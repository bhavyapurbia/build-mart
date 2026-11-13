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
      const payload = res.data?.data || res.data;
      const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.inventory)
          ? payload.inventory
          : (Array.isArray(res.data?.inventory) ? res.data.inventory : []));
      setInventory(list);
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Warehouse Stock & Inventory Tracking
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
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
            {!Array.isArray(inventory) || inventory.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted)', fontSize: '13.5px' }}>
                  No inventory tracking records found.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
              <tr key={item.productId} style={{ background: item.isLowStock ? 'var(--color-accent-light)' : 'transparent' }}>
                <td>
                  <strong style={{ fontSize: '13.5px', color: 'var(--color-ink)' }}>{item.name}</strong>
                  {item.isLowStock && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-error)', fontWeight: 700, marginTop: '2px' }}>
                      <AlertTriangle size={12} />
                      <span>Below Reorder Threshold (≤ 15)</span>
                    </div>
                  )}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{item.sku}</td>
                <td style={{ fontSize: '12.5px' }}>{item.category}</td>
                <td style={{ fontSize: '12.5px', fontWeight: 600 }}>{item.brand}</td>
                <td>
                  <strong style={{ fontSize: '15px', color: item.isLowStock ? 'var(--color-error)' : 'var(--color-ink)' }}>
                    {item.stock}
                  </strong>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{item.unit}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder={item.stock}
                      value={editingStock[item.productId] ?? ''}
                      onChange={e => setEditingStock({ ...editingStock, [item.productId]: e.target.value })}
                      style={{ width: '70px', padding: '6px 8px', border: '1px solid var(--color-rule)', borderRadius: '4px', fontSize: '12.5px' }}
                    />
                    <button
                      onClick={() => handleUpdateStock(item.productId)}
                      style={{ background: 'var(--primary-dark)', color: 'var(--bg-card)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;

