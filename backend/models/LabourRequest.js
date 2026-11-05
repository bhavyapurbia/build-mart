const { createUnifiedModel } = require('./dbAdapter');

const LabourRequest = createUnifiedModel('LabourRequest', {
  bookingId: { type: String, required: true, unique: true },
  user: { type: String },
  orderId: { type: String },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    workLocation: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  labourType: {
    type: String,
    enum: [
      'Mason',
      'Tile worker',
      'Plumber',
      'General construction worker',
      'Waterproofing worker',
      'Other'
    ],
    required: true
  },
  workersRequired: { type: Number, required: true, default: 1 },
  workCategory: { type: String },
  preferredStartDate: { type: String, required: true },
  expectedDuration: { type: String, required: true },
  additionalInstructions: { type: String },
  siteImages: [{ type: String }],
  labourCharges: { type: Number, default: 0 },
  chargesApprovedByCustomer: { type: Boolean, default: false },
  assignedWorkers: [{
    name: String,
    phone: String,
    trade: String
  }],
  status: {
    type: String,
    enum: ['Pending Review', 'Quoted', 'Assigned', 'In Progress', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Pending Review'
  },
  adminNotes: { type: String }
});

module.exports = LabourRequest;

