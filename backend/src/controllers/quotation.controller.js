import Quotation from '../models/Quotation.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError, ApiResponse, sendEmail } from '../utils/index.js';

export const createQuotation = asyncHandler(async (req, res) => {
  const {
    requestId,
    customer,
    items,
    deliveryCharge = 0,
    labourCharge = 0,
    tax = 0,
    discount = 0,
    validUntil,
    notes
  } = req.body;

  if (!requestId || !items || !items.length) {
    throw new ApiError(400, 'Request ID and quotation items are required.');
  }

  const count = await Quotation.countDocuments();
  const quotationId = `BM-QUO-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(3, '0')}`;

  let subtotal = 0;
  const processedItems = items.map(item => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 1;
    const totalPrice = unitPrice * quantity;
    subtotal += totalPrice;
    return {
      productId: item.productId || '',
      name: item.name,
      brand: item.brand || '',
      image: item.image || '',
      quantity,
      unit: item.unit || 'Piece',
      unitPrice,
      totalPrice,
      inStock: item.inStock !== false
    };
  });

  const totalAmount = Math.max(0, subtotal + Number(deliveryCharge) + Number(labourCharge) + Number(tax) - Number(discount));

  const quotation = await Quotation.create({
    quotationId,
    requestId,
    user: req.body.userId || '',
    customer: customer || {},
    items: processedItems,
    subtotal,
    deliveryCharge: Number(deliveryCharge),
    labourCharge: Number(labourCharge),
    tax: Number(tax),
    discount: Number(discount),
    totalAmount,
    validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: notes || 'Prices quoted are valid for 7 days. Free delivery above ₹5,000 threshold applied where applicable.',
    status: 'Sent'
  });

  // Update the parent Material Request
  await MaterialRequest.updateOne(
    { $or: [{ requestId }, { _id: requestId }] },
    { status: 'Quotation Sent', quotationId }
  );

  // Notify Customer
  await Notification.create({
    recipient: 'customer',
    userId: req.body.userId || '',
    title: 'Quotation Ready for Review!',
    message: `Quotation #${quotationId} for Material Request #${requestId} is ready. Total: ₹${totalAmount.toLocaleString('en-IN')}`,
    type: 'quotation',
    referenceId: quotationId,
    link: `/account?tab=quotations`
  });

  // Send Quotation Email if customer email exists
  if (customer && customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Quotation Ready: #${quotationId} - BuildMart`,
      mailgenContent: {
        body: {
          name: customer.name || 'Valued Customer',
          intro: `Your formal quotation #${quotationId} for request #${requestId} has been generated.`,
          action: {
            instructions: `Total Quoted: ₹${totalAmount.toLocaleString('en-IN')}. Review and approve your quote:`,
            button: {
              color: '#e05a00',
              text: 'Review Quotation',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'This quotation is valid for 7 days from issue.'
        }
      }
    }).catch(err => console.warn('Quotation email skipped:', err.message));
  }

  return res.status(201).json(
    new ApiResponse(201, { quotation }, 'Quotation generated and sent to customer successfully!')
  );
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id) ||
    await Quotation.findOne({ quotationId: req.params.id });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation fetched successfully')
  );
});

export const getMyQuotations = asyncHandler(async (req, res) => {
  const userEmail = req.user ? req.user.email : null;
  const userId = req.user ? String(req.user._id) : null;

  let quotations = [];
  if (userId || userEmail) {
    quotations = await Quotation.find({
      $or: [
        { user: userId },
        { 'customer.email': userEmail }
      ]
    }).sort({ createdAt: -1 });
  }

  return res.status(200).json(
    new ApiResponse(200, quotations, 'Quotations fetched successfully')
  );
});

export const getAllQuotations = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find().sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, quotations, 'Quotations fetched successfully')
  );
});

export const respondToQuotation = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;
  const quotation = await Quotation.findById(req.params.id) ||
    await Quotation.findOne({ quotationId: req.params.id });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found.');
  }

  if (action === 'accept') {
    quotation.status = 'Accepted';
    await Quotation.updateOne({ _id: quotation._id }, { status: 'Accepted' });

    // Update parent Material Request
    await MaterialRequest.updateOne(
      { $or: [{ requestId: quotation.requestId }, { _id: quotation.requestId }] },
      { status: 'Quotation Accepted' }
    );

    // Notify admin
    await Notification.create({
      recipient: 'admin',
      title: 'Quotation Accepted by Customer',
      message: `${quotation.customer.name} accepted Quotation #${quotation.quotationId} (₹${quotation.totalAmount}). Ready for checkout/fulfillment.`,
      type: 'quotation',
      referenceId: quotation.quotationId,
      link: '/admin/orders'
    });

    return res.status(200).json(
      new ApiResponse(200, { quotation }, 'Quotation accepted! You can now proceed to finalize checkout and schedule delivery.')
    );
  } else if (action === 'reject') {
    quotation.status = 'Rejected';
    quotation.rejectionReason = rejectionReason || 'Declined by customer';
    await Quotation.updateOne(
      { _id: quotation._id },
      { status: 'Rejected', rejectionReason: quotation.rejectionReason }
    );

    await MaterialRequest.updateOne(
      { $or: [{ requestId: quotation.requestId }, { _id: quotation.requestId }] },
      { status: 'Quotation Rejected' }
    );

    await Notification.create({
      recipient: 'admin',
      title: 'Quotation Declined',
      message: `${quotation.customer.name} declined Quotation #${quotation.quotationId}. Reason: ${quotation.rejectionReason}`,
      type: 'quotation',
      referenceId: quotation.quotationId,
      link: '/admin/quotations'
    });

    return res.status(200).json(
      new ApiResponse(200, { quotation }, 'Quotation marked as declined.')
    );
  } else {
    throw new ApiError(400, 'Action must be "accept" or "reject".');
  }
});

export default {
  createQuotation,
  getQuotationById,
  getMyQuotations,
  getAllQuotations,
  respondToQuotation
};
