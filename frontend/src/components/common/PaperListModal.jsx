import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle, ShieldCheck, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const PaperListModal = ({ isOpen, onClose, currentCity }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [imagePreview, setImagePreview] = useState(null);
  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    siteAddress: (user?.addresses && user.addresses[0]?.street) || '',
    city: currentCity || 'Bengaluru',
    pincode: (user?.addresses && user.addresses[0]?.pincode) || '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setImagePreview(null);
        setSubmittedData(null);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview) {
      showToast('Please capture or upload a photo of your paper material list.', 'error');
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.siteAddress.trim()) {
      showToast('Name, phone number, and site address are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        isPaperList: true,
        paperListImage: imagePreview,
        customer,
        items: []
      };

      const res = await api.post('/material-requests', payload);
      setSubmittedData(res.data);
      showToast('Paper material list sent directly to Admin!', 'success', 5000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting paper list.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setImagePreview(null);
    setSubmittedData(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="paper-list-modal-title">
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', borderRadius: '18px' }}>
        {submittedData ? (
          /* Confirmation Success Screen */
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-green-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle size={36} />
            </div>

            <span style={{
              background: 'var(--color-accent-light)',
              color: 'var(--primary-deep)',
              fontSize: '11.5px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid var(--color-accent)'
            }}>
              PAPER LIST RECEIVED • ADMIN REVIEWING
            </span>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '12px' }}>
              Paper List #{submittedData.requestId} Sent to Admin!
            </h2>

            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', lineHeight: 1.6, margin: '10px 0 24px' }}>
              Thank you, <strong>{customer.name}</strong>. Your paper material list photo has been delivered directly to our materials engineer. We will review your handwriting, calculate factory pricing, and contact you with a formal quotation.
            </p>

            <button
              onClick={handleClose}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Done & Return to Shopping
            </button>
          </div>
        ) : (
          /* Paper List Upload Form */
          <>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--color-accent)', color: 'var(--bg-card)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={18} />
                </div>
                <div>
                  <h3 id="paper-list-modal-title" style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--color-ink)' }}>
                    Snap Paper Material List
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                    Take a photo of your handwritten paper list & send directly to admin
                  </div>
                </div>
              </div>
              <button onClick={handleClose} aria-label="Close modal" style={{ background: 'transparent', cursor: 'pointer', border: 'none', padding: '4px' }}>
                <X size={20} color='var(--color-muted)' />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Photo Capture Area */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
                    1. Capture / Upload Paper List Photo *
                  </label>

                  {imagePreview ? (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--color-accent)', maxHeight: '220px', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={imagePreview}
                        alt="Paper List Preview"
                        style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: 'var(--bg-card)',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove and retake photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed var(--color-rule)',
                      borderRadius: '12px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: 'var(--bg-page)',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '10px' }}>
                        {/* Direct Camera Button for Mobile */}
                        <label style={{
                          background: 'var(--color-accent)',
                          color: 'var(--bg-card)',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(255, 110, 0, 0.3)'
                        }}>
                          <Camera size={16} />
                          <span>Take Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {/* File Upload Button */}
                        <label style={{
                          background: 'var(--bg-card)',
                          color: 'var(--color-ink)',
                          border: '1.5px solid var(--color-rule)',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}>
                          <Upload size={16} />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}>
                        Supports camera photos, handwritten contractor notes, blueprint sheets or bills
                      </div>
                    </div>
                  )}
                </div>

                {/* Contractor Details */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
                    2. Contractor / Site Engineer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={e => setCustomer({ ...customer, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
                    Job Site Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Plot / Street / Building site location for delivery truck"
                    value={customer.siteAddress}
                    onChange={e => setCustomer({ ...customer, siteAddress: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}>
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need delivery tomorrow morning, quote Tata Tiscon only"
                    value={customer.notes}
                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-rule)', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  style={{ color: 'var(--color-ink)', border: '1px solid var(--color-rule)', padding: '10px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px 18px', background: 'var(--color-accent)' }}
                >
                  {submitting ? 'Uploading to Admin...' : 'Send Paper List to Admin ➔'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PaperListModal;

