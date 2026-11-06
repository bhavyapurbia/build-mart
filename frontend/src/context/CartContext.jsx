import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const { showToast } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem('bm_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const productId = product._id || product.id;
    setCartItems(prev => {
      const idx = prev.findIndex(item => (item.productId || item._id || item.product?._id) === productId);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += Number(quantity);
        return copy;
      } else {
        return [...prev, {
          productId,
          _id: productId,
          product,
          name: product.name,
          brand: product.brand || '',
          image: (product.images && product.images[0]) || product.image || '',
          price: Number(product.price) || 0,
          mrp: Number(product.mrp) || 0,
          unit: product.unit || 'Piece',
          quantity: Number(quantity) || 1
        }];
      }
    });
    showToast(`Added "${product.name ? product.name.slice(0, 30) : 'Item'}..." to Cart!`, 'success', 2500);
  };

  const updateCartQty = (productId, quantity) => {
    const numQty = Number(quantity);
    if (numQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if ((item.productId || item._id || item.product?._id) === productId) {
        return { ...item, quantity: numQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => (item.productId || item._id || item.product?._id) !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem('bm_cart');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST typical for building hardware
  const deliveryFee = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
  const totalAmount = Math.max(0, subtotal + tax + deliveryFee - couponDiscount);

  const applyCoupon = async (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    try {
      const res = await api.post('/coupons/validate', { code, cartTotal: subtotal });
      setCoupon(res.data);
      setCouponDiscount(res.data.discountAmount);
      showToast(res.data.message, 'success');
      return { success: true, discount: res.data.discountAmount };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed', 'info');
  };

  const value = {
    cartItems,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    addToCart,
    updateCartQty,
    updateQuantity: updateCartQty,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    coupon,
    couponDiscount,
    totalAmount,
    applyCoupon,
    removeCoupon
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
