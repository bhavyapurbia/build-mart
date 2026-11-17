import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, CheckCircle, ShieldCheck, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const PaperListModal = ({ isOpen, onClose, currentCity }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    siteAddress: (user?.addresses && user.addresses[0]?.street) || '',
    city: currentCity || localStorage.getItem('bm_user_city') || '',
    pincode: (user?.addresses && user.addresses[0]?.pincode) || '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCustomer(prev => ({
      ...prev,
      name: prev.name || user?.name || '',
      phone: prev.phone || user?.phone || localStorage.getItem('bm_user_phone') || '',
      siteAddress: prev.siteAddress || (user?.addresses && user.addresses[0]?.street) || '',
      city: prev.city || currentCity || localStorage.getItem('bm_user_city') || '',
      pincode: prev.pincode || (user?.addresses && user.addresses[0]?.pincode) || ''
    }));
    document.body.classList.add('modal-open');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setImagePreview(null);
        setSelectedFile(null);
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

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image size exceeds 8MB. Please select a smaller photo.', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview && !selectedFile) {
      showToast('Please capture or upload a photo of your paper material list.', 'error');
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.siteAddress.trim()) {
      showToast('Name, phone number, and site address are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = imagePreview;

      // Upload directly to Cloudinary via /upload/paper-list
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        const uploadRes = await api.post('/upload/paper-list', uploadData, {
          timeout: 120000
        });
        finalImageUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      }

      const payload = {
        isPaperList: true,
        paperListImage: finalImageUrl,
        customer,
        items: []
      };

      const res = await api.post('/material-requests', payload);
      setSubmittedData(res.data);
      showToast('Paper material list uploaded and sent directly to Admin!', 'success', 5000);
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.status === 429 
        ? 'Too many upload attempts. Please wait a moment and try again.'
        : 'Error submitting paper list. Please try again.');
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setImagePreview(null);
    setSelectedFile(null);
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
              List #{submittedData.data?.requestId || submittedData.requestId || 'PRO-LIST'} Sent to Admin!
            </h3>

            <p className="sheet-success-desc">
              Thank you, <strong>{customer.name}</strong>. Your paper list photo has been delivered to our materials desk. We will review your items, verify warehouse stock, and send your itemized bill via WhatsApp.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  const reqId = submittedData.data?.requestId || submittedData.requestId;
                  handleClose();
                  if (reqId) navigate(`/snap-list/bill/${reqId}`);
                }}
                className="sheet-submit-btn"
                style={{ background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FileText size={16} />
                <span>Track My Bill Online</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px' }}
              >
                Done & Return to Shopping
              </button>
            </div>
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
