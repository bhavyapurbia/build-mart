import mongoose from 'mongoose';
import { BULK_ENQUIRY_STATUS } from '../constants/enums.js';

const bulkEnquirySchema = new mongoose.Schema({
  enquiryId: { type: String, required: true, unique: true, trim: true },
  user: { type: String, default: null },
  customer: {
    fullName: { type: String, required: true, trim: true },
    companyName: { type: String, default: '', trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    projectLocation: { type: String, required: true, trim: true },
    deliveryRequirement: { type: String, default: '' },
    expectedPurchaseDate: { type: String, default: '' }
  },
  items: [{
    category: { type: String, default: '' },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'Piece' },
    notes: { type: String, default: '' }
  }],
  additionalDetails: { type: String, default: '' },
  documentUrl: { type: String, default: '' },
  quotation: {
    quotedPrice: { type: Number, default: 0, min: 0 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    validUntil: { type: Date, default: null },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Sent', 'Accepted', 'Rejected'], default: 'Pending' }
  },
  status: {
    type: String,
    enum: Object.values(BULK_ENQUIRY_STATUS),
    default: BULK_ENQUIRY_STATUS.RECEIVED
  },
  adminNotes: { type: String, default: '' }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C query indexes
bulkEnquirySchema.index({ user: 1, createdAt: -1 });
bulkEnquirySchema.index({ status: 1, createdAt: -1 });

const BulkEnquiry = mongoose.models.BulkEnquiry || mongoose.model('BulkEnquiry', bulkEnquirySchema);

export default BulkEnquiry;
export { BulkEnquiry };
