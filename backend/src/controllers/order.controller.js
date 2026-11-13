import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { computePricing } from '../services/pricing.service.js';
import { createOrderRecord, restoreStock } from '../services/order.service.js';
import { validateOrderTransition, canCustomerCancel } from '../utils/order.stateMachine.js';
import { assertOwnerOrAdmin } from '../middleware/auth.middleware.js';
import { sendEmail } from '../utils/Email.js';

/**
 * Creates an order with server-authoritative pricing (COD / Bank Transfer / Credit on Approval).
 * Client-submitted prices and totals are strictly ignored.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    paymentMethod = 'COD',
    labourDetails,
    couponApplied,
    quotationId
  } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
    throw new ApiError(400, 'Customer name, phone, address, city, and pincode are required.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order items list cannot be empty.');
  }

  // Restrict paymentMethod in direct createOrder to non-online methods (online must go through Razorpay flow)
  const allowedDirectMethods = ['COD', 'Bank Transfer', 'Credit on Approval'];
  const normalizedMethod = allowedDirectMethods.includes(paymentMethod) ? paymentMethod : 'COD';

  let quotationDoc = null;
  if (quotationId) {
    quotationDoc = await Quotation.findOne({ quotationId }).lean();
    if (!quotationDoc) {
      throw new ApiError(404, `Quotation #${quotationId} not found.`);
    }
    if (quotationDoc.status !== 'Accepted') {
      throw new ApiError(400, `Quotation #${quotationId} must be accepted before converting to order.`);
    }
    if (quotationDoc.validUntil && new Date(quotationDoc.validUntil) < new Date()) {
      throw new ApiError(400, `Quotation #${quotationId} has expired.`);
    }
    if (req.user && quotationDoc.user && String(quotationDoc.user) !== String(req.user._id) && req.user.role !== 'admin') {
      throw new ApiError(403, 'You are not authorized to checkout this quotation.');
    }
  }

  // 1. Server-Authoritative Pricing Calculation
  const pricing = await computePricing({
    items,
    couponCode: couponApplied,
    shipping: { state: customer.state || 'Karnataka', pincode: customer.pincode },
    userId: req.user ? String(req.user._id) : null,
    quotation: quotationDoc
  });

  // 2. Atomic Order Persistence & Stock Decrement
  const order = await createOrderRecord({
    customer,
    pricing,
    paymentMethod: normalizedMethod,
    paymentStatus: 'Pending', // Direct orders are always initially Pending
    userId: req.user ? String(req.user._id) : null,
    quotationId: quotationDoc ? quotationDoc.quotationId : null,
    labourDetails
  });

  return res.status(201).json(
    new ApiResponse(201, {
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      order
    }, 'Order placed successfully! We are preparing your building materials for dispatch.')
  );
});

/**
 * Gets the authenticated user's order history with pagination.
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required to view orders.');
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { user: String(req.user._id) };
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Orders fetched successfully')
  );
});

/**
 * Retrieves a single order by ID or orderId, enforcing ownership.
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { orderId: req.params.id };
  const order = await Order.findOne(query).lean();

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Enforce ownership: customers can only view their own orders
  assertOwnerOrAdmin(order.user, req.user, order.customer?.email);

  return res.status(200).json(
    new ApiResponse(200, order, 'Order retrieved successfully')
  );
});

/**
 * Admin: Get all orders with search, filters, and pagination.
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  // Search query (orderId, phone, customer name)
  if (req.query.q) {
    const term = req.query.q.trim();
    filter.$or = [
      { orderId: { $regex: term, $options: 'i' } },
      { 'customer.phone': { $regex: term, $options: 'i' } },
      { 'customer.name': { $regex: term, $options: 'i' } }
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Orders fetched successfully')
  );
});

/**
 * Admin: Update order status with state-machine validation and inventory restore on cancel.
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, paymentStatus } = req.body;
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { orderId: req.params.id };
  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const updateData = {};

  if (status && status !== order.orderStatus) {
    // Validate state machine transition
    validateOrderTransition(order.orderStatus, status);
    updateData.orderStatus = status;

    const timeline = order.timeline || [];
    timeline.push({
      status,
      note: note || `Status transitioned to ${status}`,
      timestamp: new Date().toISOString()
    });
    updateData.timeline = timeline;

    // If order is cancelled, restore stock back to inventory
    if (status === 'Cancelled') {
      await restoreStock(order.items, order.orderId, note || 'Admin cancelled order');
    }

    // Customer email on status change
    if (order.customer?.email) {
      sendEmail({
        email: order.customer.email,
        subject: `Order Update: #${order.orderId} is now ${status} - BuildMart`,
        mailgenContent: {
          body: {
            name: order.customer.name,
            intro: `Your order #${order.orderId} status has been updated to "${status}".`,
            action: {
              instructions: 'Track your materials delivery live:',
              button: {
                color: '#d97706',
                text: 'View Order Details',
                link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
              }
            }
          }
        }
      }).catch(err => console.warn('[Email] Status update email skipped:', err.message));
    }
  }

  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }

  const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true }).lean();

  return res.status(200).json(
    new ApiResponse(200, { order: updated }, 'Order status updated successfully')
  );
});

/**
 * Customer self-service cancellation (allowed before "Ready for Dispatch").
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { orderId: req.params.id };
  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Owner or admin only
  assertOwnerOrAdmin(order.user, req.user, order.customer?.email);

  if (!canCustomerCancel(order.orderStatus)) {
    throw new ApiError(
      400,
      `Order #${order.orderId} cannot be cancelled because it is already "${order.orderStatus}". Please contact support for assistance.`
    );
  }

  // Restore stock
  await restoreStock(order.items, order.orderId, 'Cancelled by customer');

  const timeline = order.timeline || [];
  timeline.push({
    status: 'Cancelled',
    note: req.body.reason ? `Customer cancelled: ${req.body.reason}` : 'Cancelled by customer request',
    timestamp: new Date().toISOString()
  });

  const updated = await Order.findByIdAndUpdate(
    order._id,
    {
      orderStatus: 'Cancelled',
      timeline
    },
    { new: true }
  ).lean();

  // Notify admin
  await Notification.create({
    recipient: 'admin',
    title: 'Order Cancelled by Customer',
    message: `Customer ${order.customer?.name} cancelled order #${order.orderId}`,
    type: 'order',
    referenceId: order.orderId,
    link: '/admin/orders'
  });

  return res.status(200).json(
    new ApiResponse(200, { order: updated }, 'Order cancelled successfully.')
  );
});

/**
 * Public rate-limited guest order tracking (orderId + phone).
 * Returns non-sensitive timeline and status without leaking customer PII.
 */
