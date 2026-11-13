import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const CATEGORIES = [
  'Cement & Steel',
  'Tiles & Adhesives',
  'Waterproofing',
  'CPVC, PVC & GI Fittings',
  'Hardware & Locks',
  'Bathware',
  'Tools & Accessories',
  'Construction Materials'
];

const BRANDS = [
  'UltraTech',
  'Tata Tiscon',
  'Dr. Fixit',
  'Astral Pipes',
  'Jaquar',
  'Asian Paints',
  'Bosch',
  'Kajaria',
  'ACC',
  'Godrej',
  'Supreme',
  'Pidilite'
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
    imageUrl: '',
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
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
      isFeatured: false,
      isDeal: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
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
      imageUrl: (p.images && p.images[0]) || p.image || '',
      isFeatured: !!p.isFeatured,
      isDeal: !!p.isDeal
    });
    setIsModalOpen(true);
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
      const payload = {
        ...formData,
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80']
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
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Product Catalog Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
            Add, update specifications, set stock, and manage wholesale prices
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Add New Material</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-card)' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--color-rule)', fontSize: '13px', background: 'var(--bg-card)', fontWeight: 600 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price (₹) / Unit</th>
              <th>Available Stock</th>
              <th>Deals / Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={(p.images && p.images[0]) || p.image || '/placeholder-material.jpg'}
                      alt={p.name}
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                    />
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
                  <span style={{ fontWeight: 700, color: p.stock <= 15 ? 'var(--color-error)' : 'var(--color-ink)' }}>
                    {p.stock}
                  </span>
                  {p.stock <= 15 && <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-error)', fontWeight: 700 }}>Low Stock</span>}
                </td>
                <td>
                  {p.isDeal && <span style={{ background: 'var(--accent-red-light)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, marginRight: '4px' }}>Deal</span>}
                  {p.isFeatured && <span style={{ background: 'var(--primary-light)', color: 'var(--primary-deep)', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>Bestseller</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      style={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      title="Edit Product"
                    >
                      <Edit2 size={14} color='var(--color-ink)' />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{ background: 'var(--accent-red-light)', border: '1px solid var(--accent-red-light)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      title="Delete Product"
                    >
                      <Trash2 size={14} color='var(--color-error)' />
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
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingProduct ? 'Edit Construction Material' : 'Add New Construction Material'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Material Product Name *
                  </label>
                  <input
                    type="text"
                    required
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
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-card)' }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Brand *</label>
                    <select
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13px', background: 'var(--bg-card)' }}
                    >
                      {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.mrp}
                      onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. 50kg Bag, Ton, Piece"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Available Stock *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Description</label>
                  <textarea
                    rows={2}
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
                  <span>Save Material</span>
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

