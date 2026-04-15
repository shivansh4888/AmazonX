'use client';
// Cart Context - Global state management for shopping cart
// Wraps the entire app so any component can access cart data

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, getSessionId } from '@/lib/api';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  // Initialize session and fetch cart on mount
  useEffect(() => {
    getSessionId(); // Ensure session exists
    fetchCart();
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } catch (error) {
      // Silently fail on initial load
      console.error('Cart fetch error:', error);
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1, productName = '') => {
    setLoading(true);
    try {
      const { data } = await cartApi.add(productId, quantity);
      
      // Store sessionId returned from server if new
      if (data.sessionId && typeof window !== 'undefined') {
        localStorage.setItem('shopx_session_id', data.sessionId);
      }
      
      setCart(data.cart);
      toast.success(`Added to cart!`, {
        icon: '🛒',
        style: { borderRadius: '4px', background: '#131921', color: '#fff' }
      });
      return true;
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to add to cart';
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      await cartApi.update(itemId, quantity);
      await fetchCart(); // Refresh cart
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    try {
      await cartApi.remove(itemId);
      await fetchCart();
      toast.success('Item removed', { icon: '🗑️' });
    } catch (error) {
      toast.error('Failed to remove item');
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  }, []);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      updateQuantity, 
      removeItem, 
      clearCart,
      fetchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
