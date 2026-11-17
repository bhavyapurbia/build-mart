import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hammer, Lock, Mail, User, Phone, MapPin, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: localStorage.getItem('bm_user_city') || '',
    street: '',
    pincode: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handlePhoneChange = (e) => {
    // Only accept numeric digits, up to 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: cleaned }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number
    if (formData.phone && (formData.phone.length !== 10 || !/^[6-9]\d{9}$/.test(formData.phone))) {
      showToast('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      addresses: [{
        street: formData.street.trim() || 'Primary Job-Site Address',
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        isDefault: true
      }]
    });
    setSubmitting(false);

    if (res.success) {
      if (formData.city.trim()) {
        localStorage.setItem('bm_user_city', formData.city.trim());
      }
      const from = location.state?.from || '/account';
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '36px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ margin: '0 auto 12px', width: '56px', height: '56px', borderRadius: '14px', background: '#FFFFFF', padding: '2px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', border: '1.5px solid #EA7E12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.jpg" alt="BuildPlace" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)' }}>
              Create Customer Account
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
              Register for contractor pricing, instant material quotes, and saved job-site details
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma / ABC Construction"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="email"
                  required
                  placeholder="name@site.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)' }}>
                  Mobile Number *
                </label>
                <span style={{ fontSize: '11px', color: formData.phone.length === 10 ? '#16A34A' : '#94A3B8', fontWeight: 700 }}>
                  {formData.phone.length === 10 ? '✓ 10 Digits Valid' : `${formData.phone.length}/10 digits`}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  placeholder="9876543210 (10 digits)"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  City / Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Pune, Delhi"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                  Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560103"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Job-Site Delivery Address (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  placeholder="Plot/Flat No, Landmark, Project Name"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', marginTop: '6px' }}
            >
              <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" state={location.state} style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

