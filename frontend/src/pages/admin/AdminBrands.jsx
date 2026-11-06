import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2, X, Check, Search, ShieldCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    isFeatured: true
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setBrands(list);
    } catch (err) {
      showToast('Error loading brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=200&q=80',
      isFeatured: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      isFeatured: brand.isFeatured !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id || editingBrand.id}`, formData);
        showToast('Brand updated successfully!', 'success');
      } else {
        await api.post('/brands', formData);
        showToast('New brand added successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving brand', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      showToast(`Brand "${name}" removed.`, 'success');
      fetchBrands();
    } catch (err) {
      showToast('Error deleting brand', 'error');
    }
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Page Title Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Brands & Manufacturers
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Manage authorized construction material brands, OEM logos, and featured manufacturer cards
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary"
          style={{ display: 'inline-flex', padding: '10px 18px', fontSize: '13px' }}
        >
          <Plus size={16} />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '400px' }}>
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search brands by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13.5px' }}
          />
        </div>
      </div>

      {/* Brands Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Loading brands...</div>
        ) : filteredBrands.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 18px' }}>Logo</th>
                  <th style={{ padding: '12px 18px' }}>Brand Name</th>
                  <th style={{ padding: '12px 18px' }}>Description</th>
                  <th style={{ padding: '12px 18px' }}>Featured</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map(b => (
                  <tr key={b._id || b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#FFF5EB', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={b.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=100&q=80'}
                          alt={b.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px', fontWeight: 800, color: '#0F172A' }}>
                      {b.name}
                    </td>
                    <td style={{ padding: '12px 18px', color: '#64748B', maxWidth: '300px' }}>
                      {b.description || 'Verified manufacturer partner'}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        background: b.isFeatured !== false ? '#ECFDF5' : '#F1F5F9',
                        color: b.isFeatured !== false ? '#065F46' : '#64748B',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {b.isFeatured !== false ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(b)}
                          style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', color: '#0F172A' }}
                          title="Edit Brand"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id || b.id, b.name)}
                          style={{ padding: '6px', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444' }}
                          title="Delete Brand"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No brands found.
          </div>
        )}
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                {editingBrand ? 'Edit Brand' : 'Add New Manufacturer Brand'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Brand Name * (e.g. UltraTech, Tata Tiscon, Dr. Fixit, Havells, Futura, Hettich)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Description / Speciality
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of products supplied by this brand"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isFeatured" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                    Show in Homepage "Shop by brand" section
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ color: '#0F172A', border: '1px solid #CBD5E1' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;

