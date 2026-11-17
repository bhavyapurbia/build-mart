import MaterialRequest from '../models/MaterialRequest.js';
import Notification from '../models/Notification.js';
import Quotation from '../models/Quotation.js';
import Order from '../models/Order.js';
import { asyncHandler, ApiError, ApiResponse, sendEmail } from '../utils/index.js';
import { generateRequestId, generateQuotationId } from '../utils/counter.js';
import { createOrderRecord } from '../services/order.service.js';

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
    if (paperListImage.startsWith('data:image/')) {
      throw new ApiError(400, 'Raw base64 images are not permitted in JSON payloads. Please upload the photo via multipart to /api/upload/paper-list first.');
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

  const requestId = await generateRequestId();

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
    title: isPaperList ? '📸 New Snap List Photo Received!' : 'New Material List Submitted',
    message: `${customer.name} submitted ${isPaperList ? 'a handwritten paper list photo' : 'Material Request #' + requestId} for job-site: ${customer.siteAddress}.`,
    type: 'material_request',
    referenceId: requestId,
    link: isPaperList ? '/admin/snap-lists' : '/admin/material-requests'
  });

  // Asynchronous customer notification email
  if (customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Material List Request #${requestId} - BuildPlace`,
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
  const { status, isPaperList, page, limit, q, sort = 'newest' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (isPaperList !== undefined && isPaperList !== '') {
    filter.isPaperList = isPaperList === 'true' || isPaperList === true;
  }

  if (q) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { requestId: regex },
      { 'customer.name': regex },
      { 'customer.phone': regex },
      { 'customer.email': regex },
      { 'customer.city': regex }
    ];
  }

  const sortObj = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  // Calculate stats for admin tabs
  const [totalSnapLists, pendingSnapLists, billGeneratedSnapLists, completedSnapLists] = await Promise.all([
    MaterialRequest.countDocuments({ isPaperList: true }),
    MaterialRequest.countDocuments({ isPaperList: true, status: 'Pending Review' }),
    MaterialRequest.countDocuments({ isPaperList: true, status: { $in: ['Bill Generated', 'Quotation Sent'] } }),
    MaterialRequest.countDocuments({ isPaperList: true, status: 'Converted to Order' })
  ]);

  const snapStats = {
    total: totalSnapLists,
    pending: pendingSnapLists,
    billGenerated: billGeneratedSnapLists,
    completed: completedSnapLists
  };

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      MaterialRequest.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MaterialRequest.countDocuments(filter)
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        requests,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        snapStats
      }, 'Material requests fetched successfully')
    );
  }

  const requests = await MaterialRequest.find(filter).sort(sortObj).lean();
  return res.status(200).json(
    new ApiResponse(200, { requests, snapStats }, 'Material requests fetched successfully')
  );
});

