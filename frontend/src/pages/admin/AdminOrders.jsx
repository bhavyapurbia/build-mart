import React, { useState, useEffect, useMemo } from 'react';
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
import DataTable from '../../components/admin/DataTable';
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

  const columns = useMemo(() => [
    {
      header: 'Order ID & Invoice',
      accessor: 'orderId',
      sortable: true,
      render: (order) => (
        <div>
          <strong style={{ fontSize: '13.5px', color: 'var(--color-ink)' }}>{order.orderId}</strong>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            {order.invoiceNumber || 'INV-2026-0001'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer.name',
      sortable: true,
      render: (order) => (
        <div>
          <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{order.customer?.phone}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{order.customer?.city}</div>
        </div>
      )
    },
    {
      header: 'Materials Subtotal',
      accessor: 'totalAmount',
      sortable: true,
      render: (order) => (
        <div>
          <strong style={{ color: 'var(--color-ink)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{order.items?.length || 0} items</div>
        </div>
      )
    },
    {
      header: 'Labour Service',
      accessor: (order) => (order.labourDetails?.hasLabour ? order.labourDetails.labourType : 'None'),
      render: (order) => (
        order.labourDetails?.hasLabour ? (
          <div style={{ fontSize: '12px', color: 'var(--primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HardHat size={14} />
            <span>{order.labourDetails.labourType} ({order.labourDetails.workersRequired})</span>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>None</span>
        )
      )
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      sortable: true,
      render: (order) => (
        <span style={{
          display: 'inline-block',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 700,
          background: order.paymentStatus === 'Paid' ? 'var(--accent-green-light)' : 'var(--primary-light)',
          color: order.paymentStatus === 'Paid' ? 'var(--color-success)' : 'var(--primary-deep)'
        }}>
          {order.paymentMethod} • {order.paymentStatus}
        </span>
      )
    },
    {
      header: 'Order Status',
      accessor: 'orderStatus',
      sortable: true,
      render: (order) => (
        <select
          value={order.orderStatus || 'Confirmed'}
          onChange={e => handleStatusChange(order._id, e.target.value)}
          style={{
            padding: '5px 8px',
            borderRadius: '6px',
            border: '1px solid var(--color-rule)',
            fontSize: '12px',
            fontWeight: 700,
            background: 'var(--bg-card)',
            cursor: 'pointer'
          }}
        >
          {ORDER_STATUSES.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      render: (order) => (
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
            background: 'var(--color-paper-3)',
            border: '1px solid var(--color-rule)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FileText size={14} />
          <span>Invoice</span>
        </button>
      )
    }
  ], []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)' }}>
            Confirmed Order Fulfillment Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
            Dispatch building materials, track truck deliveries, and generate official GST invoices
          </p>
        </div>
        <button onClick={loadOrders} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Refresh Orders
        </button>
      </div>

      {/* Orders DataTable */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable={true}
        searchKeys={['orderId', 'invoiceNumber', 'customer.name', 'customer.phone', 'customer.city', 'orderStatus', 'paymentMethod', 'paymentStatus']}
        exportFilename="buildmart-orders"
        emptyMessage="No orders found"
      />

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setIsInvoiceModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '0' }}>
            <div className="modal-header" style={{ background: 'var(--color-ink)', color: 'var(--bg-card)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Tax Invoice: {selectedOrder.invoiceNumber || 'INV-2026-0001'}</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Order ID: #{selectedOrder.orderId}</div>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} style={{ background: 'transparent', color: 'var(--bg-card)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" id="invoice-print-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)' }}>BuildMart Technologies Pvt Ltd</h2>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                    GSTIN: 29AABCB1234F1Z8<br />
                    Outer Ring Road Tech Zone, Bellandur, Bengaluru 560103<br />
                    Toll-Free: 1800-890-5000 | orders@buildmart.in
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-muted)' }}>
                  <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> {selectedOrder.orderStatus}</div>
                  <div><strong>Payment:</strong> {selectedOrder.paymentMethod}</div>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ background: 'var(--bg-page)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Billed & Shipped To:</strong>
                <div>{selectedOrder.customer?.name} ({selectedOrder.customer?.phone})</div>
                <div>{selectedOrder.customer?.address}, {selectedOrder.customer?.city} - {selectedOrder.customer?.pincode}</div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-paper-3)', borderBottom: '1px solid var(--color-rule)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Price (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-paper-3)' }}>
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
                <div style={{ borderTop: '2px solid var(--color-ink)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
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

