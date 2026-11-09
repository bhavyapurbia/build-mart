import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CheckCircle,
  HardHat,
  Users,
  Calendar,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../utils/api';

const LABOUR_CATEGORIES = [
  'Mason',
  'Tile worker',
  'Plumber',
  'General construction worker',
  'Waterproofing worker',
  'Other'
];

const CheckoutPage = () => {
  const { cartItems, cartCount, subtotal, tax, deliveryFee, coupon, couponDiscount, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      showToast('Please sign in to proceed with checkout.', 'warning', 3500);
      navigate('/login', { state: { from: '/checkout', message: 'Please sign in to proceed with checkout.' } });
    }
  }, [user, navigate]);

  // Customer delivery details
  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: (user?.addresses && user.addresses[0]?.street) || '',
    city: (user?.addresses && user.addresses[0]?.city) || 'Bengaluru',
    pincode: (user?.addresses && user.addresses[0]?.pincode) || '',
    deliveryInstructions: ''
  });

  // Optional Labour Service State
  const [needLabour, setNeedLabour] = useState(false);
  const [labourData, setLabourData] = useState({
    labourType: 'Mason',
    workersRequired: 2,
    workCategory: 'Brickwork & Concrete Masonry',
    preferredStartDate: '',
    expectedDuration: '2 Days',
    additionalInstructions: '',
    siteImages: []
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // ─── Razorpay Script Loader ───────────────────────────────────────────────
  const loadRazorpayScript = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // ─── Razorpay Payment Handler ─────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setSubmitting(true);

    // Load Razorpay checkout script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToast('Payment gateway failed to load. Check internet connection.', 'error');
      setSubmitting(false);
      return;
    }

    try {
      // Create Razorpay order on backend
      const { data } = await api.post('/payments/razorpay/create-order', {
        customer,
        items: cartItems.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          brand: item.brand,
          image: item.image,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        discount: couponDiscount,
        couponApplied: coupon?.code || '',
        deliveryCharge: deliveryFee,
        labourDetails: needLabour
          ? { ...labourData, hasLabour: true, labourCharges: 0, chargesApproved: false }
          : { hasLabour: false }
      });

      // Open Razorpay checkout modal
      const orderPayload = data.data || data;
      const rzpOptions = {
        key: orderPayload.keyId || data.keyId,
        amount: orderPayload.amount || data.amount,
        currency: orderPayload.currency || data.currency || 'INR',
        name: 'BuildMart',
        description: 'Construction Materials Procurement',
        order_id: orderPayload.razorpayOrderId || data.razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone
        },
        theme: { color: '#d97706' }, // amber to match brand
        handler: async function (response) {
          // Fires on successful payment — verify on backend
          try {
            const verifyRes = await api.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                customer,
                items: cartItems.map(item => ({
                  productId: item.productId || item._id,
                  name: item.name,
                  brand: item.brand,
                  image: item.image,
                  quantity: item.quantity,
                  unit: item.unit,
                  price: item.price
                })),
                paymentMethod: 'Razorpay',
                discount: couponDiscount,
                couponApplied: coupon?.code || '',
                deliveryCharge: deliveryFee,
                labourDetails: needLabour
                  ? { hasLabour: true, ...labourData, labourCharges: 0, chargesApproved: false }
                  : { hasLabour: false }
              }
            });
            clearCart();
            const orderResult = verifyRes.data.order ? verifyRes.data : (verifyRes.data.data || verifyRes.data);
            setConfirmedOrder(orderResult);
            showToast('Payment successful! Order confirmed.', 'success', 5000);
          } catch (err) {
            showToast(
              'Payment verification failed. Contact support with payment ID: ' + response.razorpay_payment_id,
              'error',
              8000
            );
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            showToast('Payment cancelled. You can retry when ready.', 'info');
            setSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response) {
        showToast('Payment failed: ' + (response.error?.description || 'Please try again'), 'error');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initiate payment. Please try again.';
      showToast(msg, 'error');
      setSubmitting(false);
    }
  };

  // ─── Main Order Handler ───────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      showToast('Your cart is empty!', 'error');
      return;
    }

    if (paymentMethod === 'Online') {
      // Validate required fields before opening Razorpay
      if (!customer.name || !customer.phone || !customer.email || !customer.address || !customer.city || !customer.pincode) {
        showToast('Please fill in all required delivery details before proceeding to payment.', 'error');
        return;
      }
      await handleRazorpayPayment();
      return;
    }

    // COD / Bank Transfer — existing logic unchanged
    setSubmitting(true);
    try {
      const payload = {
        customer,
        items: cartItems.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          brand: item.brand,
          image: item.image,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        paymentMethod,
        discount: couponDiscount,
        couponApplied: coupon ? coupon.code : '',
        deliveryCharge: deliveryFee,
        labourDetails: needLabour ? {
          hasLabour: true,
          ...labourData,
          labourCharges: 0, // Admin sets charges upon site evaluation
          chargesApproved: false
        } : { hasLabour: false }
      };

      const res = await api.post('/orders', payload);
      clearCart();
      setConfirmedOrder(res.data);
      showToast('Order confirmed successfully!', 'success', 5000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error placing order.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success Screen
  if (confirmedOrder) {
    return (
      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '2px solid var(--color-success)',
            padding: '40px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-green-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={36} />
            </div>

            <span style={{
              background: 'var(--accent-green-light)',
              color: 'var(--color-success)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase'
            }}>
              Order Placed Successfully
            </span>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '12px', marginBottom: '8px' }}>
              Order #{confirmedOrder.orderId}
            </h1>
            <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px' }}>
              Invoice Number: <strong>{confirmedOrder.invoiceNumber}</strong>
            </div>

            <p style={{ fontSize: '14.5px', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: '24px' }}>
              Thank you, <strong>{customer.name}</strong>! Your construction materials are being prepared at our fulfillment hub for fast dispatch to <strong>{customer.city}</strong>.
            </p>

            {/* Separate Material and Labour Cost Notice */}
            <div style={{
              background: 'var(--bg-page)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px',
              fontSize: '13.5px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-muted)' }}>Material Costs:</span>
                <strong style={{ color: 'var(--color-ink)' }}>₹{confirmedOrder.order.materialCost.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-muted)' }}>GST & Delivery:</span>
                <strong style={{ color: 'var(--color-ink)' }}>₹{(confirmedOrder.order.tax + confirmedOrder.order.deliveryCharge).toLocaleString('en-IN')}</strong>
              </div>

              {needLabour && (
                <div style={{
                  borderTop: '1px dashed var(--color-rule)',
                  paddingTop: '8px',
                  marginTop: '8px',
                  background: 'var(--color-accent-light)',
                  margin: '8px -8px -8px -8px',
                  padding: '12px',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-deep)', fontWeight: 700 }}>
                    <HardHat size={16} />
                    <span>Labour Request Attached (#{confirmedOrder.order.labourBookingId})</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary-deep)', marginTop: '4px' }}>
                    *Labour charges are reviewed by our contractor supervisor and displayed separately upon site verification. No labour charge has been deducted yet.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/account?tab=orders" className="btn-primary" style={{ padding: '12px 24px' }}>
                <span>Track Order Status</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/" className="btn-secondary" style={{ background: 'var(--color-paper-3)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}>
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Checkout & Order Confirmation
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Please confirm your job-site delivery location and service options.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-layout">
          {/* Left Column: Delivery Details & Labour Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Delivery Details */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                1. Delivery & Contact Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Customer / Site Engineer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                      Mobile Number (For Driver Call) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                      Email Address (For Tax Invoice) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="site@buildmart.in"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Site Street Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Plot / Project Name, Road, Landmark"
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={e => setCustomer({ ...customer, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560100"
                      value={customer.pincode}
                      onChange={e => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unload next to basement parking pillar 4, ring gatekeeper"
                    value={customer.deliveryInstructions}
                    onChange={e => setCustomer({ ...customer, deliveryInstructions: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. OPTIONAL LABOUR SERVICE SECTION (Requested in prompt) */}
            <div style={{
              background: needLabour ? 'var(--color-accent-light)' : 'var(--bg-card)',
              borderRadius: '14px',
              border: needLabour ? '2px solid var(--color-accent)' : '1px solid var(--border)',
              padding: '24px',
              transition: 'all 0.25s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: needLabour ? '18px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'var(--color-accent)',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HardHat size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-ink)' }}>
                      Optional Construction Labour Service
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>
                      Do you also need skilled workers to execute this work?
                    </p>
                  </div>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  background: needLabour ? 'var(--color-accent)' : 'var(--color-paper-3)',
                  color: needLabour ? 'var(--color-ink)' : 'var(--text-sub)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '13px'
                }}>
                  <input
                    type="checkbox"
                    checked={needLabour}
                    onChange={e => setNeedLabour(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>Yes, I Need Labour</span>
                </label>
              </div>

              {/* Conditional Labour Fields */}
              {needLabour && (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-accent)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{
                    background: 'var(--primary-light)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--primary-deep)',
                    lineHeight: 1.5
                  }}>
                    <strong>Labour Rate Policy:</strong> Labour charges are not automatically included. Our contractor supervisor will review your site location, scope of work, and worker availability to provide transparent rate estimates before dispatch. Material and labour costs are shown separately.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                        Type of Labour Required *
                      </label>
                      <select
                        value={labourData.labourType}
                        onChange={e => setLabourData({ ...labourData, labourType: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', background: 'var(--bg-card)' }}
                      >
                        {LABOUR_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                        Number of Workers Required *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={labourData.workersRequired}
                        onChange={e => setLabourData({ ...labourData, workersRequired: Number(e.target.value) || 1 })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                        Preferred Starting Date *
                      </label>
                      <input
                        type="date"
                        required={needLabour}
                        value={labourData.preferredStartDate}
                        onChange={e => setLabourData({ ...labourData, preferredStartDate: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                        Expected Duration *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Days / 1 Week / Daily Basis"
                        value={labourData.expectedDuration}
                        onChange={e => setLabourData({ ...labourData, expectedDuration: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary-light)', marginBottom: '4px' }}>
                      Additional Work Instructions / Specific Scope
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Tile laying on 600 sq ft hall floor, bathroom waterproofing prep"
                      value={labourData.additionalInstructions}
                      onChange={e => setLabourData({ ...labourData, additionalInstructions: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Method */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                2. Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: paymentMethod === 'COD' ? '2px solid var(--primary-dark)' : '1px solid var(--border)',
                  background: paymentMethod === 'COD' ? 'var(--primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>Cash on Delivery / UPI at Site Unloading</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Inspect building materials upon truck arrival before paying.</div>
                  </div>
                </label>

                {/* Online / Razorpay Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: paymentMethod === 'Online' ? '2px solid var(--primary-dark)' : '1px solid var(--border)',
                  background: paymentMethod === 'Online' ? 'var(--primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={() => setPaymentMethod('Online')}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                        Pay Online via Razorpay (Cards / UPI / Netbanking / Wallets)
                      </strong>
                      <span style={{
                        background: 'var(--primary-dark)',
                        color: 'var(--bg-card)',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.3px'
                      }}>
                        Razorpay
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                      Secure payment powered by Razorpay. GST invoice issued instantly.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: paymentMethod === 'Bank Transfer' ? '2px solid var(--primary-dark)' : '1px solid var(--border)',
                  background: paymentMethod === 'Bank Transfer' ? 'var(--primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="Bank Transfer"
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={() => setPaymentMethod('Bank Transfer')}
                  />
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>RTGS / NEFT Direct Bank Transfer</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>For registered contractors and builders purchasing high volume.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              Order Review ({cartCount} item{cartCount > 1 ? 's' : ''})
            </h2>

            {/* Item summary snippets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
              {cartItems.map(item => (
                <div key={item.productId || item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--secondary-light)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name} × {item.quantity}
                  </span>
                  <strong style={{ color: 'var(--color-ink)' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </strong>
                </div>
              ))}
            </div>

            {/* Separate Material and Labour Breakdown */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                <span>Material Cost:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                <span>GST (18% ITC):</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                <span>Site Delivery Freight:</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--color-success)' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                  <span>Coupon Discount:</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {needLabour && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-deep)', fontWeight: 600, background: 'var(--primary-light)', padding: '6px 8px', borderRadius: '4px' }}>
                  <span>Labour ({labourData.workersRequired} {labourData.labourType}s):</span>
                  <span>Pending Admin Review</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--color-ink)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '20px' }}>
              <span>Material Total:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              <span>
                {submitting
                  ? (paymentMethod === 'Online' ? 'Connecting to Razorpay...' : 'Placing Order...')
                  : (paymentMethod === 'Online' ? `Pay Now ₹${totalAmount.toLocaleString('en-IN')} via Razorpay` : 'Confirm & Place Order →')
                }
              </span>
              {!submitting && <ArrowRight size={16} />}
            </button>

            <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Full money-back warranty on certified materials. Dispatched in 30-60 minutes.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
