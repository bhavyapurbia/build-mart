import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../constants/enums.js';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, trim: true },
  invoiceNumber: { type: String, unique: true, sparse: true, trim: true },
  user: { type: String, default: null },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: 'Karnataka', trim: true },
    pincode: { type: String, required: true, trim: true },
    deliveryInstructions: { type: String, trim: true }
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'Piece' },
    price: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, default: 18 },
    hsnCode: { type: String, default: '2523' },
    discountAllocation: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  materialCost: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  taxBreakup: {
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 }
  },
  deliveryCharge: { type: Number, default: 0, min: 0 },
  labourCost: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  couponApplied: { type: String, default: '' },
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHOD),
    default: PAYMENT_METHOD.COD
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  razorpayOrderId: { type: String, unique: true, sparse: true, default: null },
  razorpayPaymentId: { type: String, sparse: true, default: null },
  orderStatus: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.CONFIRMED
  },
  quotationId: { type: String, default: '' },
  labourBookingId: { type: String, default: '' },
  timeline: [{
    status: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  minimize: false
});

// Compound & query indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
export { Order };
