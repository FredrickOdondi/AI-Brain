import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentService = {
  getAll: () => api.get('/documents'),
  upload: (formData, onProgress) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  delete: (id) => api.delete(`/documents/${id}`),
  rebuild: () => api.post('/documents/rebuild'),
  clearAll: () => api.delete('/documents'),
};

export const chatService = {
  send: (message) => api.post('/chat', { message }),
};

export const personalityService = {
  getAll: () => api.get('/personalities'),
  set: (personality, customInstructions) =>
    api.post('/personality', { personality, customInstructions }),
};

export const healthService = {
  check: () => api.get('/health'),
};

export default api;
