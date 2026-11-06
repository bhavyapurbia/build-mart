import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to unwrap standardized ApiResponse envelopes seamlessly
api.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    Array.isArray(response.data.data)
  ) {
    const arr = response.data.data;
    arr.message = response.data.message;
    arr.statusCode = response.data.statusCode;
    arr.success = response.data.success;
    response.data = arr;
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api;
