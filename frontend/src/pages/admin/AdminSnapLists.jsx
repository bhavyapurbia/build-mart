import React, { useState, useEffect } from 'react';
import {
  Camera,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  MessageSquare,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Copy,
  Send,
  Clock,
  AlertTriangle,
  X,
  Check,
  Package,
  Truck,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api, { subscribeCatalogUpdates } from '../../utils/api';

const AdminSnapLists = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, billGenerated: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, BILLED, COMPLETED
  const [search, setSearch] = useState('');

  // Image viewer modal state
  const [previewImage, setPreviewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Bill Generation modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billItems, setBillItems] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(250);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [validDays, setValidDays] = useState(7);
  const [submittingBill, setSubmittingBill] = useState(false);

  // WhatsApp post-generation prompt modal
  const [generatedBillData, setGeneratedBillData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const { showToast } = useNotification();

  const loadSnapLists = async () => {
    setLoading(true);
    try {
      const res = await api.get('/material-requests/admin/all?isPaperList=true');
      const payload = res.data?.data || res.data;
      const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.requests) ? payload.requests : []);
      setRequests(list);
      if (payload?.snapStats) {
        setStats(payload.snapStats);
      } else {
        // Fallback count calculation
        const pending = list.filter(r => r.status === 'Pending Review').length;
        const billed = list.filter(r => r.status === 'Bill Generated' || r.status === 'Quotation Sent').length;
        const completed = list.filter(r => r.status === 'Converted to Order').length;
        setStats({ total: list.length, pending, billGenerated: billed, completed });
      }
    } catch (err) {
      console.error('Error loading snap lists:', err);
      showToast('Error loading snap list requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapLists();
    const unsub = subscribeCatalogUpdates(loadSnapLists);
    return () => unsub();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (activeTab === 'PENDING' && r.status !== 'Pending Review') return false;
    if (activeTab === 'BILLED' && r.status !== 'Bill Generated' && r.status !== 'Quotation Sent') return false;
    if (activeTab === 'COMPLETED' && r.status !== 'Converted to Order') return false;
    if (activeTab === 'REJECTED' && r.status !== 'Quotation Rejected' && r.status !== 'Cancelled') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.requestId && r.requestId.toLowerCase().includes(q)) ||
      (r.customer?.name && r.customer.name.toLowerCase().includes(q)) ||
      (r.customer?.phone && r.customer.phone.toLowerCase().includes(q)) ||
      (r.customer?.city && r.customer.city.toLowerCase().includes(q))
    );
  });

  // Open Bill Generation Modal
  const handleOpenBillModal = (req) => {
    setSelectedRequest(req);
    // Pre-populate items from request if any, or initialize with 1 blank line
    const existing = req.items && req.items.length > 0 && req.items[0]?.name !== 'Handwritten Contractor Paper List'
      ? req.items.map(i => ({
          productId: i.productId || '',
          name: i.name,
          brand: i.brand || 'Standard',
          quantity: i.quantity || 1,
          unit: i.unit || 'Piece',
          unitPrice: i.unitPrice || 0,
          inStock: i.inStock !== false
        }))
      : [
          {
            name: '',
            brand: '',
            quantity: 1,
            unit: 'Bag',
            unitPrice: 0,
            inStock: true
          }
        ];

    setBillItems(existing);
    const existingBill = req.billDetails || {};
    setDeliveryCharge(existingBill.deliveryCharge != null ? existingBill.deliveryCharge : 250);
    setTax(existingBill.tax || 0);
    setDiscount(existingBill.discount || 0);
    setAdminNotes(existingBill.adminNotes || req.adminNotes || 'Bill prepared from your snap list photo. Stock verified by BuildPlace Materials Desk.');
    setValidDays(7);
    setIsBillModalOpen(true);
  };

  const handleAddItem = () => {
    setBillItems(prev => [
      ...prev,
      {
        name: '',
        brand: '',
        quantity: 1,
        unit: 'Piece',
        unitPrice: 0,
        inStock: true
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index, field, value) => {
    setBillItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Pricing calculations
  const availableSubtotal = billItems
    .filter(i => i.inStock)
    .reduce((sum, i) => sum + ((Number(i.unitPrice) || 0) * (Number(i.quantity) || 1)), 0);

  const grandTotal = Math.max(0, availableSubtotal + (Number(deliveryCharge) || 0) + (Number(tax) || 0) - (Number(discount) || 0));

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const validItems = billItems.filter(i => i.name.trim() !== '');
    if (validItems.length === 0) {
      showToast('Please add at least one material item from the photo.', 'error');
      return;
    }

    setSubmittingBill(true);
    try {
      const payload = {
        items: validItems,
        deliveryCharge: Number(deliveryCharge),
        tax: Number(tax),
        discount: Number(discount),
        adminNotes,
        validDays: Number(validDays) || 7
      };

      const res = await api.post(`/material-requests/admin/${selectedRequest.requestId || selectedRequest._id}/generate-bill`, payload);
      const data = res.data?.data || res.data;

      showToast(`Bill generated for Snap List #${selectedRequest.requestId}!`, 'success');
      setIsBillModalOpen(false);
      setGeneratedBillData({
        requestId: selectedRequest.requestId,
        customerName: selectedRequest.customer?.name,
        phone: selectedRequest.customer?.phone,
        totalAmount: grandTotal,
        billUrl: data.billUrl || `${window.location.origin}/snap-list/bill/${selectedRequest.requestId}`,
        whatsappUrl: data.whatsappUrl
      });
      loadSnapLists();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error generating bill', 'error');
    } finally {
      setSubmittingBill(false);
    }
  };

  const handleReject = async (reqId) => {
    if (!window.confirm('Are you sure you want to decline/reject this snap list request?')) return;
    try {
      await api.put(`/material-requests/admin/${reqId}/status`, { status: 'Cancelled' });
      showToast('Snap list request cancelled.', 'info');
      loadSnapLists();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const getCleanPhone = (phone) => {
    return String(phone || '').replace(/\D/g, '').replace(/^91/, '');
  };

  const openWhatsAppChat = (req) => {
    const cleanPhone = getCleanPhone(req.customer?.phone);
    const msg = `Hello ${req.customer?.name}!\nI am from the BuildPlace Materials Desk regarding your Snap List #${req.requestId}.\nHow can we assist you with your construction supplies?`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openWhatsAppBill = (req) => {
    const cleanPhone = getCleanPhone(req.customer?.phone);
    const billUrl = `${window.location.origin}/snap-list/bill/${req.requestId}`;
    const total = req.billDetails?.totalAmount || 0;
    const msg = `Hello ${req.customer?.name}!\nYour official BuildPlace bill for Snap List #${req.requestId} is ready.\n\n*Total Payable: ₹${total.toLocaleString('en-IN')}*\n\nPlease check available stock and pay online to confirm site delivery:\n${billUrl}\n\nThank you for choosing BuildPlace!`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    showToast('Bill link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="admin-snap-lists-page" style={{ paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EA7E12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
              <Camera size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
              Snap Lists (Photo Uploads)
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Review contractor handwritten paper lists, generate itemized bills with stock status, and send instant WhatsApp bills.
          </p>
        </div>

        <button
          onClick={loadSnapLists}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA7E12' }}>
            <Camera size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 600 }}>Total Snap Lists</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)' }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: stats.pending > 0 ? '1.5px solid #EA7E12' : '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: stats.pending > 0 ? '#FFEDD5' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stats.pending > 0 ? '#C2410C' : '#64748B' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 600 }}>Pending Review</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: stats.pending > 0 ? '#C2410C' : 'var(--color-ink)' }}>
              {stats.pending}
              {stats.pending > 0 && <span style={{ fontSize: '11px', background: '#EA7E12', color: '#FFF', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>ACTION REQ</span>}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <FileText size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 600 }}>Bills Generated</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB' }}>{stats.billGenerated}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 600 }}>Orders Converted</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A' }}>{stats.completed}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'ALL', label: `All (${requests.length})` },
              { id: 'PENDING', label: `Pending Review (${stats.pending})` },
              { id: 'BILLED', label: `Bill Ready (${stats.billGenerated})` },
              { id: 'COMPLETED', label: `Paid / Converted (${stats.completed})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`chip-filter ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, name, phone, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '7px 10px 7px 32px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12.5px' }}
            />
          </div>
        </div>
      </div>

      {/* Snap Lists Cards / Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--color-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p>Loading snap lists...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Camera size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>No Snap Lists Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', maxWidth: '400px', margin: '4px auto 0' }}>
              When customers snap photos of handwritten construction lists on their phone, they will appear here instantly for review.
            </p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const bill = req.billDetails || {};
            const isBilled = req.status === 'Bill Generated' || req.status === 'Quotation Sent';
            const isCompleted = req.status === 'Converted to Order';
            const cleanPhone = getCleanPhone(req.customer?.phone);
            const inStockItems = (req.items || []).filter(i => i.inStock !== false);
            const outOfStockItems = (req.items || []).filter(i => i.inStock === false);

            return (
              <div
                key={req._id}
                style={{
                  background: 'var(--bg-card)',
                  border: req.status === 'Pending Review' ? '1.5px solid #EA7E12' : '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 1fr auto',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                {/* 1. Snap List Photo Thumbnail */}
                <div style={{ position: 'relative', width: '130px', height: '130px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid var(--border)', background: '#F8FAFC' }}>
                  {req.paperListImage ? (
                    <>
                      <img
                        src={req.paperListImage}
                        alt="Handwritten Paper List"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => { setPreviewImage(req.paperListImage); setZoomLevel(1); setRotation(0); }}
                      />
                      <button
                        type="button"
                        onClick={() => { setPreviewImage(req.paperListImage); setZoomLevel(1); setRotation(0); }}
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(15,23,42,0.85)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={12} /> Zoom
                      </button>
                    </>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '11px', textAlign: 'center', padding: '6px' }}>
                      No Photo Attached
                    </div>
                  )}
                </div>

                {/* 2. Customer & Site Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#EA7E12' }}>#{req.requestId}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: isCompleted ? '#DCFCE7' : isBilled ? '#DBEAFE' : '#FFEDD5',
                        color: isCompleted ? '#166534' : isBilled ? '#1E40AF' : '#9A3412'
                      }}
                    >
                      {req.status}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      • {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-ink)' }}>
                    {req.customer?.name}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                      href={`tel:${req.customer?.phone}`}
                      style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      <Phone size={13} color="#64748B" />
                      {req.customer?.phone}
                    </a>

                    {/* Green WhatsApp Contact Button */}
                    <button
                      type="button"
                      onClick={() => openWhatsAppChat(req)}
                      style={{
                        background: '#25D366',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '3px 10px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer'
                      }}
                      title="Send message on WhatsApp"
                    >
                      <MessageSquare size={13} />
                      WhatsApp
                    </button>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={13} />
                    <span>{req.customer?.siteAddress}, <strong>{req.customer?.city}</strong> {req.customer?.pincode ? `(${req.customer.pincode})` : ''}</span>
                  </div>

                  {req.customer?.notes && (
                    <div style={{ fontSize: '11.5px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', color: '#475569', fontStyle: 'italic', marginTop: '4px' }}>
                      "{req.customer.notes}"
                    </div>
                  )}
                </div>

                {/* 3. Generated Bill / Items Overview */}
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {isBilled || isCompleted ? (
                    <>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Bill Summary
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)' }}>
                        ₹{(bill.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        <span>✓ <strong>{inStockItems.length}</strong> available item(s)</span>
                        {outOfStockItems.length > 0 && (
                          <span style={{ color: '#DC2626', fontWeight: 700, marginLeft: '6px' }}>
                            (⚠️ {outOfStockItems.length} out of stock)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                        Payment: <strong style={{ color: bill.paymentStatus === 'paid' ? '#16A34A' : bill.paymentStatus === 'cod_confirmed' ? '#D97706' : '#DC2626' }}>
                          {bill.paymentStatus === 'paid' ? 'Paid Online' : bill.paymentStatus === 'cod_confirmed' ? 'Pay on Delivery' : 'Unpaid (Pending Customer)'}
                        </strong>
                      </div>
                      {bill.orderId && (
                        <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>
                          Order Created: #{bill.orderId}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '10px 0' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', background: '#FFEDD5', padding: '3px 8px', borderRadius: '6px' }}>
                        Action: Generate Bill
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                        Inspect the handwritten photo, enter pricing for the requested materials, and mark any out-of-stock items.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenBillModal(req)}
                    className="btn-primary"
                    style={{
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: isBilled ? '#0F172A' : '#EA7E12'
                    }}
                  >
                    <FileText size={15} />
                    <span>{isBilled ? 'Edit Bill' : 'Generate Bill'}</span>
                  </button>

                  {/* Send Bill via WhatsApp if bill is ready */}
                  {isBilled && (
                    <button
                      type="button"
                      onClick={() => openWhatsAppBill(req)}
                      style={{
                        background: '#25D366',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title="Send Bill Link via WhatsApp"
                    >
                      <Send size={13} />
                      <span>Send Bill via WhatsApp</span>
                    </button>
                  )}

                  {/* Direct Link to Customer Bill Page */}
                  {isBilled && (
                    <a
                      href={`/snap-list/bill/${req.requestId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        textAlign: 'center',
                        fontSize: '11.5px',
                        color: '#2563EB',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Preview Bill Page</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleReject(req._id || req.requestId)}
                      style={{
                        background: 'transparent',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Decline Request
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL 1: HIGH-RES IMAGE VIEWER WITH ZOOM & ROTATE --- */}
      {previewImage && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewImage(null)}
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Toolbar */}
            <div style={{ position: 'absolute', top: '-44px', display: 'flex', gap: '8px', zIndex: 10 }}>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 3))}
                style={{ background: '#334155', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <ZoomIn size={14} /> Zoom In
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.5))}
                style={{ background: '#334155', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <ZoomOut size={14} /> Zoom Out
              </button>
              <button
                type="button"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                style={{ background: '#334155', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <RotateCw size={14} /> Rotate
              </button>
              <button
                type="button"
                onClick={() => { setZoomLevel(1); setRotation(0); }}
                style={{ background: '#334155', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
              >
                Close (✕)
              </button>
            </div>

            <div style={{ overflow: 'auto', maxHeight: '82vh', maxWidth: '88vw', borderRadius: '10px', background: '#0F172A', padding: '8px' }}>
              <img
                src={previewImage}
                alt="Enlarged handwritten paper list"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                  maxHeight: '78vh',
                  maxWidth: '85vw',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: GENERATE BILL / QUOTATION MODAL (SPLIT-SCREEN) --- */}
      {isBillModalOpen && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setIsBillModalOpen(false)} style={{ zIndex: 999 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '1150px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#EA7E12" />
                  Generate Official Bill for Snap List #{selectedRequest.requestId}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Customer: <strong>{selectedRequest.customer?.name}</strong> ({selectedRequest.customer?.phone}) • Site: {selectedRequest.customer?.siteAddress}, {selectedRequest.customer?.city}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsBillModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Split Body: Left = Photo, Right = Bill Form */}
            <form onSubmit={handleSaveBill} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', flex: 1, overflow: 'hidden', minHeight: '450px' }}>
                {/* Left: Handwritten Photo with Quick Zoom */}
                <div style={{ background: '#0F172A', padding: '14px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC' }}>
                      📸 Contractor Paper List Photo
                    </span>
                    <a
                      href={selectedRequest.paperListImage}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      <span>Open full tab</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1E293B', borderRadius: '8px', padding: '6px' }}>
                    {selectedRequest.paperListImage ? (
                      <img
                        src={selectedRequest.paperListImage}
                        alt="Paper List"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>No photo uploaded</span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', textAlign: 'center' }}>
                    Read the contractor's handwriting above and enter pricing on the right.
                  </span>
                </div>

                {/* Right: Itemized Bill Form */}
                <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
                        Line Items & Availability from Photo:
                      </strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-muted)' }}>
                        Toggle "Out of Stock" if item unavailable
                      </span>
                    </div>

                    {/* Table / List of Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {billItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: item.inStock ? '#FFFFFF' : '#FEF2F2',
                            border: item.inStock ? '1px solid var(--border)' : '1.5px dashed #EF4444',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            display: 'grid',
                            gridTemplateColumns: '1.6fr 1fr 0.9fr 1fr 1fr auto',
                            gap: '8px',
                            alignItems: 'center'
                          }}
                        >
                          {/* Item Name */}
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="e.g. UltraTech Super PPC Cement"
                              value={item.name}
                              onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12px', fontWeight: 600 }}
                            />
                          </div>

                          {/* Brand */}
                          <div>
                            <input
                              type="text"
                              placeholder="Brand (e.g. UltraTech)"
                              value={item.brand}
                              onChange={e => handleUpdateItem(idx, 'brand', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12px' }}
                            />
                          </div>

                          {/* Qty & Unit */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                              type="number"
                              min="1"
                              required
                              value={item.quantity}
                              onChange={e => handleUpdateItem(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                              style={{ width: '50px', padding: '6px 6px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12px', textAlign: 'center' }}
                            />
                            <input
                              type="text"
                              placeholder="Unit"
                              value={item.unit}
                              onChange={e => handleUpdateItem(idx, 'unit', e.target.value)}
                              style={{ width: '55px', padding: '6px 6px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12px' }}
                            />
                          </div>

                          {/* Unit Price */}
                          <div>
                            <input
                              type="number"
                              min="0"
                              required
                              placeholder="Price (₹)"
                              value={item.unitPrice}
                              onChange={e => handleUpdateItem(idx, 'unitPrice', Math.max(0, Number(e.target.value) || 0))}
                              style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12px', fontWeight: 700 }}
                            />
                          </div>

                          {/* In-Stock Toggle Button (Core Requirement!) */}
                          <div>
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(idx, 'inStock', !item.inStock)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: '5px',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: item.inStock ? '#DCFCE7' : '#FEE2E2',
                                color: item.inStock ? '#166534' : '#991B1B'
                              }}
                              title={item.inStock ? 'Click to mark as Out of Stock' : 'Click to mark as Available'}
                            >
                              {item.inStock ? '✓ In Stock' : '⚠️ Not in Stock'}
                            </button>
                          </div>

                          {/* Delete */}
                          <div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                              title="Remove line"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="btn-secondary"
                      style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      <span>+ Add Line Item from Photo</span>
                    </button>
                  </div>

                  {/* Summary & Charges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '2px' }}>
                        Delivery Freight (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={deliveryCharge}
                        onChange={e => setDeliveryCharge(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '2px' }}>
                        GST / Taxes (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={tax}
                        onChange={e => setTax(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '2px' }}>
                        Trade Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={e => setDiscount(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '3px' }}>
                      Notes for Contractor / Customer
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="e.g. 16mm rebar is out of stock, but 12mm and PPC cement are ready for dispatch within 45 mins."
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>

                  {/* Total Banner */}
                  <div style={{ background: '#FFF7ED', border: '1.5px solid #EA7E12', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700, display: 'block' }}>
                        Calculated from available in-stock items only
                      </span>
                      <span style={{ fontSize: '12px', color: '#7C2D12' }}>
                        Subtotal: ₹{availableSubtotal.toLocaleString('en-IN')} + Freight: ₹{deliveryCharge} + Tax: ₹{tax} - Discount: ₹{discount}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700 }}>GRAND TOTAL PAYABLE</span>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#EA7E12' }}>
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingBill}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13.5px', fontWeight: 800 }}
                >
                  <Send size={15} />
                  <span>{submittingBill ? 'Generating Official Bill...' : 'Generate & Send Bill to Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: POST-GENERATION WHATSAPP SHARE PROMPT --- */}
      {generatedBillData && (
        <div className="modal-backdrop" onClick={() => setGeneratedBillData(null)} style={{ zIndex: 1000 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '520px', textAlign: 'center', padding: '28px' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '6px' }}>
              Official Bill Generated!
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Bill for Snap List <strong>#{generatedBillData.requestId}</strong> (Total: <strong>₹{generatedBillData.totalAmount.toLocaleString('en-IN')}</strong>) is ready for <strong>{generatedBillData.customerName}</strong>.
            </p>

            {/* Direct Link Box */}
            <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '360px' }}>
                {generatedBillData.billUrl}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedBillData.billUrl)}
                style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '5px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Prominent WhatsApp Dispatch Button */}
            <a
              href={generatedBillData.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 18px',
                background: '#25D366',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
                marginBottom: '10px'
              }}
            >
              <MessageSquare size={18} />
              <span>Send Bill via WhatsApp Now</span>
            </a>

            <button
              type="button"
              onClick={() => setGeneratedBillData(null)}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '13px' }}
            >
              Done & Return to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSnapLists;
