import React, { useState, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

function checkPasswordStrength(pw) {
  let score = 0;
  if (!pw) return { score: 0, label: 'Empty', color: '#D1D5DB' };
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  if (score <= 2) return { score, label: 'Weak', color: '#EF4444' };
  if (score <= 4) return { score, label: 'Moderate', color: '#F59E0B' };
  return { score, label: 'Strong', color: '#10B981' };
}

export default function ResetPasswordPage() {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => checkPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Reset token is missing or invalid.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      showToast('Password reset successfully! Please sign in.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed. Token may have expired.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '440px', padding: '60px 16px', textAlign: 'center', minHeight: '65vh' }}>
        <div style={{ backgroundColor: 'var(--bg-card, #FFFFFF)', borderRadius: '16px', padding: '36px', border: '1px solid var(--border-light, #E5E7EB)' }}>
          <AlertCircle size={44} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Invalid Reset Link</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            No password reset token was provided in the URL. Please request a new link.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

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
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            Set New Password
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Choose a strong password to secure your BuildMart procurement account.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '24px',
                background: 'var(--bg-accent-subtle, #F0FDF4)',
                borderRadius: '10px',
                border: '1px solid var(--border-accent, #BBF7D0)',
                marginBottom: '24px'
              }}
            >
              <CheckCircle2 size={40} color="var(--color-success, #16A34A)" style={{ marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>Password Updated</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Your password has been changed and all prior sessions have been securely signed out.
              </p>
            </div>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', textAlign: 'center' }}
            >
              Sign In with New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                    <span style={{ fontWeight: 600, color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(strength.score / 5) * 100}%`,
                        backgroundColor: strength.color,
                        transition: 'all 0.25s ease'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #D1D5DB)',
                  fontSize: '14px'
                }}
              />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#EF4444' }}>
                  Passwords do not match
                </p>
              )}
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
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

