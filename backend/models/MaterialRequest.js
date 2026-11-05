const { createUnifiedModel } = require('./dbAdapter');

const MaterialRequest = createUnifiedModel('MaterialRequest', {
  requestId: { type: String, required: true, unique: true },
  user: { type: String }, // User ID if authenticated or 'guest'
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    siteAddress: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    requiredDate: { type: String },
    notes: { type: String }
  },
  items: [{
    productId: { type: String },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: 'Piece' },
    unitPrice: { type: Number, default: 0 },
    estimatedTotal: { type: Number, default: 0 }
  }],
  status: {
    type: String,
    enum: [
      'Pending Review',
      'Quotation Sent',
      'Quotation Accepted',
      'Quotation Rejected',
      'Converted to Order',
      'Cancelled'
    ],
    default: 'Pending Review'
  },
  isPaperList: { type: Boolean, default: false },
  paperListImage: { type: String },
  adminNotes: { type: String },
  quotationId: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String }
});

module.exports = MaterialRequest;

