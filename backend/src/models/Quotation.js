import mongoose from 'mongoose';
import { QUOTATION_STATUS } from '../constants/enums.js';

const quotationSchema = new mongoose.Schema({
  quotationId: { type: String, required: true, unique: true, trim: true },
  requestId: { type: String, required: true, trim: true },
  user: { type: String, default: null },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    siteAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  items: [{
    productId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'Piece' },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, default: 0, min: 0 },
  labourCharge: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  validUntil: { type: Date, default: null },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: Object.values(QUOTATION_STATUS),
    default: QUOTATION_STATUS.SENT
  },
  rejectionReason: { type: String, default: '' },
  orderId: { type: String, default: '' }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C query indexes
quotationSchema.index({ user: 1, createdAt: -1 });
quotationSchema.index({ status: 1, createdAt: -1 });

const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);

export default Quotation;
export { Quotation };
