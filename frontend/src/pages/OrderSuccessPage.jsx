import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, Download, MessageSquare, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `I just ordered certified construction materials on BuildMart (Order #${orderId}) with 30-60 min job-site delivery! Track live at: https://buildmart.in/track-order`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadInvoice = () => {
    if (orderId) {
      window.open(`/api/orders/${orderId}/invoice.pdf`, '_blank');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '640px', padding: '60px 16px', minHeight: '65vh', textAlign: 'center' }}>
      <SEO title="Order Confirmed" description="Your construction materials order has been confirmed." />

      <div style={{
        backgroundColor: 'var(--bg-card, #FFFFFF)',
        borderRadius: '16px',
        padding: '40px 32px',
        border: '1px solid var(--border-light, #E5E7EB)',
        boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '16px',
          background: 'var(--bg-accent-subtle, #F0FDF4)',
          borderRadius: '50%',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={52} color="var(--color-success, #16A34A)" />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Order Confirmed!
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Your order <strong>#{orderId}</strong> has been received by our central fulfillment hub. Warehouse dispatch and truck loading is in progress.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'var(--bg-subtle, #F9FAFB)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--color-success, #15803D)',
          fontWeight: 600,
          marginBottom: '28px'
        }}>
          <ShieldCheck size={16} />
          <span>Batch test reports & Tax Invoice generated</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Link
              to="/track-order"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              <Truck size={16} /> Track Delivery
            </Link>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={16} /> Tax Invoice
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={16} /> Share Order on WhatsApp
          </button>

          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              marginTop: '8px'
            }}
          >
            <Home size={14} /> Continue Shopping Materials
          </Link>
        </div>
      </div>
    </div>
  );
}

