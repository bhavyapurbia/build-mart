import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    const res = await adminLogin(email.trim(), password);
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
                autoComplete="email"
                placeholder="name@buildmart.in"
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
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 36px',
                  background: 'var(--color-ink)',
                  border: '1px solid var(--secondary-light)',
                  borderRadius: '8px',
                  color: 'var(--bg-card)',
                  fontSize: '13.5px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', marginTop: '6px' }}
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Admin Console'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '12px 14px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '11.5px',
          color: 'var(--text-light)',
          lineHeight: 1.4
        }}>
          <ShieldAlert size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <span>Restricted Area: Access is strictly authorized for BuildMart personnel. All sign-in attempts are logged and monitored.</span>
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