export const getMaterialRequestById = asyncHandler(async (req, res) => {
  const query = req.params.id && req.params.id.length === 24
    ? { $or: [{ _id: req.params.id }, { requestId: req.params.id }] }
    : { requestId: req.params.id };

  const request = await MaterialRequest.findOne(query).lean();

  if (!request) {
    throw new ApiError(404, 'Material request not found.');
  }

  let quotation = null;
  if (request.quotationId) {
    quotation = await Quotation.findOne({ quotationId: request.quotationId }).lean();
  } else {
    quotation = await Quotation.findOne({ requestId: request.requestId }).sort({ createdAt: -1 }).lean();
  }

  return res.status(200).json(
    new ApiResponse(200, { ...request, quotation }, 'Material request retrieved successfully')
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

/**
 * Admin: Generate official bill for a Snap List image with line items, stock availability, and taxes.
 * POST /api/material-requests/:id/generate-bill
 */
export const generateSnapListBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    items = [],
    deliveryCharge = 0,
    tax = 0,
    discount = 0,
    adminNotes = '',
    validDays = 7
  } = req.body;

  const query = id.length === 24 ? { $or: [{ _id: id }, { requestId: id }] } : { requestId: id };
  const request = await MaterialRequest.findOne(query);

  if (!request) {
    throw new ApiError(404, 'Material request / snap list not found.');
  }

  // Calculate pricing based on in-stock items only
  const processedItems = items.map((item, idx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const inStock = item.inStock !== false;
    const estimatedTotal = inStock ? (qty * unitPrice) : 0;
    return {
      productId: item.productId || `snap-item-${Date.now()}-${idx}`,
      name: (item.name || 'Material Item').trim(),
      brand: (item.brand || '').trim(),
      image: item.image || request.paperListImage || '',
      quantity: qty,
      unit: item.unit || 'Piece',
      unitPrice,
      estimatedTotal,
      inStock
    };
  });

  const subtotal = processedItems
    .filter(i => i.inStock)
    .reduce((sum, i) => sum + i.estimatedTotal, 0);

  const numDelivery = Math.max(0, Number(deliveryCharge) || 0);
  const numTax = Math.max(0, Number(tax) || 0);
  const numDiscount = Math.max(0, Number(discount) || 0);
  const totalAmount = Math.max(0, subtotal + numDelivery + numTax - numDiscount);

  const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

  // Generate or link Quotation
  let quotationId = request.quotationId;
  if (!quotationId) {
    quotationId = await generateQuotationId();
  }

  const quotationItems = processedItems.map(i => ({
    productId: i.productId,
    name: i.name,
    brand: i.brand,
    image: i.image,
    quantity: i.quantity,
    unit: i.unit,
    unitPrice: i.unitPrice,
    totalPrice: i.estimatedTotal,
    inStock: i.inStock
  }));

  const quoData = {
    quotationId,
    requestId: request.requestId,
    user: request.user,
    customer: request.customer,
    items: quotationItems,
    subtotal,
    deliveryCharge: numDelivery,
    tax: numTax,
    discount: numDiscount,
    totalAmount,
    validUntil,
    notes: adminNotes || 'Bill generated by BuildPlace Materials Desk based on your snap list photo.',
    status: 'Sent'
  };

  await Quotation.findOneAndUpdate(
    { quotationId },
    quoData,
    { upsert: true, new: true }
  );

  request.items = processedItems;
  request.status = 'Bill Generated';
  request.quotationId = quotationId;
  request.adminNotes = adminNotes || request.adminNotes;
  request.billDetails = {
    subtotal,
    deliveryCharge: numDelivery,
    tax: numTax,
    discount: numDiscount,
    totalAmount,
    generatedAt: new Date(),
    validUntil,
    adminNotes,
    paymentStatus: 'unpaid',
    orderId: ''
  };

  await request.save();

  // Create notification for customer if registered
  if (request.user && request.user !== 'guest' && !request.user.includes('@')) {
    await Notification.create({
      recipient: 'customer',
      userId: request.user,
      title: '📋 Your Material List Bill is Ready!',
      message: `Bill for Snap List #${request.requestId} is ready (₹${totalAmount.toLocaleString('en-IN')}). Review stock and pay online.`,
      type: 'quotation',
      referenceId: request.requestId,
      link: `/snap-list/bill/${request.requestId}`
    }).catch(() => {});
  }

  const clientBaseUrl = process.env.CLIENT_URL?.split(',')[0] || 'https://buildplace.in';
  const billUrl = `${clientBaseUrl}/snap-list/bill/${request.requestId}`;
  const cleanPhone = String(request.customer?.phone || '').replace(/\D/g, '').replace(/^91/, '');
  const outOfStockItems = processedItems.filter(i => !i.inStock);
  const outOfStockNote = outOfStockItems.length > 0
    ? `\n\n*Availability Notice:*\n${outOfStockItems.length} item(s) (${outOfStockItems.map(i => i.name).join(', ')}) are currently out of stock and excluded from the bill total.`
    : '';

  const whatsappMessage = `Hello ${request.customer?.name}!\nYour official BuildPlace bill for Snap List #${request.requestId} is ready.\n\n*Total Payable: ₹${totalAmount.toLocaleString('en-IN')}*${outOfStockNote}\n\nCheck item details and pay online here:\n${billUrl}\n\nOur team is ready to dispatch your building materials!`;
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return res.status(200).json(
    new ApiResponse(200, {
      request,
      billUrl,
      whatsappMessage,
      whatsappUrl,
      totalAmount
    }, 'Snap list bill generated and sent successfully!')
  );
});

/**
 * Customer: Pay and confirm bill for a Snap List (Online Razorpay or COD).
 * POST /api/material-requests/:id/pay-bill
 */
