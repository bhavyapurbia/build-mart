import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Truck,
  Building,
  Send,
  X,
  Plus
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const AdminMaterialRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationItems, setQuotationItems] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(250);
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(7);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const { showToast } = useNotification();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/material-requests/admin/all');
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading material requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Open Quotation Prep Modal
  const handleOpenQuotationModal = (req) => {
    setActiveRequest(req);
    const initialItems = (req.items || []).map(item => ({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      image: item.image,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice || 100,
      inStock: true
    }));
    setQuotationItems(initialItems);
    setDeliveryCharge(250);
    setNotes(`Prices quoted are locked for ${validDays} days with certified factory batch test reports.`);
    setIsQuotationModalOpen(true);
  };

  const handleUpdateItemPrice = (idx, newPrice) => {
    setQuotationItems(prev => {
      const copy = [...prev];
      copy[idx].unitPrice = Math.max(0, Number(newPrice) || 0);
      return copy;
    });
  };

  const handleToggleStock = (idx) => {
    setQuotationItems(prev => {
      const copy = [...prev];
      copy[idx].inStock = !copy[idx].inStock;
      return copy;
    });
  };

  const handleAddNewItem = () => {
    setQuotationItems(prev => [
      ...prev,
      {
        name: 'Item from Paper List',
        brand: 'BuildMart Certified',
        quantity: 1,
        unit: 'Unit',
        unitPrice: 100,
        inStock: true
      }
    ]);
  };

  const handleRemoveItem = (idx) => {
    setQuotationItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSendQuotation = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;

    setSubmittingQuote(true);
    try {
      const payload = {
        requestId: activeRequest.requestId,
        userId: activeRequest.user,
        customer: activeRequest.customer,
        items: quotationItems,
        deliveryCharge: Number(deliveryCharge),
        notes,
        validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const res = await api.post('/quotations/admin', payload);
      showToast('Formal Quotation sent to customer successfully!', 'success');
      setIsQuotationModalOpen(false);
      loadRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating quotation', 'error');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/material-requests/admin/${id}/status`, { status });
      showToast(`Request status updated to ${status}`, 'success');
      loadRequests();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const subtotal = quotationItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const totalQuoteAmount = subtotal + tax + Number(deliveryCharge);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Material List Request Management
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Review customer project material lists, verify warehouse stock, and dispatch formal quotations
          </p>
        </div>
        <button onClick={loadRequests} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Refresh Requests
        </button>
      </div>

      {/* Requests Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer & Phone</th>
              <th>Project Site Location</th>
              <th>Materials List</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>
                  <strong style={{ color: '#0F172A', fontSize: '13.5px' }}>{req.requestId}</strong>
                  {req.isPaperList && (
                    <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginTop: '3px' }}>
                      📸 Paper List Photo
                    </div>
                  )}
                  {req.quotationId && (
                    <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: 600 }}>
                      Quo: #{req.quotationId}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{req.customer?.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{req.customer?.phone}</div>
                </td>
                <td>
                  <div style={{ maxWidth: '180px', fontSize: '12.5px', lineHeight: 1.3 }}>
                    {req.customer?.siteAddress}, <strong>{req.customer?.city}</strong>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '12.5px' }}>
                    <strong>{req.items?.length || 0} product(s)</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748B', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.items?.map(i => i.name).join(', ')}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '12.5px', color: '#64748B' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span className={`badge-status ${req.status === 'Quotation Sent' ? 'badge-sent' : req.status === 'Quotation Accepted' ? 'badge-confirmed' : req.status === 'Quotation Rejected' ? 'badge-cancelled' : 'badge-pending'}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenQuotationModal(req)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Prepare and Send Official Quotation"
                    >
                      <FileText size={14} />
                      <span>{req.quotationId ? 'Update Quote' : 'Prepare Quote'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                      style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', padding: '6px 8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      title="Reject request"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Prepare Quotation Modal */}
      {isQuotationModalOpen && activeRequest && (
        <div className="modal-backdrop" onClick={() => setIsQuotationModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  Prepare Formal Quotation for Request #{activeRequest.requestId}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Customer: <strong>{activeRequest.customer?.name}</strong> • Site: {activeRequest.customer?.siteAddress}, {activeRequest.customer?.city}
                </div>
              </div>
              <button onClick={() => setIsQuotationModalOpen(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendQuotation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeRequest.paperListImage && (
                  <div style={{ background: '#FFFBEB', border: '1.5px dashed #F59E0B', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#B45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📸 Handwritten Contractor Paper List Photo:</span>
                    </div>
                    <a href={activeRequest.paperListImage} target="_blank" rel="noreferrer">
                      <img
                        src={activeRequest.paperListImage}
                        alt="Paper Material List"
                        style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                      />
                    </a>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
                      Tip: Click image to open in high-res full view. Review the contractor's handwriting and enter itemized quoted prices below.
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Verify Stock & Edit Itemized Quoted Prices (₹):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quotationItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr auto',
                        gap: '10px',
                        alignItems: 'center',
                        background: '#F8FAFC',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Brand: {item.brand}</div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>Qty: </span>
                        <strong>{item.quantity} {item.unit}</strong>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Quoted Unit Rate (₹)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => handleUpdateItemPrice(idx, e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '13px', fontWeight: 700 }}
                        />
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Line Total</div>
                        <strong>₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</strong>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(idx)}
                          style={{
                            background: item.inStock ? '#DCFCE7' : '#FEE2E2',
                            color: item.inStock ? '#15803D' : '#B91C1C',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
                  >
                    <Plus size={14} />
                    <span>+ Add Line Item from Paper List</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Delivery Freight Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={e => setDeliveryCharge(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Quotation Validity (Days)
                    </label>
                    <input
                      type="number"
                      value={validDays}
                      onChange={e => setValidDays(Number(e.target.value) || 7)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Notes & Special Delivery Terms
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                {/* Calculation Box */}
                <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#92400E' }}>Subtotal: ₹{subtotal.toLocaleString('en-IN')} + GST (18%): ₹{tax.toLocaleString('en-IN')} + Freight: ₹{deliveryCharge}</div>
                    <strong style={{ fontSize: '16px', color: '#78350F' }}>Total Quoted Payable: ₹{totalQuoteAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsQuotationModalOpen(false)}
                  className="btn-secondary"
                  style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={15} />
                  <span>{submittingQuote ? 'Sending Quotation...' : 'Dispatch Formal Quotation to Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterialRequests;

