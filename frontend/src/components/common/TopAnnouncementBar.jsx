import React from 'react';
import { Phone, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const TopAnnouncementBar = ({ onOpenLocation, currentCity }) => {
  const { settings } = useSettings();

  const phone = settings?.supportPhone || '1800-890-5000';
  const announcementText = settings?.announcementBar || `⚡ 30-60 Minute Direct Job-Site Delivery in ${currentCity || 'Bengaluru'} | Genuine Certified Construction Supplies`;

  return (
    <div className="announcement-bar">
      <div className="container announcement-content">
        <div className="announcement-left">
          <span className="announcement-badge">30-60 MIN DELIVERY</span>
          <span>{announcementText}</span>
        </div>
        <div className="announcement-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color='var(--color-success)' />
            <span>100% Genuine Certified Brands</span>
          </div>
          <a href={`tel:${phone.replace(/\D/g, '')}`} className="announcement-link">
            <Phone size={13} />
            <span>Toll-Free: {phone}</span>
          </a>
          <button
            type="button"
            onClick={onOpenLocation}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <MapPin size={12} />
            <span>{currentCity || 'Change City'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopAnnouncementBar;
