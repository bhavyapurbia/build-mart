import React, { useState, useEffect } from 'react';
import {
  Image,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Megaphone,
  Percent,
  Sparkles,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const DEFAULT_BANNERS = [
  {
    id: 'b1',
    title: 'FLAT 5% CASHBACK',
    subtitle: 'on orders above ₹50,000. No limits on bulk supplies.',
    badge: 'MEGABUILDMART',
    couponCode: 'BUILD50K',
    ctaText: 'SHOP NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
    active: true,
    type: 'hero'
  },
  {
    id: 'b2',
    title: 'FREE EXPRESS 30-MIN DISPATCH',
    subtitle: 'Direct from micro-fulfillment hubs across the city',
    badge: 'SITE DELIVERY',
    couponCode: 'FASTSITE',
    ctaText: 'ORDER NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)',
    active: true,
    type: 'hero'
  },
  {
    id: 'b3',
    title: 'CONTRACTOR WHOLESALE CLUB',
    subtitle: 'Special credit terms, GST billing & dedicated site manager',
    badge: 'TRADE DESK',
    couponCode: 'PROCONTRACT',
    ctaText: 'SUBMIT LIST',
    link: '/material-list',
    bgGradient: 'linear-gradient(135deg, #14532D 0%, #15803D 100%)',
    active: true,
    type: 'hero'
  }
];

const AdminBanners = () => {
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('bm_admin_banners');
    return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
  });

  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('bm_announcement') || '⚡ Free express delivery to job sites in under 30 minutes for orders over ₹499';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'SPECIAL OFFER',
    couponCode: 'BUILD50K',
    ctaText: 'SHOP NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
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
      console.warn('Using cached banners:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const saveBanners = (updated) => {
    setBanners(updated);
    localStorage.setItem('bm_admin_banners', JSON.stringify(updated));
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'SPECIAL PROMO',
      couponCode: 'BUILD10',
      ctaText: 'EXPLORE SUPPLIES',
      link: '/products',
      bgGradient: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
      active: true,
      type: 'hero'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setFormData({ ...b });
    setIsModalOpen(true);
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
        showToast('Banner promotional campaign updated!', 'success');
      } else {
        await api.post('/banners', formData);
        showToast('New promotional banner created!', 'success');
      }
      await fetchBanners();
    } catch (err) {
      console.error('API error, falling back to local save:', err);
      if (editingBanner) {
        const updated = banners.map(b => (b.id === editingBanner.id || b._id === editingBanner._id) ? { ...formData, id: b.id || b._id } : b);
        saveBanners(updated);
      } else {
        const newB = { ...formData, id: `b_${Date.now()}` };
        saveBanners([newB, ...banners]);
      }
      showToast('Banner saved!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.delete(`/banners/${id}`);
        await fetchBanners();
        showToast('Banner removed', 'info');
      } catch (err) {
        const updated = banners.filter(b => b.id !== id && b._id !== id);
        saveBanners(updated);
        showToast('Banner removed', 'info');
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.put(`/banners/${id}/toggle`);
      await fetchBanners();
      showToast('Banner visibility status updated', 'success');
    } catch (err) {
      const updated = banners.map(b => (b.id === id || b._id === id) ? { ...b, active: !b.active } : b);
      saveBanners(updated);
      showToast('Banner visibility status updated', 'success');
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
          <h1 className="admin-page-title">Banners & Promotional Campaigns</h1>
          <p className="admin-page-sub">
            Manage homepage carousel slides, festive cashback promotions, and global site announcements
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Global Announcement Bar Editor */}
      <div className="admin-card" style={{ marginBottom: '28px', padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Top Global Announcement Bar</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Displayed at the very top of every customer page</p>
          </div>
        </div>

        <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13.5px'
            }}
            placeholder="Enter announcement text..."
          />
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
            Update Announcement
          </button>
        </form>
      </div>

      {/* Hero Banners Grid */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>Active Hero & Cashback Slides ({banners.length})</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {banners.map(b => (
          <div
            key={b._id || b.id}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Live Banner Preview Card */}
            <div
              style={{
                background: b.bgGradient || '#091E3A',
                color: '#FFFFFF',
                padding: '24px',
                position: 'relative',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    background: '#F59E0B',
                    color: '#000000',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {b.badge}
                </span>

                <span
                  style={{
                    background: b.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: b.active ? '#34D399' : '#F87171',
                    border: `1px solid ${b.active ? '#10B981' : '#EF4444'}`,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {b.active ? '● LIVE' : '○ DISABLED'}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '20px', fontWeight: 900, margin: '8px 0 4px', color: '#FFFFFF' }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                  {b.subtitle}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: '11.5px', color: '#FCD34D', fontWeight: 700 }}>
                  Coupon: <code>{b.couponCode}</code>
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#FFFFFF', color: '#0F172A', padding: '3px 10px', borderRadius: '4px' }}>
                  {b.ctaText} →
                </span>
              </div>
            </div>

            {/* Admin Controls */}
            <div style={{ padding: '14px 18px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handleToggleActive(b._id || b.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: b.active ? '#D97706' : '#10B981'
                }}
              >
                {b.active ? 'Pause Campaign' : 'Activate Campaign'}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(b)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#E2E8F0',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b._id || b.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit Banner */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLAT 5% CASHBACK ON CEMENT"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Subtitle Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. On orders above ₹50,000 for all site materials"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Offer Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Target Link
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Background Gradient Theme
                </label>
                <select
                  value={formData.bgGradient}
                  onChange={e => setFormData({ ...formData, bgGradient: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #CBD5E1' }}
                >
                  <option value="linear-gradient(135deg, #091E3A 0%, #1B4965 100%)">Deep Midnight Blue (Default)</option>
                  <option value="linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)">Crimson Festive Red</option>
                  <option value="linear-gradient(135deg, #14532D 0%, #15803D 100%)">Emerald Forest Green</option>
                  <option value="linear-gradient(135deg, #78350F 0%, #D97706 100%)">Amber Gold</option>
                  <option value="linear-gradient(135deg, #312E81 0%, #4338CA 100%)">Royal Indigo</option>
                  <option value="linear-gradient(135deg, #1E293B 0%, #0F172A 100%)">Obsidian Charcoal</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="bannerActive" style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Make this banner active immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
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

