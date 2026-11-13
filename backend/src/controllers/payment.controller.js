import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { razorpay, RAZORPAY_KEY_ID } from '../utils/razorpay.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import StockReservation from '../models/StockReservation.js';
import WebhookEvent from '../models/WebhookEvent.js';
import Notification from '../models/Notification.js';
import { computePricing } from '../services/pricing.service.js';
import { createOrderRecord, restoreStock } from '../services/order.service.js';
import { generateReceiptNumber } from '../utils/counter.js';
import { assertOwnerOrAdmin } from '../middleware/auth.middleware.js';

/**
 * Initiates Razorpay payment with server-authoritative pricing and 15-minute stock reservation.
 * POST /api/payments/razorpay/create-order
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    couponApplied,
    quotationId,
    labourDetails
  } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
    throw new ApiError(400, 'Customer name, phone, address, city, and pincode are required.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart items cannot be empty.');
  }

  let quotationDoc = null;
  if (quotationId) {
    quotationDoc = await Quotation.findOne({ quotationId }).lean();
    if (!quotationDoc) throw new ApiError(404, `Quotation #${quotationId} not found.`);
    if (quotationDoc.status !== 'Accepted') throw new ApiError(400, 'Quotation must be accepted before payment.');
    if (quotationDoc.validUntil && new Date(quotationDoc.validUntil) < new Date()) {
      throw new ApiError(400, 'Quotation has expired.');
    }
  }

  // 1. Calculate pricing strictly on server
  const pricing = await computePricing({
    items,
    couponCode: couponApplied,
    shipping: { state: customer.state || 'Karnataka', pincode: customer.pincode },
    userId: req.user ? String(req.user._id) : null,
    quotation: quotationDoc
  });

  if (pricing.totalPaise < 100) {
    throw new ApiError(400, 'Total order amount must be at least ₹1.00.');
  }

  const receipt = await generateReceiptNumber();

  // 2. Create Razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: pricing.totalPaise,
      currency: 'INR',
      receipt,
      notes: {
        customerEmail: customer.email || '',
        customerPhone: customer.phone,
        quotationId: quotationId || ''
      }
    });
  } catch (err) {
    console.error('[Razorpay] Order creation failed:', err.message);
    throw new ApiError(503, 'Payment gateway is currently unavailable. Please try again.');
  }

  const reservedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins reservation

  // 3. Create StockReservation
  await StockReservation.create({
    reservationId: `RES-${Date.now()}`,
    razorpayOrderId: razorpayOrder.id,
    user: req.user ? String(req.user._id) : null,
    items: pricing.lines.map(l => ({ productId: l.productId, quantity: l.quantity })),
    status: 'active',
    expiresAt: reservedUntil
  });

  // 4. Persist Payment record with server-authoritative snapshots
  const payment = await Payment.create({
    user: req.user ? String(req.user._id) : null,
    razorpayOrderId: razorpayOrder.id,
    amount: pricing.totalPaise,
    currency: 'INR',
    status: 'created',
    reservedUntil,
    pricingSnapshot: {
      materialCost: pricing.subtotal,
      discount: pricing.discount,
      tax: pricing.tax,
      taxBreakup: pricing.taxBreakup,
      delivery: pricing.delivery,
      labour: pricing.labour,
      total: pricing.total,
      totalPaise: pricing.totalPaise
    },
    itemsSnapshot: pricing.lines.map(l => ({
      productId: l.productId,
      name: l.name,
      brand: l.brand,
      image: l.image,
      quantity: l.quantity,
      unit: l.unit,
      price: l.price,
      gstRate: l.gstRate,
      hsnCode: l.hsnCode,
      discountAllocation: l.discountAllocation,
      tax: l.tax,
      total: l.total
    })),
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      city: customer.city,
      state: customer.state || 'Karnataka',
      pincode: customer.pincode,
      deliveryInstructions: customer.deliveryInstructions || ''
    },
    couponApplied: pricing.appliedCouponCode || '',
    quotationId: quotationId || '',
    labourDetails: labourDetails || null
  });

  return res.status(201).json(
    new ApiResponse(201, {
      razorpayOrderId: razorpayOrder.id,
      amount: pricing.totalPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      pricing: {
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        tax: pricing.tax,
        delivery: pricing.delivery,
        total: pricing.total
      }
    }, 'Razorpay payment order initialized.')
  );
});

/**
 * Shared order settlement function after verified capture.
 * Used by BOTH verifyRazorpayPayment AND handleWebhook for perfect consistency.
 */
