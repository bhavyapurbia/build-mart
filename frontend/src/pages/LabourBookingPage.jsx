import React, { useState } from 'react';
import {
  HardHat,
  Users,
  Calendar,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Layers,
  Grid,
  Wrench,
  Droplets,
  Building2,
  Hammer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../utils/api';

const LABOUR_CATEGORIES = [
  { type: 'Mason', desc: 'Brickwork, block masonry, plastering, boundary walls, and lintels', icon: Layers },
  { type: 'Tile worker', desc: 'Precision vitrified floor tiling, wall cladding, and epoxy grouting', icon: Grid },
  { type: 'Plumber', desc: 'CPVC internal lines, drainage SWR, bathroom fittings, and sanitary fixings', icon: Wrench },
  { type: 'Waterproofing worker', desc: 'Terrace membrane coatings, bathroom sunken slab, and crystalline sealing', icon: Droplets },
  { type: 'General construction worker', desc: 'RCC curing, sand/aggregate shifting, excavation, and site cleanup', icon: Building2 },
  { type: 'Other', desc: 'Carpenters, fabricators, and specialized site trades', icon: Hammer }
];

const LabourBookingPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    workLocation: (user?.addresses && user.addresses[0]?.street) || '',
    city: (user?.addresses && user.addresses[0]?.city) || 'Bengaluru',
    pincode: (user?.addresses && user.addresses[0]?.pincode) || ''
  });

  const [labourType, setLabourType] = useState('Mason');
  const [workersRequired, setWorkersRequired] = useState(2);
  const [workCategory, setWorkCategory] = useState('Plastering & Brickwork');
  const [preferredStartDate, setPreferredStartDate] = useState('');
  const [expectedDuration, setExpectedDuration] = useState('3 Days');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preferredStartDate) {
      showToast('Please select your preferred work starting date.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer,
        labourType,
        workersRequired: Number(workersRequired) || 1,
        workCategory,
        preferredStartDate,
        expectedDuration,
        additionalInstructions
      };

      const res = await api.post('/labour-requests', payload);
      setSubmittedBooking(res.data);
      showToast('Labour service request submitted successfully!', 'success', 5000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error booking labour service.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedBooking) {
    return (
      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
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
              Booking ID: #{submittedBooking.bookingId}
            </span>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '12px', marginBottom: '8px' }}>
              Labour Request Submitted for Review
            </h1>

            <p style={{ fontSize: '14.5px', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '24px' }}>
              Thank you, <strong>{customer.name}</strong>. Our local contractor supervisor is reviewing availability of skilled {labourType}s for your project starting on <strong>{preferredStartDate}</strong>.
            </p>

            <div style={{
              background: 'var(--bg-page)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '18px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '13px',
              color: 'var(--text-sub)',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>What Happens Next?</div>
              <div>• Supervisor contacts you to confirm site accessibility and scope.</div>
              <div>• Transparent daily or square-footage labour charges are quoted.</div>
              <div>• Certified workers are assigned with direct contact details.</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setSubmittedBooking(null)}
                className="btn-primary"
              >
                <span>Book Another Trade</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 0 80px' }}>
      <div className="container" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary-light)',
            color: 'var(--primary-deep)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            <HardHat size={16} />
            <span>Skilled Construction Workforce</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Book Verified Site Labour
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-muted)', maxWidth: '600px', margin: '8px auto 0' }}>
            Hire experienced masons, plumbers, tile layers, and waterproofing specialists on a daily or project contract.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px' }}>
          {/* Select Trade Category */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '12px' }}>
              1. Choose Required Trade Category *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {LABOUR_CATEGORIES.map(cat => {
                const isSelected = labourType === cat.type;
                return (
                  <div
                    key={cat.type}
                    onClick={() => setLabourType(cat.type)}
                    style={{
                      border: isSelected ? '2px solid var(--primary-dark)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <cat.icon size={20} color="var(--primary-dark)" />
                      <strong style={{ fontSize: '14.5px', color: 'var(--color-ink)' }}>{cat.type}</strong>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.4 }}>
                      {cat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scope and Date */}
          <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '14px' }}>
              2. Job Timeline & Team Size
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Number of Workers *
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  required
                  value={workersRequired}
                  onChange={e => setWorkersRequired(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Starting Date *
                </label>
                <input
                  type="date"
                  required
                  value={preferredStartDate}
                  onChange={e => setPreferredStartDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Estimated Duration *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Days / 1 Week"
                  value={expectedDuration}
                  onChange={e => setExpectedDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>
          </div>

          {/* Customer & Location */}
          <div style={{ marginBottom: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '14px' }}>
              3. Site Location & Contact Details
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Your Name *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Work Site Location Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street / Project site, Landmark, Area"
                  value={customer.workLocation}
                  onChange={e => setCustomer({ ...customer, workLocation: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>City *</label>
                <input
                  type="text"
                  required
                  value={customer.city}
                  onChange={e => setCustomer({ ...customer, city: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={customer.pincode}
                  onChange={e => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
          >
            <span>{submitting ? 'Submitting Request...' : 'Submit Labour Booking Request'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LabourBookingPage;

