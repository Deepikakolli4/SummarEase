import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;
const apiClient = axios.create({ baseURL: apiUrl });
let refreshRequest = null;

const clearSession = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('auth-expired'));
};

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status !== 401 || !request || request._retry || request.url?.includes('/user/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      if (!refreshRequest) {
        refreshRequest = axios.post(`${apiUrl}/user/refresh`, { refresh_token: refreshToken })
          .then(({ data }) => {
            if (!data.access_token || !data.refresh_token) {
              throw new Error('Refresh response did not contain new tokens');
            }
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            if (data.username) localStorage.setItem('username', data.username);
            return data.access_token;
          })
          .catch((refreshError) => {
            clearSession();
            throw refreshError;
          })
          .finally(() => {
            refreshRequest = null;
          });
      }

      const accessToken = await refreshRequest;
      request.headers = request.headers || {};
      request.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;