export const trackOrder = asyncHandler(async (req, res) => {
  const { orderId, phone } = req.body;
  if (!orderId || !phone) {
    throw new ApiError(400, 'Both Order ID and Contact Phone number are required.');
  }

  const cleanPhone = phone.replace(/[\s+-]/g, '').slice(-10);
  const order = await Order.findOne({ orderId: orderId.trim() }).lean();

  if (!order) {
    throw new ApiError(404, 'No matching order found with the provided details.');
  }

  const orderPhone = (order.customer?.phone || '').replace(/[\s+-]/g, '').slice(-10);
  if (orderPhone !== cleanPhone) {
    throw new ApiError(404, 'No matching order found with the provided details.');
  }

  // Sanitized view without exposing sensitive PII
  const nonPiiOrder = {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    itemCount: order.items?.length || 0,
    items: (order.items || []).map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit })),
    timeline: order.timeline || [],
    deliveryCity: order.customer?.city,
    createdAt: order.createdAt
  };

  return res.status(200).json(
    new ApiResponse(200, nonPiiOrder, 'Order tracking details retrieved successfully.')
  );
});

import { generateInvoicePDF } from '../services/invoice.service.js';

/**
 * GET /api/orders/:id/invoice.pdf
 * Generates and streams GST tax invoice PDF for the order owner or admin.
 */
export const downloadInvoice = asyncHandler(async (req, res) => {
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { orderId: req.params.id };
  const order = await Order.findOne(query).lean();

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  assertOwnerOrAdmin(order.user, req.user, order.customer?.email);

  await generateInvoicePDF(order, res);
});

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  trackOrder,
  downloadInvoice
};
