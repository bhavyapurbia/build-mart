import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { razorpay, RAZORPAY_KEY_ID } from '../utils/razorpay.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import LabourRequest from '../models/LabourRequest.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/Email.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Re-calculates the order totals on the backend so we never trust frontend amounts.
 */
function calculateOrderTotals(items, deliveryCharge, discount) {
  let materialCost = 0;
  for (const item of items) {
    materialCost += (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }
  const tax = Math.round(materialCost * 0.18);
  const calculatedDelivery = 0; // Free delivery (removed for payment testing)
  const totalAmount = Math.max(
    0,
    materialCost + tax + calculatedDelivery - Number(discount || 0)
  );
  const amountInPaise = Math.round(totalAmount * 100);
  return { materialCost, tax, calculatedDelivery, totalAmount, amountInPaise };
}

/**
 * Maps raw request items to the shape stored in Order.items.
 */
function mapOrderItems(items) {
  return items.map(item => ({
    productId: item.productId || item._id || null,
    name: item.name,
    brand: item.brand || '',
    image: item.image || (item.images && item.images[0]) || '',
    quantity: Number(item.quantity) || 1,
    unit: item.unit || 'Piece',
    price: Number(item.price) || 0,
    total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
  }));
}

/**
 * Creates the actual Order document and optional LabourRequest after payment is confirmed.
 * Mirrors the logic in order.controller.js → createOrder.
 */
async function createConfirmedOrder({ orderData, userId, totalAmounts, razorpayOrderId, razorpayPaymentId }) {
  const {
    customer,
    items,
    labourDetails,
    couponApplied,
    discount = 0,
    deliveryCharge = 0
  } = orderData;

  const { materialCost, tax, calculatedDelivery, totalAmount } = totalAmounts;

  const count = await Order.countDocuments();
  const orderId = `BM-ORD-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(4, '0')}`;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

  const orderItems = mapOrderItems(items);

  const labourCost = (labourDetails && labourDetails.hasLabour && labourDetails.labourCharges)
    ? Number(labourDetails.labourCharges)
    : 0;

  // Create labour request if applicable
  let labourBookingId = null;
  if (labourDetails && labourDetails.hasLabour) {
    const lCount = await LabourRequest.countDocuments();
    labourBookingId = `BM-LBR-${Date.now().toString().slice(-4)}-${(lCount + 1).toString().padStart(3, '0')}`;
    await LabourRequest.create({
      requestId: labourBookingId,
      user: userId || null,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        siteAddress: `${customer.address}, ${customer.city} - ${customer.pincode}`
      },
      workType: labourDetails.workType || 'Masonry & General Construction',
      workersNeeded: Number(labourDetails.workersNeeded) || 2,
      daysNeeded: Number(labourDetails.daysNeeded) || 3,
      startDate: labourDetails.startDate || new Date().toISOString().split('T')[0],
      siteLocation: `${customer.city}, ${customer.state || 'Karnataka'}`,
      estimatedCost: labourCost,
      status: 'Pending Assignment',
      notes: `Booked alongside Razorpay Order #${orderId}`
    });
  }

  const order = await Order.create({
    orderId,
    invoiceNumber,
    user: userId || null,
    customer,
    items: orderItems,
    materialCost,
    tax,
    deliveryCharge: calculatedDelivery,
    labourCost,
    discount: Number(discount || 0),
    totalAmount,
    couponApplied: couponApplied || '',
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    labourBookingId: labourBookingId || '',
    razorpayOrderId: razorpayOrderId || '',
    razorpayPaymentId: razorpayPaymentId || '',
    timeline: [
      {
        status: 'Confirmed',
        note: 'Order confirmed after successful Razorpay payment.',
        timestamp: new Date().toISOString()
      }
    ]
  });

  // Update product stock and inventory
  for (const item of orderItems) {
    if (item.productId) {
      try {
        const prod = await Product.findById(item.productId);
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
          await Product.updateOne({ _id: prod._id }, { stock: newStock });
          await Inventory.updateOne({ productId: String(prod._id) }, { currentStock: newStock });
        }
      } catch (stockErr) {
        console.warn(`[Inventory] Could not update stock for product ${item.productId}:`, stockErr.message);
      }
    }
  }

  // Admin notification
  await Notification.create({
    recipient: 'admin',
    title: 'New Razorpay Order Confirmed!',
    message: `Order #${orderId} placed by ${customer.name} for ₹${totalAmount.toLocaleString('en-IN')} via Razorpay`,
    type: 'order',
    referenceId: orderId,
    link: '/admin/orders'
  });

  // Send confirmation email (non-blocking)
  if (customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Order Confirmation - #${orderId} - BuildMart`,
      mailgenContent: {
        body: {
          name: customer.name,
          intro: `Your order #${orderId} has been confirmed. Payment received successfully via Razorpay.`,
          action: {
            instructions: `Total Amount: ₹${totalAmount.toLocaleString('en-IN')}. Payment Mode: Razorpay.`,
            button: {
              color: '#e05a00',
              text: 'View Your Orders',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'Thank you for choosing BuildMart for your construction materials procurement!'
        }
      }
    }).catch(err => console.warn('Razorpay order confirmation email skipped:', err.message));
  }

  return { orderId, invoiceNumber, order };
}

