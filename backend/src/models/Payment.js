import mongoose from 'mongoose';
import { PAYMENT_GATEWAY_STATUS } from '../constants/enums.js';

const paymentSchema = new mongoose.Schema({
  internalOrderId: { type: String, default: null },
  orderId: { type: String, default: null },
  user: { type: String, default: null },

  razorpayOrderId: { type: String, required: true, unique: true, trim: true },
  razorpayPaymentId: { type: String, default: null, trim: true },
  razorpaySignature: { type: String, default: null },

  amount: { type: Number, required: true, min: 0 }, // in paise
  currency: { type: String, default: 'INR', uppercase: true },

  status: {
    type: String,
    enum: Object.values(PAYMENT_GATEWAY_STATUS),
    default: PAYMENT_GATEWAY_STATUS.CREATED
  },

  attempts: { type: Number, default: 0 },
  webhookEventIds: [{ type: String }],
  verifiedAt: { type: Date, default: null },
  reservedUntil: { type: Date, default: null },

  // Refunds tracking
  refundedAmount: { type: Number, default: 0, min: 0 }, // in paise
  refunds: [{
    refundId: { type: String, required: true },
    amount: { type: Number, required: true }, // in paise
    status: { type: String, default: 'processed' },
    reason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],

  errorCode: { type: String, default: null },
  errorDescription: { type: String, default: null },
  supportReference: { type: String, default: null },

  // Server-authoritative snapshots taken at payment creation
  pricingSnapshot: {
    materialCost: Number,
    discount: Number,
    tax: Number,
    taxBreakup: {
      cgst: Number,
      sgst: Number,
      igst: Number
    },
    delivery: Number,
    labour: Number,
    total: Number,
    totalPaise: Number
  },
  itemsSnapshot: [{
    productId: String,
    name: String,
    brand: String,
    image: String,
    quantity: Number,
    unit: String,
    price: Number,
    gstRate: Number,
    hsnCode: String,
    discountAllocation: Number,
    tax: Number,
    total: Number
  }],

  customer: {
    name: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    deliveryInstructions: String
  },
  couponApplied: { type: String, default: '' },
  quotationId: { type: String, default: '' },
  labourDetails: { type: mongoose.Schema.Types.Mixed, default: null }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C indexes
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
export { Payment };
