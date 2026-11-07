import React, { useState, useEffect } from 'react';
import { Settings, Save, Phone, MessageSquare, Truck, Mail, MapPin } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'BuildMart',
    whatsappNumber: '+91 98765 43210',
    supportPhone: '1800-890-5000',
    supportEmail: 'orders@buildmart.in',
    officeAddress: 'BuildMart Fulfillment Hub 01, Outer Ring Road, Bellandur, Bengaluru 560103',
    announcementBar: '30-60 Minute Direct Job-Site Delivery in Bengaluru | Genuine Certified Construction Supplies',
    freeDeliveryThreshold: 5000
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) setSettings(res.data);
      } catch (err) {
        showToast('Error loading website settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      showToast('Website settings updated successfully!', 'success');
    } catch (err) {
      showToast('Error updating settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
          Website Configuration & Settings
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
          Manage top announcement banner, WhatsApp customer hotline, toll-free number, and free delivery thresholds
        </p>
      </div>

      <form onSubmit={handleSave} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
            Top Announcement Bar Text
          </label>
          <input
            type="text"
            value={settings.announcementBar}
            onChange={e => setSettings({ ...settings, announcementBar: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
              WhatsApp Support Number *
            </label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
              Toll-Free Helpline *
            </label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
              Official Orders Email *
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
              Free Truck Freight Order Threshold (₹)
            </label>
            <input
              type="number"
              value={settings.freeDeliveryThreshold}
              onChange={e => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) || 0 })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
            Central Logistics Yard & HQ Address
          </label>
          <textarea
            rows={2}
            value={settings.officeAddress}
            onChange={e => setSettings({ ...settings, officeAddress: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

