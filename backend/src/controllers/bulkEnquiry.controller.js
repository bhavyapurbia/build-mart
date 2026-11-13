import BulkEnquiry from '../models/BulkEnquiry.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError, ApiResponse, sendEmail } from '../utils/index.js';
import { generateBulkId, generateOrderId, generateInvoiceNumber } from '../utils/counter.js';
import { assertOwnerOrAdmin } from '../middleware/auth.middleware.js';

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

  const enquiryId = await generateBulkId();

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
  const { status, page, limit, q, sort = 'newest' } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (q) {
    const term = q.trim();
    filter.$or = [
      { enquiryId: { $regex: term, $options: 'i' } },
      { 'customer.fullName': { $regex: term, $options: 'i' } },
      { 'customer.companyName': { $regex: term, $options: 'i' } },
      { 'customer.phone': { $regex: term, $options: 'i' } },
      { 'customer.email': { $regex: term, $options: 'i' } }
    ];
  }

  const sortObj = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [enquiries, total] = await Promise.all([
      BulkEnquiry.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      BulkEnquiry.countDocuments(filter)
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        enquiries,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }, 'Bulk enquiries fetched successfully')
    );
  }

  const enquiries = await BulkEnquiry.find(filter).sort(sortObj).lean();
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
      validUntil: validUntil || (enquiry.quotation ? enquiry.quotation.validUntil : null),
      notes: notes || (enquiry.quotation ? enquiry.quotation.notes : ''),
      status: status === 'Quotation Sent' ? 'Sent' : 'Pending'
    };
  }

  const updated = await BulkEnquiry.findByIdAndUpdate(enquiry._id, updateData, { new: true });

  // Email customer on quote dispatch
  if (status === 'Quotation Sent' && enquiry.customer?.email) {
    sendEmail({
      email: enquiry.customer.email,
      subject: `Commercial Quote Ready - #${enquiry.enquiryId} - BuildMart`,
      mailgenContent: {
        body: {
          name: enquiry.customer.fullName,
          intro: `Your formal wholesale quote for enquiry #${enquiry.enquiryId} is ready. Quoted Rate: ₹${Number(quotedPrice || 0).toLocaleString('en-IN')}`,
          action: {
            instructions: 'Review quotation details and accept online:',
            button: {
              color: '#e05a00',
              text: 'Review Bulk Quote',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          }
        }
      }
    }).catch(err => console.warn('Bulk quote email skipped:', err.message));
  }

  return res.status(200).json(
    new ApiResponse(200, { enquiry: updated }, 'Bulk enquiry updated successfully')
  );
});

/**
 * Customer accept / reject for bulk quotation
 * POST /api/bulk-enquiries/:id/respond
 */
export const respondToBulkEnquiry = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    throw new ApiError(400, 'Action must be "accept" or "reject".');
  }

  const enquiry = await BulkEnquiry.findById(req.params.id) || await BulkEnquiry.findOne({ enquiryId: req.params.id });
  if (!enquiry) {
    throw new ApiError(404, 'Bulk enquiry not found.');
  }

  assertOwnerOrAdmin(enquiry.user, req.user);

  const newStatus = action === 'accept' ? 'Accepted' : 'Rejected';
  enquiry.status = newStatus;
  if (action === 'reject') {
    enquiry.adminNotes = `Customer rejection reason: ${rejectionReason || 'Declined'}`;
  }
  await enquiry.save();

  // Notify admin
  await Notification.create({
    recipient: 'admin',
    title: `Bulk Quote #${enquiry.enquiryId} ${newStatus}`,
    message: `${enquiry.customer?.fullName} ${action === 'accept' ? 'accepted' : 'declined'} the bulk quote.`,
    type: 'bulk',
    referenceId: enquiry.enquiryId,
    link: '/admin/bulk'
  });

  return res.status(200).json(
    new ApiResponse(200, { enquiry }, `Bulk enquiry ${action === 'accept' ? 'accepted' : 'declined'} successfully.`)
  );
});

/**
 * Admin: Convert accepted bulk enquiry to confirmed Order with payment terms
 * POST /api/bulk-enquiries/admin/:id/convert-to-order
 */
export const convertBulkEnquiryToOrder = asyncHandler(async (req, res) => {
  const { paymentTerms = 'Credit on Approval' } = req.body;
  const enquiry = await BulkEnquiry.findById(req.params.id) || await BulkEnquiry.findOne({ enquiryId: req.params.id });

  if (!enquiry) {
    throw new ApiError(404, 'Bulk enquiry not found.');
  }

  if (enquiry.status !== 'Accepted') {
    throw new ApiError(400, 'Bulk enquiry must be accepted by the customer before converting to an order.');
  }

  const orderId = await generateOrderId();
  const invoiceNumber = await generateInvoiceNumber();

  const quotedPrice = enquiry.quotation?.quotedPrice || 0;
  const deliveryCharges = enquiry.quotation?.deliveryCharges || 0;
  const tax = Math.round(quotedPrice * 0.18);
  const totalAmount = quotedPrice + deliveryCharges + tax;

  const order = await Order.create({
    orderId,
    invoiceNumber,
    user: enquiry.user || null,
    customer: {
      name: enquiry.customer?.fullName,
      phone: enquiry.customer?.phone,
      email: enquiry.customer?.email,
      address: enquiry.customer?.projectLocation,
      city: 'Bengaluru',
      pincode: '560001',
      deliveryInstructions: `Bulk order. Payment Terms: ${paymentTerms}. Requirement: ${enquiry.customer?.deliveryRequirement || ''}`
    },
    items: enquiry.items.map(i => ({
      productId: 'bulk-item-' + Date.now(),
      name: i.productName,
      brand: 'Wholesale Mill Supply',
      quantity: i.quantity,
      unit: i.unit,
      price: Math.round(quotedPrice / (enquiry.items.length || 1)),
      total: Math.round(quotedPrice / (enquiry.items.length || 1))
    })),
    materialCost: quotedPrice,
    tax,
    taxBreakup: {
      cgst: Math.round(tax / 2),
      sgst: Math.round(tax / 2),
      igst: 0
    },
    deliveryCharge: deliveryCharges,
    labourCost: 0,
    totalAmount,
    paymentMethod: 'Credit on Approval',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    timeline: [
      {
        status: 'Confirmed',
        note: `Converted from Bulk Enquiry #${enquiry.enquiryId}. Terms: ${paymentTerms}`,
        timestamp: new Date()
      }
    ]
  });

  enquiry.status = 'Converted to Order';
  await enquiry.save();

  // Notify customer
  if (enquiry.customer?.email) {
    sendEmail({
      email: enquiry.customer.email,
      subject: `Order Confirmed: #${orderId} from Bulk Enquiry - BuildMart`,
      mailgenContent: {
        body: {
          name: enquiry.customer.fullName,
          intro: `Your bulk requirement #${enquiry.enquiryId} has been converted into confirmed Order #${orderId}. Payment Terms: ${paymentTerms}.`,
          action: {
            instructions: 'Track dispatch schedule and download invoice:',
            button: {
              color: '#e05a00',
              text: 'View Order Details',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          }
        }
      }
    }).catch(err => console.warn('Bulk order email skipped:', err.message));
  }

  return res.status(200).json(
    new ApiResponse(200, { orderId, order }, 'Bulk enquiry successfully converted to order!')
  );
});

export default {
  submitBulkEnquiry,
  getMyBulkEnquiries,
  getAllBulkEnquiries,
  updateBulkEnquiry,
  respondToBulkEnquiry,
  convertBulkEnquiryToOrder
};
