import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Request failed';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);

export const healthCheck = () => api.get('/health');
export const getIndexStats = () => api.get('/index/stats');
export const getIndexOperations = (limit = 50) => api.get('/index/operations', { params: { limit } });

export const uploadDocument = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

export const getDocuments = (skip = 0, limit = 50) =>
  api.get('/documents', { params: { skip, limit } });

export const getDocument = (id) => api.get(`/documents/${id}`);
export const updateDocument = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.put(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const getDocumentHistory = (id) => api.get(`/documents/${id}/history`);

export const search = (q, limit = 10) => api.get('/search', { params: { q, limit } });
export const autocomplete = (q) => api.get('/search/autocomplete', { params: { q } });
export const getSearchHistory = (limit = 100) => api.get('/search-history', { params: { limit } });

export const runBenchmark = (method, datasetSize, operation = 'insert') =>
  api.post('/benchmarks/run', null, {
    params: { method, dataset_size: datasetSize, operation },
  });

export const getBenchmarks = (limit = 50) => api.get('/benchmarks', { params: { limit } });
export const getBenchmarkComparison = (datasetSize, operation = 'insert') =>
  api.get('/benchmarks/comparison', { params: { dataset_size: datasetSize, operation } });

export default api;
