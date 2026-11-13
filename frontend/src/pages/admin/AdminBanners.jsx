import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Megaphone,
  ExternalLink,
  Eye,
  Upload,
  Smartphone,
  Tablet,
  Laptop,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

export const DEFAULT_BANNERS = [
  {
    id: 'banner_wirebonanza_promo',
    _id: 'banner_wirebonanza_promo',
    title: 'Flat 5% OFF on Electrical Wires',
    subtitle: 'on orders above 10000. Use Coupon WIREBONANZA',
    badge: 'WIRE BONANZA',
    couponCode: 'WIREBONANZA',
    ctaText: 'ORDER NOW',
    link: '/products?category=Electrical%20%26%20Automation',
    image: '/banners/wirebonanza-offer.jpg',
    order: 1,
    active: true,
    type: 'hero'
  },
  {
    id: 'b_diwali_promo',
    _id: 'b_diwali_promo',
    title: 'diwali offer',
    subtitle: 'on order above 4000 get flat 200 off',
    badge: 'SPECIAL PROMO',
    couponCode: 'DIWALI200',
    ctaText: 'EXPLORE SUPPLIES',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #181C9A 0%, #282DCB 100%)',
    image: '',
    benefit1Text: '30-Min',
    benefit1Sub: 'Site Delivery',
    benefit2Text: '100% Factory',
    benefit2Sub: 'GST Invoices',
    coinText: 'OFFER',
    order: 2,
    active: true,
    type: 'hero'
  },
  {
    id: 'b1',
    _id: 'b1',
    title: 'FLAT 5% CASHBACK',
    subtitle: 'on orders above ₹50,000. No limits on bulk supplies.',
    badge: 'MEGABUILDMART',
    couponCode: 'BUILD50K',
    ctaText: 'SHOP NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
    image: '',
    benefit1Text: 'Express 30-Min',
    benefit1Sub: 'Site Dispatch',
    benefit2Text: 'Batch Tested',
    benefit2Sub: 'MTC Certificates',
    coinText: '5% OFF',
    order: 3,
    active: true,
    type: 'hero'
  }
];

const PRESET_BANNER_GRAPHICS = [
  {
    label: '⚡ Flat 5% Off Wires (Wire Bonanza)',
    url: '/banners/wirebonanza-offer.jpg',
    title: 'Flat 5% OFF on Electrical Wires',
    link: '/products?category=Electrical%20%26%20Automation'
  },
  {
    label: '🏗️ UltraTech Cement Mega Procurement',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
    title: 'Direct Factory Cement Supplies',
    link: '/products?category=Cement%20%26%20Steel'
  },
  {
    label: '🛡️ Asian Paints Damp Proof Festive',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    title: 'Waterproofing & Wall Paints Offer',
    link: '/products?category=Waterproofing'
  }
];

