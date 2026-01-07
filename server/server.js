require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { ChromaClient } = require('chromadb');
const DocumentAgent = require('./agent');

// Configuration
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-groq-api-key-here';
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize LangGraph Agent with Government Professional personality
const agent = new DocumentAgent(GROQ_API_KEY, {
    personality: 'government_professional',
    temperature: 0.7,
    maxTokens: 1500
});

// Initialize ChromaDB Client
let chromaClient;
let collection;

async function initializeChroma() {
    try {
        chromaClient = new ChromaClient({ path: CHROMA_URL });

        // Get or create collection
        try {
            collection = await chromaClient.getCollection({ name: 'real_estate_knowledge' });
            console.log('Connected to existing ChromaDB collection');
        } catch (error) {
            collection = await chromaClient.createCollection({
                name: 'real_estate_knowledge',
                metadata: { 'hnsw:space': 'cosine' }
            });
            console.log('Created new ChromaDB collection');
        }
    } catch (error) {
        console.warn('ChromaDB not available, using in-memory storage:', error.message);
        // Fallback to in-memory storage
        collection = null;
    }
}

// In-memory fallback storage
const inMemoryStore = {
    documents: [],
    embeddings: [],
    metadata: []
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt|md/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'));
    }
});

// Document metadata storage
let documentsMetadata = [];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        vectorDB: collection ? 'ChromaDB' : 'In-Memory',
        personality: agent.personality.name
    });
});

