import React from 'react';
import { Phone, Clock, ShieldCheck, MapPin } from 'lucide-react';

const TopAnnouncementBar = ({ onOpenLocation, currentCity }) => {
  return (
    <div className="announcement-bar">
      <div className="container announcement-content">
        <div className="announcement-left">
          <span className="announcement-badge">⚡ 30-60 MIN DELIVERY</span>
          <span>Guaranteed on-site express material delivery in <strong>{currentCity}</strong></span>
        </div>
        <div className="announcement-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>100% Genuine Certified Brands</span>
          </div>
          <a href="tel:18008905000" className="announcement-link">
            <Phone size={13} />
            <span>Toll-Free: 1800-890-5000</span>
          </a>
          <button
            onClick={onOpenLocation}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#F59E0B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <MapPin size={12} />
            <span>Change City</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopAnnouncementBar;