// ---------------------------------------------------------------------------
// Controller: createRazorpayOrder
// POST /api/payments/razorpay/create-order
// ---------------------------------------------------------------------------
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    discount = 0,
    couponApplied,
    deliveryCharge,
    labourDetails
  } = req.body;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart items cannot be empty.');
  }
  for (const item of items) {
    if (!item.name || item.price == null || item.quantity == null) {
      throw new ApiError(400, 'Each item must have name, price, and quantity.');
    }
  }

  // Server-side amount calculation
  const { materialCost, tax, calculatedDelivery, totalAmount, amountInPaise } =
    calculateOrderTotals(items, deliveryCharge, discount);

  if (amountInPaise < 100) {
    throw new ApiError(400, 'Order amount must be at least ₹1.');
  }

  // Create Razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });
  } catch (err) {
    console.error('[Razorpay] Failed to create order:', err.message);
    throw new ApiError(503, 'Payment gateway unavailable. Please try again later.');
  }

  // Persist Payment record
  const orderSummary = {
    materialCost,
    tax,
    delivery: calculatedDelivery,
    discount: Number(discount || 0),
    total: totalAmount
  };

  await Payment.create({
    user: req.user ? String(req.user._id) : null,
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    status: 'created',
    attempts: 0,
    webhookEventIds: [],
    orderSummary,
    // Store pending order data so we can create the Order after capture
    pendingOrderData: { customer, items, couponApplied, discount, deliveryCharge, labourDetails }
  });

  return res.status(201).json(
    new ApiResponse(201, {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      orderSummary
    }, 'Razorpay order created successfully.')
  );
});

