import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  X,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const STATUS_CONFIG = {
  captured: {
    label: 'Captured / Paid',
    badgeClass: 'badge-success',
    color: 'var(--color-success)',
    bg: 'var(--accent-green-light)',
    icon: CheckCircle2
  },
  failed: {
    label: 'Failed',
    badgeClass: 'badge-danger',
    color: 'var(--color-error)',
    bg: 'rgba(239, 68, 68, 0.12)',
    icon: XCircle
  },
  created: {
    label: 'Initiated / Pending',
    badgeClass: 'badge-warning',
    color: 'var(--primary-dark)',
    bg: 'var(--primary-light)',
    icon: Clock
  },
  refunded: {
    label: 'Refunded',
    badgeClass: 'badge-info',
    color: 'var(--primary-dark)',
    bg: 'var(--primary-light)',
    icon: RotateCcw
  },
  partially_refunded: {
    label: 'Partially Refunded',
    badgeClass: 'badge-info',
    color: 'var(--secondary-light)',
    bg: 'var(--bg-page)',
    icon: RotateCcw
  }
};

const AdminPayments = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);
  const [refundModalTx, setRefundModalTx] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);
  const { showToast } = useNotification();

  const loadData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        api.get('/payments/admin/transactions'),
        api.get('/payments/admin/stats')
      ]);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data || []));
      setStats(statsRes.data?.data || statsRes.data || null);
    } catch (err) {
      console.error('[AdminPayments] Error fetching payments data:', err);
      showToast('Error loading payment transactions.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenRefundModal = (tx) => {
    setRefundModalTx(tx);
    const fullRupees = Math.round(Number(tx.amount || 0)) / 100;
    setRefundAmount(fullRupees.toString());
    setRefundReason('Customer requested cancellation and refund');
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundModalTx) return;

    const amountNum = Number(refundAmount);
    const maxRupees = Math.round(Number(refundModalTx.amount || 0)) / 100;

    if (isNaN(amountNum) || amountNum <= 0 || amountNum > maxRupees) {
      showToast(`Please enter a valid refund amount between 1 and ${maxRupees}.`, 'error');
      return;
    }

    setRefunding(true);
    try {
      await api.post('/payments/admin/refund', {
        paymentId: refundModalTx._id || refundModalTx.razorpayPaymentId,
        amount: amountNum,
        reason: refundReason
      });
      showToast(`Refund of ₹${amountNum.toLocaleString('en-IN')} initiated successfully!`, 'success');
      setRefundModalTx(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Refund processing failed.';
      showToast(msg, 'error');
    } finally {
      setRefunding(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const orderId = (tx.internalOrderId || '').toLowerCase();
    const rzpOrderId = (tx.razorpayOrderId || '').toLowerCase();
    const rzpPaymentId = (tx.razorpayPaymentId || '').toLowerCase();
    const customerName = (tx.order?.customer?.name || tx.pendingOrderData?.customer?.name || '').toLowerCase();
    const customerPhone = (tx.order?.customer?.phone || tx.pendingOrderData?.customer?.phone || '').toLowerCase();

    const matchesSearch =
      orderId.includes(query) ||
      rzpOrderId.includes(query) ||
      rzpPaymentId.includes(query) ||
      customerName.includes(query) ||
      customerPhone.includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
              Razorpay Payment Gateways and Ledger
            </h1>
            <span style={{
              background: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              Test Mode
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
            Live transaction monitoring, signature audit log, order cross-referencing, and refund settlement
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Ledger'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Total Captured */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-muted)' }}>Captured Revenue</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-green-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            ₹{(stats?.captured?.amountRupees || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '4px', fontWeight: 600 }}>
            {stats?.captured?.count || 0} Successful Order Payments
          </div>
        </div>

        {/* Total Failed */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-muted)' }}>Failed Attempts</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <XCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            ₹{(stats?.failed?.amountRupees || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px', fontWeight: 600 }}>
            {stats?.failed?.count || 0} Failed Checkout Sessions
          </div>
        </div>

        {/* Refunded */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-muted)' }}>Refunded Volume</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RotateCcw size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            ₹{(stats?.refunded?.amountRupees || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--primary-dark)', marginTop: '4px', fontWeight: 600 }}>
            {stats?.refunded?.count || 0} Reversed Transactions
          </div>
        </div>

        {/* Total Transactions */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-muted)' }}>Gross Ledger Total</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--color-paper-3)',
              color: 'var(--color-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            {stats?.total || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Total Payment Records Logged
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            type="text"
            placeholder="Search by Order ID, Razorpay Payment ID, or customer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '13px',
              background: 'var(--bg-page)',
              color: 'var(--color-ink)'
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'captured', 'created', 'failed', 'refunded'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setStatusFilter(statusKey)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: statusFilter === statusKey ? 'var(--color-ink)' : 'var(--border)',
                background: statusFilter === statusKey ? 'var(--color-ink)' : 'var(--bg-card)',
                color: statusFilter === statusKey ? 'var(--bg-card)' : 'var(--secondary-light)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {statusKey === 'ALL' ? 'All Transactions' : (STATUS_CONFIG[statusKey]?.label || statusKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-muted)' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13.5px' }}>Loading transaction ledger...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <CreditCard size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>No payment records found</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'Transactions created via Razorpay Checkout will appear here automatically.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order / Internal ID</th>
                <th>Razorpay IDs</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const statusCfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.created;
                const StatusIcon = statusCfg.icon;
                const rupees = Math.round(Number(tx.amount || 0)) / 100;
                const customer = tx.order?.customer || tx.pendingOrderData?.customer || {};

                return (
                  <tr key={tx._id || tx.razorpayOrderId}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-ink)', fontSize: '13.5px' }}>
                        {tx.internalOrderId || 'Pending Checkout'}
                      </div>
                      {tx.orderId && (
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                          Ref: {tx.orderId.slice(-6)}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-light)', fontFamily: 'monospace' }}>
                        ORD: {tx.razorpayOrderId || 'N/A'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                        PAY: {tx.razorpayPaymentId || 'N/A'}
                      </div>
                    </td>

                    <td>
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--color-ink)' }}>
                        {customer.name || 'Guest Customer'}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}>
                        {customer.phone || customer.email || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '14.5px', color: 'var(--color-ink)' }}>
                        ₹{rupees.toLocaleString('en-IN')}
                      </strong>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-muted)' }}>
                        {tx.amount} paise ({tx.currency || 'INR'})
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: statusCfg.bg,
                        color: statusCfg.color
                      }}>
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </span>
                    </td>

                    <td style={{ fontSize: '12px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                      {tx.verifiedAt
                        ? new Date(tx.verifiedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                        : tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                        : 'N/A'
                      }
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedTx(tx)}
                          title="View Payment Audit Details"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: 'var(--color-ink)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} />
                          <span>Audit</span>
                        </button>

                        {tx.status === 'captured' && (
                          <button
                            onClick={() => handleOpenRefundModal(tx)}
                            title="Issue Refund via Razorpay"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--primary-light)',
                              color: 'var(--primary-dark)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <RotateCcw size={13} />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Transaction Audit Detail Modal */}
      {selectedTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)' }}>
                  Razorpay Transaction Audit Record
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Internal ID: <strong>{selectedTx.internalOrderId || 'N/A'}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-page)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px', fontSize: '13.5px' }}>
                  Gateway Identifiers
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Razorpay Order ID:</span>
                  <code style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{selectedTx.razorpayOrderId}</code>
                  <span style={{ color: 'var(--color-muted)' }}>Razorpay Payment ID:</span>
                  <code style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{selectedTx.razorpayPaymentId || 'Pending'}</code>
                  <span style={{ color: 'var(--color-muted)' }}>Signature Status:</span>
                  <span style={{ color: selectedTx.razorpaySignature ? 'var(--color-success)' : 'var(--color-muted)', fontWeight: 600 }}>
                    {selectedTx.razorpaySignature ? 'HMAC-SHA256 Verified (OK)' : 'Unsigned / Incomplete'}
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-page)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px', fontSize: '13.5px' }}>
                  Financial Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Amount in Rupees:</span>
                  <strong style={{ color: 'var(--color-ink)' }}>₹{(Math.round(Number(selectedTx.amount || 0)) / 100).toLocaleString('en-IN')}</strong>
                  <span style={{ color: 'var(--color-muted)' }}>Amount in Paise:</span>
                  <span>{selectedTx.amount} paise</span>
                  <span style={{ color: 'var(--color-muted)' }}>Currency:</span>
                  <span>{selectedTx.currency || 'INR'}</span>
                  <span style={{ color: 'var(--color-muted)' }}>Lifecycle Status:</span>
                  <strong style={{ textTransform: 'uppercase', color: selectedTx.status === 'captured' ? 'var(--color-success)' : 'var(--primary-dark)' }}>
                    {selectedTx.status}
                  </strong>
                </div>
              </div>

              {selectedTx.refundId && (
                <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px', fontSize: '13.5px' }}>
                    Refund Audit Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px' }}>
                    <span style={{ color: 'var(--primary-dark)' }}>Refund ID:</span>
                    <code>{selectedTx.refundId}</code>
                    <span style={{ color: 'var(--primary-dark)' }}>Refunded Amount:</span>
                    <strong>₹{(Math.round(Number(selectedTx.refundAmount || 0)) / 100).toLocaleString('en-IN')}</strong>
                    <span style={{ color: 'var(--primary-dark)' }}>Refund Status:</span>
                    <span>{selectedTx.refundStatus}</span>
                  </div>
                </div>
              )}

              {selectedTx.errorCode && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-error)', marginBottom: '6px' }}>
                    Failure Diagnostics
                  </div>
                  <div style={{ color: 'var(--color-error)' }}>
                    Code: <code>{selectedTx.errorCode}</code>: {selectedTx.errorDescription}
                  </div>
                </div>
              )}

              {/* Order items snapshot */}
              {selectedTx.pendingOrderData?.items && (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px' }}>
                    Purchased Construction Materials ({selectedTx.pendingOrderData.items.length} items)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedTx.pendingOrderData.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-page)', borderRadius: '6px' }}>
                        <span>{item.name} × {item.quantity}</span>
                        <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedTx(null)}
                className="btn-secondary"
                style={{ padding: '8px 20px' }}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RotateCcw size={18} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)' }}>
                  Issue Razorpay Refund
                </h2>
              </div>
              <button
                onClick={() => setRefundModalTx(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--secondary-light)', lineHeight: 1.5, marginBottom: '16px' }}>
              This will initiate an instantaneous refund against Razorpay Payment ID{' '}
              <code style={{ fontWeight: 700 }}>{refundModalTx.razorpayPaymentId}</code>.
            </p>

            <form onSubmit={handleProcessRefund}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '6px' }}>
                  Refund Amount (in ₹ INR) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-muted)' }}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={Math.round(Number(refundModalTx.amount || 0)) / 100}
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 28px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      fontWeight: 700,
                      background: 'var(--bg-page)',
                      color: 'var(--color-ink)'
                    }}
                  />
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
                  Max refundable: ₹{(Math.round(Number(refundModalTx.amount || 0)) / 100).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '6px' }}>
                  Reason for Refund (Passed to Razorpay and Customer)
                </label>
                <textarea
                  rows={2}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Material out of stock, customer requested cancellation"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    background: 'var(--bg-page)',
                    color: 'var(--color-ink)',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setRefundModalTx(null)}
                  disabled={refunding}
                  className="btn-secondary"
                  style={{ padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="btn-primary"
                  style={{
                    padding: '9px 20px',
                    fontSize: '13.5px',
                    cursor: refunding ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={14} className={refunding ? 'spinning' : ''} />
                  <span>{refunding ? 'Processing Refund...' : 'Confirm and Process Refund'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
