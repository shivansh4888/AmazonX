'use client';
// Cart Context - Global state management for shopping cart
// Wraps the entire app so any component can access cart data

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, getSessionId } from '@/lib/api';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
    appliedCoupon: null,
  });
  const [loading, setLoading] = useState(false);

  // Initialize session and fetch cart on mount
  useEffect(() => {
    getSessionId(); // Ensure session exists
    fetchCart();
  }, []);

  useEffect(() => {
    const pendingCoupon = typeof window !== 'undefined'
      ? localStorage.getItem('shopx_pending_coupon')
      : null;

    if (!pendingCoupon || cart.items.length === 0 || cart.appliedCoupon?.code === pendingCoupon) {
      return;
    }

    applyCoupon(pendingCoupon, { silent: true }).then((success) => {
      if (success && typeof window !== 'undefined') {
        localStorage.removeItem('shopx_pending_coupon');
      }
    });
  }, [cart.items.length, cart.appliedCoupon?.code]);

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
      const { data } = await cartApi.update(itemId, quantity);
      setCart(data.cart);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const { data } = await cartApi.remove(itemId);
      setCart(data.cart);
      toast.success('Item removed', { icon: '🗑️' });
    } catch (error) {
      toast.error('Failed to remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clear();
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  }, []);

  const applyCoupon = useCallback(async (code, options = {}) => {
    if (!code) return false;

    try {
      const { data } = await cartApi.applyCoupon(code);
      setCart(data.cart);
      if (!options.silent) {
        toast.success(data.message || 'Coupon applied');
      }
      return true;
    } catch (error) {
      if (!options.silent) {
        toast.error(error.response?.data?.error || 'Failed to apply coupon');
      }
      return false;
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
      fetchCart,
      applyCoupon,
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
