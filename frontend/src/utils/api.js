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

// Cross-tab & same-tab instant catalog sync when admin adds/edits/deletes items
const SYNC_KEY = 'bm_catalog_updated_at';
const CATALOG_PATHS = ['/products', '/categories', '/brands', '/banners', '/settings', '/pages', '/coupons'];

export const notifyCatalogUpdated = () => {
  const ts = String(Date.now());
  try {
    localStorage.setItem(SYNC_KEY, ts);
    sessionStorage.removeItem('bm_home_cache');
    localStorage.removeItem('bm_home_cache');
  } catch {
    // ignore storage errors
  }
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('buildmart_catalog_sync');
      ch.postMessage({ type: 'CATALOG_UPDATED', ts });
      ch.close();
    }
  } catch {
    // ignore BroadcastChannel errors
  }
  try {
    window.dispatchEvent(new CustomEvent('buildmart:catalog-updated', { detail: { ts } }));
  } catch {
    // ignore window event errors
  }
};

export const subscribeCatalogUpdates = (onUpdate) => {
  if (typeof window === 'undefined' || typeof onUpdate !== 'function') {
    return () => {};
  }

  let lastTrigger = 0;
  const triggerSafely = () => {
    const now = Date.now();
    if (now - lastTrigger < 500) return;
    lastTrigger = now;
    onUpdate();
  };

  let bc = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('buildmart_catalog_sync');
      bc.onmessage = (event) => {
        if (event?.data?.type === 'CATALOG_UPDATED') {
          triggerSafely();
        }
      };
    }
  } catch {
    bc = null;
  }

  const handleStorage = (e) => {
    if (e.key === SYNC_KEY) triggerSafely();
  };

  const handleCustomEvent = () => triggerSafely();

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      triggerSafely();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('buildmart:catalog-updated', handleCustomEvent);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    if (bc) {
      try { bc.close(); } catch { /* noop */ }
    }
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('buildmart:catalog-updated', handleCustomEvent);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
};

const api = axios.create({
  baseURL: normalizedBaseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token, handle FormData multipart boundaries, and bust stale GET caches
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  const token = localStorage.getItem('bm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Cache-bust all GET requests so admin edits/adds/deletes reflect immediately everywhere
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _t: Date.now()
    };
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

// Response interceptor with 401 token refresh & instant catalog sync broadcast
api.interceptors.response.use((response) => {
  const method = (response.config?.method || '').toLowerCase();
  const reqUrl = response.config?.url || '';
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    if (CATALOG_PATHS.some((p) => reqUrl.includes(p))) {
      notifyCatalogUpdated();
    }
  }
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
