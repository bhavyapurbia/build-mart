import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  User,
  ClipboardList,
  FileText,
  Package,
  HardHat,
  Truck,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Download,
  RotateCcw,
  Ban,
  Heart,
  Lock,
  Mail,
  ShieldCheck,
  Check,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../utils/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' }
];

function getOrderStep(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return 0;
    case 'processing': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    case 'cancelled': return -1;
    default: return 0;
  }
}

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useNotification();
  const { addToCart } = useCart();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const queryTab = new URLSearchParams(location.search).get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(queryTab);

  const [materialRequests, setMaterialRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [labourBookings, setLabourBookings] = useState([]);
  const [bulkEnquiries, setBulkEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Sync active tab with url
  useEffect(() => {
    if (queryTab) setActiveTab(queryTab);
  }, [queryTab]);

  const extractItems = (res) => {
    if (!res) return [];
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.orders)) return payload.orders;
    if (Array.isArray(payload?.quotations)) return payload.quotations;
    if (Array.isArray(payload?.requests)) return payload.requests;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [matRes, quoRes, ordRes, lbrRes, blkRes] = await Promise.all([
          api.get('/material-requests/my'),
          api.get('/quotations/my'),
          api.get('/orders/my'),
          api.get('/labour-requests/my'),
          api.get('/bulk-enquiries/my')
        ]);
        setMaterialRequests(extractItems(matRes));
        setQuotations(extractItems(quoRes));
        setOrders(extractItems(ordRes));
        setLabourBookings(extractItems(lbrRes));
        setBulkEnquiries(extractItems(blkRes));
      } catch (err) {
        console.error('Error loading account data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Handle Quotation Response (Accept or Reject)
  const handleRespondQuotation = async (quotationId, action) => {
    try {
      const res = await api.post(`/quotations/${quotationId}/respond`, { action });
      showToast(res.data.message || `Quotation ${action}ed successfully!`, action === 'accept' ? 'success' : 'info');

      const [quoRes, matRes] = await Promise.all([
        api.get('/quotations/my'),
        api.get('/material-requests/my')
      ]);
      setQuotations(extractItems(quoRes));
      setMaterialRequests(extractItems(matRes));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating quotation', 'error');
    }
  };

  // Handle Order Cancellation
  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (reason === null) return;

    try {
      await api.post(`/orders/${orderId}/cancel`, { reason: reason || 'Customer requested cancellation' });
      showToast('Order cancelled successfully', 'info');
      const ordRes = await api.get('/orders/my');
      setOrders(extractItems(ordRes));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  // Handle Reorder
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart(item, item.quantity || 1);
    });
    showToast(`Added ${order.items.length} items to your cart!`, 'success');
    navigate('/cart');
  };

  // Download Invoice PDF
  const handleDownloadInvoice = (orderId) => {
    const token = localStorage.getItem('bm_token');
    const url = `/api/orders/${orderId}/invoice.pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  // Handle Bulk Enquiry Response (Accept or Reject)
  const handleRespondBulkEnquiry = async (enquiryId, action) => {
    try {
      await api.post(`/bulk-enquiries/${enquiryId}/respond`, { action });
      showToast(`Bulk enquiry quotation ${action}ed!`, 'success');
      const blkRes = await api.get('/bulk-enquiries/my');
      setBulkEnquiries(blkRes.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update enquiry', 'error');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 0 100px' }}>
        <div className="container" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <User size={48} color='var(--text-light)' style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '8px' }}>
              Sign in to Access Your Account
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginBottom: '24px' }}>
              Sign in to review formal quotations, track job-site deliveries, and view your material lists.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '10px 24px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-secondary" style={{ padding: '10px 24px' }}>
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '36px 0 80px', background: 'var(--bg-page)', minHeight: '80vh' }}>
      <div className="container">
        {/* Profile Header Bar */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '24px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent), var(--primary-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg-card)',
              fontSize: '22px',
              fontWeight: 800
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'B'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
                  {user?.name || 'Customer'}
                </h1>
                {user?.emailVerified ? (
                  <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={12} /> Verified
                  </span>
                ) : (
                  <Link to="/verify-email" style={{ fontSize: '11px', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    Verify Email
                  </Link>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                {user?.email} • {user?.phone || 'No phone registered'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/track-order" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>
              <Truck size={14} style={{ marginRight: '6px' }} /> Track Order
            </Link>
            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-error)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border)',
          marginBottom: '28px',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: Array.isArray(orders) ? orders.length : 0 },
            { id: 'quotations', label: 'Formal Quotations', icon: FileText, count: Array.isArray(quotations) ? quotations.length : 0 },
            { id: 'material-requests', label: 'Material Lists', icon: ClipboardList, count: Array.isArray(materialRequests) ? materialRequests.length : 0 },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: Array.isArray(wishlistItems) ? wishlistItems.length : 0 },
            { id: 'bulk', label: 'Bulk Enquiries', icon: Truck, count: Array.isArray(bulkEnquiries) ? bulkEnquiries.length : 0 },
            { id: 'labour', label: 'Labour Bookings', icon: HardHat, count: Array.isArray(labourBookings) ? labourBookings.length : 0 },
            { id: 'profile', label: 'Profile & Security', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/account?tab=${tab.id}`, { replace: true });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--primary, #0284C7)' : '3px solid transparent',
                  color: isActive ? 'var(--primary, #0284C7)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count != null && tab.count > 0 && (
                  <span style={{
                    background: isActive ? 'var(--primary, #0284C7)' : '#E5E7EB',
                    color: isActive ? '#FFFFFF' : '#374151',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
            Loading your procurement history...
          </div>
        ) : (
          <div>
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                {!Array.isArray(orders) || orders.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Package size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No orders placed yet.</p>
                    <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                      Browse Building Materials
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(Array.isArray(orders) ? orders : []).map(ord => {
                      const stepIdx = getOrderStep(ord.orderStatus);
                      const isCancelled = ord.orderStatus?.toLowerCase() === 'cancelled';
                      const canCancel = ['pending', 'processing'].includes(ord.orderStatus?.toLowerCase());

                      return (
                        <div key={ord._id} style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                          {/* Order Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light, #E5E7EB)' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '16px', color: 'var(--color-ink)' }}>Order #{ord.orderId}</strong>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  background: isCancelled ? '#FEE2E2' : stepIdx === 3 ? '#DCFCE7' : '#EFF6FF',
                                  color: isCancelled ? '#B91C1C' : stepIdx === 3 ? '#15803D' : '#1D4ED8'
                                }}>
                                  {ord.orderStatus}
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                                Placed on: {new Date(ord.createdAt).toLocaleDateString()} • Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoice(ord._id || ord.orderId)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Download size={13} /> Tax Invoice
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReorder(ord)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <RotateCcw size={13} /> Reorder
                              </button>
                              {canCancel && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(ord._id || ord.orderId)}
                                  style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Ban size={13} /> Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Stepper Timeline */}
                          {!isCancelled && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative', margin: '20px 0 24px', textAlign: 'center' }}>
                              <div style={{ position: 'absolute', top: '14px', left: '12%', right: '12%', height: '2px', background: '#E5E7EB', zIndex: 0 }}>
                                <div style={{ height: '100%', width: `${(Math.max(0, stepIdx) / 3) * 100}%`, background: 'var(--color-success, #10B981)' }} />
                              </div>
                              {STATUS_STEPS.map((s, idx) => {
                                const isDone = stepIdx >= idx;
                                return (
                                  <div key={s.key} style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      margin: '0 auto 6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      background: isDone ? 'var(--color-success, #10B981)' : '#FFFFFF',
                                      color: isDone ? '#FFFFFF' : '#9CA3AF',
                                      border: isDone ? 'none' : '2px solid #D1D5DB'
                                    }}>
                                      {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: isDone ? 700 : 500, color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                      {s.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Items Table with GST Breakup */}
                          <div style={{ background: 'var(--bg-page)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light, #E5E7EB)', textAlign: 'left' }}>
                                    <th style={{ padding: '6px 8px' }}>Item</th>
                                    <th style={{ padding: '6px 8px' }}>Qty</th>
                                    <th style={{ padding: '6px 8px' }}>Unit Rate</th>
                                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ord.items?.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                      <td style={{ padding: '8px', fontWeight: 600 }}>{item.name}</td>
                                      <td style={{ padding: '8px' }}>{item.quantity} {item.unit || ''}</td>
                                      <td style={{ padding: '8px' }}>₹{Number(item.price || item.unitPrice || 0).toLocaleString('en-IN')}</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₹{Number(item.total || ((item.price || 0) * (item.quantity || 1))).toLocaleString('en-IN')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Financial GST Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', maxWidth: '300px', marginLeft: 'auto', marginTop: '12px', color: 'var(--text-secondary)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Taxable Subtotal:</span>
                                <span>₹{Number(ord.subtotal || ord.totalAmount * 0.82 || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Delivery Freight:</span>
                                <span>{(ord.deliveryCharge ?? ord.shippingFee ?? 0) === 0 ? 'FREE' : `₹${Number(ord.deliveryCharge ?? ord.shippingFee).toLocaleString('en-IN')}`}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>GST (18% ITC):</span>
                                <span>₹{Number(ord.tax || ord.totalAmount * 0.18 || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D1D5DB', paddingTop: '6px', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                <span>Grand Total:</span>
                                <span>₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. QUOTATIONS TAB */}
            {activeTab === 'quotations' && (
              <div>
                {quotations.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <FileText size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No formal quotations generated yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {quotations.map(quo => (
                      <div key={quo._id} style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Quotation #{quo.quotationId}</h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valid until: {quo.validUntil ? new Date(quo.validUntil).toLocaleDateString() : '48 Hours'}</span>
                          </div>
                          <span className="badge-status badge-sent">{quo.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          <span style={{ fontWeight: 800, fontSize: '16px' }}>Total: ₹{Number(quo.totalAmount || 0).toLocaleString('en-IN')}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const token = localStorage.getItem('bm_token');
                                const qId = quo._id || quo.quotationId;
                                const url = `/api/quotations/${qId}/export.pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                                window.open(url, '_blank');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
                            >
                              <Download size={13} style={{ marginRight: '4px' }} /> Download PDF
                            </button>
                            {quo.status === 'Sent' || quo.status === 'Quoted' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRespondQuotation(quo.quotationId, 'accept')}
                                  className="btn btn-primary"
                                  style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px' }}
                                >
                                  Accept Quote
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRespondQuotation(quo.quotationId, 'reject')}
                                  style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', background: '#FEE2E2', color: '#B91C1C', border: 'none' }}
                                >
                                  Decline
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. MATERIAL LISTS TAB */}
            {activeTab === 'material-requests' && (
              <div>
                {materialRequests.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <ClipboardList size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No material lists submitted.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {materialRequests.map(req => (
                      <div key={req._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <strong style={{ fontSize: '15px' }}>Material List #{req.requestId}</strong>
                          <span className="badge-status badge-sent">{req.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {req.items?.map((item, idx) => (
                            <div key={idx}>• {item.name}: {item.quantity} {item.unit}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                {wishlistItems.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Heart size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>Your wishlist is currently empty.</p>
                    <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                      Explore Materials
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {wishlistItems.map(p => (
                      <div key={p._id || p.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light, #E5E7EB)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <img
                            src={(p.images && p.images[0]) || p.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=300&q=80'}
                            alt={p.name}
                            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                          />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary, #0284C7)', textTransform: 'uppercase' }}>{p.brand}</span>
                          <h4 style={{ margin: '4px 0 8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</h4>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            ₹{Number(p.price || 0).toLocaleString('en-IN')} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>/ {p.unit || 'unit'}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => addToCart(p, 1)}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <ShoppingCart size={14} /> Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(p._id || p.id)}
                            style={{ padding: '8px 10px', background: 'none', border: '1px solid var(--border-light, #D1D5DB)', borderRadius: '6px', color: '#EF4444', cursor: 'pointer' }}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. BULK ENQUIRIES TAB */}
            {activeTab === 'bulk' && (
              <div>
                {bulkEnquiries.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Truck size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No bulk contractor enquiries submitted.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {bulkEnquiries.map(blk => (
                      <div key={blk._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <strong style={{ fontSize: '15px' }}>Bulk Enquiry #{blk.enquiryId}</strong>
                          <span className="badge-status badge-sent">{blk.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {blk.items?.map((item, idx) => (
                            <div key={idx}>• {item.productName}: {item.quantity} {item.unit} {item.price ? `(@ ₹${item.price})` : ''}</div>
                          ))}
                        </div>
                        {blk.status === 'Quoted' && (
                          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() => handleRespondBulkEnquiry(blk._id || blk.enquiryId, 'accept')}
                              className="btn btn-primary"
                              style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px' }}
                            >
                              Accept Bulk Terms
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespondBulkEnquiry(blk._id || blk.enquiryId, 'reject')}
                              style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', background: '#FEE2E2', color: '#B91C1C', border: 'none' }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. LABOUR BOOKINGS TAB */}
            {activeTab === 'labour' && (
              <div>
                {labourBookings.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <HardHat size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No active labour service bookings.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {labourBookings.map(b => (
                      <div key={b._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <strong style={{ fontSize: '15px' }}>Booking #{b.bookingId}</strong>
                          <span className="badge-status badge-confirmed">{b.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          Trade: <strong>{b.labourType}</strong> ({b.workersRequired} workers) • Location: {b.customer?.city}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. PROFILE & SECURITY TAB */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Profile Overview */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Profile Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div><strong>Name:</strong> {user?.name}</div>
                    <div><strong>Email:</strong> {user?.email}</div>
                    <div><strong>Phone:</strong> {user?.phone || 'Not added'}</div>
                    <div><strong>Role:</strong> {user?.role}</div>
                    <div><strong>GSTIN:</strong> {user?.gstin || 'Not registered'}</div>
                  </div>
                </div>

                {/* Change Password Form */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={16} /> Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>New Password (min 8 chars)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="btn btn-primary"
                      style={{ marginTop: '8px', padding: '10px', borderRadius: '6px', fontWeight: 600 }}
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
