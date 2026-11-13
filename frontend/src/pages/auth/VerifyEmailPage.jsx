import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

export default function VerifyEmailPage() {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token');
  const { showToast } = useNotification();

  const [status, setStatus] = useState(token ? 'verifying' : 'no-token'); // verifying | success | error | no-token
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const requestedRef = React.useRef(false);

  useEffect(() => {
    if (!token || requestedRef.current) return;
    requestedRef.current = true;

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: resendEmail });
      setResendSuccess(true);
      showToast('Verification email resent successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification email.';
      showToast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '460px', padding: '60px 16px', minHeight: '65vh' }}>
      <div
        style={{
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
          border: '1px solid var(--border-light, #E5E7EB)',
          textAlign: 'center'
        }}
      >
        {status === 'verifying' && (
          <div>
            <RefreshCw size={36} color="var(--primary, #0284C7)" className="animate-spin" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Verifying Your Email...</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Please wait while we confirm your email verification token.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--bg-accent-subtle, #F0FDF4)', borderRadius: '50%', marginBottom: '16px' }}>
              <CheckCircle2 size={44} color="var(--color-success, #16A34A)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              Email Verified!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Your BuildMart account is now fully verified. You can now access verified contractor pricing and seamless job-site dispatch.
            </p>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}
            >
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {(status === 'error' || status === 'no-token') && (
          <div>
            <div style={{ display: 'inline-flex', padding: '16px', background: '#FEF2F2', borderRadius: '50%', marginBottom: '16px' }}>
              <AlertCircle size={44} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {status === 'no-token' ? 'Verify Your Email' : 'Verification Link Expired'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {status === 'no-token'
                ? 'Please click the link sent to your registered email address, or enter your email below to request a new link.'
                : 'The verification link may have expired or was already used. Enter your email below to get a fresh link.'}
            </p>

            {resendSuccess ? (
              <div style={{ padding: '16px', background: 'var(--bg-accent-subtle, #F0FDF4)', borderRadius: '8px', border: '1px solid var(--border-accent, #BBF7D0)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-success, #16A34A)', fontWeight: 600 }}>
                  A fresh verification link has been sent to your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light, #D1D5DB)',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 600 }}
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '20px' }}>
              <Link to="/login" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

