import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Edit,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

const STATUS_OPTIONS = [
  'All',
  'Submitted',
  'Under Review',
  'Quoted',
  'Accepted',
  'Rejected',
  'Expired',
  'Converted to Order'
];

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();

  // Edit form state
  const [editData, setEditData] = useState({
    status: '',
    validUntil: '',
    notes: '',
    deliveryCharge: 0,
    labourCharge: 0,
    discount: 0,
    items: [],
    resendEmail: false
  });

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await api.get('/quotations/admin/all', { params });
      const data = res.data?.data || res.data;
      const list = Array.isArray(data) ? data : (data?.quotations || []);
      setQuotations(list);
    } catch (err) {
      showToast('Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, showToast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleOpenEdit = (quote) => {
    setSelectedQuote(quote);
    setEditData({
      status: quote.status || 'Quoted',
      validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
      notes: quote.notes || '',
      deliveryCharge: quote.deliveryCharge || 0,
      labourCharge: quote.labourCharge || 0,
      discount: quote.discount || 0,
      items: (quote.items || []).map(i => ({ ...i })),
      resendEmail: false
    });
    setIsModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    setEditData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setSaving(true);
    try {
      await api.put(`/quotations/admin/${selectedQuote._id || selectedQuote.quotationId}`, editData);
      showToast('Quotation updated successfully!', 'success');
      setIsModalOpen(false);
      fetchQuotations();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quotation.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExpire = async (quote) => {
    if (!window.confirm(`Are you sure you want to expire Quotation #${quote.quotationId}?`)) return;
    try {
      await api.put(`/quotations/admin/${quote._id || quote.quotationId}`, { status: 'Expired' });
      showToast(`Quotation #${quote.quotationId} marked as Expired`, 'info');
      fetchQuotations();
    } catch (err) {
      showToast('Failed to expire quotation', 'error');
    }
  };

  const handleDownloadPDF = async (quote) => {
    const id = quote._id || quote.quotationId;
    window.open(`/api/quotations/${id}/export.pdf`, '_blank');
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Quotations Management
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Review, revise pricing, send formal estimates, and export statutory quotation documents.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card, #FFFFFF)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid var(--border-light, #E5E7EB)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%' }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setStatusFilter(opt)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: statusFilter === opt ? 'var(--primary, #0284C7)' : 'var(--border-light, #D1D5DB)',
                background: statusFilter === opt ? 'var(--primary, #0284C7)' : 'transparent',
                color: statusFilter === opt ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search quote #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #D1D5DB)',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div
        style={{
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: '12px',
          border: '1px solid var(--border-light, #E5E7EB)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading quotations...
          </div>
        ) : quotations.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>No quotations found</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try switching filters or adjusting your search term.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle, #F9FAFB)', borderBottom: '1px solid var(--border-light, #E5E7EB)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Quote #</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Items</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total (₹)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Valid Until</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(q => {
                  const isExp = q.validUntil && new Date(q.validUntil) < new Date();
                  return (
                    <tr key={q._id || q.quotationId} style={{ borderBottom: '1px solid var(--border-light, #F3F4F6)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary, #0284C7)' }}>
                        {q.quotationId}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.customer?.name || 'Contractor'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.customer?.phone}</div>
                        {q.customer?.company && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{q.customer.company}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {q.items?.length || 0} item(s)
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{Number(q.totalAmount || 0).toLocaleString('en-IN')}
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                          GST: ₹{Number(q.tax || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              q.status === 'Accepted'
                                ? '#DCFCE7'
                                : q.status === 'Rejected' || q.status === 'Expired'
                                ? '#FEE2E2'
                                : '#EFF6FF',
                            color:
                              q.status === 'Accepted'
                                ? '#15803D'
                                : q.status === 'Rejected' || q.status === 'Expired'
                                ? '#B91C1C'
                                : '#1D4ED8'
                          }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {q.validUntil ? (
                          <span style={{ color: isExp ? '#EF4444' : 'inherit', fontWeight: isExp ? 600 : 400 }}>
                            {new Date(q.validUntil).toLocaleDateString()}
                            {isExp && ' (Expired)'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(q)}
                            title="Download PDF Quotation"
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-light, #D1D5DB)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <Download size={13} /> PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(q)}
                            title="Revise Rates & Details"
                            style={{
                              background: 'var(--primary, #0284C7)',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: '#FFFFFF'
                            }}
                          >
                            <Edit size={13} /> Revise
                          </button>
                          {q.status !== 'Expired' && q.status !== 'Accepted' && (
                            <button
                              type="button"
                              onClick={() => handleExpire(q)}
                              title="Expire Quotation"
                              style={{
                                background: 'transparent',
                                border: '1px solid #FCA5A5',
                                borderRadius: '6px',
                                padding: '5px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#EF4444'
                              }}
                            >
                              Expire
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revise Quotation Modal */}
      {isModalOpen && selectedQuote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card, #FFFFFF)',
              borderRadius: '14px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-light, #E5E7EB)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-subtle, #F9FAFB)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                  Revise Quotation #{selectedQuote.quotationId}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Customer: {selectedQuote.customer?.name} ({selectedQuote.customer?.phone})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Quotation Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light, #D1D5DB)' }}
                  >
                    <option value="Quoted">Quoted</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                    <option value="Converted to Order">Converted to Order</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Valid Until (Date)
                  </label>
                  <input
                    type="date"
                    value={editData.validUntil}
                    onChange={(e) => setEditData(prev => ({ ...prev, validUntil: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light, #D1D5DB)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={editData.deliveryCharge}
                    onChange={(e) => setEditData(prev => ({ ...prev, deliveryCharge: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light, #D1D5DB)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Special Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={editData.discount}
                    onChange={(e) => setEditData(prev => ({ ...prev, discount: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light, #D1D5DB)' }}
                  />
                </div>
              </div>

              {/* Items Line Table */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Quoted Line Items (Adjust Rates)
                </label>
                <div style={{ border: '1px solid var(--border-light, #E5E7EB)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle, #F9FAFB)', borderBottom: '1px solid var(--border-light, #E5E7EB)' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Name</th>
                        <th style={{ padding: '8px 10px', width: '90px' }}>Qty</th>
                        <th style={{ padding: '8px 10px', width: '80px' }}>Unit</th>
                        <th style={{ padding: '8px 10px', width: '110px' }}>Rate (₹)</th>
                        <th style={{ padding: '8px 10px', width: '110px' }}>Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editData.items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light, #F3F4F6)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>{it.name}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{it.unit || 'units'}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <input
                              type="number"
                              min="0"
                              value={it.price}
                              onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 700 }}>
                            ₹{((Number(it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Internal / Customer Notes
                </label>
                <textarea
                  rows={2}
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Terms, batch test certificate clauses, or site unloading details..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light, #D1D5DB)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="resendEmail"
                  checked={editData.resendEmail}
                  onChange={(e) => setEditData(prev => ({ ...prev, resendEmail: e.target.checked }))}
                />
                <label htmlFor="resendEmail" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  Send notification alert to customer upon saving
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '6px', fontWeight: 600 }}
                >
                  {saving ? 'Saving...' : 'Save & Update Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

