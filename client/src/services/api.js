
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem('circleup_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {}

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (error.response && error.response.status === 401) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('circleup_token');
          window.localStorage.removeItem('circleup_user');
        }
      }
    } catch {}

    return Promise.reject(error);
  }
);

export default api;
