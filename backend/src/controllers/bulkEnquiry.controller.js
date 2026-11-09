import BulkEnquiry from '../models/BulkEnquiry.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError, ApiResponse, sendEmail } from '../utils/index.js';

export const submitBulkEnquiry = asyncHandler(async (req, res) => {
  const {
    fullName,
    companyName,
    phone,
    email,
    projectLocation,
    deliveryRequirement,
    expectedPurchaseDate,
    items,
    additionalDetails,
    documentUrl
  } = req.body;

  if (!fullName || !phone || !email || !projectLocation) {
    throw new ApiError(400, 'Full name, phone, email, and project location are required.');
  }
  if (!items || !items.length) {
    throw new ApiError(400, 'At least one product requirement must be specified.');
  }

  const count = await BulkEnquiry.countDocuments();
  const enquiryId = `BM-BLK-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(3, '0')}`;

  const enquiry = await BulkEnquiry.create({
    enquiryId,
    user: req.user ? String(req.user._id) : email,
    customer: {
      fullName,
      companyName: companyName || '',
      phone,
      email,
      projectLocation,
      deliveryRequirement: deliveryRequirement || 'Immediate / Staggered',
      expectedPurchaseDate: expectedPurchaseDate || ''
    },
    items: items.map(item => ({
      category: item.category || 'General Construction',
      productName: item.productName || item.name,
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'Ton / Bags',
      notes: item.notes || ''
    })),
    additionalDetails: additionalDetails || '',
    documentUrl: documentUrl || '',
    status: 'Received'
  });

  // Notify Admin
  await Notification.create({
    recipient: 'admin',
    title: 'New High-Volume Bulk Order Enquiry',
    message: `${fullName} (${companyName || 'Independent Builder'}) submitted bulk requirement #${enquiryId} for ${projectLocation}.`,
    type: 'bulk',
    referenceId: enquiryId,
    link: '/admin/bulk'
  });

  // Asynchronous customer notification email
  if (email) {
    sendEmail({
      email,
      subject: `Bulk Enquiry Received - #${enquiryId} - BuildMart`,
      mailgenContent: {
        body: {
          name: fullName,
          intro: `We have received your commercial wholesale enquiry #${enquiryId} for ${projectLocation}.`,
          action: {
            instructions: 'Our institutional supply team is currently calculating direct mill rates and freight logistics.',
            button: {
              color: '#e05a00',
              text: 'View Enquiry Status',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'A key accounts manager will reach out with your formal trade quote within 4 business hours.'
        }
      }
    }).catch(err => console.warn('Bulk email delivery skipped:', err.message));
  }

  return res.status(201).json(
    new ApiResponse(201, {
      enquiryId,
      enquiry
    }, 'Bulk material enquiry submitted successfully! A dedicated commercial key accounts manager will review specifications and respond with trade tier pricing.')
  );
});

export const getMyBulkEnquiries = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : null;
  const userEmail = req.user ? req.user.email : null;

  let enquiries = [];
  if (userId || userEmail) {
    enquiries = await BulkEnquiry.find({
      $or: [
        { user: userId },
        { 'customer.email': userEmail }
      ]
    }).sort({ createdAt: -1 });
  }

  return res.status(200).json(
    new ApiResponse(200, enquiries, 'Bulk enquiries fetched successfully')
  );
});

export const getAllBulkEnquiries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const enquiries = await BulkEnquiry.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, enquiries, 'Bulk enquiries fetched successfully')
  );
});

export const updateBulkEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    status,
    quotedPrice,
    deliveryCharges,
    validUntil,
    notes,
    adminNotes
  } = req.body;

  const enquiry = await BulkEnquiry.findById(id) || await BulkEnquiry.findOne({ enquiryId: id });
  if (!enquiry) {
    throw new ApiError(404, 'Bulk enquiry not found.');
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

  if (quotedPrice !== undefined || deliveryCharges !== undefined) {
    updateData.quotation = {
      quotedPrice: quotedPrice !== undefined ? Number(quotedPrice) : (enquiry.quotation ? enquiry.quotation.quotedPrice : 0),
      deliveryCharges: deliveryCharges !== undefined ? Number(deliveryCharges) : (enquiry.quotation ? enquiry.quotation.deliveryCharges : 0),
      validUntil: validUntil || (enquiry.quotation ? enquiry.quotation.validUntil : ''),
      notes: notes || (enquiry.quotation ? enquiry.quotation.notes : ''),
      status: status === 'Quotation Sent' ? 'Sent' : 'Pending'
    };
  }

  const updated = await BulkEnquiry.findByIdAndUpdate(enquiry._id, updateData, { new: true });
  return res.status(200).json(
    new ApiResponse(200, { enquiry: updated }, 'Bulk enquiry updated successfully')
  );
});

export default {
  submitBulkEnquiry,
  getMyBulkEnquiries,
  getAllBulkEnquiries,
  updateBulkEnquiry
};
