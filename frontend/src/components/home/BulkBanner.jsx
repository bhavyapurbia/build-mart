import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';

const BulkBanner = () => {
  return (
    <section className="container">
      <div className="bulk-order-banner">
        <div style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
            Bulk Procurement for Contractors &amp; Developers
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-rule)', lineHeight: 1.6, marginBottom: '24px' }}>
            Get special pricing for large construction projects and bulk material requirements. Direct mill dispatches for Cement, Fe 550D TMT Steel, AAC blocks, and CPVC piping with GST invoices and official batch test reports.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <ShieldCheck size={16} color='var(--color-success)' />
              <span>Direct Mill Pricing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <Truck size={16} color='var(--color-accent)' />
              <span>Multi-Axle Site Unloading</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <ShieldCheck size={16} color='var(--color-success)' />
              <span>Dedicated Account Manager</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/bulk-enquiry" className="btn-primary" style={{ padding: '12px 26px', fontSize: '14.5px' }}>
              <span>Request Bulk Order</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href="https://wa.me/919876543210?text=Hello%20BuildMart,%20I%20have%20a%20bulk%20construction%20material%20requirement"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ background: 'rgba(37, 211, 102, 0.2)', borderColor: 'rgba(37, 211, 102, 0.4)', color: 'var(--bg-card)' }}
            >
              <MessageSquare size={16} color="#25D366" />
              <span>WhatsApp Bulk Desk</span>
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            background: 'color-mix(in oklab, var(--bg-card) 8%, transparent)',
            padding: '24px',
            borderRadius: '16px',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)'
          }}>
            <Truck size={48} color='var(--color-accent)' style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '20px', fontWeight: 800 }}>400+ Tonnes</div>
            <div style={{ fontSize: '12px', color: 'var(--color-rule)' }}>Dispatched Daily Across Sites</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkBanner;

