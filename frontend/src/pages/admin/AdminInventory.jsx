import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState({});
  const { showToast } = useNotification();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory');
      setInventory(res.data || []);
    } catch (err) {
      showToast('Error loading inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUpdateStock = async (productId) => {
    const newStock = editingStock[productId];
    if (newStock === undefined) return;

    try {
      await api.put('/admin/inventory/stock', {
        productId,
        stock: Number(newStock)
      });
      showToast('Inventory stock updated successfully!', 'success');
      loadInventory();
    } catch (err) {
      showToast('Error updating stock', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Warehouse Stock & Inventory Tracking
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Monitor active material stocks across fulfillment hubs with low-stock warnings
          </p>
        </div>
        <button onClick={loadInventory} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Refresh Stock
        </button>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Current Stock</th>
              <th>Unit</th>
              <th>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.productId} style={{ background: item.isLowStock ? '#FFFBEB' : 'transparent' }}>
                <td>
                  <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{item.name}</strong>
                  {item.isLowStock && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#DC2626', fontWeight: 700, marginTop: '2px' }}>
                      <AlertTriangle size={12} />
                      <span>Below Reorder Threshold (≤ 15)</span>
                    </div>
                  )}
                </td>
                <td style={{ fontSize: '12px', color: '#64748B' }}>{item.sku}</td>
                <td style={{ fontSize: '12.5px' }}>{item.category}</td>
                <td style={{ fontSize: '12.5px', fontWeight: 600 }}>{item.brand}</td>
                <td>
                  <strong style={{ fontSize: '15px', color: item.isLowStock ? '#DC2626' : '#0F172A' }}>
                    {item.stock}
                  </strong>
                </td>
                <td style={{ fontSize: '12px', color: '#64748B' }}>{item.unit}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder={item.stock}
                      value={editingStock[item.productId] ?? ''}
                      onChange={e => setEditingStock({ ...editingStock, [item.productId]: e.target.value })}
                      style={{ width: '70px', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '12.5px' }}
                    />
                    <button
                      onClick={() => handleUpdateStock(item.productId)}
                      style={{ background: '#D97706', color: '#FFFFFF', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;

