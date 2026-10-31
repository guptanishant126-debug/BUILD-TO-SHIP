import axios from 'axios';
import { handleClientFallback } from './clientFallback';

let hasBackendFailed = false;

const isRemoteStaticHost = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('vercel.app') || host.includes('netlify.app') || (!host.includes('localhost') && !host.includes('127.0.0.1'));
};

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (isRemoteStaticHost()) {
    // If user provided a real external HTTPS backend (e.g. on Render or Railway)
    if (envUrl && envUrl.startsWith('https://') && !envUrl.includes('localhost')) {
      return envUrl;
    }
    // Otherwise use relative /api
    return '/api';
  }

  return envUrl || 'http://localhost:5000/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: inject Bearer token or fast-track client fallback if static host
axiosInstance.interceptors.request.use(
  async (config) => {
    // If we already know the current deployment is a static host without an active API backend,
    // and no remote HTTPS backend URL was set in VITE_API_BASE_URL:
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    const hasExternalApi = envUrl && envUrl.startsWith('https://') && !envUrl.includes('localhost');

    if ((hasBackendFailed || isRemoteStaticHost()) && !hasExternalApi) {
      // Create a custom adapter to serve response directly without network 405 error
      config.adapter = async (cfg) => {
        const fallbackRes = await handleClientFallback(cfg);
        return fallbackRes;
      };
      return config;
    }

    const token = localStorage.getItem('aegis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 405, 404, Network Error with Resilient Fallback Engine
axiosInstance.interceptors.response.use(
  (response) => {
    // If static host returned HTML instead of JSON for an API route
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      hasBackendFailed = true;
      return handleClientFallback(response.config);
    }
    return response;
  },
  async (error) => {
    const status = error.response ? error.response.status : null;
    const responseData = error.response ? error.response.data : null;

    // Detect if static host rejected API route (405 Method Not Allowed, 404, or Network Error)
    const isStaticHostRejection =
      status === 405 ||
      status === 404 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      !error.response ||
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      (typeof responseData === 'string' && responseData.includes('<!DOCTYPE html>'));

    if (isStaticHostRejection && error.config) {
      console.warn(`[AegisVoice Sentinel] Endpoint ${error.config.url} returned status ${status || 'Network Error'}. Engaging client-side resilient fallback.`);
      hasBackendFailed = true;
      try {
        const fallbackRes = await handleClientFallback(error.config);
        return fallbackRes;
      } catch (fallbackErr) {
        console.error('Fallback handling failed:', fallbackErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
