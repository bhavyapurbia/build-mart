import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      showToast('Password reset instructions sent!', 'success');

      // In dev mode, backend may return resetUrl
      const data = res.data?.data || res.data;
      if (data?.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', padding: '60px 16px', minHeight: '65vh' }}>
      <div
        style={{
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
          border: '1px solid var(--border-light, #E5E7EB)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '14px',
              backgroundColor: 'var(--bg-accent-subtle, #EFF6FF)',
              borderRadius: '50%',
              color: 'var(--primary, #0284C7)',
              marginBottom: '16px'
            }}
          >
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Enter your registered email address and we'll send you a secure link to reset your account password.
          </p>
        </div>

        {submitted ? (
          <div>
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                background: 'var(--bg-accent-subtle, #F0FDF4)',
                borderRadius: '10px',
                border: '1px solid var(--border-accent, #BBF7D0)',
                marginBottom: '20px'
              }}
            >
              <CheckCircle2 size={36} color="var(--color-success, #16A34A)" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Check Your Inbox
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly. The link expires in 1 hour.
              </p>
            </div>

            {/* Development Helper: Direct Reset Link */}
            {devResetUrl && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '8px',
                  border: '1px solid #FCD34D',
                  marginBottom: '20px',
                  fontSize: '12px'
                }}
              >
                <strong>Dev Mode Quick Link:</strong>
                <div style={{ marginTop: '4px', wordBreak: 'break-all' }}>
                  <Link to={devResetUrl} style={{ color: '#B45309', fontWeight: 600 }}>
                    Click here to reset password directly
                  </Link>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--primary, #0284C7)',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@buildmart.in"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

