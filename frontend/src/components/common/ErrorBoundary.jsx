import React from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    const errorDetails = encodeURIComponent(
      `BuildMart Error Report:\nError: ${this.state.error?.message}\nLocation: ${window.location.href}\nStack: ${this.state.errorInfo?.componentStack?.slice(0, 300)}`
    );
    window.open(`mailto:orders@buildmart.in?subject=BuildMart%20Issue%20Report&body=${errorDetails}`, '_blank');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '60px 16px',
          maxWidth: '560px',
          margin: '40px auto',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          borderRadius: '16px',
          border: '1px solid var(--border-light, #E5E7EB)',
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '16px',
            background: '#FEE2E2',
            borderRadius: '50%',
            color: '#DC2626',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={36} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px' }}>
            We encountered an unexpected error while loading this material procurement component. Your cart and orders are safe.
          </p>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div style={{
              textAlign: 'left',
              padding: '12px',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#DC2626',
              marginBottom: '24px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {this.state.error.toString()}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Reload
            </button>
            <button
              type="button"
              onClick={this.handleReport}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={15} /> Report Issue
            </button>
            <a
              href="/"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              <Home size={15} /> Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

