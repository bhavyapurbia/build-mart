import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';

const DEFAULT_CITIES = [
  { city: 'Bengaluru', hub: 'Central Fulfillment Hub (Bellandur)', state: 'Karnataka' },
  { city: 'Mumbai', hub: 'Western Suburbs Hub (Andheri)', state: 'Maharashtra' },
  { city: 'Delhi NCR', hub: 'Gurugram Sector 48 Hub', state: 'Delhi' },
  { city: 'Hyderabad', hub: 'HITEC City Logistics Yard', state: 'Telangana' },
  { city: 'Pune', hub: 'Kharadi Industrial Zone', state: 'Maharashtra' },
  { city: 'Chennai', hub: 'Guindy Central Depot', state: 'Tamil Nadu' }
];

const LocationModal = ({ isOpen, onClose, currentCity, onSelectCity }) => {
  const [pincode, setPincode] = useState('');
  const [checking, setChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState(null); // { serviceable: boolean, message: string, city: string }
  const [activeCities, setActiveCities] = useState(DEFAULT_CITIES);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch live active cities enabled by Admin
  useEffect(() => {
    if (!isOpen) return;

    const fetchActiveCities = async () => {
      try {
        const res = await api.get('/serviceability/cities');
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (list && list.length > 0) {
          setActiveCities(list);
        }
      } catch (err) {
        // Fallback to local storage or defaults
        try {
          const cached = localStorage.getItem('bm_admin_cities');
          if (cached) {
            const parsed = JSON.parse(cached);
            const activeOnly = parsed.filter(c => c.isAvailable !== false);
            if (activeOnly.length > 0) setActiveCities(activeOnly);
          }
        } catch {}
      }
    };

    fetchActiveCities();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPincode('');
      setPincodeResult(null);
      setErrorMessage('');
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPincodeResult(null);

    const clean = pincode.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code (e.g. 560001).');
      return;
    }

    setChecking(true);
    try {
      const res = await api.get(`/serviceability?pincode=${clean}`);
      const data = res.data?.data || res.data;

      if (data.serviceable) {
        setPincodeResult({
          serviceable: true,
          city: data.city,
          pincode: clean,
          etaLabel: data.etaLabel || '⚡ 30-60 Min Express Delivery'
        });

        // Set city and save to local storage
        onSelectCity(data.city);
        try {
          localStorage.setItem('bm_user_city', data.city);
          localStorage.setItem('bm_user_pincode', clean);
        } catch {}

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setPincodeResult({
          serviceable: false,
          pincode: clean,
          message: data.message || `Sorry, direct delivery is not available for PIN code ${clean} yet.`
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid PIN code. Please verify and try again.';
      setPincodeResult({
        serviceable: false,
        pincode: clean,
        message: msg
      });
    } finally {
      setChecking(false);
    }
  };

  const handleCitySelect = (cityName) => {
    onSelectCity(cityName);
    try {
      localStorage.setItem('bm_user_city', cityName);
    } catch {}
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', borderRadius: '16px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FF9900', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={18} />
            </div>
            <div>
              <h3 id="location-modal-title" style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
                Choose Delivery Location
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                Check site PIN code availability & local warehouse lead time
              </span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', cursor: 'pointer', border: 'none', padding: '4px' }}>
            <X size={20} color="var(--color-muted)" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
            Enter your 6-digit site PIN code to verify express delivery availability:
          </p>

          {/* PIN code input form */}
          <form onSubmit={handlePincodeSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Enter 6-digit PIN code (e.g. 560001)"
              maxLength={6}
              value={pincode}
              onChange={e => {
                setPincode(e.target.value.replace(/\D/g, ''));
                setErrorMessage('');
                setPincodeResult(null);
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: errorMessage || (pincodeResult && !pincodeResult.serviceable) ? '1.5px solid #DC2626' : '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: 600,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={checking || pincode.length !== 6}
              style={{
                background: pincode.length === 6 ? '#FF9900' : 'var(--border)',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: pincode.length === 6 ? 'pointer' : 'not-allowed',
                boxShadow: pincode.length === 6 ? '0 2px 8px rgba(255, 153, 0, 0.4)' : 'none'
              }}
            >
              {checking ? 'Checking...' : 'Check & Apply'}
            </button>
          </form>

          {/* Error Message for Invalid Input */}
          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pincode Result Alert Banner */}
          {pincodeResult && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              background: pincodeResult.serviceable ? '#ECFDF5' : '#FEF2F2',
              border: `1.5px solid ${pincodeResult.serviceable ? '#10B981' : '#F87171'}`,
              color: pincodeResult.serviceable ? '#065F46' : '#991B1B',
              fontSize: '12.5px',
              lineHeight: 1.4
            }}>
              {pincodeResult.serviceable ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: '#047857' }}>
                      Delivery Available in {pincodeResult.city}! ({pincodeResult.pincode})
                    </strong>
                    <span>{pincodeResult.etaLabel} to your job site. Applying delivery location...</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#991B1B', marginBottom: '2px' }}>
                      Delivery Not Available for PIN code {pincodeResult.pincode}
                    </strong>
                    <span>{pincodeResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Major Metro Supply Zones */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Serviceable Cities ({activeCities.length})
              </span>
              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                ● Express On-Site Available
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {activeCities.map(c => {
                const cityName = c.city || c.name;
                const hubName = c.hub || `${cityName} Fulfillment Depot`;
                const isSelected = currentCity?.toLowerCase().includes(cityName.toLowerCase());

                return (
                  <div
                    key={cityName}
                    onClick={() => handleCitySelect(cityName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #FF9900' : '1px solid var(--border)',
                      background: isSelected ? '#FFFBEB' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--color-ink)' }}>{cityName}</strong>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}>{hubName}</div>
                    </div>
                    {isSelected && <Check size={18} color="#FF9900" />}
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
