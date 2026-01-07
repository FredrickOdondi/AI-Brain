# AI-Brain Project Structure

## Professional Full-Stack Architecture

```
AI-Brain/
├── client/                    # Vite + React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.js       # Vite configuration
│
├── server/                   # Node.js + Express Backend
│   ├── src/
│   │   ├── agents/          # LangGraph agents
│   │   │   ├── DocumentAgent.js
│   │   │   ├── graphs/      # LangGraph workflows
│   │   │   └── tools/       # Agent tools
│   │   ├── config/          # Configuration
│   │   │   ├── personalities.js
│   │   │   └── database.js
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── server.js        # Entry point
│   ├── uploads/             # File uploads (gitignored)
│   ├── .env                 # Environment variables (gitignored)
│   ├── .env.example         # Example environment
│   └── package.json
│
├── docs/                     # Documentation
│   ├── api/                 # API documentation
│   ├── guides/              # User guides
│   └── architecture/        # Architecture docs
│
├── .gitignore
├── README.md
├── package.json             # Root package.json (workspaces)
└── docker-compose.yml       # Docker setup (optional)
```

## Technology Stack

### Frontend (client/)
- **Framework**: React 18+ with Vite
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Styling**: CSS Modules / Tailwind CSS
- **Build Tool**: Vite

### Backend (server/)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI Agent**: LangGraph + LangChain
- **LLM**: Groq (Llama 3.3 70B)
- **Vector Store**: ChromaDB (optional) / In-Memory
- **File Processing**: PDF-Parse, Mammoth

## Development Workflow

### Setup
```bash
# Install all dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd server && npm install
```

### Development
```bash
# Start frontend dev server (from client/)
npm run dev          # Runs on http://localhost:5173

# Start backend server (from server/)
npm run dev          # Runs on http://localhost:3001
```

### Production
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

## Key Features

1. **LangGraph Agent System**
   - State-managed workflows
   - Multiple personality profiles
   - Tool integration
   - Structured output

2. **Professional Frontend**
   - Modern React with hooks
   - Responsive design
   - Real-time updates
   - File upload with progress

3. **Scalable Backend**
   - RESTful API
   - Proper error handling
   - Middleware architecture
   - Environment-based config

4. **Document Processing**
   - PDF, DOCX, TXT support
   - Vector embeddings
   - Semantic search
   - RAG (Retrieval Augmented Generation)

## API Endpoints

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents/upload` - Upload documents
- `DELETE /api/documents/:id` - Delete document

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/history` - Get chat history

### Agent
- `GET /api/personalities` - List personalities
- `POST /api/personality` - Set agent personality
- `GET /api/health` - Health check

## Environment Variables

### Server (.env)
```env
GROQ_API_KEY=your_groq_api_key
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=104857600
CHROMA_URL=http://localhost:8000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Best Practices

1. **Code Organization**
   - Separation of concerns
   - Single responsibility principle
   - Clear folder structure

2. **Error Handling**
   - Try-catch blocks
   - Proper error responses
   - Client-side error boundaries

3. **Security**
   - Input validation
   - File upload restrictions
   - Environment variables for secrets
   - CORS configuration

4. **Performance**
   - Code splitting (Vite)
   - Lazy loading
   - Caching strategies
   - Optimized builds

## Next Steps

1. Implement React components
2. Set up proper routing
3. Add authentication (optional)
4. Implement real-time features (WebSocket)
5. Add testing (Vitest, Jest)
6. Set up CI/CD pipeline
7. Docker containerization
8. Monitoring and logging
