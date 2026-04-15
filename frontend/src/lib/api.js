// API client configuration
// All backend requests go through this axios instance

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach sessionId to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
  }
  return config;
});

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
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

export const ordersApi = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  getByEmail: (email) => api.get('/orders', { params: { email } }),
};
