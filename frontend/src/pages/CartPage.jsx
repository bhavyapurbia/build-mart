import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const {
    cartItems,
    cartCount,
    updateCartQty,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    coupon,
    couponDiscount,
    totalAmount,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
  };

  if (!cartItems.length) {
    return (
      <div style={{ padding: '80px 0 100px' }}>
        <div className="container" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '48px 32px'
          }}>
            <ShoppingCart size={54} color='var(--text-light)' style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '8px' }}>
              Your Shopping Cart is Empty
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Add genuine cement bags, TMT rebars, plumbing fittings, or tiles to proceed to direct express checkout.
            </p>
            <Link to="/products" className="btn-primary" style={{ padding: '12px 28px' }}>
              <span>Shop Materials Now</span>
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
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Shopping Cart ({cartCount} item{cartCount > 1 ? 's' : ''})
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Direct factory dispatch with 30-60 min job-site fulfillment.
          </p>
        </div>

        <div className="cart-layout">
          {/* Cart Items List */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>
                Item Details
              </span>
              <button
                onClick={clearCart}
                style={{ background: 'transparent', color: 'var(--color-error)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map(item => (
                <div
                  key={item.productId || item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-paper-3)',
                    background: 'var(--bg-page)',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=120&q=80'}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                        {item.brand}
                      </span>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.3 }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                        ₹{item.price} / {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-rule)', borderRadius: '6px', background: 'var(--bg-card)', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId || item._id, item.quantity - 1)}
                        style={{ padding: '6px 10px', background: 'var(--bg-page)', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateCartQty(item.productId || item._id, e.target.value)}
                        style={{ width: '46px', textAlign: 'center', border: 'none', fontSize: '13px', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId || item._id, item.quantity + 1)}
                        style={{ padding: '6px 10px', background: 'var(--bg-page)', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ink)' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId || item._id)}
                      style={{ background: 'transparent', color: 'var(--text-light)', cursor: 'pointer', padding: '6px' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/products" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                ← Add More Materials
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupon */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              Order Summary
            </h2>

            {/* Coupon Box */}
            <div style={{ marginBottom: '20px' }}>
              {coupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--accent-green-light)',
                  border: '1px solid var(--accent-green-light)',
                  padding: '10px 14px',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green-dark)' }}>
                      COUPON: {coupon.code} APPLIED
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green-dark)' }}>
                      Saving ₹{couponDiscount.toLocaleString('en-IN')} ({coupon.discountPercent}% off)
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'transparent', color: 'var(--color-error)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. BUILD10)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    style={{
                      background: 'var(--primary-dark)',
                      color: 'var(--bg-card)',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                <span>Materials Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                <span>GST (18% Input Tax Credit):</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                <span>Delivery Freight:</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--color-success)' }}>FREE (Above ₹5,000)</strong> : `₹${deliveryFee}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                  <span>Coupon Discount:</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)' }}>
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14.5px' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: 'var(--color-muted)' }}>
              <ShieldCheck size={14} color='var(--color-success)' />
              <span>Certified original batch test certificate included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

