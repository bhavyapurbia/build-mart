import React, { useState } from 'react';
import { MapPin, X, Check } from 'lucide-react';

const CITIES = [
  { name: 'Bengaluru', hub: 'Central Fulfillment Hub (Bellandur)' },
  { name: 'Mumbai', hub: 'Western Suburbs Hub (Andheri)' },
  { name: 'Delhi NCR', hub: 'Gurugram Sector 48 Hub' },
  { name: 'Hyderabad', hub: 'HITEC City Logistics Yard' },
  { name: 'Pune', hub: 'Kharadi Industrial Zone' },
  { name: 'Chennai', hub: 'Guindy Central Depot' }
];

const LocationModal = ({ isOpen, onClose, currentCity, onSelectCity }) => {
  const [pincode, setPincode] = useState('');

  if (!isOpen) return null;

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      onSelectCity(`Pincode: ${pincode}`);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#D97706" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Choose Delivery Location</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '16px' }}>
            Select your project site city or enter your 6-digit pin code for accurate delivery lead times and localized warehouse pricing:
          </p>

          <form onSubmit={handlePincodeSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter 6-digit Pincode (e.g. 560103)"
              maxLength={6}
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              disabled={pincode.length !== 6}
              style={{
                background: pincode.length === 6 ? '#D97706' : '#E2E8F0',
                color: pincode.length === 6 ? '#FFFFFF' : '#94A3B8',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: pincode.length === 6 ? 'pointer' : 'not-allowed'
              }}
            >
              Apply
            </button>
          </form>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Major Metro Supply Zones
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '10px' }}>
              {CITIES.map(c => {
                const isSelected = currentCity === c.name;
                return (
                  <div
                    key={c.name}
                    onClick={() => {
                      onSelectCity(c.name);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #D97706' : '1px solid #E2E8F0',
                      background: isSelected ? '#FEF3C7' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A' }}>{c.name}</strong>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{c.hub}</div>
                    </div>
                    {isSelected && <Check size={18} color="#D97706" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;

