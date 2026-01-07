# AI Brain Frontend - Setup Guide

## What Is This?

This is your **AI Brain** web interface - a simple UI where you can:
- 📤 Upload your knowledge base documents (PDFs, Word docs, text files)
- 📚 Manage your uploaded documents
- 💬 Chat with your AI to test responses
- 🔄 Rebuild embeddings when needed
- 🗑️ Delete documents you no longer need

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install Node.js dependencies
npm install
```

### Step 2: Configure OpenAI API Key

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Get your key from: https://platform.openai.com/api-keys
```

Edit the `.env` file:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
```

### Step 3: Start the Server

```bash
# Start the backend server
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧠 AI Brain Server Running                              ║
║                                                           ║
║   Frontend: http://localhost:3000                         ║
║   API:      http://localhost:3000/api                     ║
║                                                           ║
║   Vector DB: In-Memory                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 4: Open the Frontend

Open your browser and go to:
```
http://localhost:3000
```

You should see the AI Brain interface!

## How to Use

### 1. Upload Documents

**Drag and Drop:**
- Drag PDF, Word, or text files onto the upload area
- Files are automatically processed and chunked
- Embeddings are generated and stored

**Or Click to Browse:**
- Click the upload area
- Select files from your computer
- Click "Upload Documents"

**Supported Formats:**
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Text Files (.txt)
- Markdown (.md)

**File Size Limit:** 10MB per file

### 2. View Uploaded Documents

The left panel shows all your uploaded documents with:
- Document name
- File size
- Upload date
- Number of chunks created

### 3. Chat with Your AI Brain

Once documents are uploaded:
1. Type a question in the chat box
2. Press Enter or click "Send"
3. AI responds based on your knowledge base
4. See sources and confidence scores

**Example Questions:**
- "What are my criteria for seller financing?"
- "How should I approach a foreclosure situation?"
- "Draft an email for a motivated seller"
- "What deal structures do I use?"

### 4. Manage Documents

**Delete a Document:**
- Click the 🗑️ icon next to any document
- Confirm deletion
- Document and its embeddings are removed

**Rebuild Embeddings:**
- Click "🔄 Rebuild Embeddings" button
- Useful if you want to regenerate all embeddings
- Takes a few minutes for large document sets

**Clear All:**
- Click "🗑️ Clear All" button
- Removes ALL documents and embeddings
- Use with caution!

## Features

### 🎨 Clean, Simple Interface
- Minimal design
- Easy drag-and-drop
- Real-time updates
- Mobile responsive

### 🤖 Smart AI Responses
- RAG (Retrieval-Augmented Generation)
- Sources cited for transparency
- Confidence scores shown
- Based on YOUR documents only

### 📊 Document Management
- See all uploaded files
- Track chunks per document
- Easy deletion
- Rebuild capabilities

### 💾 Two Storage Modes

**In-Memory (Default):**
- No setup required
- Fast and simple
- Data lost on server restart
- Good for testing

**ChromaDB (Optional):**
- Persistent storage
- Scalable
- Production-ready
- See ChromaDB setup below

## Architecture

```
┌─────────────────┐
│   Frontend UI   │  (HTML/CSS/JavaScript)
│  localhost:3000 │
└────────┬────────┘
         │
         │ HTTP API
         │
┌────────▼────────┐
│  Express Server │  (Node.js)
│   backend/      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│OpenAI│  │Vector │
│ API  │  │  DB   │
└──────┘  └───────┘
```

### API Endpoints

**Health Check:**
```
GET /api/health
```

**Get Documents:**
```
GET /api/documents
```

