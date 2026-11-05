import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from './NotificationContext';

const MaterialListContext = createContext();

export const MaterialListProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bm_material_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem('bm_material_list', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save material list to localStorage', e);
    }
  }, [items]);

  const toggleMaterialItem = (product) => {
    const productId = product._id || product.id;
    const exists = items.some(item => (item.productId || item._id) === productId);

    if (exists) {
      setItems(prev => prev.filter(item => (item.productId || item._id) !== productId));
      showToast(`Removed "${product.name.slice(0, 32)}..." from Material List`, 'info', 2500);
    } else {
      const newItem = {
        productId,
        name: product.name,
        brand: product.brand || '',
        image: (product.images && product.images[0]) || product.image || '',
        price: Number(product.price) || 0,
        mrp: Number(product.mrp) || 0,
        unit: product.unit || 'Piece',
        category: product.category || '',
        quantity: 1
      };
      setItems(prev => [...prev, newItem]);
      showToast(`Added "${product.name.slice(0, 32)}..." to your Material List!`, 'success', 2500);
    }
  };

  const isMaterialSelected = (productId) => {
    return items.some(item => (item.productId || item._id) === productId);
  };

  const updateQuantity = (productId, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setItems(prev => prev.map(item => {
      if ((item.productId || item._id) === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const removeMaterialItem = (productId) => {
    setItems(prev => prev.filter(item => (item.productId || item._id) !== productId));
    showToast('Item removed from Material List', 'info');
  };

  const clearMaterialList = () => {
    setItems([]);
    localStorage.removeItem('bm_material_list');
  };

  const submitMaterialRequest = async (customerDetails) => {
    if (!items.length) {
      showToast('Your Material List is empty! Click product images to add materials.', 'error');
      return { success: false, message: 'Material list is empty' };
    }

    setSubmitting(true);
    try {
      const payload = {
        customer: customerDetails,
        items: items.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          brand: item.brand,
          image: item.image,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        }))
      };

      const res = await api.post('/material-requests', payload);
      clearMaterialList();
      showToast(`Material List #${res.data.requestId} submitted for review!`, 'success', 5000);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit Material List request.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  };

  const value = {
    items,
    materialCount: items.length,
    toggleMaterialItem,
    isMaterialSelected,
    updateQuantity,
    removeMaterialItem,
    clearMaterialList,
    submitMaterialRequest,
    submitting
  };

  return (
    <MaterialListContext.Provider value={value}>
      {children}
    </MaterialListContext.Provider>
  );
};

export const useMaterialList = () => useContext(MaterialListContext);