export const paySnapListBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    paymentMethod = 'COD',
    razorpayPaymentId,
    razorpayOrderId
  } = req.body;

  const query = id.length === 24 ? { $or: [{ _id: id }, { requestId: id }] } : { requestId: id };
  const request = await MaterialRequest.findOne(query);

  if (!request) {
    throw new ApiError(404, 'Material request not found.');
  }

  if (request.status === 'Converted to Order') {
    return res.status(200).json(
      new ApiResponse(200, {
        request,
        orderId: request.billDetails?.orderId,
        alreadyProcessed: true
      }, 'This bill has already been paid and converted to an order.')
    );
  }

  const isOnline = paymentMethod === 'Razorpay' || paymentMethod === 'Online';
  const bill = request.billDetails || {};
  const totalAmount = bill.totalAmount || 0;

  if (totalAmount <= 0) {
    throw new ApiError(400, 'Cannot pay a bill with ₹0 total.');
  }

  // Filter available items only for final order
  const availableItems = (request.items || []).filter(i => i.inStock !== false);
  if (availableItems.length === 0) {
    throw new ApiError(400, 'None of the items in this list are available in stock.');
  }

  const orderLines = availableItems.map((i, idx) => ({
    productId: i.productId || `snap-${Date.now()}-${idx}`,
    name: i.name,
    brand: i.brand || 'Standard',
    image: i.image || request.paperListImage || '/placeholder-material.svg',
    quantity: i.quantity,
    unit: i.unit,
    price: i.unitPrice,
    total: i.estimatedTotal,
    gstRate: 18,
    hsnCode: '2523',
    discountAllocation: 0,
    tax: Math.round(i.estimatedTotal * 0.18)
  }));

  const pricingSnapshot = {
    subtotal: bill.subtotal || totalAmount,
    tax: bill.tax || 0,
    delivery: bill.deliveryCharge || 0,
    discount: bill.discount || 0,
    total: totalAmount,
    lines: orderLines
  };

  const customerObj = {
    name: request.customer?.name || 'Customer',
    phone: request.customer?.phone || '',
    email: request.customer?.email || '',
    address: request.customer?.siteAddress || 'Site Delivery',
    city: request.customer?.city || 'Bengaluru',
    pincode: request.customer?.pincode || '560001',
    state: 'Karnataka'
  };

  const order = await createOrderRecord({
    customer: customerObj,
    pricing: pricingSnapshot,
    paymentMethod: isOnline ? 'Online' : 'COD',
    paymentStatus: isOnline ? 'Paid' : 'Pending',
    userId: (request.user && request.user !== 'guest' && !request.user.includes('@')) ? request.user : null,
    quotationId: request.quotationId || null,
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null
  });

  // Update request record
  request.status = 'Converted to Order';
  request.billDetails = {
    ...bill,
    paymentStatus: isOnline ? 'paid' : 'cod_confirmed',
    paymentMethod: isOnline ? 'Razorpay' : 'COD',
    orderId: order.orderId
  };
  await request.save();

  // If Quotation exists, update status
  if (request.quotationId) {
    await Quotation.findOneAndUpdate(
      { quotationId: request.quotationId },
      {
        status: 'Converted to Order',
        orderId: order.orderId
      }
    ).catch(() => {});
  }

  // Notify admin
  await Notification.create({
    recipient: 'admin',
    title: isOnline ? '💰 Snap List Payment Received Online' : '📦 Snap List Order Confirmed (Pay on Delivery)',
    message: `${customerObj.name} confirmed bill for Snap List #${request.requestId}. Order #${order.orderId} created for ₹${totalAmount.toLocaleString('en-IN')}. Ready for dispatch!`,
    type: 'order',
    referenceId: order.orderId,
    link: '/admin/orders'
  }).catch(() => {});

  return res.status(200).json(
    new ApiResponse(200, {
      request,
      order,
      orderId: order.orderId
    }, isOnline
      ? 'Payment received! Your building materials order is confirmed and scheduled for site dispatch.'
      : 'Order confirmed with Pay on Delivery! We are loading your supplies for dispatch.')
  );
});

export default {
  submitMaterialRequest,
  getMyMaterialRequests,
  getAllMaterialRequests,
  getMaterialRequestById,
  updateMaterialRequestStatus,
  generateSnapListBill,
  paySnapListBill
};
