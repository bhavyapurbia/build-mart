import React from 'react';
import { ShieldCheck, Clock, Percent, Users, Truck } from 'lucide-react';

const REASONS = [
  {
    icon: Clock,
    title: '30-60 Min Site Delivery',
    desc: 'Hyper-local fulfillment centers positioned close to urban development belts ensure zero job-site downtime.'
  },
  {
    icon: ShieldCheck,
    title: '100% Genuine Tested Materials',
    desc: 'Factory-sealed original bags and rebars with batch testing reports compliant with IS and RERA standards.'
  },
  {
    icon: Percent,
    title: 'Transparent Trade Pricing',
    desc: 'Wholesale tiered prices for masons, contractors, and developers. No hidden handling or delivery markups.'
  },
  {
    icon: Users,
    title: 'Verified Skilled Labour',
    desc: 'Optionally book certified masons, plumbers, tile workers, and waterproofing teams directly alongside material orders.'
  },
  {
    icon: Truck,
    title: 'Bulk & Project Supply',
    desc: 'Dedicated fleet equipped for crane and multi-axle mechanical unloading on residential and commercial sites.'
  }
];

const WhyChooseUs = () => {
  return (
    <section style={{ padding: '36px 0 20px', background: 'var(--bg-page)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            The BuildMart Advantage
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
            Why Builders Choose BuildMart
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '6px' }}>
            Engineered from the ground up for modern construction workflows and trade contractor reliability.
          </p>
        </div>

        <div className="features-grid">
          {REASONS.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={26} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>
                  {reason.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                  {reason.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

