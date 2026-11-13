import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import CouponRedemption from '../models/CouponRedemption.js';
import Quotation from '../models/Quotation.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Notification from '../models/Notification.js';
import { generateOrderId, generateInvoiceNumber } from '../utils/counter.js';
import { createFromOrder } from './labour.service.js';
import { sendEmail } from '../utils/Email.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Atomically decrements stock for an array of items.
 * If any product has insufficient stock, performs compensating rollbacks for already-decremented lines
 * and throws 409 with the failing SKU/product details.
 */
export async function atomicDecrementStock(items, orderId) {
  const decrementedLines = [];

  for (const item of items) {
    const pId = String(item.productId || item._id);
    const qty = Number(item.quantity);

    // Atomically decrement stock if stock >= qty
    const updateResult = await Product.updateOne(
      { _id: pId, stock: { $gte: qty } },
      { $inc: { stock: -qty } }
    );

    if (updateResult.modifiedCount === 0) {
      // Rollback previously decremented items
      for (const rolled of decrementedLines) {
        await Product.updateOne({ _id: rolled.pId }, { $inc: { stock: rolled.qty } });
      }
      const prod = await Product.findById(pId).lean();
      throw new ApiError(
        409,
        `Out of stock during checkout: "${item.name || prod?.name || pId}" (SKU: ${prod?.sku || 'N/A'}). Requested: ${qty}, available: ${prod?.stock ?? 0}.`
      );
    }

    decrementedLines.push({ pId, qty, name: item.name });

    // Update inventory record and record history
    try {
      const inv = await Inventory.findOne({ productId: pId });
      const currentStock = Math.max(0, (inv?.currentStock ?? 0) - qty);
      await Inventory.updateOne(
        { productId: pId },
        {
          $inc: { currentStock: -qty },
          $push: {
            history: {
              change: -qty,
              reason: `Order #${orderId} fulfilled`,
              timestamp: new Date().toISOString(),
              updatedBy: 'Order System'
            }
          }
        }
      );

      // Check reorder point (B19)
      const reorderPoint = inv?.reorderPoint ?? 15;
      if (currentStock <= reorderPoint) {
        await Notification.create({
          recipient: 'admin',
          title: 'Low Stock Alert',
          message: `Product "${item.name}" (SKU: ${inv?.sku || 'N/A'}) has fallen below reorder point (${currentStock} left).`,
          type: 'stock',
          referenceId: pId,
          link: '/admin/inventory'
        });
      }
    } catch (invErr) {
      console.warn(`[Inventory] Could not log inventory history for product ${pId}:`, invErr.message);
    }
  }

  return true;
}

/**
 * Restores stock when an order is cancelled.
 */
export async function restoreStock(items, orderId, reason = 'Order cancelled') {
  for (const item of items) {
    const pId = String(item.productId || item._id);
    const qty = Number(item.quantity);
    if (!pId || !qty) continue;

    await Product.updateOne({ _id: pId }, { $inc: { stock: qty } });
    await Inventory.updateOne(
      { productId: pId },
      {
        $inc: { currentStock: qty },
        $push: {
          history: {
            change: qty,
            reason: `Order #${orderId} returned to stock: ${reason}`,
            timestamp: new Date().toISOString(),
            updatedBy: 'System Cancellation'
          }
        }
      }
    );
  }
}

/**
 * Core order creation engine used by both direct orders (COD/Transfer) and online verified payments (Razorpay/Webhook).
 */
export async function createOrderRecord({
  customer,
  pricing,
  paymentMethod,
  paymentStatus = 'Pending',
  userId = null,
  quotationId = null,
  labourDetails = null,
  razorpayOrderId = null,
  razorpayPaymentId = null
}) {
  const orderId = await generateOrderId();
  const invoiceNumber = await generateInvoiceNumber();

  // Atomically decrement stock
  await atomicDecrementStock(pricing.lines, orderId);

  // If a coupon was applied, record redemption and increment usage atomically
  if (pricing.appliedCouponCode) {
    await Coupon.updateOne(
      { code: pricing.appliedCouponCode },
      { $inc: { usageCount: 1 } }
    );
    if (userId) {
      await CouponRedemption.create({
        code: pricing.appliedCouponCode,
        user: String(userId),
        orderId,
        discountAmount: pricing.discount,
        redeemedAt: new Date()
      });
    }
  }

  // Create Order document
  const order = await Order.create({
    orderId,
    invoiceNumber,
    user: userId ? String(userId) : null,
    customer,
    items: pricing.lines.map(l => ({
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
    materialCost: pricing.subtotal,
    tax: pricing.tax,
    taxBreakup: pricing.taxBreakup,
    deliveryCharge: pricing.delivery,
    labourCost: pricing.labour,
    discount: pricing.discount,
    totalAmount: pricing.total,
    couponApplied: pricing.appliedCouponCode || '',
    paymentMethod,
    paymentStatus,
    razorpayOrderId: razorpayOrderId || '',
    razorpayPaymentId: razorpayPaymentId || '',
    orderStatus: 'Confirmed',
    quotationId: quotationId || '',
    timeline: [
      {
        status: 'Confirmed',
        note: `Order confirmed via ${paymentMethod}. Preparing materials for dispatch.`,
        timestamp: new Date().toISOString()
      }
    ]
  });

  // Handle associated labour service if requested
  if (labourDetails && (labourDetails.hasLabour || labourDetails.labourType)) {
    const labourBookingId = await createFromOrder(order, labourDetails);
    if (labourBookingId) {
      await Order.updateOne({ _id: order._id }, { labourBookingId });
      order.labourBookingId = labourBookingId;
    }
  }

  // If order was converted from a quotation, transition quotation & material request
  if (quotationId) {
    const quo = await Quotation.findOne({ quotationId });
    if (quo) {
      await Quotation.updateOne(
        { _id: quo._id },
        { status: 'Converted to Order', orderId }
      );
      if (quo.requestId) {
        await MaterialRequest.updateOne(
          { $or: [{ requestId: quo.requestId }, { _id: quo.requestId.length === 24 ? quo.requestId : undefined }] },
          { status: 'Converted to Order' }
        );
      }
    }
  }

  // Admin notification
  await Notification.create({
    recipient: 'admin',
    title: 'New Confirmed Order Placed!',
    message: `Order #${orderId} placed by ${customer.name} for ₹${pricing.total.toLocaleString('en-IN')} (${paymentMethod})`,
    type: 'order',
    referenceId: orderId,
    link: '/admin/orders'
  });

  // Customer email (non-blocking)
  if (customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Order Confirmation - #${orderId} - BuildMart`,
      mailgenContent: {
        body: {
          name: customer.name,
          intro: `Your order #${orderId} has been confirmed.`,
          action: {
            instructions: `Total Payable: ₹${pricing.total.toLocaleString('en-IN')}. Payment Mode: ${paymentMethod}.`,
            button: {
              color: '#d97706',
              text: 'View Your Orders',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'Thank you for choosing BuildMart for your construction materials procurement!'
        }
      }
    }).catch(err => console.warn('[Email] Order confirmation email delivery skipped:', err.message));
  }

  return order;
}

export default {
  atomicDecrementStock,
  restoreStock,
  createOrderRecord
};

