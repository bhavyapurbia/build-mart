import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

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
  const [validationAlerts, setValidationAlerts] = useState([]);

  // Save to localStorage whenever cartItems change
  useEffect(() => {
    try {
      localStorage.setItem('bm_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Validate cart against server prices and stock
  const validateCurrentCart = useCallback(async (itemsToValidate = cartItems) => {
    if (!itemsToValidate || itemsToValidate.length === 0) {
      setValidationAlerts([]);
      return;
    }

    try {
      const res = await api.post('/cart/validate', { items: itemsToValidate });
      const data = res.data?.data || res.data;
      if (data) {
        if (Array.isArray(data.items) && data.hasChanges) {
          setCartItems(data.items);
          setValidationAlerts(data.changes || []);
          if (coupon) {
            setCoupon(null);
            setCouponDiscount(0);
          }
        }
      }
    } catch (err) {
      // Quiet fail if offline
    }
  }, [cartItems, coupon]);

  // On mount or user auth change, validate cart or merge guest cart
  useEffect(() => {
    let isMounted = true;

    const syncOrMerge = async () => {
      const saved = localStorage.getItem('bm_cart');
      let localItems = [];
      if (saved) {
        try {
          localItems = JSON.parse(saved);
        } catch (e) {}
      }

      if (isAuthenticated) {
        try {
          if (localItems.length > 0) {
            const res = await api.post('/cart/merge', { items: localItems });
            const cartData = res.data?.data || res.data;
            if (isMounted && cartData?.items) {
              setCartItems(cartData.items);
            }
          } else {
            const res = await api.get('/cart');
            const cartData = res.data?.data || res.data;
            if (isMounted && cartData?.items) {
              setCartItems(cartData.items);
            }
          }
        } catch (err) {
          console.warn('Failed to sync server cart on login', err);
        }
      } else if (localItems.length > 0) {
        validateCurrentCart(localItems);
      }
    };

    syncOrMerge();

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // Add to cart (Guest-friendly, no login required, pure state update)
  const addToCart = (product, quantity = 1) => {
    if (!product) return;

    const productId = String(product._id || product.id);
    const numQty = Math.max(1, Number(quantity) || 1);
    const maxStock = Number(product.stock != null ? product.stock : 9999);

    setCartItems(prev => {
      const idx = prev.findIndex(item => String(item.productId || item._id || item.product?._id) === productId);
      if (idx > -1) {
        const existing = prev[idx];
        const newQty = Math.min(maxStock, existing.quantity + numQty);
        const updated = [...prev];
        updated[idx] = {
          ...existing,
          quantity: newQty,
          price: Number(product.price != null ? product.price : existing.price)
        };
        return updated;
      } else {
        const effectiveQty = Math.min(maxStock, numQty);
        return [
          ...prev,
          {
            productId,
            _id: productId,
            name: product.name,
            brand: product.brand || '',
            image: (product.images && product.images[0]) || product.image || '/placeholder-material.svg',
            price: Number(product.price) || 0,
            mrp: Number(product.mrp) || Number(product.price) || 0,
            unit: product.unit || 'Piece',
            quantity: effectiveQty,
            stock: maxStock
          }
        ];
      }
    });

    // Clear applied coupon if line items change to prevent stale discount amounts
    if (coupon) {
      setCoupon(null);
      setCouponDiscount(0);
    }

    showToast(`Added "${product.name ? product.name.slice(0, 30) : 'Item'}" to Cart!`, 'success', 2500);
  };

  const updateCartQty = (productId, quantity) => {
    const pId = String(productId);
    const numQty = Number(quantity);

    if (numQty <= 0) {
      removeFromCart(pId);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (String(item.productId || item._id || item.product?._id) === pId) {
        const maxStock = Number(item.stock != null ? item.stock : 9999);
        return { ...item, quantity: Math.min(maxStock, numQty) };
      }
      return item;
    }));

    if (coupon) {
      setCoupon(null);
      setCouponDiscount(0);
    }
  };

  const removeFromCart = (productId) => {
    const pId = String(productId);
    setCartItems(prev => prev.filter(item => String(item.productId || item._id || item.product?._id) !== pId));
    if (coupon) {
      setCoupon(null);
      setCouponDiscount(0);
    }
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setCouponDiscount(0);
    setValidationAlerts([]);
    localStorage.removeItem('bm_cart');
    if (isAuthenticated) {
      api.post('/cart/clear').catch(() => {});
    }
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const deliveryFee = (subtotal >= 5000 || subtotal === 0) ? 0 : 350;
  const totalAmount = Math.max(0, subtotal + tax + deliveryFee - couponDiscount);

  // Recalculate coupon discount whenever cart subtotal changes
  useEffect(() => {
    if (coupon) {
      const minVal = coupon.minOrderValue || 1000;
      if (subtotal < minVal) {
        setCoupon(null);
        setCouponDiscount(0);
        showToast(`Cart fell below minimum order (₹${minVal}). Coupon removed.`, 'info');
      } else {
        const recalculated = Math.min(
          Math.round((subtotal * coupon.discountPercent) / 100),
          coupon.maxDiscount || 5000
        );
        setCouponDiscount(recalculated);
      }
    }
  }, [subtotal, coupon, showToast]);

  const applyCoupon = async (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    try {
      const res = await api.post('/coupons/validate', { code, cartTotal: subtotal });
      const payload = res.data?.data || res.data;
      setCoupon(payload);
      setCouponDiscount(payload.discountAmount);
      showToast(res.data.message || 'Coupon applied successfully!', 'success');
      return { success: true, discount: payload.discountAmount };
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
    validationAlerts,
    validateCurrentCart,
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