// Get available personalities
app.get('/api/personalities', (req, res) => {
    const { getAllPersonalities } = require('./personality-config');
    try {
        const personalities = getAllPersonalities();
        res.json({
            success: true,
            current: agent.personalityType,
            personalities: personalities
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update agent personality
app.post('/api/personality', (req, res) => {
    try {
        const { personality, customInstructions } = req.body;

        if (!personality) {
            return res.status(400).json({ success: false, message: 'Personality type is required' });
        }

        agent.setPersonality(personality, customInstructions || '');

        res.json({
            success: true,
            message: `Personality updated to: ${agent.personality.name}`,
            personality: {
                type: agent.personalityType,
                name: agent.personality.name,
                description: agent.personality.description
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all documents
app.get('/api/documents', async (req, res) => {
    try {
        res.json({
            success: true,
            documents: documentsMetadata
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload documents
app.post('/api/documents/upload', upload.array('documents'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const uploadedDocs = [];

        for (const file of req.files) {
            // Extract text from file
            const text = await extractTextFromFile(file.path, file.mimetype);

            // Split into chunks
            const chunks = splitIntoChunks(text, 1000);

            // Generate embeddings and store
            await storeDocumentChunks(file.originalname, chunks, file.size);

            // Save metadata
            const docMetadata = {
                id: file.filename,
                name: file.originalname,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                chunks: chunks.length,
                path: file.path
            };

            documentsMetadata.push(docMetadata);
            uploadedDocs.push(docMetadata);
        }

        res.json({
            success: true,
            message: 'Documents uploaded successfully',
            count: uploadedDocs.length,
            documents: uploadedDocs
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docIndex = documentsMetadata.findIndex(doc => doc.id === id);

        if (docIndex === -1) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = documentsMetadata[docIndex];

        // Delete file
        try {
            await fs.unlink(doc.path);
        } catch (error) {
            console.warn('File not found:', error.message);
        }

        // Remove from vector store
        if (collection) {
            await collection.delete({ where: { documentId: id } });
        } else {
            // Remove from in-memory store
            inMemoryStore.documents = inMemoryStore.documents.filter((_, i) => {
                return !(inMemoryStore.metadata[i].documentId === id);
            });
            inMemoryStore.embeddings = inMemoryStore.embeddings.filter((_, i) => {
                return !(inMemoryStore.metadata[i].documentId === id);
            });
            inMemoryStore.metadata = inMemoryStore.metadata.filter(m => m.documentId !== id);
        }

        // Remove from metadata
        documentsMetadata.splice(docIndex, 1);

        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Clear all documents
app.delete('/api/documents/clear', async (req, res) => {
    try {
        // Delete all files
        for (const doc of documentsMetadata) {
            try {
                await fs.unlink(doc.path);
            } catch (error) {
                console.warn('File not found:', error.message);
            }
        }

        // Clear vector store
        if (collection) {
            await chromaClient.deleteCollection({ name: 'real_estate_knowledge' });
            collection = await chromaClient.createCollection({
                name: 'real_estate_knowledge',
                metadata: { 'hnsw:space': 'cosine' }
            });
        } else {
            inMemoryStore.documents = [];
            inMemoryStore.embeddings = [];
            inMemoryStore.metadata = [];
        }

        documentsMetadata = [];

        res.json({ success: true, message: 'All documents cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Rebuild embeddings
app.post('/api/documents/rebuild', async (req, res) => {
    try {
        // Clear existing embeddings
        if (collection) {
            await chromaClient.deleteCollection({ name: 'real_estate_knowledge' });
            collection = await chromaClient.createCollection({
                name: 'real_estate_knowledge',
                metadata: { 'hnsw:space': 'cosine' }
            });
        } else {
            inMemoryStore.documents = [];
            inMemoryStore.embeddings = [];
            inMemoryStore.metadata = [];
        }

        // Rebuild from existing files
        for (const doc of documentsMetadata) {
            const text = await extractTextFromFile(doc.path);
            const chunks = splitIntoChunks(text, 1000);
            await storeDocumentChunks(doc.name, chunks, doc.size, doc.id);
            doc.chunks = chunks.length;
        }

        res.json({ success: true, message: 'Embeddings rebuilt successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(message);

        // Search vector store
        const searchResults = await searchSimilarChunks(queryEmbedding, 5);

        const sources = searchResults.length > 0
            ? [...new Set(searchResults.map(result => result.source))]
            : [];

        // Use LangGraph agent to process the query
        const agentResult = await agent.processQuery(message, {
            searchResults: searchResults.map(r => ({
                text: r.text,
                source: r.source,
                similarity: r.similarity
            })),
            sources: sources
        });

        res.json({
            success: agentResult.success,
            answer: agentResult.answer,
            sources: agentResult.sources,
            confidence: agentResult.confidence,
            tokenCount: agentResult.tokenCount,
            metadata: agentResult.metadata
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper Functions

async function extractTextFromFile(filePath, mimeType) {
    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (ext === '.docx' || ext === '.doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (ext === '.txt' || ext === '.md') {
            return await fs.readFile(filePath, 'utf-8');
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Text extraction error:', error);
        throw error;
    }
}

function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;
        const chunk = text.slice(start, end);
        chunks.push(chunk.trim());
        start = end - overlap;
    }

    return chunks.filter(chunk => chunk.length > 50); // Filter out very small chunks
}

async function generateEmbedding(text) {
    try {
        // Simple fallback: create a basic embedding from text using character codes
        // This is a simplified version - for production, consider using sentence-transformers or similar
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(384).fill(0);

        // Create a simple hash-based embedding
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const charCode = word.charCodeAt(j);
                const index = (charCode * (i + 1) * (j + 1)) % 384;
                embedding[index] += 1 / (i + 1);
            }
        }

        // Normalize the embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    } catch (error) {
        console.error('Embedding generation error:', error);
        throw error;
    }
}

async function storeDocumentChunks(documentName, chunks, fileSize, documentId = null) {
    const docId = documentId || Date.now().toString();

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await generateEmbedding(chunk);
        const chunkId = `${docId}-chunk-${i}`;

        const metadata = {
            documentId: docId,
            documentName: documentName,
            chunkIndex: i,
            chunkText: chunk
        };

        if (collection) {
            // Store in ChromaDB
            await collection.add({
                ids: [chunkId],
                embeddings: [embedding],
                documents: [chunk],
                metadatas: [metadata]
            });
        } else {
            // Store in memory
            inMemoryStore.documents.push(chunk);
            inMemoryStore.embeddings.push(embedding);
            inMemoryStore.metadata.push(metadata);
        }
    }
}

async function searchSimilarChunks(queryEmbedding, topK = 5) {
    if (collection) {
        // Search in ChromaDB
        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: topK
        });

        return results.documents[0].map((doc, i) => ({
            text: doc,
            source: results.metadatas[0][i].documentName,
            similarity: 1 - (results.distances[0][i] || 0)
        }));
    } else {
        // Search in memory using cosine similarity
        if (inMemoryStore.embeddings.length === 0) {
            return [];
        }

        const similarities = inMemoryStore.embeddings.map((emb, i) => ({
            index: i,
            similarity: cosineSimilarity(queryEmbedding, emb)
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, topK).map(s => ({
            text: inMemoryStore.documents[s.index],
            source: inMemoryStore.metadata[s.index].documentName,
            similarity: s.similarity
        }));
    }
}

function cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (mag1 * mag2);
}

// Start Server
async function startServer() {
    await initializeChroma();

    // Create uploads directory
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧠 AI Brain Server Running                              ║
║                                                           ║
║   Frontend: http://localhost:${PORT}                          ║
║   API:      http://localhost:${PORT}/api                      ║
║                                                           ║
║   Vector DB: ${collection ? 'ChromaDB' : 'In-Memory'.padEnd(44)} ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
        `);
    });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});
