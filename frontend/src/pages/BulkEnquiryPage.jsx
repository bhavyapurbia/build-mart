import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  FileText,
  Building2,
  Calendar,
  ArrowRight,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../utils/api';

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

const BulkEnquiryPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [customer, setCustomer] = useState({
    fullName: user?.name || '',
    companyName: '',
    phone: user?.phone || '',
    email: user?.email || '',
    projectLocation: '',
    deliveryRequirement: 'Immediate / Staggered Weekly',
    expectedPurchaseDate: ''
  });

  const [items, setItems] = useState([
    { category: 'Cement & Steel', productName: 'Tata Tiscon 550D TMT Rebar (12mm)', quantity: 20, unit: 'Tons', notes: 'Mill test certificate required' }
  ]);

  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { category: 'Cement & Steel', productName: '', quantity: 10, unit: 'Tons / Bags', notes: '' }
    ]);
  };

  const updateItemRow = (idx, field, val) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx][field] = val;
      return copy;
    });
  };

  const removeItemRow = (idx) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) {
      showToast('Please specify at least one product requirement.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...customer,
        items,
        additionalDetails
      };

      const res = await api.post('/bulk-enquiries', payload);
      setSubmittedEnquiry(res.data);
      showToast('Bulk enquiry submitted! Our institutional sales team is reviewing your project.', 'success', 5000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error submitting bulk enquiry.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedEnquiry) {
    return (
      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '2px solid var(--color-success)',
            padding: '40px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-green-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={36} />
            </div>

            <span style={{
              background: 'var(--primary-light)',
              color: 'var(--primary-deep)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase'
            }}>
              Bulk Enquiry ID: #{submittedEnquiry.enquiryId}
            </span>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '12px', marginBottom: '8px' }}>
              High-Volume Requirement Received
            </h1>

            <p style={{ fontSize: '14.5px', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '24px' }}>
              Thank you, <strong>{customer.fullName}</strong>. A dedicated Commercial Key Accounts Manager has been assigned to prepare wholesale tier-1 factory pricing for your project in <strong>{customer.projectLocation}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/919876543210?text=Hello%20BuildMart%20Bulk%20Desk,%20following%20up%20on%20Bulk%20Enquiry%20%23${submittedEnquiry.enquiryId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ background: 'var(--color-success)', color: 'var(--bg-card)', padding: '12px 20px' }}
              >
                <MessageSquare size={16} />
                <span>Follow up on WhatsApp</span>
              </a>
              <button
                onClick={() => setSubmittedEnquiry(null)}
                className="btn-secondary"
                style={{ background: 'var(--color-paper-3)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}
              >
                <span>Submit Another Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 0 80px' }}>
      <div className="container" style={{ maxWidth: '980px', margin: '0 auto' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--secondary-dark) 0%, var(--color-ink) 100%)',
          borderRadius: '16px',
          padding: '36px',
          color: 'var(--bg-card)',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <span style={{
            background: 'var(--color-accent)',
            color: 'var(--color-ink)',
            fontSize: '11px',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '10px'
          }}>
            Institutional & Commercial Supply
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, marginBottom: '10px' }}>
            Request Bulk Construction Materials
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-rule)', maxWidth: '680px', lineHeight: 1.6 }}>
            Special tiered pricing directly from authorized cement plants and primary steel mills. Multi-truck logistics with factory test certificates for contractors, developers, and government projects.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px' }}>
          {/* Section 1: Customer Details */}
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            1. Contractor / Company Profile
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Your Name"
                value={customer.fullName}
                onChange={e => setCustomer({ ...customer, fullName: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Company / Contractor Firm Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Infra Projects Pvt Ltd"
                value={customer.companyName}
                onChange={e => setCustomer({ ...customer, companyName: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="procurement@apexinfra.com"
                value={customer.email}
                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Project Site Location / City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Outer Ring Road, Bengaluru"
                value={customer.projectLocation}
                onChange={e => setCustomer({ ...customer, projectLocation: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Expected Purchase Date
              </label>
              <input
                type="date"
                value={customer.expectedPurchaseDate}
                onChange={e => setCustomer({ ...customer, expectedPurchaseDate: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
              />
            </div>
          </div>

          {/* Section 2: Multi-Item Requirement Schedule */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>
              2. Material Requirements Schedule
            </h2>
            <button
              type="button"
              onClick={addItemRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary-deep)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>Add Another Material</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 2fr 1fr 1fr auto',
                  gap: '10px',
                  alignItems: 'center',
                  background: 'var(--bg-page)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '2px' }}>Category</label>
                  <select
                    value={item.category}
                    onChange={e => updateItemRow(idx, 'category', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '12.5px', background: 'var(--bg-card)' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '2px' }}>Product / Grade Specification *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UltraTech Super PPC / 16mm Fe 550D Rebar"
                    value={item.productName}
                    onChange={e => updateItemRow(idx, 'productName', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '2px' }}>Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItemRow(idx, 'quantity', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '2px' }}>Unit</label>
                  <input
                    type="text"
                    placeholder="Tons / Bags / Boxes"
                    value={item.unit}
                    onChange={e => updateItemRow(idx, 'unit', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-rule)', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>

                <div style={{ paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length <= 1}
                    style={{
                      background: 'transparent',
                      color: items.length <= 1 ? 'var(--color-rule)' : 'var(--color-error)',
                      cursor: items.length <= 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Additional Notes & Site Specs */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
              Additional Specifications, Crane Unloading Requirements, or Payment Terms
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Unloading requires site hydra crane, need staggered delivery across 4 weeks, bill-to ship-to GST format required"
              value={additionalDetails}
              onChange={e => setAdditionalDetails(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
          >
            <span>{submitting ? 'Submitting Project Enquiry...' : 'Submit Bulk Order Enquiry'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkEnquiryPage;

