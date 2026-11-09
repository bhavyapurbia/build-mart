import MaterialRequest from '../models/MaterialRequest.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError, ApiResponse, sendEmail } from '../utils/index.js';

export const submitMaterialRequest = asyncHandler(async (req, res) => {
  const { customer, items, isPaperList, paperListImage } = req.body;
  if (!customer || !customer.name || !customer.phone || !customer.siteAddress) {
    throw new ApiError(400, 'Customer name, phone, and site address are required.');
  }

  let processedItems = items || [];
  if (isPaperList) {
    if (!paperListImage) {
      throw new ApiError(400, 'Please provide or snap a photo of the paper material list.');
    }
    if (!processedItems.length) {
      processedItems = [{
        productId: 'paper-sheet-' + Date.now(),
        name: 'Handwritten Contractor Paper List',
        brand: 'Site Photo',
        image: paperListImage,
        quantity: 1,
        unit: 'Photo Sheet',
        unitPrice: 0,
        estimatedTotal: 0
      }];
    }
  } else if (!processedItems.length) {
    throw new ApiError(400, 'At least one material item must be selected.');
  }

  const count = await MaterialRequest.countDocuments();
  const requestId = `BM-REQ-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(3, '0')}`;

  const newRequest = await MaterialRequest.create({
    requestId,
    user: req.user ? String(req.user._id) : (customer.email || 'guest'),
    isPaperList: !!isPaperList,
    paperListImage: paperListImage || '',
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      siteAddress: customer.siteAddress,
      city: customer.city || 'Bengaluru',
      pincode: customer.pincode || '',
      requiredDate: customer.requiredDate || '',
      notes: customer.notes || (isPaperList ? 'Paper list photo submitted by contractor' : '')
    },
    items: processedItems.map(item => ({
      productId: item.productId || item._id,
      name: item.name,
      brand: item.brand || '',
      image: item.image || (item.images && item.images[0]) || paperListImage || '',
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'Piece',
      unitPrice: Number(item.price || item.unitPrice || 0),
      estimatedTotal: (Number(item.price || item.unitPrice || 0)) * (Number(item.quantity) || 1)
    })),
    status: 'Pending Review'
  });

  // Create Notification for Admin
  await Notification.create({
    recipient: 'admin',
    title: isPaperList ? '📸 New Paper Material List Photo Uploaded' : 'New Material List Submitted',
    message: `${customer.name} submitted ${isPaperList ? 'a handwritten paper list photo' : 'Material Request #' + requestId} for job-site: ${customer.siteAddress}.`,
    type: 'material_request',
    referenceId: requestId,
    link: `/admin/material-requests`
  });

  // Asynchronous customer notification email
  if (customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Material List Request #${requestId} - BuildMart`,
      mailgenContent: {
        body: {
          name: customer.name,
          intro: `We have received your site material list request #${requestId}.`,
          action: {
            instructions: 'Our materials estimating engineer is reviewing trade pricing and available inventory.',
            button: {
              color: '#e05a00',
              text: 'View Request Status',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'You will receive an official quotation shortly.'
        }
      }
    }).catch(err => console.warn('Material request email skipped:', err.message));
  }

  return res.status(201).json(
    new ApiResponse(201, {
      requestId,
      request: newRequest
    }, isPaperList
      ? 'Paper material list photo uploaded successfully! Our materials engineer is reviewing your handwritten list and will issue a formal quotation.'
      : 'Material list submitted successfully! Our materials engineer will review stock and provide your formal quotation shortly.')
  );
});

export const getMyMaterialRequests = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : null;
  const userEmail = req.user ? req.user.email : null;

  let requests = [];
  if (userId) {
    requests = await MaterialRequest.find({
      $or: [
        { user: userId },
        { 'customer.email': userEmail }
      ]
    }).sort({ createdAt: -1 });
  }
  return res.status(200).json(
    new ApiResponse(200, requests, 'Material requests fetched successfully')
  );
});

export const getAllMaterialRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const requests = await MaterialRequest.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, requests, 'Material requests fetched successfully')
  );
});

export const getMaterialRequestById = asyncHandler(async (req, res) => {
  const request = await MaterialRequest.findById(req.params.id) ||
    await MaterialRequest.findOne({ requestId: req.params.id });

  if (!request) {
    throw new ApiError(404, 'Material request not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, request, 'Material request retrieved successfully')
  );
});

export const updateMaterialRequestStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const updateData = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

  let updated = await MaterialRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!updated) {
    await MaterialRequest.updateOne({ requestId: req.params.id }, updateData);
    updated = await MaterialRequest.findOne({ requestId: req.params.id });
  }

  if (!updated) {
    throw new ApiError(404, 'Material request not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { request: updated }, 'Material request status updated')
  );
});

export default {
  submitMaterialRequest,
  getMyMaterialRequests,
  getAllMaterialRequests,
  getMaterialRequestById,
  updateMaterialRequestStatus
};
