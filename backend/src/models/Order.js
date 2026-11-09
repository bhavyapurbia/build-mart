import { createUnifiedModel } from './dbAdapter.js';

const Order = createUnifiedModel('Order', {
  orderId: { type: String, required: true, unique: true },
  invoiceNumber: { type: String },
  user: { type: String },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    deliveryInstructions: { type: String }
  },
  items: [{
    productId: { type: String },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Piece' },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  materialCost: { type: Number, required: true },
  labourCost: { type: Number, default: 0 },
  labourDetails: {
    hasLabour: { type: Boolean, default: false },
    labourType: String,
    workersRequired: Number,
    preferredStartDate: String,
    durationDays: String,
    instructions: String,
    chargesApproved: Boolean
  },
  deliveryCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  couponApplied: { type: String },
  paymentMethod: { type: String, enum: ['COD', 'Online', 'Bank Transfer', 'Credit on Approval', 'Razorpay'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded', 'Partially Refunded', 'Failed'], default: 'Pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  orderStatus: {
    type: String,
    enum: [
      'Pending Review',
      'Quotation Sent',
      'Awaiting Customer Approval',
      'Confirmed',
      'Processing',
      'Ready for Dispatch',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Confirmed'
  },
  quotationId: { type: String },
  labourBookingId: { type: String },
  timeline: [{
    status: String,
    note: String,
    timestamp: String
  }]
});

export default Order;
export { Order };
