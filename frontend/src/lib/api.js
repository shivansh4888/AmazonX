// API client configuration
// All backend requests go through this axios instance

import axios from 'axios';

const LOCAL_API_BASE = 'http://localhost:5000/api';
const PRIMARY_API_BASE = process.env.NEXT_PUBLIC_API_URL || LOCAL_API_BASE;
const FALLBACK_API_BASE =
  process.env.NEXT_PUBLIC_API_FALLBACK_URL ||
  (PRIMARY_API_BASE === LOCAL_API_BASE ? 'https://amazonx-dep.onrender.com/api' : '');

export const api = axios.create({
  baseURL: PRIMARY_API_BASE,
  timeout: 15000,
});

// Attach sessionId to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const sessionId = getSessionId();
    const userId = getUserId();
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isLocalPrimary = PRIMARY_API_BASE === LOCAL_API_BASE;
    const shouldRetryWithFallback =
      Boolean(FALLBACK_API_BASE) &&
      isLocalPrimary &&
      !originalRequest._retriedWithFallback &&
      (
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        !error.response ||
        error.response.status >= 500
      );

    if (shouldRetryWithFallback) {
      originalRequest._retriedWithFallback = true;
      originalRequest.baseURL = FALLBACK_API_BASE;
      return api.request(originalRequest);
    }

    return Promise.reject(error);
  }
);

// ─── Session Management ────────────────────────────────────────────────────────
// We use a random UUID stored in localStorage as a "session ID"
// This lets us maintain a cart without requiring user authentication

export const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('shopx_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('shopx_session_id', sessionId);
  }
  return sessionId;
};

export const getUserId = () => {
  if (typeof window === 'undefined') return null;

  let userId = localStorage.getItem('shopx_user_id');
  if (!userId) {
    userId = 'demo-user';
    localStorage.setItem('shopx_user_id', userId);
  }
  return userId;
};

// ─── API Functions ─────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (params = {}) => {
    const normalizedParams = { ...params };

    if (normalizedParams.sortBy === 'price_asc') {
      normalizedParams.sortBy = 'price';
      normalizedParams.sortOrder = 'asc';
    } else if (normalizedParams.sortBy === 'price_desc') {
      normalizedParams.sortBy = 'price';
      normalizedParams.sortOrder = 'desc';
    } else if (normalizedParams.sortBy === 'rating') {
      normalizedParams.sortOrder = normalizedParams.sortOrder || 'desc';
    } else if (normalizedParams.sortBy === 'reviewCount') {
      normalizedParams.sortOrder = normalizedParams.sortOrder || 'desc';
    } else if (normalizedParams.sortBy === 'createdAt') {
      normalizedParams.sortOrder = normalizedParams.sortOrder || 'desc';
    }

    return api.get('/products', { params: normalizedParams });
  },
  getById: (id) => api.get(`/products/${id}`),
  getPriceInsight: (id) => api.get(`/products/${id}/price-insight`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  getConflicts: () => api.get('/cart/conflicts'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  applyCoupon: (code) => api.post('/cart/apply-coupon', { code }),
};

export const ordersApi = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  getByEmail: (email) => api.get('/orders', { params: { email } }),
};

export const reorderApi = {
  getSuggestions: () => api.get('/reorder/suggestions'),
};

export const challengesApi = {
  getByProductId: (productId) => api.get(`/challenges/${productId}`),
  attempt: (payload) => api.post('/challenges/attempt', payload),
};