export async function settleCapturedPayment(payment, razorpayPaymentId, razorpaySignature = null) {
  // Atomically claim payment processing
  const claimed = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $in: ['created', 'authorized'] } },
    { status: 'processing', razorpayPaymentId, razorpaySignature },
    { new: true }
  );

  if (!claimed) {
    // Payment was already claimed/processed concurrently
    const existingOrder = payment.orderId ? await Order.findById(payment.orderId).lean() : null;
    return { alreadyProcessed: true, order: existingOrder, orderId: payment.internalOrderId };
  }

  try {
    const pricing = {
      lines: claimed.itemsSnapshot,
      subtotal: claimed.pricingSnapshot.materialCost,
      tax: claimed.pricingSnapshot.tax,
      taxBreakup: claimed.pricingSnapshot.taxBreakup,
      delivery: claimed.pricingSnapshot.delivery,
      labour: claimed.pricingSnapshot.labour,
      discount: claimed.pricingSnapshot.discount,
      total: claimed.pricingSnapshot.total,
      appliedCouponCode: claimed.couponApplied
    };

    const order = await createOrderRecord({
      customer: claimed.customer,
      pricing,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      userId: claimed.user,
      quotationId: claimed.quotationId,
      labourDetails: claimed.labourDetails,
      razorpayOrderId: claimed.razorpayOrderId,
      razorpayPaymentId
    });

    // Mark stock reservation confirmed
    await StockReservation.updateOne(
      { razorpayOrderId: claimed.razorpayOrderId },
      { status: 'confirmed' }
    );

    // Finalize payment record
    await Payment.findByIdAndUpdate(claimed._id, {
      status: 'captured',
      orderId: String(order._id),
      internalOrderId: order.orderId,
      verifiedAt: new Date()
    });

    return { success: true, order, orderId: order.orderId };
  } catch (err) {
    console.error(`[Payment Settle Error] Payment ${claimed._id} captured on gateway but order creation failed:`, err);

    const supportRef = `SUP-${Date.now().toString().slice(-6)}`;
    await Payment.findByIdAndUpdate(claimed._id, {
      status: 'needs_attention',
      supportReference: supportRef,
      errorDescription: err.message
    });

    // Alert admin immediately
    await Notification.create({
      recipient: 'admin',
      title: 'CRITICAL: Captured Payment Requires Manual Order Creation',
      message: `Payment ${razorpayPaymentId} captured for ₹${(claimed.amount / 100).toFixed(2)} but order failed: ${err.message}. Ref: ${supportRef}`,
      type: 'order',
      referenceId: supportRef,
      link: '/admin/payments'
    });

    return {
      needsAttention: true,
      supportReference: supportRef,
      message: 'Payment captured on gateway but internal order creation encountered a technical error. Our team has been alerted.'
    };
  }
}

/**
 * Verifies Razorpay payment signature and completes order creation.
 * Crucial: completely IGNORES any client-sent orderData!
 * POST /api/payments/razorpay/verify
 */
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.');
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    throw new ApiError(404, 'Payment record not found for this Razorpay order ID.');
  }

  // Idempotency: already captured
  if (payment.status === 'captured') {
    const existingOrder = payment.orderId ? await Order.findById(payment.orderId).lean() : null;
    return res.status(200).json(
      new ApiResponse(200, {
        orderId: payment.internalOrderId,
        order: existingOrder,
        alreadyProcessed: true
      }, 'Payment already verified and order confirmed.')
    );
  }

  // Verify HMAC signature
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'hex');
  const receivedBuf = Buffer.from(razorpay_signature, 'hex');

  const signaturesMatch =
    expectedBuf.length === receivedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, receivedBuf);

  if (!signaturesMatch) {
    await Payment.findByIdAndUpdate(payment._id, {
      status: 'failed',
      errorCode: 'SIGNATURE_MISMATCH',
      errorDescription: 'Cryptographic signature mismatch.'
    });
    throw new ApiError(400, 'Payment signature verification failed. Payment not authorized.');
  }

  // Fetch gateway status from Razorpay API to verify amount & capture
  try {
    const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (rzpPayment) {
      if (rzpPayment.amount !== payment.amount) {
        throw new ApiError(400, `Payment amount mismatch. Gateway received ${rzpPayment.amount}, expected ${payment.amount}.`);
      }
      if (rzpPayment.order_id !== razorpay_order_id) {
        throw new ApiError(400, 'Payment gateway order ID mismatch.');
      }
      if (rzpPayment.status === 'failed') {
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'failed',
          errorCode: rzpPayment.error_code || 'PAYMENT_FAILED',
          errorDescription: rzpPayment.error_description || 'Payment rejected by gateway.'
        });
        throw new ApiError(402, 'Payment was declined by your bank or payment provider.');
      }
    }
  } catch (fetchErr) {
    if (fetchErr instanceof ApiError) throw fetchErr;
    console.warn('[Razorpay] Could not verify with Razorpay fetch API, relying on valid signature:', fetchErr.message);
  }

  // Settle the payment and create the order using server snapshots
  const settlementResult = await settleCapturedPayment(payment, razorpay_payment_id, razorpay_signature);

  if (settlementResult.needsAttention) {
    return res.status(202).json(
      new ApiResponse(202, {
        supportReference: settlementResult.supportReference,
        status: 'needs_attention'
      }, settlementResult.message)
    );
  }

  return res.status(201).json(
    new ApiResponse(201, {
      orderId: settlementResult.orderId,
      order: settlementResult.order
    }, 'Payment verified and order placed successfully!')
  );
});

