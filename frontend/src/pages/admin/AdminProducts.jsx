import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const CATEGORIES = [
  'Cement & Steel',
  'Tiles & Adhesives',
  'Waterproofing',
  'Plumbing & Sanitary',
  'Hardware & Locks',
  'Electrical & Automation',
  'Tools & Equipment'
];

const PRESET_IMAGE_SUGGESTIONS = [
  { label: 'Asian Paints Damp Proof', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80' },
  { label: 'UltraTech PPC Cement', url: '/categories/cement-bags-ultratech.png' },
  { label: 'Tata Tiscon Rebars', url: '/categories/tmt-bars.svg' },
  { label: 'Araldite Klear5 Adhesive', url: '/deals/araldite-klear5.svg' },
  { label: 'Fevikwik 463 Thick Gel', url: '/deals/fevikwik-463.svg' },
  { label: 'Hindware Western Commode', url: '/deals/western-commode-deal.svg' },
  { label: 'Kohinoor Extension Nipple', url: '/deals/kohinoor-extension-nipple.svg' },
  { label: 'Fevicol Wood Adhesive', url: '/categories/fevicol-sealants.svg' }
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cement & Steel',
    subcategory: '',
    brand: 'UltraTech',
    price: '',
    mrp: '',
    unit: '50kg Bag',
    stock: 100,
    description: '',
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80'],
    isFeatured: false,
    isDeal: false
  });

  const { showToast } = useNotification();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=100');
      const payload = res.data?.data || res.data;
      const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.products)
          ? payload.products
          : (Array.isArray(res.data?.products) ? res.data.products : []));
      setProducts(list);
    } catch (err) {
      console.error(err);
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Cement & Steel',
      subcategory: '',
      brand: 'UltraTech',
      price: '',
      mrp: '',
      unit: 'Piece',
      stock: 100,
      description: '',
      images: ['https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80'],
      isFeatured: false,
      isDeal: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const existingImages = (p.images && p.images.length > 0)
      ? p.images
      : (p.image ? [p.image] : ['']);

    setFormData({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || '',
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit || 'Piece',
      stock: p.stock,
      description: p.description || '',
      images: existingImages.length > 0 ? existingImages : [''],
      isFeatured: !!p.isFeatured,
      isDeal: !!p.isDeal
    });
    setIsModalOpen(true);
  };

  // Multiple image helpers
  const handleAddImageSlot = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleUpdateImage = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.images];
      updated[index] = value;
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updated.length > 0 ? updated : [''] };
    });
  };

  const handleMoveImage = (index, direction) => {
    setFormData(prev => {
      const updated = [...prev.images];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, images: updated };
    });
  };

  const handleSelectPreset = (url) => {
    setFormData(prev => {
      // If last slot is empty, fill it; otherwise append
      const last = prev.images[prev.images.length - 1];
      if (!last || last.trim() === '') {
        const copy = [...prev.images];
        copy[copy.length - 1] = url;
        return { ...prev, images: copy };
      }
      return { ...prev, images: [...prev.images, url] };
    });
    showToast('Image preset added!', 'info');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material product?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted successfully', 'success');
      loadProducts();
    } catch (err) {
      showToast('Error deleting product', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanImages = formData.images
        .map(img => (typeof img === 'string' ? img.trim() : ''))
        .filter(Boolean);

      const payload = {
        ...formData,
        images: cleanImages.length > 0 ? cleanImages : ['/placeholder-material.svg']
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product added to catalog!', 'success');
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Product & Material Catalog</h2>
          <p>Manage genuine site procurement supplies, multi-image sliders, stock and factory prices</p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search products by title, SKU, or manufacturer brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              type="button"
              className={`chip-filter ${selectedCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              All Categories
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                className={`chip-filter ${selectedCategory === c ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product &amp; Images</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Stock</th>
              <th>Deals / Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const imgCount = (p.images && Array.isArray(p.images)) ? p.images.length : (p.image ? 1 : 0);
              const thumb = (p.images && p.images[0]) || p.image || '/placeholder-material.svg';

              return (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={thumb}
                          alt={p.name}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'contain', background: '#F8FAFC', padding: '2px', border: '1px solid #E2E8F0' }}
                        />
                        {imgCount > 1 && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: '#0F172A',
                            color: '#FFFFFF',
                            fontSize: '9.5px',
                            fontWeight: 800,
                            borderRadius: '10px',
                            padding: '1px 5px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}>
                            {imgCount}📷
                          </span>
                        )}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--color-ink)', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 700 }}>{p.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{p.sku}</td>
                  <td style={{ fontSize: '12.5px' }}>{p.category}</td>
                  <td>
                    <strong style={{ color: 'var(--color-ink)' }}>₹{p.price}</strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}> / {p.unit}</span>
                    {p.discount > 0 && <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-success)', fontWeight: 700 }}>{p.discount}% Off</span>}
                  </td>
                  <td>
                    <span className={`status-pill ${p.stock > 10 ? 'approved' : 'pending'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {p.isDeal && <span style={{ background: '#FFF7ED', color: '#EA580C', fontSize: '10.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>DEAL</span>}
                      {p.isFeatured && <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '10.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>FEATURED</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="btn-icon"
                        title="Edit product & multiple images"
                        style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', cursor: 'pointer' }}
                      >
                        <Edit size={15} color="#2563EB" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        className="btn-icon"
                        title="Delete product"
                        style={{ padding: '6px', borderRadius: '6px', background: '#FEE2E2', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} color="#DC2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Add / Edit Modal with Multi-Image Manager */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product & Multiple Images' : 'Add New Material Product'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asian Paints SmartCare Damp Proof Advanced 20L"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px', background: 'var(--bg-card)' }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Manufacturer / Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asian Paints, UltraTech, Tata Tiscon"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>MRP Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Pack Unit *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20L Bucket, 50kg Bag, Piece"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Available Stock Units *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Subcategory (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Waterproofing, TMT 16mm"
                      value={formData.subcategory}
                      onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                {/* --- MULTIPLE IMAGES SECTION (AUTO/MANUAL SLIDER READY) --- */}
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={16} color="#FF7800" />
                        Product Images Slider ({formData.images.length} images)
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>
                        Add multiple photos for auto-sliding and touch/click carousel on the website.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddImageSlot}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} /> Add Image
                    </button>
                  </div>

                  {/* List of images with thumbnail & reorder controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.images.map((imgUrl, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                        {/* Live Thumbnail */}
                        <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', background: '#F1F5F9', border: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <ImageIcon size={16} color="#94A3B8" />
                          )}
                        </div>

                        {/* Input */}
                        <input
                          type="text"
                          placeholder={idx === 0 ? "Primary image URL (https://...)" : `Image ${idx + 1} URL (https://...)`}
                          value={imgUrl}
                          onChange={e => handleUpdateImage(idx, e.target.value)}
                          style={{ flex: 1, padding: '7px 10px', fontSize: '12.5px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                        />

                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            PRIMARY
                          </span>
                        )}

                        {/* Reorder Buttons */}
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: '2px' }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 1)}
                          disabled={idx === formData.images.length - 1}
                          title="Move Down"
                          style={{ background: 'none', border: 'none', cursor: idx === formData.images.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === formData.images.length - 1 ? 0.3 : 1, padding: '2px' }}
                        >
                          <ArrowDown size={14} />
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Delete Image"
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Preset Suggestions Quick Add */}
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Sparkles size={12} color="#FF7800" /> One-Click Real Material Photo Presets:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {PRESET_IMAGE_SUGGESTIONS.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#0F172A',
                            cursor: 'pointer'
                          }}
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter material technical specifications and ISI/BIS certification details..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isDeal}
                      onChange={e => setFormData({ ...formData, isDeal: e.target.checked })}
                    />
                    <span>Show in "Today's Deals"</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>Show in "Bestselling Products"</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ background: 'var(--color-paper-3)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Save Material &amp; Images</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
