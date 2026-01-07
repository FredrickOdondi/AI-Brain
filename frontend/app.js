// Configuration
const CONFIG = {
    apiUrl: 'http://localhost:3001/api',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.md']
};

// State Management
const state = {
    documents: [],
    selectedFiles: [],
    chatHistory: [],
    isProcessing: false
};

// DOM Elements
const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    uploadBtn: document.getElementById('uploadBtn'),
    documentList: document.getElementById('documentList'),
    docCount: document.getElementById('docCount'),
    rebuildBtn: document.getElementById('rebuildBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    statusArea: document.getElementById('statusArea'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    chatStats: document.getElementById('chatStats'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadDocuments();
    checkBackendConnection();
});

// Event Listeners
function initializeEventListeners() {
    // File Upload
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.uploadBtn.addEventListener('click', uploadFiles);

    // Drag and Drop
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);

    // Actions
    elements.rebuildBtn.addEventListener('click', rebuildEmbeddings);
    elements.clearAllBtn.addEventListener('click', clearAllDocuments);

    // Chat
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// File Handling
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFilesToSelection(files);
}

function handleDragOver(e) {
    e.preventDefault();
    elements.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    addFilesToSelection(files);
}

function addFilesToSelection(files) {
    const validFiles = files.filter(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isValidType = CONFIG.allowedTypes.includes(ext);
        const isValidSize = file.size <= CONFIG.maxFileSize;

        if (!isValidType) {
            showStatus(`${file.name} is not a supported file type`, 'error');
            return false;
        }
        if (!isValidSize) {
            showStatus(`${file.name} is too large (max 10MB)`, 'error');
            return false;
        }
        return true;
    });

    state.selectedFiles = [...state.selectedFiles, ...validFiles];
    updateUploadButton();
    showStatus(`${validFiles.length} file(s) selected for upload`, 'info');
}

function updateUploadButton() {
    elements.uploadBtn.disabled = state.selectedFiles.length === 0;
    if (state.selectedFiles.length > 0) {
        elements.uploadBtn.textContent = `Upload ${state.selectedFiles.length} Document(s)`;
    } else {
        elements.uploadBtn.textContent = 'Upload Documents';
    }
}

