import React, { useState, useEffect } from 'react';
import { Truck, MessageSquare, Phone, Mail, FileText, CheckCircle, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminBulkEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState(1500);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Quotation Sent');

  const { showToast } = useNotification();

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bulk-enquiries/admin/all');
      setEnquiries(res.data || []);
    } catch (err) {
      showToast('Error loading bulk enquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleOpenQuote = (enq) => {
    setSelectedEnquiry(enq);
    setQuotedPrice(enq.quotation?.quotedPrice || '');
    setDeliveryCharges(enq.quotation?.deliveryCharges || 1500);
    setNotes(enq.quotation?.notes || 'Direct mill multi-truck rate including transit insurance.');
    setStatus(enq.status === 'Received' ? 'Quotation Sent' : enq.status);
    setIsQuoteModalOpen(true);
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      await api.put(`/bulk-enquiries/admin/${selectedEnquiry._id}`, {
        quotedPrice: Number(quotedPrice),
        deliveryCharges: Number(deliveryCharges),
        notes,
        status
      });

      showToast('Bulk project quotation updated!', 'success');
      setIsQuoteModalOpen(false);
      loadEnquiries();
    } catch (err) {
      showToast('Error updating bulk quotation', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            High-Volume Bulk Order Enquiries
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Manage commercial developer requirements, issue plant pricing, and follow up via WhatsApp
          </p>
        </div>
        <button onClick={loadEnquiries} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Refresh
        </button>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Enquiry ID</th>
              <th>Contractor / Company</th>
              <th>Contact Details</th>
              <th>Project Site Location</th>
              <th>Material Requirements</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map(enq => (
              <tr key={enq._id}>
                <td><strong>{enq.enquiryId}</strong></td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{enq.customer?.fullName}</div>
                  <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>
                    {enq.customer?.companyName || 'Private Builder'}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12.5px' }}>{enq.customer?.phone}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{enq.customer?.email}</div>
                </td>
                <td>
                  <div style={{ fontSize: '12.5px', maxWidth: '180px' }}>
                    {enq.customer?.projectLocation}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12.5px' }}>
                    {enq.items?.map((item, i) => (
                      <div key={i}>• {item.productName}: <strong>{item.quantity} {item.unit}</strong></div>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`badge-status ${enq.status === 'Quotation Sent' ? 'badge-sent' : 'badge-pending'}`}>
                    {enq.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenQuote(enq)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <span>Prepare Quote</span>
                    </button>

                    <a
                      href={`https://wa.me/${enq.customer?.phone?.replace(/\D/g, '')}?text=Hello%20${enq.customer?.fullName},%20following%20up%20from%20BuildMart%20regarding%20Bulk%20Enquiry%20%23${enq.enquiryId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#25D366',
                        color: '#FFFFFF',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Contact on WhatsApp"
                    >
                      <MessageSquare size={14} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quote Modal */}
      {isQuoteModalOpen && selectedEnquiry && (
        <div className="modal-backdrop" onClick={() => setIsQuoteModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                Quotation for Bulk Enquiry #{selectedEnquiry.enquiryId}
              </h3>
              <button onClick={() => setIsQuoteModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveQuote}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>Client:</strong> {selectedEnquiry.customer?.fullName} ({selectedEnquiry.customer?.companyName})<br />
                  <strong>Project Location:</strong> {selectedEnquiry.customer?.projectLocation}<br />
                  <strong>Requirements:</strong> {selectedEnquiry.items?.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Total Quoted Commercial Material Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 850000"
                    value={quotedPrice}
                    onChange={e => setQuotedPrice(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Multi-Truck Site Freight & Crane Unloading (₹)
                  </label>
                  <input
                    type="number"
                    value={deliveryCharges}
                    onChange={e => setDeliveryCharges(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Terms & Mill Test Report Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Enquiry Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13.5px', background: '#FFFFFF' }}
                  >
                    <option value="Received">Received</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Accepted">Accepted by Client</option>
                    <option value="Converted to Order">Converted to Confirmed Order</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="btn-secondary" style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Save & Send Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBulkEnquiries;