/**
 * Razorpay Webhook Handler
 * POST /api/webhooks/razorpay
 */
export const handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (process.env.NODE_ENV === 'production' && !webhookSecret) {
    console.error('[Razorpay Webhook] CRITICAL: RAZORPAY_WEBHOOK_SECRET is not configured in production.');
    return res.status(500).json({ error: 'Webhook secret not configured.' });
  }

  const receivedSignature = req.headers['x-razorpay-signature'];
  if (!receivedSignature) {
    return res.status(401).json({ error: 'Missing x-razorpay-signature header' });
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret || 'dev_webhook_secret_do_not_use_in_prod')
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
    console.warn('[Razorpay Webhook] Invalid webhook signature received.');
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
  const event = payload.event;
  const eventId = req.headers['x-razorpay-event-id'] || `ev_${payload.created_at || Date.now()}`;
  const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};

  // Idempotency: verify via WebhookEvent collection
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  await WebhookEvent.create({ eventId, eventType: event, payload });

  try {
    if (event === 'payment.captured' || event === 'order.paid') {
      const razorpayOrderId = entity.order_id || entity.id;
      const razorpayPaymentId = entity.id || entity.payment_id;

      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment && payment.status !== 'captured') {
          await settleCapturedPayment(payment, razorpayPaymentId);
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = entity.order_id;
      if (razorpayOrderId) {
        await Payment.updateOne(
          { razorpayOrderId, status: { $in: ['created', 'authorized'] } },
          {
            status: 'failed',
            errorCode: entity.error_code || 'FAILED',
            errorDescription: entity.error_description || 'Payment failed.'
          }
        );
      }
    } else if (event === 'refund.processed') {
      const razorpayPaymentId = entity.payment_id;
      if (razorpayPaymentId) {
        const payment = await Payment.findOne({ razorpayPaymentId });
        if (payment) {
          const refundAmt = Number(entity.amount) || 0;
          const newRefunded = (payment.refundedAmount || 0) + refundAmt;
          const isFull = newRefunded >= payment.amount;

          await Payment.updateOne(
            { _id: payment._id },
            {
              status: isFull ? 'refunded' : 'partially_refunded',
              refundedAmount: newRefunded,
              $push: {
                refunds: {
                  refundId: entity.id,
                  amount: refundAmt,
                  status: 'processed',
                  createdAt: new Date()
                }
              }
            }
          );
        }
      }
    }
    return res.status(200).json({ received: true });
  } catch (hookErr) {
    console.error('[Razorpay Webhook Error]:', hookErr);
    return res.status(500).json({ error: 'Webhook processing error.' });
  }
};

/**
 * Customer / Admin: Check status of a payment.
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { razorpayOrderId } = req.params;
  const payment = await Payment.findOne({ razorpayOrderId }).lean();

  if (!payment) {
    throw new ApiError(404, 'Payment record not found.');
  }

  // If authenticated customer, verify ownership
  if (req.user && payment.user) {
    assertOwnerOrAdmin(payment.user, req.user);
  }

  let order = null;
  if (payment.orderId) {
    order = await Order.findById(payment.orderId).lean();
  }

  return res.status(200).json(
    new ApiResponse(200, {
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      status: payment.status,
      amountRupees: (payment.amount / 100).toFixed(2),
      currency: payment.currency,
      verifiedAt: payment.verifiedAt,
      internalOrderId: payment.internalOrderId,
      order
    }, 'Payment status retrieved.')
  );
});

/**
 * Admin: List transactions with pagination and search.
 */
