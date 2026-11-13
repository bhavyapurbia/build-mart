import React, { useState } from 'react';
import { Truck, Search, CheckCircle, Clock, Package, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Received & awaiting dispatch confirmation' },
  { key: 'processing', label: 'Processing at Hub', desc: 'Materials picked & loaded onto truck' },
  { key: 'shipped', label: 'Out for Delivery', desc: 'Transit to job site' },
  { key: 'delivered', label: 'Delivered', desc: 'Site e-POD verified' }
];

function getStepIndex(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 0;
    case 'processing': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    case 'cancelled': return -1;
    default: return 0;
  }
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const { showToast } = useNotification();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId || !phone) {
      showToast('Please provide both Order ID and Phone Number.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders/track', {
        orderId: orderId.trim(),
        phone: phone.trim()
      });
      const data = res.data?.data || res.data;
      setOrderData(data);
      showToast('Order details located!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'No matching order found. Please verify Order ID and Phone.';
      showToast(msg, 'error');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = orderData ? getStepIndex(orderData.orderStatus) : 0;
  const isCancelled = orderData?.orderStatus?.toLowerCase() === 'cancelled';

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 16px', minHeight: '65vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', padding: '14px', background: 'var(--bg-accent-subtle, #EFF6FF)', borderRadius: '50%', color: 'var(--primary, #0284C7)', marginBottom: '12px' }}>
          <Truck size={32} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          Track Job-Site Delivery
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
          Check real-time truck dispatch and fulfillment status for your materials order.
        </p>
      </div>

      {/* Lookup Form */}
      <div
        style={{
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          borderRadius: '14px',
          padding: '24px 28px',
          border: '1px solid var(--border-light, #E5E7EB)',
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
          marginBottom: '32px'
        }}
      >
        <form onSubmit={handleTrack} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Order ID *
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. BM-2026-0001"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #D1D5DB)',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Contact Phone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #D1D5DB)',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '11px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <Search size={16} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {orderData && (
        <div
          style={{
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            borderRadius: '14px',
            border: '1px solid var(--border-light, #E5E7EB)',
            boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
            overflow: 'hidden'
          }}
        >
          {/* Header Summary */}
          <div
            style={{
              padding: '20px 24px',
              background: 'var(--bg-subtle, #F9FAFB)',
              borderBottom: '1px solid var(--border-light, #E5E7EB)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order Reference
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {orderData.orderId}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: isCancelled ? '#FEE2E2' : currentStep === 3 ? '#DCFCE7' : '#EFF6FF',
                  color: isCancelled ? '#B91C1C' : currentStep === 3 ? '#15803D' : '#1D4ED8'
                }}
              >
                Status: {orderData.orderStatus}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{orderData.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div style={{ padding: '32px 24px' }}>
            {isCancelled ? (
              <div style={{ padding: '20px', background: '#FEF2F2', borderRadius: '10px', textAlign: 'center', border: '1px solid #FECACA' }}>
                <AlertCircle size={32} color="#EF4444" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', color: '#991B1B', fontSize: '16px', fontWeight: 700 }}>Order Cancelled</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#7F1D1D' }}>This order was cancelled. Any payment debited will be credited within 3-5 working days.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative', gap: '8px' }}>
                {/* Connecting bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '12%',
                    right: '12%',
                    height: '3px',
                    background: 'var(--border-light, #E5E7EB)',
                    zIndex: 0
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(Math.max(0, currentStep) / 3) * 100}%`,
                      background: 'var(--color-success, #10B981)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>

                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div key={step.key} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          margin: '0 auto 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isDone ? 'var(--color-success, #10B981)' : 'var(--bg-card, #FFFFFF)',
                          color: isDone ? '#FFFFFF' : 'var(--text-muted)',
                          border: isDone ? 'none' : '2px solid var(--border-light, #D1D5DB)',
                          fontWeight: 700,
                          fontSize: '14px',
                          boxShadow: isCurrent ? '0 0 0 4px var(--bg-accent-subtle, #DCFCE7)' : 'none'
                        }}
                      >
                        {isDone ? <CheckCircle size={18} /> : idx + 1}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 600, color: isCurrent ? 'var(--primary, #0284C7)' : 'var(--text-primary)' }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Items Included */}
            <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-light, #F3F4F6)', paddingTop: '24px' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} /> Dispatched Items ({orderData.itemCount || orderData.items?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(orderData.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--bg-subtle, #F9FAFB)',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {item.quantity} {item.unit || 'units'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Info */}
            {orderData.deliveryCity && (
              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--bg-accent-subtle, #EFF6FF)', borderRadius: '8px', fontSize: '13px', color: 'var(--primary, #1D4ED8)' }}>
                📍 Destination Hub / City: <strong>{orderData.deliveryCity}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

