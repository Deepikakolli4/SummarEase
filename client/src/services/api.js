import apiClient from '../utils/apiClient';

// Authentication endpoints
export const loginUser = (credentials) => apiClient.post('/user/login', credentials);

export const registerUser = (userData) => apiClient.post('/user', userData);

export const sendResetCode = (email) => apiClient.post('/user/forgotpassword', { email });

export const verifyResetCode = (email, code) => apiClient.post('/user/verify-code', { email, code });

export const updatePassword = ({ email, code, newPassword }) =>
  apiClient.post('/user/verify-code', {
    email,
    code,
    newPassword,
    isPasswordUpdate: true,
  });

// URL Analysis endpoint
export const analyzeUrl = ({ url, lang, sourceType }) =>
  apiClient.post('/analyze', { url, lang, sourceType });

// History endpoints
export const getHistory = (params) => apiClient.get('/user/history', { params });

export const deleteHistoryItem = (id) => apiClient.delete(`/user/history/${id}`);

export default apiClient;
