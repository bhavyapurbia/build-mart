import LabourRequest from '../models/LabourRequest.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError, ApiResponse, sendEmail } from '../utils/index.js';

export const submitLabourRequest = asyncHandler(async (req, res) => {
  const {
    customer,
    labourType,
    workersRequired = 1,
    workCategory,
    preferredStartDate,
    expectedDuration,
    additionalInstructions,
    siteImages = [],
    orderId
  } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.workLocation) {
    throw new ApiError(400, 'Customer name, phone, and work location are required.');
  }
  if (!labourType || !preferredStartDate || !expectedDuration) {
    throw new ApiError(400, 'Labour trade, start date, and expected duration are required.');
  }

  const count = await LabourRequest.countDocuments();
  const bookingId = `BM-LBR-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(3, '0')}`;

  const newLabour = await LabourRequest.create({
    bookingId,
    user: req.user ? String(req.user._id) : (customer.email || 'guest'),
    orderId: orderId || '',
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      workLocation: customer.workLocation,
      city: customer.city || 'Bengaluru',
      pincode: customer.pincode || ''
    },
    labourType,
    workersRequired: Number(workersRequired) || 1,
    workCategory: workCategory || labourType,
    preferredStartDate,
    expectedDuration,
    additionalInstructions: additionalInstructions || '',
    siteImages: Array.isArray(siteImages) ? siteImages : [],
    status: 'Pending Review'
  });

  // Notify Admin
  await Notification.create({
    recipient: 'admin',
    title: 'New Labour Service Booking Request',
    message: `${customer.name} requested ${workersRequired} ${labourType}(s) starting on ${preferredStartDate}.`,
    type: 'labour',
    referenceId: bookingId,
    link: '/admin/labour'
  });

  // Asynchronously send confirmation email if email provided
  if (customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Labour Request Booked - #${bookingId} - BuildMart`,
      mailgenContent: {
        body: {
          name: customer.name,
          intro: `We have received your contractor & labour request #${bookingId} for ${labourType}.`,
          action: {
            instructions: `Work Location: ${customer.workLocation}. Preferred Start Date: ${preferredStartDate}. Duration: ${expectedDuration}.`,
            button: {
              color: '#e05a00',
              text: 'View Booking Status',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'Our site deployment manager will contact you to confirm wage rates and site reporting times.'
        }
      }
    }).catch(err => console.warn('Labour request email skipped:', err.message));
  }

  return res.status(201).json(
    new ApiResponse(201, {
      bookingId,
      labourRequest: newLabour
    }, 'Labour service request submitted! Our contractor supervisor will review availability and contact you with rate estimates.')
  );
});

export const getMyLabourBookings = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : null;
  const userEmail = req.user ? req.user.email : null;

  let bookings = [];
  if (userId || userEmail) {
    bookings = await LabourRequest.find({
      $or: [
        { user: userId },
        { 'customer.email': userEmail }
      ]
    }).sort({ createdAt: -1 });
  }

  return res.status(200).json(
    new ApiResponse(200, bookings, 'Labour bookings fetched successfully')
  );
});

export const getAllLabourRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const requests = await LabourRequest.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, requests, 'Labour requests fetched successfully')
  );
});

export const updateLabourRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    labourCharges,
    assignedWorkers,
    status,
    adminNotes,
    chargesApprovedByCustomer
  } = req.body;

  const updateData = {};
  if (labourCharges !== undefined) updateData.labourCharges = Number(labourCharges);
  if (assignedWorkers) updateData.assignedWorkers = assignedWorkers;
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (chargesApprovedByCustomer !== undefined) updateData.chargesApprovedByCustomer = chargesApprovedByCustomer;

  let updated = await LabourRequest.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    await LabourRequest.updateOne({ bookingId: id }, updateData);
    updated = await LabourRequest.findOne({ bookingId: id });
  }

  if (!updated) {
    throw new ApiError(404, 'Labour request not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { labourRequest: updated }, 'Labour request updated successfully')
  );
});

export default {
  submitLabourRequest,
  getMyLabourBookings,
  getAllLabourRequests,
  updateLabourRequest
};
