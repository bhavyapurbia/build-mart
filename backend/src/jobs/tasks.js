import StockReservation from '../models/StockReservation.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Quotation from '../models/Quotation.js';
import Notification from '../models/Notification.js';
import { NOTIFICATION_RECIPIENT, NOTIFICATION_TYPE, PAYMENT_GATEWAY_STATUS, QUOTATION_STATUS } from '../constants/enums.js';

/**
 * Sweeps and releases expired stock reservations.
 * Restores product stock and inventory records atomically.
 */
export const releaseStockReservations = async () => {
  const now = new Date();
  const expiredReservations = await StockReservation.find({
    status: 'active',
    expiresAt: { $lt: now }
  });

  if (expiredReservations.length === 0) return 0;

  let releasedCount = 0;
  for (const reservation of expiredReservations) {
    for (const item of reservation.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      await Inventory.updateOne(
        { productId: String(item.productId) },
        {
          $inc: { currentStock: item.quantity },
          $push: {
            history: {
              change: item.quantity,
              reason: `Reservation ${reservation.reservationId} expired`,
              timestamp: now,
              updatedBy: 'system-worker'
            }
          }
        }
      );
    }
    reservation.status = 'expired';
    await reservation.save();
    releasedCount++;
  }

  console.log(`[Worker] Released ${releasedCount} expired stock reservation(s).`);
  return releasedCount;
};

/**
 * Sweeps abandoned/stale payments older than 1 hour.
 * Sets status to expired and cleans up pending data.
 */
export const cleanupStalePayments = async () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const stalePayments = await Payment.find({
    status: PAYMENT_GATEWAY_STATUS.CREATED,
    createdAt: { $lt: oneHourAgo }
  });

  if (stalePayments.length === 0) return 0;

  let expiredCount = 0;
  for (const payment of stalePayments) {
    payment.status = PAYMENT_GATEWAY_STATUS.EXPIRED;
    await payment.save();

    // Release any associated reservations
    if (payment.razorpayOrderId) {
      await StockReservation.updateMany(
        { razorpayOrderId: payment.razorpayOrderId, status: 'active' },
        { status: 'expired' }
      );
    }
    expiredCount++;
  }

  console.log(`[Worker] Marked ${expiredCount} stale payment(s) as expired.`);
  return expiredCount;
};

/**
 * Sweeps sent quotations past their validity window.
 * Updates status to 'Expired'.
 */
export const sweepExpiredQuotations = async () => {
  const now = new Date();
  const result = await Quotation.updateMany(
    {
      status: QUOTATION_STATUS.SENT,
      validUntil: { $lt: now }
    },
    {
      status: QUOTATION_STATUS.EXPIRED
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`[Worker] Expired ${result.modifiedCount} quotation(s) past validUntil.`);
  }
  return result.modifiedCount;
};

/**
 * Checks for low stock products and creates admin digest notification.
 */
export const checkLowStockDigest = async () => {
  const lowStockProducts = await Product.find({
    isActive: true,
    deletedAt: null,
    stock: { $lte: 15 }
  }).select('name sku stock unit').limit(20).lean();

  if (lowStockProducts.length === 0) return;

  const title = `⚠️ Low Stock Alert: ${lowStockProducts.length} product(s)`;
  const message = `Critical stock alert for: ${lowStockProducts.map(p => `${p.name} (${p.stock} ${p.unit})`).slice(0, 3).join(', ')}${lowStockProducts.length > 3 ? '...' : ''}`;

  // Only create if not created in the last 6 hours to avoid spam
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const existing = await Notification.findOne({
    recipient: NOTIFICATION_RECIPIENT.ADMIN,
    type: NOTIFICATION_TYPE.STOCK,
    createdAt: { $gte: sixHoursAgo }
  });

  if (!existing) {
    await Notification.create({
      recipient: NOTIFICATION_RECIPIENT.ADMIN,
      title,
      message,
      type: NOTIFICATION_TYPE.STOCK,
      link: '/admin/inventory'
    });
    console.log(`[Worker] Created low stock notification for ${lowStockProducts.length} items.`);
  }
};

export default {
  releaseStockReservations,
  cleanupStalePayments,
  sweepExpiredQuotations,
  checkLowStockDigest
};

