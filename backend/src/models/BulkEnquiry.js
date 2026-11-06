import { createUnifiedModel } from './dbAdapter.js';

const BulkEnquiry = createUnifiedModel('BulkEnquiry', {
  enquiryId: { type: String, required: true, unique: true },
  user: { type: String },
  customer: {
    fullName: { type: String, required: true },
    companyName: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    projectLocation: { type: String, required: true },
    deliveryRequirement: { type: String },
    expectedPurchaseDate: { type: String }
  },
  items: [{
    category: { type: String },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Piece' },
    notes: { type: String }
  }],
  additionalDetails: { type: String },
  documentUrl: { type: String },
  quotation: {
    quotedPrice: { type: Number, default: 0 },
    deliveryCharges: { type: Number, default: 0 },
    validUntil: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Sent', 'Accepted', 'Rejected'], default: 'Pending' }
  },
  status: {
    type: String,
    enum: ['Received', 'Under Review', 'Quotation Sent', 'Accepted', 'Rejected', 'Converted to Order'],
    default: 'Received'
  },
  adminNotes: { type: String }
});

export default BulkEnquiry;
export { BulkEnquiry };

