import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const GUEST_CART_KEY = 'bm_guest_cart';
const LEGACY_CART_KEY = 'bm_cart';
const MAX_ITEM_QTY = 999;

const readGuestCart = () => {
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  try {
    if (!items || items.length === 0) {
      localStorage.removeItem(GUEST_CART_KEY);
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to save guest cart to localStorage', e);
  }
};

const normalizeClientItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter(Boolean)
    .map(item => {
      const pId = String(item.productId || item._id || item.product?._id || '');
      const rawQty = Number(item.quantity);
      const safeQty = (!Number.isFinite(rawQty) || rawQty < 1 || rawQty > MAX_ITEM_QTY)
        ? 1
        : Math.floor(rawQty);
      return {
        ...item,
        productId: pId,
        _id: pId,
        price: Number(item.price) || 0,
        mrp: Number(item.mrp) || Number(item.price) || 0,
        quantity: safeQty
      };
    })
    .filter(item => item.productId);
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useNotification();

  const [cartItems, setCartItems] = useState(() => {
    // Only initialize from guest storage if no auth token is present
    const hasToken = Boolean(localStorage.getItem('bm_token'));
    return hasToken ? [] : normalizeClientItems(readGuestCart());
  });

  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validationAlerts, setValidationAlerts] = useState([]);
  const wasAuthenticatedRef = useRef(false);

  // Sync updated items to server (when logged in) or guest storage (when logged out)
  const persistCart = useCallback((nextItems) => {
    const clean = normalizeClientItems(nextItems);
    if (isAuthenticated) {
      localStorage.removeItem(LEGACY_CART_KEY);
      localStorage.removeItem(GUEST_CART_KEY);
      api.post('/cart/sync', { items: clean }).catch((err) => {
        console.warn('Failed to sync cart to server:', err.message);
      });
    } else {
      writeGuestCart(clean);
    }
  }, [isAuthenticated]);

  // Validate cart against server prices and stock
  const validateCurrentCart = useCallback(async (itemsToValidate = cartItems) => {
    if (!itemsToValidate || itemsToValidate.length === 0) {
      setValidationAlerts([]);
      return;
    }

    try {
      const res = await api.post('/cart/validate', { items: itemsToValidate });
      const data = res.data?.data || res.data;
      if (data && Array.isArray(data.items) && data.hasChanges) {
        const cleaned = normalizeClientItems(data.items);
        setCartItems(cleaned);
        persistCart(cleaned);
        setValidationAlerts(data.changes || []);
        if (coupon) {
          setCoupon(null);
          setCouponDiscount(0);
        }
      }
    } catch {
      // Quiet fail if offline
    }
  }, [cartItems, coupon, persistCart]);

  // On auth resolution: fetch server cart (and merge true guest cart ONCE if present)
  useEffect(() => {
    if (authLoading) return;
    let isMounted = true;

    const loadCartForSession = async () => {
      if (isAuthenticated) {
        wasAuthenticatedRef.current = true;
        // Remove legacy shared key so previously saved server carts can NEVER re-merge into themselves
        localStorage.removeItem(LEGACY_CART_KEY);

        const guestItems = normalizeClientItems(readGuestCart());
        try {
          if (guestItems.length > 0) {
            // Clear guest cart immediately before/after merging so it can never merge twice
            localStorage.removeItem(GUEST_CART_KEY);
            const res = await api.post('/cart/merge', { guestItems });
            const cartData = res.data?.data || res.data;
            if (isMounted && Array.isArray(cartData?.items)) {
              setCartItems(normalizeClientItems(cartData.items));
            }
          } else {
            const res = await api.get('/cart');
            const cartData = res.data?.data || res.data;
            if (isMounted && Array.isArray(cartData?.items)) {
              setCartItems(normalizeClientItems(cartData.items));
            }
          }
        } catch (err) {
          console.warn('Failed to load server cart:', err);
        }
      } else {
        // If user just logged out, reset state to empty guest cart
        if (wasAuthenticatedRef.current) {
          wasAuthenticatedRef.current = false;
          localStorage.removeItem(LEGACY_CART_KEY);
          if (isMounted) {
            setCartItems([]);
            setCoupon(null);
            setCouponDiscount(0);
            setValidationAlerts([]);
          }
          return;
        }

        const guestItems = normalizeClientItems(readGuestCart());
        if (isMounted) {
          setCartItems(guestItems);
        }
        if (guestItems.length > 0) {
          validateCurrentCart(guestItems);
        }
      }
    };

    loadCartForSession();

    return () => { isMounted = false; };
  }, [isAuthenticated, authLoading]);

  // Add to cart (syncs immediately to server if authenticated, else guest localStorage)
  const addToCart = (product, quantity = 1) => {
    if (!product) return;

    const productId = String(product._id || product.id);
    const numQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const maxStock = Math.min(Number(product.stock != null ? product.stock : MAX_ITEM_QTY), MAX_ITEM_QTY);

    setCartItems(prev => {
      const idx = prev.findIndex(item => String(item.productId || item._id || item.product?._id) === productId);
      let nextItems;
      if (idx > -1) {
        const existing = prev[idx];
        const newQty = Math.min(maxStock, (Number(existing.quantity) || 1) + numQty);
        nextItems = [...prev];
        nextItems[idx] = {
          ...existing,
          quantity: newQty,
          price: Number(product.price != null ? product.price : existing.price)
        };
      } else {
        const effectiveQty = Math.min(maxStock, numQty);
        nextItems = [
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

      persistCart(nextItems);
      return nextItems;
    });

    if (coupon) {
      setCoupon(null);
      setCouponDiscount(0);
    }

    showToast(`Added "${product.name ? product.name.slice(0, 30) : 'Item'}" to Cart!`, 'success', 2500);
  };

  const updateCartQty = (productId, quantity) => {
    const pId = String(productId);
    const numQty = Math.floor(Number(quantity));

    if (!Number.isFinite(numQty) || numQty <= 0) {
      removeFromCart(pId);
      return;
    }

    setCartItems(prev => {
      const nextItems = prev.map(item => {
        if (String(item.productId || item._id || item.product?._id) === pId) {
          const maxStock = Math.min(Number(item.stock != null ? item.stock : MAX_ITEM_QTY), MAX_ITEM_QTY);
          return { ...item, quantity: Math.min(maxStock, numQty) };
        }
        return item;
      });
      persistCart(nextItems);
      return nextItems;
    });

    if (coupon) {
      setCoupon(null);
      setCouponDiscount(0);
    }
  };

  const removeFromCart = (productId) => {
    const pId = String(productId);
    setCartItems(prev => {
      const nextItems = prev.filter(item => String(item.productId || item._id || item.product?._id) !== pId);
      persistCart(nextItems);
      return nextItems;
    });
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
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(LEGACY_CART_KEY);
    if (isAuthenticated) {
      api.post('/cart/clear').catch(() => {});
    }
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
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
    cartCount: cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
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