// ---------------------------------------------------------------------------
// Controller: verifyRazorpayPayment
// POST /api/payments/razorpay/verify
// ---------------------------------------------------------------------------
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.');
  }

  // Find the Payment record
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    throw new ApiError(404, 'Payment record not found for this Razorpay order ID.');
  }

  // Idempotency — already captured
  if (payment.status === 'captured') {
    const existingOrder = payment.orderId
      ? (await Order.findById(payment.orderId) || await Order.findOne({ _id: payment.orderId }))
      : null;
    return res.status(200).json(
      new ApiResponse(200, {
        orderId: payment.internalOrderId,
        mongoOrderId: payment.orderId,
        order: existingOrder,
        alreadyProcessed: true
      }, 'Payment already verified and order already created.')
    );
  }

  // --- Verify HMAC signature ---
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  let signaturesMatch = false;
  try {
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const receivedBuf = Buffer.from(razorpay_signature, 'hex');
    signaturesMatch =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    signaturesMatch = false;
  }

  if (!signaturesMatch) {
    // Mark payment as failed
    await Payment.findByIdAndUpdate(payment._id, {
      status: 'failed',
      errorCode: 'SIGNATURE_MISMATCH',
      errorDescription: 'Razorpay signature verification failed.'
    }, { new: true });
    throw new ApiError(400, 'Payment signature verification failed. Payment not authorised.');
  }

  // --- Optionally confirm capture status via Razorpay API ---
  let razorpayPaymentDetails = null;
  try {
    razorpayPaymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (err) {
    // Network/API error — signature already verified cryptographically, proceed safely
    console.warn('[Razorpay] Could not fetch payment details, trusting signature:', err.message);
  }

  if (razorpayPaymentDetails && razorpayPaymentDetails.status === 'failed') {
    await Payment.findByIdAndUpdate(payment._id, {
      status: 'failed',
      razorpayPaymentId: razorpay_payment_id,
      errorCode: razorpayPaymentDetails.error_code || 'PAYMENT_FAILED',
      errorDescription: razorpayPaymentDetails.error_description || 'Payment failed on Razorpay.'
    }, { new: true });
    throw new ApiError(402, 'Payment failed on Razorpay. Please try again.');
  }

  // --- Payment is valid — build the order ---
  // Prefer fresh orderData from request; fall back to what we stored at order creation
  const resolvedOrderData = orderData || payment.pendingOrderData || {};

  const { materialCost, tax, calculatedDelivery, totalAmount } = calculateOrderTotals(
    resolvedOrderData.items || [],
    resolvedOrderData.deliveryCharge,
    resolvedOrderData.discount
  );

  const totalAmounts = { materialCost, tax, calculatedDelivery, totalAmount };

  const { orderId, invoiceNumber, order } = await createConfirmedOrder({
    orderData: resolvedOrderData,
    userId: req.user ? String(req.user._id || req.user.id) : (payment.user || null),
    totalAmounts,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id
  });

  // Update Payment record
  await Payment.findByIdAndUpdate(payment._id, {
    status: 'captured',
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    verifiedAt: new Date(),
    internalOrderId: orderId,
    orderId: String(order._id)
  }, { new: true });

  return res.status(201).json(
    new ApiResponse(201, {
      orderId,
      invoiceNumber,
      order
    }, 'Payment verified and order placed successfully!')
  );
});

// ---------------------------------------------------------------------------
// Controller: getPaymentStatus
// GET /api/payments/razorpay/status/:razorpayOrderId
// ---------------------------------------------------------------------------
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { razorpayOrderId } = req.params;

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    throw new ApiError(404, 'Payment record not found.');
  }

  let order = null;
  if (payment.orderId) {
    order = await Order.findById(payment.orderId) || await Order.findOne({ _id: payment.orderId });
  }

  return res.status(200).json(
    new ApiResponse(200, {
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      verifiedAt: payment.verifiedAt,
      internalOrderId: payment.internalOrderId,
      order
    }, 'Payment status fetched successfully.')
  );
});

