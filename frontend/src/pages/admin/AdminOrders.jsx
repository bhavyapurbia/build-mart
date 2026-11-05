import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Eye,
  FileText,
  Printer,
  X,
  Truck,
  CheckCircle,
  Clock,
  HardHat
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const ORDER_STATUSES = [
  'Pending Review',
  'Quotation Sent',
  'Awaiting Customer Approval',
  'Confirmed',
  'Processing',
  'Ready for Dispatch',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { showToast } = useNotification();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
      loadOrders();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
            Confirmed Order Fulfillment Management
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '2px' }}>
            Dispatch building materials, track truck deliveries, and generate official GST invoices
          </p>
        </div>
        <button onClick={loadOrders} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Refresh Orders
        </button>
      </div>

      {/* Orders Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID & Invoice</th>
              <th>Customer</th>
              <th>Materials Subtotal</th>
              <th>Labour Service</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{order.orderId}</strong>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {order.invoiceNumber || 'INV-2026-0001'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{order.customer?.phone}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{order.customer?.city}</div>
                </td>
                <td>
                  <strong style={{ color: '#0F172A' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{order.items?.length || 0} items</div>
                </td>
                <td>
                  {order.labourDetails?.hasLabour ? (
                    <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HardHat size={14} />
                      <span>{order.labourDetails.labourType} ({order.labourDetails.workersRequired})</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>None</span>
                  )}
                </td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: order.paymentStatus === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                    color: order.paymentStatus === 'Paid' ? '#15803D' : '#B45309'
                  }}>
                    {order.paymentMethod} • {order.paymentStatus}
                  </span>
                </td>
                <td>
                  {/* Status Dropdown */}
                  <select
                    value={order.orderStatus || 'Confirmed'}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    {ORDER_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsInvoiceModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} />
                    <span>Invoice</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setIsInvoiceModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '0' }}>
            <div className="modal-header" style={{ background: '#0F172A', color: '#FFFFFF' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Tax Invoice: {selectedOrder.invoiceNumber || 'INV-2026-0001'}</h3>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>Order ID: #{selectedOrder.orderId}</div>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} style={{ background: 'transparent', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" id="invoice-print-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>BuildMart Technologies Pvt Ltd</h2>
                  <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                    GSTIN: 29AABCB1234F1Z8<br />
                    Outer Ring Road Tech Zone, Bellandur, Bengaluru 560103<br />
                    Toll-Free: 1800-890-5000 | orders@buildmart.in
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748B' }}>
                  <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> {selectedOrder.orderStatus}</div>
                  <div><strong>Payment:</strong> {selectedOrder.paymentMethod}</div>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Billed & Shipped To:</strong>
                <div>{selectedOrder.customer?.name} ({selectedOrder.customer?.phone})</div>
                <div>{selectedOrder.customer?.address}, {selectedOrder.customer?.city} - {selectedOrder.customer?.pincode}</div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Price (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px' }}>{item.name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.price}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₹{item.total?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ width: '280px', marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Material Cost:</span>
                  <span>₹{selectedOrder.materialCost?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST 18% (ITC):</span>
                  <span>₹{selectedOrder.tax?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Freight:</span>
                  <span>{selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}</span>
                </div>
                {selectedOrder.labourCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Labour Charges:</span>
                    <span>₹{selectedOrder.labourCost?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ borderTop: '2px solid #0F172A', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                  <span>Total Amount:</span>
                  <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handlePrintInvoice} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

