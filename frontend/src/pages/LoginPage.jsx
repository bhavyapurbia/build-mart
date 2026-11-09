import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hammer, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      const from = location.state?.from || '/account';
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '36px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="brand-logo-icon" style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
              <Hammer size={24} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)' }}>
              Sign in to BuildMart
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
              Access your saved material lists, quotations, and active job-site dispatches
            </p>
          </div>

          {redirectMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--primary-light)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              fontSize: '12.5px',
              color: 'var(--primary-dark)',
              fontWeight: 600
            }}>
              <AlertCircle size={16} />
              <span>{redirectMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="email"
                  required
                  placeholder="contractor@buildmart.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color='var(--text-light)' style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
              <span>{submitting ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{
            background: 'var(--bg-page)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginTop: '20px',
            fontSize: '12px',
            color: 'var(--color-muted)'
          }}>
            <strong>Demo Customer Account:</strong><br />
            Email: <code>customer@buildmart.com</code> | Pass: <code>customer123</code>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-muted)' }}>
            New to BuildMart?{' '}
            <Link to="/register" state={location.state} style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
