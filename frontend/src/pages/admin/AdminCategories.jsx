import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import CloudinaryImageUpload from '../../components/common/CloudinaryImageUpload';
import api, { notifyCatalogUpdated } from '../../utils/api';

const PLACEHOLDERS = new Set(['/placeholder-material.svg', '/placeholder-material.jpg', '/placeholder.svg']);

const toSlug = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const cleanStoredImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  return PLACEHOLDERS.has(trimmed) ? '' : trimmed;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSubInput, setNewSubInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'Building2',
    subcategories: []
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
      setCategories(list);
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
    setNewSubInput('');
    setFormData({
      name: '',
      description: '',
      image: '',
      icon: 'Building2',
      subcategories: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setNewSubInput('');
    const subs = (c.subcategories || []).map(s => {
      const subName = typeof s === 'object' ? (s.name || '') : String(s);
      const subImg = typeof s === 'object' ? (s.customImage || s.image || '') : '';
      return {
        name: subName,
        slug: typeof s === 'object' ? (s.slug || toSlug(subName)) : toSlug(subName),
        description: typeof s === 'object' ? (s.description || '') : `${subName} products`,
        image: cleanStoredImage(subImg)
      };
    });

    const catImg = c.customImage || c.image || '';
    setFormData({
      name: c.name || '',
      description: c.description || '',
      image: cleanStoredImage(catImg),
      icon: c.icon || 'Building2',
      subcategories: subs
    });
    setIsModalOpen(true);
  };

  const handleAddSubcategories = () => {
    const names = newSubInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    setFormData(prev => {
      const existingNames = new Set(prev.subcategories.map(s => s.name.toLowerCase()));
      const additions = [];
      for (const n of names) {
        if (!existingNames.has(n.toLowerCase())) {
          existingNames.add(n.toLowerCase());
          additions.push({
            name: n,
            slug: toSlug(n),
            description: `${n} products`,
            image: ''
          });
        }
      }
      return { ...prev, subcategories: [...prev.subcategories, ...additions] };
    });
    setNewSubInput('');
  };

  const handleSubNameChange = (idx, value) => {
    setFormData(prev => {
      const updated = [...prev.subcategories];
      updated[idx] = {
        ...updated[idx],
        name: value,
        slug: toSlug(value),
        description: `${value} products`
      };
      return { ...prev, subcategories: updated };
    });
  };

  const handleSubImageChange = (idx, url) => {
    const trimmed = (url || '').trim();
    setFormData(prev => {
      const updated = [...prev.subcategories];
      updated[idx] = { ...updated[idx], image: trimmed };
      return { ...prev, subcategories: updated };
    });
  };

  const handleRemoveSub = (idx) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== idx)
    }));
  };

  const handleDeleteCategory = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      showToast(`Category "${c.name}" deleted.`, 'success');
      notifyCatalogUpdated();
      await loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If user typed something in quick-add input without clicking Add, include it automatically
    let finalSubs = [...formData.subcategories];
    if (newSubInput.trim()) {
      const extraNames = newSubInput.split(',').map(s => s.trim()).filter(Boolean);
      const existing = new Set(finalSubs.map(s => s.name.toLowerCase()));
      extraNames.forEach(n => {
        if (!existing.has(n.toLowerCase())) {
          existing.add(n.toLowerCase());
          finalSubs.push({ name: n, slug: toSlug(n), description: `${n} products`, image: '' });
        }
      });
    }

    const cleanedSubs = finalSubs
      .map(s => ({
        name: (s.name || '').trim(),
        slug: toSlug(s.name),
        description: (s.description || `${s.name} products`).trim(),
        image: cleanStoredImage(s.image)
      }))
      .filter(s => s.name);

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: cleanStoredImage(formData.image),
        icon: formData.icon,
        subcategories: cleanedSubs
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        showToast('Category updated successfully!', 'success');
      } else {
        await api.post('/categories', payload);
        showToast('Category created successfully!', 'success');
      }

      notifyCatalogUpdated();
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving category', 'error');
    } finally {
      setSaving(false);
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
            Upload unique Cloudinary images for each category and subcategory
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
              <th>Subcategories & Unique Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#F8FAFC', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={c.image || '/placeholder-material.svg'}
                        alt={c.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/placeholder-material.svg'; }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>{c.name}</strong>
                        {c.customImage && c.customImage.includes('res.cloudinary.com') && (
                          <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Cloudinary
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}>slug: {c.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '12.5px', color: 'var(--text-sub)', maxWidth: '220px' }}>
                  {c.description}
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '380px' }}>
                    {c.subcategories?.map((sub, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'var(--color-paper-3)',
                          border: sub.customImage ? '1px solid #BBF7D0' : '1px solid var(--color-rule)',
                          padding: '3px 7px 3px 4px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: 'var(--secondary-light)'
                        }}
                      >
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={13} color="#94A3B8" />
                        )}
                        <span>{sub.name}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      style={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '94%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add Category'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paint"
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
                      placeholder="Short category description"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                {/* Category Main Cloudinary Image Upload */}
                <CloudinaryImageUpload
                  label="Category Main Image (Cloudinary)"
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  folder="categories"
                  helpText="Upload category cover image to Cloudinary (JPEG, PNG, WebP)"
                  previewHeight="130px"
                />

                {/* Subcategories Section with Unique Cloudinary Image Per Subcategory */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                      Subcategories ({formData.subcategories.length}) — Unique Image per Subcategory
                    </strong>
                    <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                      Cloudinary CDN
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>
                    Add subcategories below and upload a separate, unique Cloudinary image for each card.
                  </p>

                  {/* Quick-Add Bar (supports single or comma-separated names) */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Add subcategory (or comma separated: paint, primer, putti, damproof)"
                      value={newSubInput}
                      onChange={e => setNewSubInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategories();
                        }
                      }}
                      style={{ flex: 1, padding: '8px 11px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', background: '#FFFFFF' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategories}
                      style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Individual Subcategory Rows with Unique Cloudinary Upload */}
                  {formData.subcategories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '12.5px', border: '1px dashed #CBD5E1', borderRadius: '8px', background: '#FFFFFF' }}>
                      No subcategories added yet. Type names above and click <strong>Add</strong>.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {formData.subcategories.map((sub, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', minWidth: '22px' }}>
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              required
                              value={sub.name}
                              onChange={e => handleSubNameChange(idx, e.target.value)}
                              placeholder="Subcategory name"
                              style={{ flex: 1, padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                            />
                            {sub.image ? (
                              <span style={{ fontSize: '10.5px', color: '#166534', background: '#DCFCE7', padding: '2px 7px', borderRadius: '999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={11} /> Unique Image
                              </span>
                            ) : (
                              <span style={{ fontSize: '10.5px', color: '#B45309', background: '#FEF3C7', padding: '2px 7px', borderRadius: '999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <AlertCircle size={11} /> Upload Image
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveSub(idx)}
                              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '5px 7px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Remove subcategory"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <CloudinaryImageUpload
                            compact
                            value={sub.image}
                            onChange={(url) => handleSubImageChange(idx, url)}
                            folder="categories/subcategories"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ background: 'var(--color-paper-3)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  <span>{saving ? 'Saving...' : 'Save Category'}</span>
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