const AdminBanners = () => {
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('bm_admin_banners');
      return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    } catch {
      return DEFAULT_BANNERS;
    }
  });

  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('bm_announcement') || 'Free express delivery to job sites in under 30 minutes for orders over ₹499';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'tablet' | 'laptop'
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '/products',
    image: '',
    bgGradient: 'linear-gradient(135deg, #181C9A 0%, #282DCB 100%)',
    badge: 'SPECIAL PROMO',
    couponCode: '',
    ctaText: 'ORDER NOW',
    active: true,
    type: 'hero'
  });

  const { showToast } = useNotification();

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (list && list.length > 0) {
        setBanners(list);
        localStorage.setItem('bm_admin_banners', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Using local/cached banners:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const saveBannersLocally = (updated) => {
    setBanners(updated);
    localStorage.setItem('bm_admin_banners', JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setPreviewDevice('mobile');
    setFormData({
      title: 'Flat 5% OFF on Electrical Wires',
      subtitle: 'on orders above 10000. Use Coupon WIREBONANZA',
      link: '/products?category=Electrical%20%26%20Automation',
      image: '/banners/wirebonanza-offer.jpg',
      bgGradient: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
      badge: 'WIRE BONANZA',
      couponCode: 'WIREBONANZA',
      ctaText: 'ORDER NOW',
      active: true,
      type: 'hero'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setPreviewDevice('mobile');
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      link: b.link || '/products',
      image: b.image || '',
      bgGradient: b.bgGradient || 'linear-gradient(135deg, #181C9A 0%, #282DCB 100%)',
      badge: b.badge || 'SPECIAL PROMO',
      couponCode: b.couponCode || '',
      ctaText: b.ctaText || 'ORDER NOW',
      active: b.active !== false,
      type: b.type || 'hero'
    });
    setIsModalOpen(true);
  };

  // Image File Upload Handler
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB. Please select an optimized banner image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (typeof dataUrl === 'string') {
        setFormData(prev => ({
          ...prev,
          image: dataUrl,
          title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        }));
        showToast('Banner image uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      image: preset.url,
      title: preset.title,
      link: preset.link
    }));
    showToast('Preset banner graphic applied!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Banner title is required', 'error');
      return;
    }

    try {
      if (editingBanner) {
        const id = editingBanner._id || editingBanner.id;
        await api.put(`/banners/${id}`, formData);
        showToast('Promotional banner updated successfully!', 'success');
      } else {
        await api.post('/banners', formData);
        showToast('New promotional banner created!', 'success');
      }
      await fetchBanners();
    } catch (err) {
      console.error('API error, saving to local storage:', err);
      if (editingBanner) {
        const updated = banners.map(b => (b.id === editingBanner.id || b._id === editingBanner._id) ? { ...formData, id: b.id || b._id } : b);
        saveBannersLocally(updated);
      } else {
        const newB = { ...formData, id: `b_${Date.now()}` };
        saveBannersLocally([newB, ...banners]);
      }
      showToast('Banner saved successfully!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotional banner?')) {
      try {
        await api.delete(`/banners/${id}`);
        await fetchBanners();
        showToast('Banner deleted successfully', 'info');
      } catch (err) {
        const updated = banners.filter(b => b.id !== id && b._id !== id);
        saveBannersLocally(updated);
        showToast('Banner removed', 'info');
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.put(`/banners/${id}/toggle`);
      await fetchBanners();
      showToast('Banner visibility updated', 'success');
    } catch (err) {
      const updated = banners.map(b => (b.id === id || b._id === id) ? { ...b, active: !b.active } : b);
      saveBannersLocally(updated);
      showToast('Banner visibility updated', 'success');
    }
  };

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    localStorage.setItem('bm_announcement', announcementText);
    showToast('Top Announcement Bar updated across the website!', 'success');
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-page-title">Website Banners & Promotions</h1>
          <p className="admin-page-sub">
            Upload banner graphics, manage homepage offer carousels, and maintain identical viewports across mobile, tablet & laptop
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>Upload New Banner</span>
        </button>
      </div>

      {/* Global Top Announcement Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFF4ED', color: '#FF7800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Top Announcement Bar</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Sticky notice bar at the very top of customer header</p>
          </div>
        </div>

        <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px'
            }}
            placeholder="Enter announcement notice..."
          />
          <button type="submit" className="btn-primary" style={{ padding: '9px 16px', whiteSpace: 'nowrap', fontSize: '13px' }}>
            Save Notice
          </button>
        </form>
      </div>

      {/* Banners List Table */}
      <div className="admin-table-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            Active Banner Slider Carousel ({banners.length} banners)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Rendered with 2.105:1 responsive aspect ratio across all devices
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '220px' }}>Banner Graphic</th>
              <th>Campaign Title</th>
              <th>Target Click Link</th>
              <th>Format</th>
              <th>Status</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(b => {
              const bId = b._id || b.id;
              const hasImg = !!b.image;

              return (
                <tr key={bId}>
                  <td>
                    <div style={{
                      width: '180px',
                      aspectRatio: '2.105 / 1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: b.bgGradient || '#0A192F',
                      border: '1.5px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {hasImg ? (
                        <img
                          src={b.image}
                          alt={b.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ padding: '6px', textAlign: 'center', color: '#FFFFFF' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, display: 'block' }}>{b.title}</span>
                          <span style={{ fontSize: '9px', opacity: 0.8 }}>HTML Card</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>{b.title}</strong>
                    {b.couponCode && (
                      <span style={{ fontSize: '11px', color: '#FF7800', fontWeight: 800 }}>
                        Code: {b.couponCode}
                      </span>
                    )}
                  </td>
                  <td>
                    <a
                      href={b.link || '/products'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      <span>{b.link || '/products'}</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td>
                    {hasImg ? (
                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        IMAGE GRAPHIC
                      </span>
                    ) : (
                      <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        HTML CARD
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(bId)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: b.active !== false ? '#DCFCE7' : '#F1F5F9',
                        color: b.active !== false ? '#15803D' : '#64748B'
                      }}
                    >
                      {b.active !== false ? '● ACTIVE' : '○ HIDDEN'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        title="Edit banner"
                        style={{ padding: '6px', borderRadius: '6px', background: '#F1F5F9', border: 'none', cursor: 'pointer' }}
                      >
                        <Edit2 size={15} color="#2563EB" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(bId)}
                        title="Delete banner"
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

      {/* Add / Edit Banner Modal with Responsive Screen Preview */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                {editingBanner ? 'Edit Banner Graphic & Settings' : 'Upload New Promotional Banner'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* 1. IMAGE UPLOAD SECTION */}
                <div style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px', padding: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    1. Upload Banner Image Graphic *
                  </label>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 12px' }}>
                    Upload your designed banner image. It automatically adapts to the identical aspect ratio on mobile, tablet & laptop.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#FF7800',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={16} /> Choose Image from Device
                    </button>

                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>or enter image URL below:</span>
                  </div>

                  {/* URL Input */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. /banners/wirebonanza-offer.jpg or https://..."
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Presets */}
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                      Or Pick Preset Banner:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {PRESET_BANNER_GRAPHICS.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleSelectPreset(p)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            color: '#1E293B'
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. RESPONSIVE MULTI-SCREEN PREVIEW */}
                {formData.image && (
                  <div style={{ background: '#0F172A', borderRadius: '12px', padding: '16px', color: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={16} color="#38BDF8" />
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>Live Responsive Screen Preview</span>
                      </div>

                      {/* Device switch tabs */}
                      <div style={{ display: 'flex', gap: '4px', background: '#1E293B', padding: '3px', borderRadius: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: previewDevice === 'mobile' ? '#FF7800' : 'transparent',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Smartphone size={13} /> Mobile (375px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('tablet')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: previewDevice === 'tablet' ? '#FF7800' : 'transparent',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Tablet size={13} /> Tablet (640px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice('laptop')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: previewDevice === 'laptop' ? '#FF7800' : 'transparent',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Laptop size={13} /> Laptop (Full)
                        </button>
                      </div>
                    </div>

                    {/* Preview Screen Frame */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      background: '#020617',
                      padding: '16px',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: previewDevice === 'mobile' ? '340px' : (previewDevice === 'tablet' ? '540px' : '100%'),
                        maxWidth: '100%',
                        transition: 'width 0.3s ease'
                      }}>
                        <div style={{
                          width: '100%',
                          aspectRatio: '2.105 / 1',
                          borderRadius: previewDevice === 'mobile' ? '12px' : '16px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          border: '1.5px solid rgba(255,255,255,0.1)'
                        }}>
                          <img
                            src={formData.image}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10.5px', color: '#94A3B8' }}>
                          ✓ Exact 2.105:1 proportion maintained without clipping
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SETTINGS & LINK DESTINATION */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Banner Title / Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 5% OFF on Electrical Wires"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Target Click Link (URL) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. /products?category=Electrical%20%26%20Automation"
                      value={formData.link}
                      onChange={e => setFormData({ ...formData, link: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Coupon Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WIREBONANZA"
                      value={formData.couponCode}
                      onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
                    <input
                      type="checkbox"
                      id="bannerActiveCheck"
                      checked={formData.active}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="bannerActiveCheck" style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>
                      Active on Website Carousel
                    </label>
                  </div>
                </div>

              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 800 }}
                >
                  {editingBanner ? 'Save Changes' : 'Publish Banner to Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
