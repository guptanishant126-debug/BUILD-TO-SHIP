import axios from 'axios';
import { handleClientFallback } from './clientFallback';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // When deployed in the browser (e.g. on Vercel, Netlify, or any production domain)
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      // Never attempt to call localhost:5000 from an HTTPS production domain
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return '/api';
      }
    }
  }

  return envUrl || 'http://localhost:5000/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: inject Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    // Dynamically update baseURL in case domain changes
    if (!config.baseURL || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && config.baseURL.includes('localhost'))) {
      config.baseURL = getBaseUrl();
    }
    const token = localStorage.getItem('aegis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle Network Error with Resilient Fallback Engine
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if network failed, server is offline, or endpoint returned 404 on Vercel
    const isNetworkError =
      !error.response ||
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      (error.response && error.response.status === 404);

    if (isNetworkError && error.config) {
      console.warn(`[AegisVoice Sentinel] Backend offline or unreachable at ${error.config.url}. Engaging client-side resilient fallback.`);
      try {
        const fallbackRes = await handleClientFallback(error.config);
        return fallbackRes;
      } catch (fallbackErr) {
        console.error('Fallback handling failed:', fallbackErr);
      }
    }

    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        console.warn('Session expired or unauthorized.');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
