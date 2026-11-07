import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@buildmart.com');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await adminLogin(email, password);
    setSubmitting(false);
    if (res.success) {
      navigate('/admin/overview');
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--color-ink)' }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'var(--secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-accent), var(--primary-dark))',
            color: 'var(--color-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 10px 20px rgba(217, 119, 6, 0.3)'
          }}>
            <ShieldCheck size={28} />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--bg-card)' }}>
            BuildMart Admin Portal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            Restricted operations management & quotation dispatch console
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-rule)', marginBottom: '6px' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color='var(--color-muted)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'var(--color-ink)',
                  border: '1px solid var(--secondary-light)',
                  borderRadius: '8px',
                  color: 'var(--bg-card)',
                  fontSize: '13.5px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-rule)', marginBottom: '6px' }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color='var(--color-muted)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'var(--color-ink)',
                  border: '1px solid var(--secondary-light)',
                  borderRadius: '8px',
                  color: 'var(--bg-card)',
                  fontSize: '13.5px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', marginTop: '6px' }}
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Admin Console'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={async () => {
              setSubmitting(true);
              const res = await adminLogin('admin@buildmart.com', 'admin123');
              setSubmitting(false);
              if (res.success) {
                navigate('/admin/overview');
              }
            }}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: '1px solid var(--color-accent)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--color-accent)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>1-Click Instant Admin Access</span>
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '12px',
          color: 'var(--color-accent)',
          lineHeight: 1.5
        }}>
          <strong>Default Admin Credentials:</strong><br />
          Email: <code>admin@buildmart.com</code><br />
          Password: <code>admin123</code>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-light)', fontSize: '13px' }}>
            ← Return to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

