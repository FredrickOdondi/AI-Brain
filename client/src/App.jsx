import { useState, useEffect, useRef } from 'react';
import './App.css';

const CONFIG = {
  apiUrl: '/api',
  maxFileSize: 100 * 1024 * 1024,
  allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.md']
};

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessages, setStatusMessages] = useState([]);
  const [loadingOverlay, setLoadingOverlay] = useState({ show: false, text: 'Processing...' });
  const [showWelcome, setShowWelcome] = useState(true);

  const fileInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    loadDocuments();
    checkBackendConnection();
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/health`);
      if (response.ok) {
        showStatus('Connected to backend', 'success');
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      showStatus('Backend server not running. Please start the server.', 'error');
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/documents`);
      const result = await response.json();
      if (response.ok) {
        setDocuments(result.documents || []);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFilesToSelection(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFilesToSelection(files);
  };

  const addFilesToSelection = (files) => {
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = CONFIG.allowedTypes.includes(ext);
      const isValidSize = file.size <= CONFIG.maxFileSize;

      if (!isValidType) {
        showStatus(`${file.name} is not a supported file type`, 'error');
        return false;
      }
      if (!isValidSize) {
        showStatus(`${file.name} is too large (max 100MB)`, 'error');
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    showStatus(`${validFiles.length} file(s) selected for upload`, 'info');
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    showLoading('Uploading and processing documents...');

    const formData = new FormData();
    selectedFiles.forEach(file => {
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
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadDocuments();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      showStatus(`Upload error: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

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
  };

  const rebuildEmbeddings = async () => {
    if (!window.confirm('This will rebuild all embeddings. Continue?')) return;

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
  };

  const clearAllDocuments = async () => {
    if (!window.confirm('Are you sure you want to delete ALL documents? This cannot be undone.')) return;

    showLoading('Clearing all documents...');

    try {
      const response = await fetch(`${CONFIG.apiUrl}/documents/clear`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showStatus('All documents cleared', 'success');
        setDocuments([]);
        setChatHistory([]);
        setShowWelcome(true);
      } else {
        throw new Error('Clear failed');
      }
    } catch (error) {
      showStatus(`Clear error: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  };

  const sendMessage = async () => {
    const message = chatInput.trim();
    if (!message) return;

    setShowWelcome(false);
    const userMessage = { role: 'user', content: message, time: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);

    const typingMessage = { role: 'assistant', content: 'typing', time: new Date() };
    setChatHistory(prev => [...prev, typingMessage]);

    try {
      const response = await fetch(`${CONFIG.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const result = await response.json();

      setChatHistory(prev => prev.filter(msg => msg.content !== 'typing'));

      if (response.ok) {
        const assistantMessage = {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          confidence: result.confidence,
          time: new Date()
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.message || 'Chat request failed');
      }
    } catch (error) {
      setChatHistory(prev => prev.filter(msg => msg.content !== 'typing'));
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        time: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const showStatus = (message, type = 'info') => {
    const id = Date.now();
    setStatusMessages(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setStatusMessages(prev => prev.filter(msg => msg.id !== id));
    }, 5000);
  };

  const showLoading = (text) => {
    setLoadingOverlay({ show: true, text });
  };

  const hideLoading = () => {
    setLoadingOverlay({ show: false, text: 'Processing...' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
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
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const hasDocuments = documents.length > 0;
  const chatEnabled = hasDocuments;

  return (
    <div className="container">
      <header>
        <h1>AI Knowledge Base System</h1>
        <p>Document Management & Intelligent Query System</p>
      </header>

      <div className="main-content">
        {/* Left Panel: Document Management */}
        <div className="panel documents-panel">
          <h2>Document Repository</h2>

          {/* Upload Area */}
          <div className="upload-section">
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p className="drop-text">Upload Documents</p>
              <p className="drop-subtext">Click to select files or drag and drop</p>
              <p className="supported-formats">Supported formats: PDF, DOC, DOCX, TXT, MD</p>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                hidden
                onChange={handleFileSelect}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={uploadFiles}
              disabled={selectedFiles.length === 0}
            >
              {selectedFiles.length > 0 ? `Upload ${selectedFiles.length} Document(s)` : 'Upload Selected Files'}
            </button>
          </div>

          {/* Document List */}
          <div className="document-list-section">
            <div className="section-header">
              <h3>Document Archive</h3>
              <span className="badge">{documents.length}</span>
            </div>

            <div className="document-list">
              {documents.length === 0 ? (
                <div className="empty-state">
                  <p>No documents in repository</p>
                  <p className="hint">Upload documents to begin indexing</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <div className="document-info">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-meta">
                        {formatFileSize(doc.size)} • Uploaded {formatDate(doc.uploadedAt)}
                        {doc.chunks && ` • ${doc.chunks} chunks`}
                      </div>
                    </div>
                    <div className="document-actions">
                      <button className="icon-btn delete" onClick={() => deleteDocument(doc.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="actions-section">
            <button
              className="btn btn-secondary"
              onClick={rebuildEmbeddings}
              disabled={!hasDocuments}
            >
              Rebuild Index
            </button>
            <button
              className="btn btn-danger"
              onClick={clearAllDocuments}
              disabled={!hasDocuments}
            >
              Clear Repository
            </button>
          </div>

          {/* Status */}
          <div className="status-area">
            {statusMessages.map(msg => (
              <div key={msg.id} className={`status-message ${msg.type}`}>
                {msg.message}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="panel chat-panel">
          <h2>Query Interface</h2>

          <div className="chat-messages" ref={chatMessagesRef}>
            {showWelcome && chatHistory.length === 0 && (
              <div className="welcome-message">
                <h3>AI Query System</h3>
                <p>Upload documents to the repository, then submit queries to retrieve information.</p>
                <p className="example-queries">Example queries:</p>
                <ul>
                  <li>What are the key policy guidelines?</li>
                  <li>Summarize the compliance requirements</li>
                  <li>What procedures are documented for emergency protocols?</li>
                </ul>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content === 'typing' ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <div className="message-content">
                      {msg.content}
                      {msg.confidence !== null && msg.confidence !== undefined && (
                        <span className={`confidence-badge confidence-${msg.confidence > 0.7 ? 'high' : msg.confidence > 0.5 ? 'medium' : 'low'}`}>
                          {Math.round(msg.confidence * 100)}% confident
                        </span>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="sources">
                          <div className="sources-title">Sources:</div>
                          {msg.sources.map((src, i) => (
                            <div key={i} className="source-item">📄 {src}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="message-time">{formatTime(msg.time)}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={chatEnabled ? 'Enter your query...' : 'Upload documents first...'}
              rows="3"
              disabled={!chatEnabled}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!chatEnabled || isProcessing}
            >
              Submit
            </button>
          </div>

          {/* Chat Stats */}
          <div className="chat-stats">
            <span>
              {hasDocuments
                ? `${documents.length} document(s) loaded • Ready to chat`
                : 'System ready - awaiting document upload'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingOverlay.show && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{loadingOverlay.text}</p>
        </div>
      )}
    </div>
  );
}

export default App;
