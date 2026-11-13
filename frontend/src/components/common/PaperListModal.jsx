import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
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
    document.body.classList.add('modal-open');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setImagePreview(null);
        setSubmittedData(null);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
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
    <div
      className="paper-list-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paper-list-modal-title"
    >
      <div
        className="paper-list-sheet"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator Bar */}
        <div className="sheet-drag-handle" />

        {submittedData ? (
          /* Confirmation Success Screen */
          <div className="sheet-success-box">
            <div className="sheet-success-icon-wrap">
              <CheckCircle size={32} />
            </div>

            <span className="sheet-success-badge">
              PAPER LIST RECEIVED • ADMIN REVIEWING
            </span>

            <h3 className="sheet-success-title">
              List #{submittedData.requestId || 'PRO-LIST'} Sent to Admin!
            </h3>

            <p className="sheet-success-desc">
              Thank you, <strong>{customer.name}</strong>. Your paper list photo has been delivered to our materials desk. We will review your items, prepare factory slab pricing, and WhatsApp/call you shortly.
            </p>

            <button
              onClick={handleClose}
              className="sheet-submit-btn"
            >
              Done & Return to Shopping
            </button>
          </div>
        ) : (
          /* Paper List Upload Form (Mobile Section Layout) */
          <>
            {/* Header */}
            <div className="sheet-header-row">
              <div className="sheet-header-left">
                <div className="sheet-camera-badge">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 id="paper-list-modal-title" className="sheet-title-text">
                    Snap Paper Material List
                  </h3>
                  <p className="sheet-subtitle-text">
                    Send photo of paper list directly to Admin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="sheet-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="sheet-form-wrap">
              <div className="sheet-scroll-body">
                
                {/* 1. Capture / Upload Photo Box */}
                <div className="sheet-field-group">
                  <label className="sheet-field-label">
                    1. Capture / Upload Paper List Photo *
                  </label>

                  {imagePreview ? (
                    <div className="sheet-preview-container">
                      <img
                        src={imagePreview}
                        alt="Paper List Preview"
                        className="sheet-preview-img"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="sheet-retake-btn"
                        title="Remove & retake photo"
                      >
                        <RefreshCw size={12} />
                        <span>Retake</span>
                      </button>
                    </div>
                  ) : (
                    <div className="sheet-upload-dashed-box">
                      <div className="sheet-upload-buttons-row">
                        {/* Direct Camera Button */}
                        <label className="sheet-action-button primary">
                          <Camera size={15} />
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
                        <label className="sheet-action-button secondary">
                          <Upload size={15} />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      <span className="sheet-upload-caption">
                        Supports contractor notes, handwritten paper lists, bills & blueprints
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Contractor Name */}
                <div className="sheet-field-group">
                  <label className="sheet-field-label">
                    2. Contractor / Site Engineer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className="sheet-input-field"
                  />
                </div>

                {/* 3. Mobile Number & City / Area in Compact Row */}
                <div className="sheet-two-col-grid">
                  <div className="sheet-field-group">
                    <label className="sheet-field-label">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customer.phone}
                      onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                      className="sheet-input-field"
                    />
                  </div>

                  <div className="sheet-field-group">
                    <label className="sheet-field-label">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={e => setCustomer({ ...customer, city: e.target.value })}
                      className="sheet-input-field"
                    />
                  </div>
                </div>

                {/* 4. Delivery Address */}
                <div className="sheet-field-group">
                  <label className="sheet-field-label">
                    Job Site Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Plot / Street / Building site location for delivery truck"
                    value={customer.siteAddress}
                    onChange={e => setCustomer({ ...customer, siteAddress: e.target.value })}
                    className="sheet-textarea-field"
                  />
                </div>

                {/* 5. Special Instructions (Optional) */}
                <div className="sheet-field-group">
                  <label className="sheet-field-label">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need delivery by 10 AM, quote Tata Tiscon only"
                    value={customer.notes}
                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                    className="sheet-input-field"
                  />
                </div>

              </div>

              {/* Bottom Footer Actions */}
              <div className="sheet-footer-row">
                <button
                  type="button"
                  onClick={handleClose}
                  className="sheet-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="sheet-submit-btn"
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