// ---------------------------------------------------------------------------
// Controller: handleWebhook
// POST /api/webhooks/razorpay   (NO auth — raw body)
// ---------------------------------------------------------------------------
export const handleWebhook = async (req, res) => {
  // Always acknowledge receipt to prevent Razorpay retries, even on errors
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured. Skipping verification.');
    } else {
      const receivedSignature = req.headers['x-razorpay-signature'];
      if (!receivedSignature) {
        console.error('[Razorpay Webhook] Missing X-Razorpay-Signature header.');
        return res.status(200).json({ received: true, error: 'Missing signature' });
      }

      // req.body is a Buffer when express.raw() is used
      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      let sigValid = false;
      try {
        const expBuf = Buffer.from(expectedSig, 'hex');
        const recBuf = Buffer.from(receivedSignature, 'hex');
        sigValid = expBuf.length === recBuf.length && crypto.timingSafeEqual(expBuf, recBuf);
      } catch {
        sigValid = false;
      }

      if (!sigValid) {
        console.error('[Razorpay Webhook] Signature mismatch — ignoring event.');
        return res.status(200).json({ received: true, error: 'Signature mismatch' });
      }
    }

    // Parse the event payload
    const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    const event = payload.event;
    const eventId = payload.account_id + '_' + (payload.created_at || Date.now());
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};

    console.log(`[Razorpay Webhook] Event: ${event}, ID: ${eventId}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = entity.order_id || entity.id;
      const razorpayPaymentId = entity.id || entity.payment_id;

      if (!razorpayOrderId) {
        console.warn('[Razorpay Webhook] No order_id in payload.');
        return res.status(200).json({ received: true });
      }

      const payment = await Payment.findOne({ razorpayOrderId });
      if (!payment) {
        console.warn(`[Razorpay Webhook] No Payment record for Razorpay order: ${razorpayOrderId}`);
        return res.status(200).json({ received: true });
      }

      // Idempotency check
      const alreadyProcessed = (payment.webhookEventIds || []).includes(eventId);
      if (alreadyProcessed || payment.status === 'captured') {
        console.log(`[Razorpay Webhook] Event ${eventId} already processed.`);
        return res.status(200).json({ received: true, duplicate: true });
      }

      // Create order if not already created
      if (!payment.orderId && payment.pendingOrderData) {
        try {
          const resolvedOrderData = payment.pendingOrderData;
          const { materialCost, tax, calculatedDelivery, totalAmount } = calculateOrderTotals(
            resolvedOrderData.items || [],
            resolvedOrderData.deliveryCharge,
            resolvedOrderData.discount
          );
          const { orderId, order } = await createConfirmedOrder({
            orderData: resolvedOrderData,
            userId: payment.user || null,
            totalAmounts: { materialCost, tax, calculatedDelivery, totalAmount },
            razorpayOrderId,
            razorpayPaymentId
          });
          await Payment.findByIdAndUpdate(payment._id, {
            status: 'captured',
            razorpayPaymentId: razorpayPaymentId || payment.razorpayPaymentId,
            verifiedAt: new Date(),
            internalOrderId: orderId,
            orderId: String(order._id),
            webhookEventIds: [...(payment.webhookEventIds || []), eventId]
          }, { new: true });
        } catch (err) {
          console.error('[Razorpay Webhook] Error creating order from webhook:', err.message);
        }
      } else {
        // Order already created — just update status and append event ID
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'captured',
          razorpayPaymentId: razorpayPaymentId || payment.razorpayPaymentId,
          webhookEventIds: [...(payment.webhookEventIds || []), eventId]
        }, { new: true });
      }

    } else if (event === 'payment.failed') {
      const razorpayOrderId = entity.order_id;
      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment && ['created', 'authorized'].includes(payment.status)) {
          await Payment.findByIdAndUpdate(payment._id, {
            status: 'failed',
            razorpayPaymentId: entity.id || payment.razorpayPaymentId,
            errorCode: entity.error_code || 'PAYMENT_FAILED',
            errorDescription: entity.error_description || 'Payment failed.',
            webhookEventIds: [...(payment.webhookEventIds || []), eventId]
          }, { new: true });
        }
      }
    } else {
      console.log(`[Razorpay Webhook] Unhandled event type: ${event}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    // Always return 200 so Razorpay doesn't retry indefinitely
    console.error('[Razorpay Webhook] Unexpected error:', err.message, err.stack);
    return res.status(200).json({ received: true, error: 'Internal processing error' });
  }
};

