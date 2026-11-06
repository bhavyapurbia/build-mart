import { createUnifiedModel } from './dbAdapter.js';

const Quotation = createUnifiedModel('Quotation', {
  quotationId: { type: String, required: true, unique: true },
  requestId: { type: String, required: true },
  user: { type: String },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    siteAddress: { type: String },
    city: { type: String },
    pincode: { type: String }
  },
  items: [{
    productId: { type: String },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Piece' },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    inStock: { type: Boolean, default: true }
  }],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  labourCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  validUntil: { type: String },
  notes: { type: String },
  status: {
    type: String,
    enum: ['Sent', 'Accepted', 'Rejected', 'Expired', 'Converted to Order'],
    default: 'Sent'
  },
  rejectionReason: { type: String },
  orderId: { type: String }
});

export default Quotation;
export { Quotation };

