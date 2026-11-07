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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../utils/api';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const queryTab = new URLSearchParams(location.search).get('tab') || 'material-requests';
  const [activeTab, setActiveTab] = useState(queryTab);

  const [materialRequests, setMaterialRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [labourBookings, setLabourBookings] = useState([]);
  const [bulkEnquiries, setBulkEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync active tab with url
  useEffect(() => {
    if (queryTab) setActiveTab(queryTab);
  }, [queryTab]);

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
        setMaterialRequests(matRes.data || []);
        setQuotations(quoRes.data || []);
        setOrders(ordRes.data || []);
        setLabourBookings(lbrRes.data || []);
        setBulkEnquiries(blkRes.data || []);
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
      showToast(res.data.message, action === 'accept' ? 'success' : 'info');

      // Refresh quotations and material requests
      const [quoRes, matRes] = await Promise.all([
        api.get('/quotations/my'),
        api.get('/material-requests/my')
      ]);
      setQuotations(quoRes.data || []);
      setMaterialRequests(matRes.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating quotation', 'error');
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
            <Link to="/login" className="btn-primary" style={{ padding: '12px 28px' }}>
              <span>Sign In to Account</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)' }}>
              Welcome back, {user?.name}
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)' }}>
              {user?.email} • Customer ID: #{user?._id?.slice(-6) || 'BM-001'}
            </p>
          </div>
          <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--accent-red-light)', color: 'var(--color-error)', borderColor: 'var(--accent-red-light)' }}>
            Log Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--border)',
          marginBottom: '28px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'material-requests', label: 'My Material Lists', count: materialRequests.length, icon: ClipboardList },
            { id: 'quotations', label: 'Formal Quotations', count: quotations.length, icon: FileText },
            { id: 'orders', label: 'Confirmed Orders', count: orders.length, icon: Package },
            { id: 'labour', label: 'Labour Bookings', count: labourBookings.length, icon: HardHat },
            { id: 'bulk', label: 'Bulk Enquiries', count: bulkEnquiries.length, icon: Truck },
            { id: 'profile', label: 'Profile & Addresses', icon: User }
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
                  borderBottom: isActive ? '3px solid var(--primary-dark)' : '3px solid transparent',
                  color: isActive ? 'var(--primary-dark)' : 'var(--color-muted)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  marginBottom: '-2px'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    background: isActive ? 'var(--primary-dark)' : 'var(--border)',
                    color: isActive ? 'var(--bg-card)' : 'var(--text-sub)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '20px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
            <p>Loading your account records...</p>
          </div>
        ) : (
          <div>
            {/* 1. My Material Requests */}
            {activeTab === 'material-requests' && (
              <div>
                {materialRequests.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <ClipboardList size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>You have not submitted any material lists yet.</p>
                    <Link to="/products" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
                      Browse Products to Create List
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {materialRequests.map(req => (
                      <div key={req._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-paper-3)' }}>
                          <div>
                            <strong style={{ fontSize: '15px', color: 'var(--color-ink)' }}>Request #{req.requestId}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                              Submitted on: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div>
                            <span className={`badge-status ${req.status === 'Quotation Sent' ? 'badge-sent' : req.status === 'Quotation Accepted' ? 'badge-confirmed' : 'badge-pending'}`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '12px' }}>
                          <strong>Site Location:</strong> {req.customer?.siteAddress}, {req.customer?.city} (PIN: {req.customer?.pincode})
                        </div>

                        {/* Items list */}
                        <div style={{ background: 'var(--bg-page)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {req.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span>• {item.name} ({item.brand})</span>
                              <strong>{item.quantity} {item.unit}</strong>
                            </div>
                          ))}
                        </div>

                        {req.quotationId && (
                          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setActiveTab('quotations');
                                navigate('/account?tab=quotations');
                              }}
                              className="btn-primary"
                              style={{ padding: '8px 16px', fontSize: '12.5px' }}
                            >
                              <span>View Linked Quotation (#{req.quotationId})</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. My Quotations (with Accept / Reject actions) */}
            {activeTab === 'quotations' && (
              <div>
                {quotations.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <FileText size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No quotations generated yet. Submit a material list to receive verified quotations from our engineering desk.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {quotations.map(quo => (
                      <div key={quo._id} style={{
                        background: 'var(--bg-card)',
                        borderRadius: '14px',
                        border: quo.status === 'Accepted' ? '2px solid var(--color-success)' : '1px solid var(--border)',
                        padding: '24px',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--color-paper-3)' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                              Formal Builder Quotation
                            </span>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)' }}>
                              Quotation #{quo.quotationId}
                            </h3>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                              Ref Request: #{quo.requestId} • Valid Until: <strong>{quo.validUntil || '7 Days'}</strong>
                            </div>
                          </div>
                          <div>
                            <span className={`badge-status ${quo.status === 'Accepted' ? 'badge-confirmed' : quo.status === 'Rejected' ? 'badge-cancelled' : 'badge-sent'}`}>
                              {quo.status}
                            </span>
                          </div>
                        </div>

                        {/* Items Breakdown Table */}
                        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: 'var(--bg-page)', color: 'var(--color-muted)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '8px 12px' }}>Material</th>
                                <th style={{ padding: '8px 12px' }}>Quantity</th>
                                <th style={{ padding: '8px 12px' }}>Quoted Unit Rate</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quo.items?.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--color-paper-3)' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.name}</td>
                                  <td style={{ padding: '10px 12px' }}>{item.quantity} {item.unit}</td>
                                  <td style={{ padding: '10px 12px' }}>₹{item.unitPrice}</td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹{item.totalPrice.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Financial Totals */}
                        <div style={{ background: 'var(--bg-page)', borderRadius: '10px', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', maxWidth: '360px', marginLeft: 'auto', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                            <span>Material Subtotal:</span>
                            <span>₹{quo.subtotal?.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                            <span>Truck Delivery Freight:</span>
                            <span>{quo.deliveryCharge === 0 ? <strong style={{ color: 'var(--color-success)' }}>FREE</strong> : `₹${quo.deliveryCharge}`}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                            <span>GST 18% (Input Tax Credit):</span>
                            <span>₹{quo.tax?.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ borderTop: '1px solid var(--color-rule)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)' }}>
                            <span>Final Quoted Amount:</span>
                            <span>₹{quo.totalAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {quo.notes && (
                          <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
                            Engineering Notes: {quo.notes}
                          </div>
                        )}

                        {/* Customer Action Buttons: Accept / Reject */}
                        {quo.status === 'Sent' && (
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <button
                              onClick={() => handleRespondQuotation(quo.quotationId, 'reject')}
                              style={{
                                background: 'var(--accent-red-light)',
                                color: 'var(--color-error)',
                                border: '1px solid var(--accent-red-light)',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <XCircle size={15} />
                              <span>Decline Quotation</span>
                            </button>

                            <button
                              onClick={() => handleRespondQuotation(quo.quotationId, 'accept')}
                              className="btn-primary"
                              style={{
                                background: 'var(--color-success)',
                                color: 'var(--bg-card)',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <CheckCircle size={15} />
                              <span>Accept Quotation & Proceed to Order</span>
                            </button>
                          </div>
                        )}

                        {quo.status === 'Accepted' && (
                          <div style={{
                            background: 'var(--accent-green-light)',
                            border: '1px solid var(--accent-green-light)',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'var(--accent-green-dark)',
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            <span>✓ You have accepted this quotation. Warehouse dispatch scheduled.</span>
                            <Link to="/products" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                              Shop More Materials
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. My Confirmed Orders */}
            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Package size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No orders placed yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map(ord => (
                      <div key={ord._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-paper-3)' }}>
                          <div>
                            <strong style={{ fontSize: '15px', color: 'var(--color-ink)' }}>Order #{ord.orderId}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                              Invoice: {ord.invoiceNumber || 'INV-2026-0001'} • Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="badge-status badge-confirmed">
                              {ord.orderStatus || 'Confirmed'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '14px' }}>
                          {ord.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>• {item.name} × {item.quantity}</span>
                              <strong>₹{item.total?.toLocaleString('en-IN')}</strong>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-paper-3)', paddingTop: '12px', fontSize: '14px' }}>
                          <div>
                            Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)' }}>
                            Total: ₹{ord.totalAmount?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Labour Bookings */}
            {activeTab === 'labour' && (
              <div>
                {labourBookings.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <HardHat size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No active labour service bookings.</p>
                    <Link to="/labour-booking" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
                      Book Skilled Labour
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {labourBookings.map(b => (
                      <div key={b._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-paper-3)' }}>
                          <div>
                            <strong style={{ fontSize: '15px' }}>Booking #{b.bookingId}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                              Trade: <strong>{b.labourType}</strong> ({b.workersRequired} workers)
                            </div>
                          </div>
                          <span className={`badge-status ${b.status === 'Assigned' ? 'badge-confirmed' : 'badge-pending'}`}>
                            {b.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                          <div><strong>Site Location:</strong> {b.customer?.workLocation}, {b.customer?.city}</div>
                          <div><strong>Schedule:</strong> Starting on {b.preferredStartDate} (Duration: {b.expectedDuration})</div>
                          {b.labourCharges > 0 && <div><strong>Approved Labour Charges:</strong> ₹{b.labourCharges?.toLocaleString('en-IN')}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Bulk Enquiries */}
            {activeTab === 'bulk' && (
              <div>
                {bulkEnquiries.length === 0 ? (
                  <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <Truck size={40} color='var(--text-light)' style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No bulk contractor enquiries submitted.</p>
                    <Link to="/bulk-enquiry" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
                      Submit Bulk Project Enquiry
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {bulkEnquiries.map(blk => (
                      <div key={blk._id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <strong style={{ fontSize: '15px' }}>Bulk Enquiry #{blk.enquiryId}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Site: {blk.customer?.projectLocation}</div>
                          </div>
                          <span className="badge-status badge-sent">{blk.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                          {blk.items?.map((item, idx) => (
                            <div key={idx}>• {item.productName}: {item.quantity} {item.unit}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. Profile & Addresses */}
            {activeTab === 'profile' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px', maxWidth: '600px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Profile Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div><strong>Name:</strong> {user?.name}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                  <div><strong>Phone:</strong> {user?.phone || 'Not added'}</div>
                  <div><strong>Account Role:</strong> {user?.role}</div>
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

