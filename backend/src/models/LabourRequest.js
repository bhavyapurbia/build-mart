import mongoose from 'mongoose';
import { LABOUR_TYPE, LABOUR_STATUS } from '../constants/enums.js';

const labourRequestSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true, trim: true },
  user: { type: String, default: null },
  orderId: { type: String, default: null },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    workLocation: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true }
  },
  labourType: {
    type: String,
    enum: Object.values(LABOUR_TYPE),
    required: true
  },
  workersRequired: { type: Number, required: true, default: 1, min: 1 },
  workCategory: { type: String, default: '' },
  preferredStartDate: { type: String, required: true },
  expectedDuration: { type: String, required: true },
  additionalInstructions: { type: String, default: '' },
  siteImages: [{ type: String }],
  labourCharges: { type: Number, default: 0, min: 0 },
  chargesApprovedByCustomer: { type: Boolean, default: false },
  assignedWorkers: [{
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    trade: { type: String, trim: true }
  }],
  status: {
    type: String,
    enum: Object.values(LABOUR_STATUS),
    default: LABOUR_STATUS.PENDING_REVIEW
  },
  adminNotes: { type: String, default: '' }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C query indexes
labourRequestSchema.index({ user: 1, createdAt: -1 });
labourRequestSchema.index({ status: 1, createdAt: -1 });

const LabourRequest = mongoose.models.LabourRequest || mongoose.model('LabourRequest', labourRequestSchema);

export default LabourRequest;
export { LabourRequest };