export const getPaymentTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Payment transactions retrieved.')
  );
});

/**
 * Admin: Get aggregated payment statistics.
 */
export const getPaymentStats = asyncHandler(async (req, res) => {
  const payments = await Payment.find().lean();

  const stats = {
    totalTransactions: payments.length,
    captured: { count: 0, amountRupees: 0 },
    failed: { count: 0, amountRupees: 0 },
    created: { count: 0, amountRupees: 0 },
    refunded: { count: 0, amountRupees: 0 },
    needs_attention: { count: 0, amountRupees: 0 }
  };

  for (const p of payments) {
    const amtRupees = (Number(p.amount) || 0) / 100;
    if (stats[p.status]) {
      stats[p.status].count++;
      stats[p.status].amountRupees += amtRupees;
    }
  }

  // Format decimals
  for (const k of Object.keys(stats)) {
    if (typeof stats[k] === 'object' && 'amountRupees' in stats[k]) {
      stats[k].amountRupees = Number(stats[k].amountRupees.toFixed(2));
    }
  }

  return res.status(200).json(
    new ApiResponse(200, stats, 'Payment statistics retrieved.')
  );
});

/**
 * Admin: Process partial or full refund through Razorpay.
 */
export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId, amount, reason } = req.body;
  if (!paymentId) throw new ApiError(400, 'paymentId is required.');

  const payment = await Payment.findOne({
    $or: [{ _id: paymentId.length === 24 ? paymentId : undefined }, { razorpayPaymentId: paymentId }]
  });

  if (!payment) throw new ApiError(404, 'Payment record not found.');
  if (!['captured', 'partially_refunded'].includes(payment.status)) {
    throw new ApiError(400, `Cannot refund payment with status "${payment.status}".`);
  }

  const alreadyRefundedPaise = payment.refundedAmount || 0;
  const maxAvailablePaise = payment.amount - alreadyRefundedPaise;

  const requestedRefundPaise = amount ? Math.round(Number(amount) * 100) : maxAvailablePaise;
  if (requestedRefundPaise <= 0 || requestedRefundPaise > maxAvailablePaise) {
    throw new ApiError(400, `Refund amount cannot exceed remaining capture amount of ₹${(maxAvailablePaise / 100).toFixed(2)}.`);
  }

  let gatewayRefund;
  try {
    gatewayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: requestedRefundPaise,
      notes: { reason: reason || 'Admin refund' }
    });
  } catch (err) {
    console.error('[Razorpay Refund Error]:', err.message);
    throw new ApiError(502, `Razorpay refund failed: ${err.message}`);
  }

  const newTotalRefundedPaise = alreadyRefundedPaise + requestedRefundPaise;
  const isFullRefund = newTotalRefundedPaise >= payment.amount;
  const newStatus = isFullRefund ? 'refunded' : 'partially_refunded';

  const updatedPayment = await Payment.findByIdAndUpdate(
    payment._id,
    {
      status: newStatus,
      refundedAmount: newTotalRefundedPaise,
      $push: {
        refunds: {
          refundId: gatewayRefund.id,
          amount: requestedRefundPaise,
          status: gatewayRefund.status || 'processed',
          reason: reason || 'Admin refund',
          createdAt: new Date()
        }
      }
    },
    { new: true }
  ).lean();

  if (payment.orderId) {
    const orderUpdate = {
      paymentStatus: isFullRefund ? 'Refunded' : 'Partially Refunded'
    };
    if (isFullRefund) {
      orderUpdate.orderStatus = 'Cancelled';
      const ord = await Order.findById(payment.orderId);
      if (ord) {
        await restoreStock(ord.items, ord.orderId, 'Full payment refunded');
      }
    }
    await Order.findByIdAndUpdate(payment.orderId, orderUpdate);
  }

  return res.status(200).json(
    new ApiResponse(200, { payment: updatedPayment, refund: gatewayRefund }, 'Refund processed successfully.')
  );
});

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  getPaymentStatus,
  getPaymentTransactions,
  getPaymentStats,
  refundPayment
};
