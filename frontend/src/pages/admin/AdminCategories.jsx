import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Sparkles, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'Building2',
    subcategoriesText: ''
  });

  const { showToast } = useNotification();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      const payload = res.data?.data || res.data;
      const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.categories)
          ? payload.categories
          : (Array.isArray(res.data?.categories) ? res.data.categories : []));
      // No electrical
      const safe = list.filter(c =>
        !c.name.toLowerCase().includes('electrical') &&
        !c.slug.toLowerCase().includes('electrical')
      );
      setCategories(safe);
    } catch (err) {
      showToast('Error loading categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      icon: 'Building2',
      subcategoriesText: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      description: c.description || '',
      image: c.productImageReference || c.image || '',
      icon: c.icon || 'Building2',
      subcategoriesText: (c.subcategories || []).map(s => s.name).join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subcategories = formData.subcategoriesText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(name => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: `${name} products`
        }));

      const payload = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        icon: formData.icon,
        subcategories
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        showToast('Category updated successfully!', 'success');
      } else {
        await api.post('/categories', payload);
        showToast('Category created successfully!', 'success');
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving category', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Category & Subcategory Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
            Manage the 8 core construction categories, upload banners, and configure subcategories
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Subcategories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '8px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={c.productImageReference || c.image || '/placeholder-material.jpg'}
                        alt={c.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = '/placeholder-material.jpg'; }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>{c.name}</strong>
                        {c.productCount > 0 ? (
                          <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {c.productCount} Products
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#64748B', padding: '1px 6px', borderRadius: '4px' }}>
                            Auto-Ref
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}>slug: {c.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '12.5px', color: 'var(--text-sub)', maxWidth: '240px' }}>
                  {c.description}
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                    {c.subcategories?.map((sub, i) => (
                      <span key={i} style={{ background: 'var(--color-paper-3)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: 'var(--secondary-light)' }}>
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    style={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                  />
                </div>

                {/* Image Reference Notice - No manual image upload needed */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="#FF7800" />
                      Product Image Auto-Referencing
                    </strong>
                    <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Real Product Images
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.45 }}>
                    Categories and subcategories automatically display the real product photos from your product catalog. No manual category image upload is needed!
                  </p>

                  {formData.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', background: '#F1F5F9', border: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={formData.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block' }}>Active Reference Image</span>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formData.image}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Subcategories (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Floor tiles, Wall tiles, Adhesives, Grout"
                    value={formData.subcategoriesText}
                    onChange={e => setFormData({ ...formData, subcategoriesText: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ background: 'var(--color-paper-3)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