// Upload Files
async function uploadFiles() {
    if (state.selectedFiles.length === 0) return;

    showLoading('Uploading and processing documents...');

    const formData = new FormData();
    state.selectedFiles.forEach(file => {
        formData.append('documents', file);
    });

    try {
        const response = await fetch(`${CONFIG.apiUrl}/documents/upload`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showStatus(`Successfully uploaded ${result.count} document(s)`, 'success');
            state.selectedFiles = [];
            elements.fileInput.value = '';
            updateUploadButton();
            await loadDocuments();
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (error) {
        showStatus(`Upload error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Load Documents
async function loadDocuments() {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/documents`);
        const result = await response.json();

        if (response.ok) {
            state.documents = result.documents || [];
            renderDocumentList();
            updateChatAvailability();
        }
    } catch (error) {
        console.error('Failed to load documents:', error);
    }
}

// Render Document List
function renderDocumentList() {
    elements.docCount.textContent = state.documents.length;

    if (state.documents.length === 0) {
        elements.documentList.innerHTML = `
            <div class="empty-state">
                <p>No documents uploaded yet</p>
                <p class="hint">Upload your knowledge base files to get started</p>
            </div>
        `;
        elements.rebuildBtn.disabled = true;
        elements.clearAllBtn.disabled = true;
        return;
    }

    elements.rebuildBtn.disabled = false;
    elements.clearAllBtn.disabled = false;

    const html = state.documents.map(doc => `
        <div class="document-item" data-id="${doc.id}">
            <div class="document-info">
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">
                    ${formatFileSize(doc.size)} • Uploaded ${formatDate(doc.uploadedAt)}
                    ${doc.chunks ? ` • ${doc.chunks} chunks` : ''}
                </div>
            </div>
            <div class="document-actions">
                <button class="icon-btn delete" onclick="deleteDocument('${doc.id}')">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');

    elements.documentList.innerHTML = html;
}

// Delete Document
async function deleteDocument(docId) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    showLoading('Deleting document...');

    try {
        const response = await fetch(`${CONFIG.apiUrl}/documents/${docId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showStatus('Document deleted successfully', 'success');
            await loadDocuments();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        showStatus(`Delete error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Rebuild Embeddings
async function rebuildEmbeddings() {
    if (!confirm('This will rebuild all embeddings. Continue?')) return;

    showLoading('Rebuilding embeddings...');

    try {
        const response = await fetch(`${CONFIG.apiUrl}/documents/rebuild`, {
            method: 'POST'
        });

        const result = await response.json();

        if (response.ok) {
            showStatus('Embeddings rebuilt successfully', 'success');
            await loadDocuments();
        } else {
            throw new Error(result.message || 'Rebuild failed');
        }
    } catch (error) {
        showStatus(`Rebuild error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Clear All Documents
async function clearAllDocuments() {
    if (!confirm('Are you sure you want to delete ALL documents? This cannot be undone.')) return;

    showLoading('Clearing all documents...');

    try {
        const response = await fetch(`${CONFIG.apiUrl}/documents/clear`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showStatus('All documents cleared', 'success');
            state.documents = [];
            state.chatHistory = [];
            renderDocumentList();
            clearChatMessages();
            updateChatAvailability();
        } else {
            throw new Error('Clear failed');
        }
    } catch (error) {
        showStatus(`Clear error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Chat Functions
function updateChatAvailability() {
    const hasDocuments = state.documents.length > 0;
    elements.chatInput.disabled = !hasDocuments;
    elements.sendBtn.disabled = !hasDocuments;

    if (hasDocuments) {
        elements.chatStats.textContent = `${state.documents.length} document(s) loaded • Ready to chat`;
        elements.chatInput.placeholder = 'Ask a question about your knowledge base...';
    } else {
        elements.chatStats.textContent = 'Upload documents to enable chat';
        elements.chatInput.placeholder = 'Upload documents first...';
    }
}

async function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessageToChat('user', message);
    elements.chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch(`${CONFIG.apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const result = await response.json();

        removeTypingIndicator();

        if (response.ok) {
            addMessageToChat('assistant', result.answer, result.sources, result.confidence);
            state.chatHistory.push({
                user: message,
                assistant: result.answer,
                sources: result.sources
            });
        } else {
            throw new Error(result.message || 'Chat request failed');
        }
    } catch (error) {
        removeTypingIndicator();
        addMessageToChat('assistant', `Sorry, I encountered an error: ${error.message}`);
    }
}

function addMessageToChat(role, content, sources = null, confidence = null) {
    // Remove welcome message if present
    const welcome = elements.chatMessages.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    let confidenceBadge = '';
    if (confidence !== null) {
        const level = confidence > 0.7 ? 'high' : confidence > 0.5 ? 'medium' : 'low';
        confidenceBadge = `<span class="confidence-badge confidence-${level}">${Math.round(confidence * 100)}% confident</span>`;
    }

    let sourcesHtml = '';
    if (sources && sources.length > 0) {
        sourcesHtml = `
            <div class="sources">
                <div class="sources-title">Sources:</div>
                ${sources.map(src => `<div class="source-item">📄 ${src}</div>`).join('')}
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-content">
            ${content}
            ${confidenceBadge}
            ${sourcesHtml}
        </div>
        <div class="message-time">${formatTime(new Date())}</div>
    `;

    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    elements.chatMessages.appendChild(indicator);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function clearChatMessages() {
    elements.chatMessages.innerHTML = `
        <div class="welcome-message">
            <h3>Welcome to your AI Brain! 👋</h3>
            <p>Upload your documents on the left, then test the AI here.</p>
            <p class="example-queries">Try asking:</p>
            <ul>
                <li>"What are my criteria for seller financing?"</li>
                <li>"How should I approach a foreclosure situation?"</li>
                <li>"Draft an email for a motivated seller"</li>
            </ul>
        </div>
    `;
}

// Status Messages
function showStatus(message, type = 'info') {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    elements.statusArea.appendChild(statusDiv);

    setTimeout(() => {
        statusDiv.style.opacity = '0';
        setTimeout(() => statusDiv.remove(), 300);
    }, 5000);
}

// Loading Overlay
function showLoading(message = 'Processing...') {
    elements.loadingText.textContent = message;
    elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

// Backend Connection Check
async function checkBackendConnection() {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/health`);
        if (response.ok) {
            showStatus('Connected to backend', 'success');
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        showStatus('Backend server not running. Please start the server.', 'error');
        console.error('Backend connection failed:', error);
    }
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Make deleteDocument available globally
window.deleteDocument = deleteDocument;
