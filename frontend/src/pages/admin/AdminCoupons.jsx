import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercent: 10,
    maxDiscount: 3000,
    minOrderValue: 2000,
    validUntil: '2026-12-31'
  });

  const { showToast } = useNotification();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setCoupons(list);
    } catch (err) {
      showToast('Error loading coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleToggle = async (id, currentActive) => {
    try {
      const res = await api.put(`/coupons/${id}/toggle`);
      const msg = res.data?.message || (currentActive ? 'Coupon disabled (OFF)' : 'Coupon activated (ON)');
      showToast(msg, 'success');
      loadCoupons();
    } catch (err) {
      showToast('Error toggling coupon status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast('Coupon deleted', 'success');
      loadCoupons();
    } catch (err) {
      showToast('Error deleting coupon', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      showToast('Coupon created successfully!', 'success');
      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating coupon', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Promotional Coupons & Trade Discounts
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Configure percentage discounts, minimum site order thresholds, and expiry limits
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Rate</th>
              <th>Min Order (₹)</th>
              <th>Max Cap (₹)</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(cp => (
              <tr key={cp._id}>
                <td>
                  <strong style={{ fontSize: '14px', color: '#D97706', letterSpacing: '0.5px' }}>{cp.code}</strong>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{cp.description}</div>
                </td>
                <td><strong style={{ color: '#10B981' }}>{cp.discountPercent}% OFF</strong></td>
                <td>₹{cp.minOrderValue?.toLocaleString('en-IN')}</td>
                <td>₹{cp.maxDiscount?.toLocaleString('en-IN')}</td>
                <td style={{ fontSize: '12.5px', color: '#64748B' }}>{cp.validUntil || 'Lifetime'}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggle(cp._id || cp.id, cp.isActive !== false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: cp.isActive !== false ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                      transition: 'all 0.2s ease',
                      background: cp.isActive !== false ? '#DCFCE7' : '#F1F5F9',
                      color: cp.isActive !== false ? '#15803D' : '#64748B',
                      boxShadow: cp.isActive !== false ? '0 1px 3px rgba(22, 163, 74, 0.2)' : 'none'
                    }}
                    title={`Click to turn ${cp.isActive !== false ? 'OFF' : 'ON'}`}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: cp.isActive !== false ? '#16A34A' : '#94A3B8'
                      }}
                    />
                    <span>{cp.isActive !== false ? 'ON (Active)' : 'OFF (Disabled)'}</span>
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(cp._id)} style={{ background: '#FEE2E2', border: '1px solid #FECACA', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={14} color="#B91C1C" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Create New Discount Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONSOON15"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Discount Percent (%) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={90}
                      value={formData.discountPercent}
                      onChange={e => setFormData({ ...formData, discountPercent: Number(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;

