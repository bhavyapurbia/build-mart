import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Truck,
  Building,
  Phone,
  MapPin,
  Eye,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SnapListBillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Online'); // Online vs COD
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Fetch the Snap List & its generated Bill
  const fetchBill = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/material-requests/${id}`);
      const data = res.data?.data || res.data;
      if (!data) {
        setError('Snap list bill not found.');
        return;
      }
      setRequest(data);
      if (data.status === 'Converted to Order' || data.billDetails?.paymentStatus === 'paid' || data.billDetails?.paymentStatus === 'cod_confirmed') {
        setOrderConfirmed({
          orderId: data.billDetails?.orderId,
          paymentMethod: data.billDetails?.paymentMethod
        });
      }
    } catch (err) {
      console.error('Error loading snap list bill:', err);
      setError(err.response?.data?.message || 'Unable to load snap list bill.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBill();
  }, [id]);

  // Razorpay Script Loader
  const loadRazorpayScript = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // Handle Pay Bill
  const handlePayBill = async () => {
    if (!request) return;
    const bill = request.billDetails || {};
    const total = bill.totalAmount || 0;

    if (total <= 0) {
      showToast('Bill total is ₹0. Cannot proceed with payment.', 'error');
      return;
    }

    setProcessingPayment(true);

    if (selectedPaymentMethod === 'COD') {
      // Pay on Site Delivery (COD)
      try {
        const res = await api.post(`/material-requests/${request.requestId || request._id}/pay-bill`, {
          paymentMethod: 'COD'
        });
        const orderData = res.data?.data || res.data;
        showToast('Order confirmed! We will deliver to your site with Cash/UPI on delivery.', 'success', 6000);
        setOrderConfirmed({
          orderId: orderData.orderId,
          paymentMethod: 'COD'
        });
        fetchBill();
      } catch (err) {
        showToast(err.response?.data?.message || 'Error confirming order with Pay on Delivery', 'error');
      } finally {
        setProcessingPayment(false);
      }
    } else {
      // Online Payment via Razorpay
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          showToast('Failed to load secure Razorpay gateway. Please check your internet connection.', 'error');
          setProcessingPayment(false);
          return;
        }

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TxvNexfNl7LMVw';

        const rzpOptions = {
          key: razorpayKey,
          amount: Math.round(total * 100), // in paise
          currency: 'INR',
          name: 'BuildPlace Materials',
          description: `Payment for Snap List #${request.requestId}`,
          image: '/logo.jpg',
          prefill: {
            name: request.customer?.name || user?.name || '',
            email: request.customer?.email || user?.email || '',
            contact: request.customer?.phone || user?.phone || ''
          },
          theme: {
            color: '#EA7E12'
          },
          handler: async function (response) {
            try {
              const payRes = await api.post(`/material-requests/${request.requestId || request._id}/pay-bill`, {
                paymentMethod: 'Razorpay',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id
              });
              const orderData = payRes.data?.data || payRes.data;
              showToast('Payment successful! Your construction materials are being prepared for dispatch.', 'success', 6000);
              setOrderConfirmed({
                orderId: orderData.orderId,
                paymentMethod: 'Online'
              });
              fetchBill();
            } catch (payErr) {
              showToast('Payment recorded but verification error occurred: ' + (payErr.response?.data?.message || payErr.message), 'error');
            } finally {
              setProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
              showToast('Payment window closed.', 'info');
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      } catch (err) {
        showToast(err.message || 'Error launching payment', 'error');
        setProcessingPayment(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #CBD5E1', borderTopColor: '#EA7E12', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-muted)', fontSize: '15px' }}>Loading your official BuildPlace material bill...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '36px 24px' }}>
          <AlertTriangle size={44} color="#EA7E12" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)' }}>Bill Not Found</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', margin: '8px 0 20px' }}>
            {error || 'This snap list request does not exist or may have been archived.'}
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', padding: '10px 20px' }}>
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const bill = request.billDetails || {};
  const hasBillGenerated = request.status === 'Bill Generated' || request.status === 'Quotation Sent' || request.status === 'Converted to Order';
  const isPaid = orderConfirmed || bill.paymentStatus === 'paid' || bill.paymentStatus === 'cod_confirmed' || request.status === 'Converted to Order';
  const outOfStockItems = (request.items || []).filter(i => i.inStock === false);
  const availableItems = (request.items || []).filter(i => i.inStock !== false);

  return (
    <div className="snap-list-bill-page" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '32px 0 60px' }}>
      <div className="container" style={{ maxWidth: '980px', margin: '0 auto', padding: '0 16px' }}>

        {/* Top Breadcrumb & Status Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-muted)' }}>
            <Link to="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/material-list" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Snap Lists</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-ink)', fontWeight: 700 }}>Bill #{request.requestId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '20px',
                background: isPaid ? '#DCFCE7' : hasBillGenerated ? '#DBEAFE' : '#FFEDD5',
                color: isPaid ? '#166534' : hasBillGenerated ? '#1E40AF' : '#9A3412',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {isPaid ? <CheckCircle size={14} /> : hasBillGenerated ? <FileText size={14} /> : <Clock size={14} />}
              {isPaid ? 'ORDER CONFIRMED' : hasBillGenerated ? 'BILL READY FOR REVIEW' : 'PENDING ADMIN ESTIMATE'}
            </span>
          </div>
        </div>

        {/* Success Confirmation Card if Already Paid / Confirmed */}
        {isPaid && (
          <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '14px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle size={30} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 6px' }}>
              ✓ Material Bill Confirmed &amp; Scheduled for Dispatch!
            </h2>
            <p style={{ fontSize: '13.5px', color: '#14532D', maxWidth: '580px', margin: '0 auto 16px', lineHeight: 1.5 }}>
              Thank you, <strong>{request.customer?.name}</strong>. Your materials are being packed at our nearest warehouse yard and will be delivered directly to your job site: <strong>{request.customer?.siteAddress}, {request.customer?.city}</strong>.
            </p>
            {orderConfirmed?.orderId && (
              <div style={{ display: 'inline-block', background: '#FFFFFF', border: '1px solid #86EFAC', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', color: '#166534', fontWeight: 700 }}>
                Order Reference: #{orderConfirmed.orderId} • Payment: {orderConfirmed.paymentMethod || 'Confirmed'}
              </div>
            )}
          </div>
        )}

        {/* Main Bill Container */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Invoice Header */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#FFFFFF', border: '1.5px solid #EA7E12', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/logo.jpg" alt="BuildPlace" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-ink)' }}>
                  BUILD<span style={{ color: '#EA7E12' }}>PLACE</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Official Trade Material Quotation &amp; Bill
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>
                Request #{request.requestId}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                Issued: {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Customer & Site Details Grid */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', background: '#FFFFFF' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Billed To Contractor / Customer
              </span>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '2px' }}>
                {request.customer?.name}
              </div>
              <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <Phone size={13} /> {request.customer?.phone}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Job-Site Delivery Location
              </span>
              <div style={{ fontSize: '13.5px', color: 'var(--color-ink)', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{request.customer?.siteAddress}, <strong>{request.customer?.city}</strong> {request.customer?.pincode ? `- ${request.customer.pincode}` : ''}</span>
              </div>
            </div>

            {/* Uploaded Snap Photo Preview Widget */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Your Uploaded Handwritten List Photo
              </span>
              {request.paperListImage ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <img
                    src={request.paperListImage}
                    alt="Uploaded Paper List"
                    style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => setIsImageModalOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#EA7E12', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: 0 }}
                  >
                    <span>View original photo</span>
                    <Eye size={12} />
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>Standard Digital List</div>
              )}
            </div>
          </div>

          {/* Pending Estimate Alert (if admin hasn't generated bill yet) */}
          {!hasBillGenerated && (
            <div style={{ padding: '36px 28px', textAlign: 'center', background: '#FFFBEB' }}>
              <Clock size={36} color="#D97706" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#92400E', margin: '0 0 6px' }}>
                Estimating Engineer is Reviewing Your Handwritten List
              </h3>
              <p style={{ fontSize: '13px', color: '#B45309', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                Our warehouse materials team is currently checking live wholesale prices and batch inventory for the items in your photo. Your bill with stock availability will appear here shortly!
              </p>
            </div>
          )}

          {/* Itemized Materials Table */}
          {hasBillGenerated && (
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
                  Itemized Materials &amp; Stock Availability
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  {availableItems.length} available • {outOfStockItems.length} out of stock
                </span>
              </div>

              {/* Prominent Out of Stock Banner (Requirement: if item not available, show clearly) */}
              {outOfStockItems.length > 0 && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertTriangle size={18} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#991B1B', display: 'block' }}>
                      Notice: {outOfStockItems.length} item(s) from your handwritten list are currently Out of Stock
                    </strong>
                    <span style={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.4 }}>
                      The items marked <strong>"Item Not in Stock"</strong> below have been deducted and excluded from your bill total. You are only paying for verified ready-to-dispatch supplies.
                    </span>
                  </div>
                </div>
              )}

              {/* Materials List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(request.items || []).map((item, idx) => {
                  const isInStock = item.inStock !== false;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: isInStock ? '#FFFFFF' : '#FEF2F2',
                        border: isInStock ? '1px solid var(--border)' : '1.5px dashed #EF4444',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        gap: '16px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Name & Brand */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: isInStock ? 'var(--color-ink)' : '#991B1B', textDecoration: isInStock ? 'none' : 'line-through' }}>
                            {item.name}
                          </span>

                          {/* CORE USER REQUIREMENT: Show "item not in stock" */}
                          {isInStock ? (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              ✓ IN STOCK
                            </span>
                          ) : (
                            <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              ⚠️ ITEM NOT IN STOCK
                            </span>
                          )}
                        </div>

                        {item.brand && (
                          <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
                            Brand: {item.brand}
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block' }}>Quantity</span>
                        <strong style={{ fontSize: '13px', color: isInStock ? 'var(--color-ink)' : '#991B1B' }}>
                          {item.quantity} {item.unit || 'Piece'}
                        </strong>
                      </div>

                      {/* Unit Price */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block' }}>Unit Rate</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isInStock ? 'var(--color-ink)' : '#94A3B8', textDecoration: isInStock ? 'none' : 'line-through' }}>
                          ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Total Line Amount */}
                      <div style={{ textAlign: 'right', minWidth: '90px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block' }}>Total</span>
                        {isInStock ? (
                          <strong style={{ fontSize: '15px', color: 'var(--color-ink)' }}>
                            ₹{Number(item.estimatedTotal || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}
                          </strong>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>
                            Excluded (₹0)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Remarks if any */}
              {bill.adminNotes && (
                <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                  <strong style={{ color: 'var(--color-ink)' }}>Note from Materials Desk: </strong>
                  {bill.adminNotes}
                </div>
              )}

              {/* Price Calculation Card */}
              <div style={{ marginTop: '24px', borderTop: '2px solid var(--border)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px', marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569' }}>
                  <span>Available Materials Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{(bill.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569' }}>
                  <span>Direct Site Delivery Freight:</span>
                  <span style={{ fontWeight: 600 }}>₹{(bill.deliveryCharge || 0).toLocaleString('en-IN')}</span>
                </div>

                {bill.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569' }}>
                    <span>GST &amp; Taxes:</span>
                    <span style={{ fontWeight: 600 }}>₹{(bill.tax || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {bill.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#16A34A' }}>
                    <span>Trade Discount Applied:</span>
                    <span style={{ fontWeight: 700 }}>-₹{(bill.discount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px', color: 'var(--color-ink)' }}>Grand Total Payable:</strong>
                  <strong style={{ fontSize: '24px', fontWeight: 900, color: '#EA7E12' }}>
                    ₹{(bill.totalAmount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* --- PAYMENT CHECKOUT SECTION (REQUIREMENT: user checks item and pays bill) --- */}
              {!isPaid && (
                <div style={{ marginTop: '30px', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#EA7E12" />
                    Select Payment Method &amp; Confirm Site Dispatch
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {/* Option 1: Online Payment (Razorpay / UPI) */}
                    <label
                      onClick={() => setSelectedPaymentMethod('Online')}
                      style={{
                        border: selectedPaymentMethod === 'Online' ? '2px solid #EA7E12' : '1px solid var(--border)',
                        background: selectedPaymentMethod === 'Online' ? '#FFF7ED' : '#FFFFFF',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="billPaymentMethod"
                        checked={selectedPaymentMethod === 'Online'}
                        onChange={() => setSelectedPaymentMethod('Online')}
                        style={{ marginTop: '3px', accentColor: '#EA7E12' }}
                      />
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)', display: 'block' }}>
                          Pay Online (Instant Dispatch)
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                          Pay via UPI (GPay, PhonePe, Paytm), Debit/Credit Card, or Netbanking. Fast 30-min loading.
                        </span>
                      </div>
                    </label>

                    {/* Option 2: Pay on Delivery (Cash / Cheque / UPI on Site) */}
                    <label
                      onClick={() => setSelectedPaymentMethod('COD')}
                      style={{
                        border: selectedPaymentMethod === 'COD' ? '2px solid #EA7E12' : '1px solid var(--border)',
                        background: selectedPaymentMethod === 'COD' ? '#FFF7ED' : '#FFFFFF',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="billPaymentMethod"
                        checked={selectedPaymentMethod === 'COD'}
                        onChange={() => setSelectedPaymentMethod('COD')}
                        style={{ marginTop: '3px', accentColor: '#EA7E12' }}
                      />
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)', display: 'block' }}>
                          Pay on Site Delivery (COD)
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                          Verify loaded materials at your job site first, then pay driver via Cash, Cheque, or UPI.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Primary Pay Button */}
                  <button
                    type="button"
                    onClick={handlePayBill}
                    disabled={processingPayment || availableItems.length === 0}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '16px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(234,126,18,0.3)'
                    }}
                  >
                    <span>
                      {processingPayment
                        ? 'Processing Payment...'
                        : selectedPaymentMethod === 'Online'
                        ? `Pay ₹${(bill.totalAmount || 0).toLocaleString('en-IN')} Online Now →`
                        : `Confirm Order with Pay on Delivery (₹${(bill.totalAmount || 0).toLocaleString('en-IN')}) →`}
                    </span>
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#16A34A" />
                    <span>Certified IS/RERA compliant building materials • 100% genuine tested supplies</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help & WhatsApp Footer */}
          <div style={{ padding: '16px 28px', background: '#FAFAFA', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>
              Questions about this bill or want to modify quantities?
            </span>
            <a
              href={`https://wa.me/918008905000?text=${encodeURIComponent(`Hello BuildPlace, I have a question regarding my Snap List Bill #${request.requestId}`)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#25D366',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <MessageSquare size={14} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* --- PHOTO ZOOM MODAL --- */}
      {isImageModalOpen && request.paperListImage && (
        <div
          className="modal-backdrop"
          onClick={() => setIsImageModalOpen(false)}
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setIsImageModalOpen(false)}
              style={{
                position: 'absolute',
                top: '-36px',
                right: '0',
                background: '#EF4444',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Close (✕)
            </button>
            <img
              src={request.paperListImage}
              alt="Handwritten Paper List Photo"
              style={{ maxWidth: '88vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: '10px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapListBillPage;