**Upload Documents:**
```
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Delete Document:**
```
DELETE /api/documents/:id
```

**Clear All Documents:**
```
DELETE /api/documents/clear
```

**Rebuild Embeddings:**
```
POST /api/documents/rebuild
```

**Chat:**
```
POST /api/chat
Content-Type: application/json
Body: { "message": "your question" }
```

## Optional: ChromaDB Setup

For persistent vector storage:

### Install ChromaDB

```bash
pip install chromadb
```

### Run ChromaDB Server

```bash
chroma run --host localhost --port 8000
```

### Update .env

```
CHROMA_URL=http://localhost:8000
```

### Restart Backend

```bash
npm start
```

You should see "Vector DB: ChromaDB" in the startup message.

## Troubleshooting

### "Backend server not running"

**Fix:**
1. Make sure you ran `npm start` in the backend folder
2. Check if port 3000 is already in use
3. Try a different port in `.env`

### "Invalid API Key"

**Fix:**
1. Check your `.env` file has correct OpenAI key
2. Verify key at https://platform.openai.com/api-keys
3. Make sure key starts with `sk-`
4. Restart the server after updating

### "File upload failed"

**Fix:**
1. Check file size < 10MB
2. Verify file type is supported (PDF, DOC, TXT, MD)
3. Check server logs for errors
4. Ensure uploads folder has write permissions

### "Chat not working"

**Fix:**
1. Upload documents first
2. Check OpenAI API key is valid
3. Ensure you have credits in OpenAI account
4. Check browser console for errors

### "Empty responses"

**Fix:**
1. Upload more relevant documents
2. Try rephrasing your question
3. Check if documents were processed correctly
4. Rebuild embeddings

## Cost Estimation

### OpenAI API Costs

**Text Embedding (text-embedding-3-small):**
- $0.02 per 1M tokens
- Average document (5 pages) = ~2,000 tokens
- Cost per document: ~$0.00004 (negligible)

**Chat Completion (GPT-4 Turbo):**
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens
- Average query: ~2K input, 500 output = $0.035

**Example Monthly Costs:**
- 100 documents uploaded: ~$0.01
- 1,000 chat queries: ~$35
- **Total: ~$35/month** (varies by usage)

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to restart the server on file changes.

## Production Deployment

### Option 1: Simple VPS

```bash
# Clone your code
git clone your-repo

# Install dependencies
cd backend
npm install

# Set environment variables
export OPENAI_API_KEY=your-key

# Run with PM2 for process management
npm install -g pm2
pm2 start server.js --name ai-brain
pm2 save
pm2 startup
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY frontend/ ../frontend/
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ai-brain .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key ai-brain
```

### Option 3: Cloud Platforms

**Heroku:**
```bash
heroku create ai-brain
heroku config:set OPENAI_API_KEY=your-key
git push heroku main
```

**DigitalOcean App Platform:**
- Connect GitHub repo
- Set environment variables
- Deploy automatically

**Railway:**
- Connect GitHub repo
- Add OpenAI API key
- Deploy with one click

## Integration with n8n

### Connect AI Brain to n8n Workflow

1. **In n8n workflow**, add an HTTP Request node:
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/chat",
  "body": {
    "message": "={{$json.emailBody}}"
  }
}
```

2. **Use the response** in your email generation:
```
AI Answer: {{$json.answer}}
Sources: {{$json.sources}}
Confidence: {{$json.confidence}}
```

3. **Test the integration:**
- Upload your SOPs and templates to AI Brain
- Send test email through n8n
- AI Brain provides context-aware responses

## File Structure

```
smartemail/
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   ├── .env                # Your config (create this)
│   └── uploads/            # Uploaded files (auto-created)
│
└── frontend/
    ├── index.html          # Main UI
    ├── styles.css          # Styling
    └── app.js              # Frontend logic
```

## What to Upload

### Recommended Documents:

1. **Investment Criteria**
   - Your profit margins
   - ARV ratios
   - Deal types you prefer

2. **Deal Structure SOPs**
   - Seller finance templates
   - Subject-to procedures
   - Lease option guidelines

3. **Email Templates**
   - Your best negotiation emails
   - Follow-up sequences
   - Response templates

4. **Market Knowledge**
   - Local market data
   - Neighborhood info
   - Comparable sales

5. **Scripts and Playbooks**
   - Phone scripts
   - Objection handlers
   - Closing techniques

6. **Legal Templates**
   - Contracts you use
   - Disclosure templates
   - State-specific forms

## Security Notes

### ⚠️ Important Security Considerations:

1. **Never commit `.env` file** to version control
2. **Keep OpenAI API key secret**
3. **Use HTTPS in production**
4. **Implement authentication** if deploying publicly
5. **Limit file uploads** to trusted users
6. **Sanitize uploaded content**
7. **Regular backups** of your documents

### Adding Basic Authentication:

```javascript
// In server.js, add middleware:
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
    users: { 'admin': 'your-password' },
    challenge: true
}));
```

## Next Steps

1. ✅ Upload your first documents
2. ✅ Test chat functionality
3. ✅ Integrate with n8n workflow (optional)
4. ✅ Deploy to production (optional)
5. ✅ Add authentication (recommended)
6. ✅ Set up ChromaDB for persistence (optional)

## Support

**Backend Issues:**
- Check server logs in terminal
- Verify environment variables
- Test API endpoints with curl/Postman

**Frontend Issues:**
- Open browser developer console (F12)
- Check network tab for failed requests
- Verify backend is running

**API Issues:**
- Test with curl: `curl http://localhost:3000/api/health`
- Check OpenAI API status
- Verify API key has credits

---

**You're all set!** Upload some documents and start chatting with your AI Brain. 🧠
