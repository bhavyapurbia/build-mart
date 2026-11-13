import mongoose from 'mongoose';
import { MATERIAL_REQUEST_STATUS } from '../constants/enums.js';

const materialRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, trim: true },
  user: { type: String, default: null }, // User ID if authenticated or null
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    siteAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    requiredDate: { type: Date, default: null },
    notes: { type: String, default: '' }
  },
  items: [{
    productId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    unit: { type: String, default: 'Piece' },
    unitPrice: { type: Number, default: 0, min: 0 },
    estimatedTotal: { type: Number, default: 0, min: 0 }
  }],
  status: {
    type: String,
    enum: Object.values(MATERIAL_REQUEST_STATUS),
    default: MATERIAL_REQUEST_STATUS.PENDING_REVIEW
  },
  isPaperList: { type: Boolean, default: false },
  paperListImage: { type: String, default: null }, // Cloudinary URL/publicId, NOT raw base64
  adminNotes: { type: String, default: '' },
  quotationId: { type: String, default: '' }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C query indexes
materialRequestSchema.index({ user: 1, createdAt: -1 });
materialRequestSchema.index({ status: 1, createdAt: -1 });

const MaterialRequest = mongoose.models.MaterialRequest || mongoose.model('MaterialRequest', materialRequestSchema);

export default MaterialRequest;
export { MaterialRequest };
