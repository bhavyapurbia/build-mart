import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getNormalizedBaseURL = (url) => {
  if (!url) return '/api';
  const clean = url.trim().replace(/\/+$/, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return clean || '/api';
};

const normalizedBaseURL = getNormalizedBaseURL(rawBaseURL);

const api = axios.create({
  baseURL: normalizedBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token and automatically handle multipart boundary for FormData
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  const token = localStorage.getItem('bm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Flag to avoid infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with 401 token refresh & seamless ApiResponse unwrapping
api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshUrl = `${normalizedBaseURL}/auth/refresh`;
      const res = await axios.post(refreshUrl, {}, { withCredentials: true });
      const newToken = res.data?.data?.token || res.data?.token;

      if (newToken) {
        localStorage.setItem('bm_token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      }
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.removeItem('bm_token');
      // Token expired and refresh failed
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
});

export default api;