// ---------------------------------------------------------------------------
// Admin: getPaymentTransactions
// GET /api/payments/admin/transactions
// ---------------------------------------------------------------------------
export const getPaymentTransactions = asyncHandler(async (req, res) => {
  const payments = await Payment.find({}).sort({ createdAt: -1 });

  // Enrich with order info where available
  const enriched = await Promise.all(
    payments.map(async (p) => {
      let order = null;
      if (p.orderId) {
        order = await Order.findById(p.orderId).catch(() => null);
      }
      return { ...p, order };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, enriched, 'Payment transactions fetched successfully.')
  );
});

// ---------------------------------------------------------------------------
// Admin: getPaymentStats
// GET /api/payments/admin/stats
// ---------------------------------------------------------------------------
export const getPaymentStats = asyncHandler(async (req, res) => {
  const payments = await Payment.find({});

  const stats = {
    total: payments.length,
    totalAmountPaise: 0,
    captured: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    created: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
    partially_refunded: { count: 0, amount: 0 }
  };

  for (const p of payments) {
    const amt = Number(p.amount) || 0;
    stats.totalAmountPaise += amt;
    const bucket = stats[p.status];
    if (bucket) {
      bucket.count += 1;
      bucket.amount += amt;
    }
  }

  // Convert paise to rupees for readability
  const toRupees = (paise) => Math.round(paise) / 100;

  return res.status(200).json(
    new ApiResponse(200, {
      total: stats.total,
      totalAmountRupees: toRupees(stats.totalAmountPaise),
      captured: { count: stats.captured.count, amountRupees: toRupees(stats.captured.amount) },
      failed: { count: stats.failed.count, amountRupees: toRupees(stats.failed.amount) },
      created: { count: stats.created.count, amountRupees: toRupees(stats.created.amount) },
      refunded: { count: stats.refunded.count, amountRupees: toRupees(stats.refunded.amount) },
      partially_refunded: { count: stats.partially_refunded.count, amountRupees: toRupees(stats.partially_refunded.amount) }
    }, 'Payment statistics fetched successfully.')
  );
});

// ---------------------------------------------------------------------------
// Admin: refundPayment
// POST /api/payments/admin/refund
// ---------------------------------------------------------------------------
export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId, amount, reason } = req.body;
  if (!paymentId) {
    throw new ApiError(400, 'paymentId is required.');
  }

  const payment = await Payment.findById(paymentId) || await Payment.findOne({ razorpayPaymentId: paymentId });
  if (!payment) {
    throw new ApiError(404, 'Payment record not found.');
  }

  if (payment.status !== 'captured' && payment.status !== 'partially_refunded') {
    throw new ApiError(400, `Cannot refund a payment with status "${payment.status}".`);
  }

  const refundAmountPaise = amount ? Math.round(Number(amount) * 100) : payment.amount;
  if (refundAmountPaise <= 0 || refundAmountPaise > payment.amount) {
    throw new ApiError(400, 'Invalid refund amount.');
  }

  let razorpayRefund = null;
  try {
    razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmountPaise,
      notes: { reason: reason || 'Admin initiated refund' }
    });
  } catch (err) {
    const errMsg = err?.error?.description || err?.description || err?.message || 'Gateway rejection';
    console.error('[Razorpay] Refund failed:', errMsg);
    throw new ApiError(502, `Razorpay refund failed: ${errMsg}`);
  }

  const isFullRefund = refundAmountPaise >= payment.amount;
  const newStatus = isFullRefund ? 'refunded' : 'partially_refunded';

  const updatedPayment = await Payment.findByIdAndUpdate(payment._id, {
    status: newStatus,
    refundId: razorpayRefund.id,
    refundAmount: refundAmountPaise,
    refundStatus: razorpayRefund.status || 'processed'
  }, { new: true });

  if (payment.orderId) {
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: isFullRefund ? 'Refunded' : 'Partially Refunded'
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { payment: updatedPayment, refund: razorpayRefund }, 'Refund processed successfully.')
  );
});
