import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Building,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useMaterialList } from '../context/MaterialListContext';
import { useAuth } from '../context/AuthContext';

const MaterialListPage = () => {
  const { items, updateQuantity, removeMaterialItem, clearMaterialList, submitMaterialRequest, submitting } = useMaterialList();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    siteAddress: (user?.addresses && user.addresses[0]?.street) || '',
    city: (user?.addresses && user.addresses[0]?.city) || 'Bengaluru',
    pincode: (user?.addresses && user.addresses[0]?.pincode) || '',
    requiredDate: '',
    notes: ''
  });

  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) return;

    const res = await submitMaterialRequest(customer);
    if (res.success) {
      setSubmittedRequest(res.data);
    }
  };

  // If successfully submitted, display confirmation view
  if (submittedRequest) {
    return (
      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '2px solid var(--color-success)',
            padding: '40px',
            textAlign: 'center',
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
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Material List Received • Awaiting Formal Quotation
            </span>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '12px', marginBottom: '8px' }}>
              Material Request #{submittedRequest.requestId} Generated!
            </h1>

            <p style={{ fontSize: '14.5px', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '24px' }}>
              Thank you, <strong>{customer.name}</strong>. Your requested building materials list has been dispatched to our materials engineering team for stock verification.
            </p>

            <div style={{
              background: 'var(--bg-page)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-deep)', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                <ShieldAlert size={18} />
                <span>What Happens Next? (Quotation Workflow)</span>
              </div>
              <ol style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6, paddingLeft: '20px' }}>
                <li>Our materials supervisor reviews factory stock levels and applies bulk delivery discounts.</li>
                <li>An official Quotation with locked prices and delivery charges will be issued.</li>
                <li>You can review the Quotation in your account and <strong>Accept or Reject</strong> it.</li>
                <li>After you accept, you proceed to confirmed order placement & job-site dispatch.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/account?tab=quotations" className="btn-primary" style={{ padding: '12px 24px' }}>
                <span>Track My Quotations</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn-secondary" style={{ background: 'var(--color-paper-3)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}>
                <span>Continue Browsing Materials</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty List View
  if (!items.length) {
    return (
      <div style={{ padding: '80px 0 100px' }}>
        <div className="container" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '48px 32px'
          }}>
            <ClipboardList size={56} color='var(--text-light)' style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '8px' }}>
              Your Material List is Empty
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Browse the catalog and simply <strong>click any product image</strong> to add Cement, Steel, Tiles, Plumbing, and Waterproofing materials directly to your list!
            </p>
            <Link to="/products" className="btn-primary" style={{ padding: '12px 28px' }}>
              <span>Browse Products & Click Images</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const estimatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ padding: '28px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={26} color='var(--primary-dark)' />
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)' }}>
              Construction Material List ({items.length} item{items.length > 1 ? 's' : ''})
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Review your selected materials, update required quantities, and submit for an official contractor quotation.
          </p>
        </div>

        {/* Workflow Reminder Alert */}
        <div style={{
          background: 'var(--color-accent-light)',
          border: '1px solid var(--color-accent)',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '28px'
        }}>
          <AlertCircle size={20} color='var(--primary-dark)' style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', color: 'var(--primary-deep)', lineHeight: 1.5 }}>
            <strong>Important Order Notice:</strong> Submitting a material list does <em>not</em> confirm an order or charge your card immediately. Our logistics and engineering team will check warehouse stock, calculate localized truck delivery fees, and issue an itemized Quotation for your review and approval.
          </div>
        </div>

        {/* Two-Column Grid: Items Table + Customer Details Form */}
        <div className="material-list-layout">
          {/* Column 1: Items List */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>
                Selected Materials Checklist
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/products" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  + Add More Products
                </Link>
                <button
                  onClick={clearMaterialList}
                  style={{ background: 'transparent', color: 'var(--color-error)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map(item => (
                <div
                  key={item.productId || item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-paper-3)',
                    background: 'var(--bg-page)',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=120&q=80'}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                        {item.brand}
                      </span>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        Ref Price: <strong>₹{item.price}</strong> / {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-rule)', borderRadius: '6px', background: 'var(--bg-card)', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId || item._id, item.quantity - 1)}
                        style={{ padding: '6px 10px', background: 'var(--bg-page)', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.productId || item._id, e.target.value)}
                        style={{ width: '46px', textAlign: 'center', border: 'none', fontSize: '13px', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId || item._id, item.quantity + 1)}
                        style={{ padding: '6px 10px', background: 'var(--bg-page)', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                        est. subtotal
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMaterialItem(item.productId || item._id)}
                      style={{ background: 'transparent', color: 'var(--text-light)', cursor: 'pointer', padding: '6px' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>Estimated Materials Value:</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)' }}>
                ₹{estimatedTotal.toLocaleString('en-IN')}*
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '4px', textAlign: 'right' }}>
              *Subject to quantity tiers, warehouse stock confirmation, and site distance charges.
            </div>
          </div>

          {/* Column 2: Customer Details & Submission Form */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              Project Site & Contact Details
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Customer / Contractor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Construction / Anil Kumar"
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@site.com"
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Project Site Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Plot/Flat No, Landmark, Road name"
                  value={customer.siteAddress}
                  onChange={e => setCustomer({ ...customer, siteAddress: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={e => setCustomer({ ...customer, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="560100"
                    value={customer.pincode}
                    onChange={e => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Preferred Required Delivery Date
                </label>
                <input
                  type="date"
                  value={customer.requiredDate}
                  onChange={e => setCustomer({ ...customer, requiredDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Site Instructions / Brand Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Crane required for unloading rebar, morning 8 AM delivery"
                  value={customer.notes}
                  onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '14.5px',
                  marginTop: '8px'
                }}
              >
                <span>{submitting ? 'Submitting to Engineering Team...' : 'Submit Material List for Quotation'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ fontSize: '12px', color: 'var(--color-muted)', textAlign: 'center', marginTop: '4px' }}>
                Zero obligation. Review and approve the official quotation before confirming order.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialListPage;

