import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from backend or localStorage
  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          // Check if guest wishlist needs to be merged
          const guestWishlistStr = localStorage.getItem('bm_wishlist');
          let guestIds = [];
          if (guestWishlistStr) {
            try {
              const parsed = JSON.parse(guestWishlistStr);
              guestIds = Array.isArray(parsed) ? parsed.map(item => item._id || item.id || item) : [];
            } catch (e) {}
          }

          if (guestIds.length > 0) {
            try {
              await api.post('/wishlist/merge', { productIds: guestIds });
              localStorage.removeItem('bm_wishlist');
            } catch (mergeErr) {
              console.warn('Failed to merge guest wishlist:', mergeErr);
            }
          }

          const res = await api.get('/wishlist');
          const data = res.data?.data || res.data;
          if (isMounted) {
            const list = Array.isArray(data) ? data : (data?.products || []);
            setItems(list);
          }
        } catch (err) {
          console.warn('Failed to fetch wishlist from server:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        // Guest mode: load from localStorage
        const stored = localStorage.getItem('bm_wishlist');
        if (stored) {
          try {
            setItems(JSON.parse(stored));
          } catch (e) {
            setItems([]);
          }
        } else {
          setItems([]);
        }
        setLoading(false);
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?._id]);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    const pId = String(productId);
    return items.some(item => {
      const id = String(item._id || item.id || item);
      return id === pId;
    });
  }, [items]);

  const addToWishlist = async (product) => {
    const pId = String(product._id || product.id);
    if (isInWishlist(pId)) return;

    if (isAuthenticated) {
      try {
        await api.post(`/wishlist/${pId}`);
        setItems(prev => [...prev, product]);
        showToast('Added to your wishlist!', 'success');
      } catch (err) {
        showToast('Failed to add to wishlist', 'error');
      }
    } else {
      const updated = [...items, product];
      setItems(updated);
      localStorage.setItem('bm_wishlist', JSON.stringify(updated));
      showToast('Added to your wishlist!', 'success');
    }
  };

  const removeFromWishlist = async (productId) => {
    const pId = String(productId);

    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${pId}`);
        setItems(prev => prev.filter(item => String(item._id || item.id || item) !== pId));
        showToast('Removed from wishlist', 'info');
      } catch (err) {
        showToast('Failed to remove from wishlist', 'error');
      }
    } else {
      const updated = items.filter(item => String(item._id || item.id || item) !== pId);
      setItems(updated);
      localStorage.setItem('bm_wishlist', JSON.stringify(updated));
      showToast('Removed from wishlist', 'info');
    }
  };

  const toggleWishlist = async (product) => {
    const pId = String(product._id || product.id);
    if (isInWishlist(pId)) {
      await removeFromWishlist(pId);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

