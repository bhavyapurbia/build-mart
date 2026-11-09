import { createUnifiedModel } from './dbAdapter.js';

const Payment = createUnifiedModel('Payment', {
  // Our internal order reference (BM-ORD-xxx) generated at Razorpay order creation time
  internalOrderId: { type: String },

  // MongoDB _id of the Order document (set after order is created on payment capture)
  orderId: { type: String },

  // userId — optional, null for guests
  user: { type: String, default: null },

  // Razorpay identifiers
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  // Amount in paise (smallest currency unit)
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  // Lifecycle status
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
    default: 'created'
  },

  // Number of payment attempts made against this Razorpay order
  attempts: { type: Number, default: 0 },

  // Webhook event IDs already processed — for idempotency
  webhookEventIds: { type: Array, default: [] },

  // Timestamps
  verifiedAt: { type: Date, default: null },

  // Refund details
  refundId: { type: String, default: null },
  refundAmount: { type: Number, default: null },
  refundStatus: { type: String, default: null },

  // Error details when payment fails
  errorCode: { type: String, default: null },
  errorDescription: { type: String, default: null },

  // Snapshot of the order summary at the time Razorpay order was created
  orderSummary: {
    materialCost: { type: Number },
    tax: { type: Number },
    delivery: { type: Number },
    discount: { type: Number },
    total: { type: Number }
  },

  // Raw customer + item data passed in at order creation — used when creating the Order after capture
  pendingOrderData: { type: Object, default: null }
});

export default Payment;
export { Payment };
