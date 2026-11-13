import Quotation from '../models/Quotation.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Notification from '../models/Notification.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/Email.js';
import { assertOwnerOrAdmin } from '../middleware/auth.middleware.js';
import { generateQuotationId } from '../utils/counter.js';
import { computePricing } from '../services/pricing.service.js';

/**
 * Admin: Create a formal quotation for a material request.
 * Derives customer and user from the MaterialRequest to prevent spoofing.
 */
export const createQuotation = asyncHandler(async (req, res) => {
  const {
    requestId,
    items,
    deliveryCharge = 0,
    labourCharge = 0,
    discount = 0,
    validUntil,
    notes
  } = req.body;

  if (!requestId || !items || !items.length) {
    throw new ApiError(400, 'Request ID and quotation items are required.');
  }

  const materialRequest = await MaterialRequest.findOne({
    $or: [{ requestId }, { _id: requestId.length === 24 ? requestId : undefined }]
  }).lean();

  if (!materialRequest) {
    throw new ApiError(404, `Material Request #${requestId} not found.`);
  }

  const quotationId = await generateQuotationId();

  // Validate stock for items
  for (const item of items) {
    if (item.productId) {
      const p = await Product.findById(item.productId).lean();
      if (p && (p.stock || 0) < Number(item.quantity)) {
        item.inStock = false;
      } else {
        item.inStock = true;
      }
    }
  }

  // Compute pricing using server pricing logic
  const pricing = await computePricing({
    items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    shipping: { state: materialRequest.customer?.state || 'Karnataka', pincode: materialRequest.customer?.pincode },
    userId: materialRequest.user
  });

  const processedItems = items.map(item => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 1;
    return {
      productId: item.productId || '',
      name: item.name,
      brand: item.brand || '',
      image: item.image || '',
      quantity,
      unit: item.unit || 'Piece',
      unitPrice,
      totalPrice: unitPrice * quantity,
      inStock: item.inStock !== false,
      gstRate: item.gstRate || 18,
      hsnCode: item.hsnCode || '2523'
    };
  });

  const quotation = await Quotation.create({
    quotationId,
    requestId: materialRequest.requestId,
    user: materialRequest.user || '',
    customer: materialRequest.customer || {},
    items: processedItems,
    subtotal: pricing.subtotal,
    deliveryCharge: Number(deliveryCharge),
    labourCharge: Number(labourCharge),
    tax: pricing.tax,
    discount: Number(discount),
    totalAmount: Math.max(0, pricing.subtotal + Number(deliveryCharge) + Number(labourCharge) + pricing.tax - Number(discount)),
    validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: notes || 'Prices quoted are valid for 7 days. Certified genuine brand construction supplies.',
    status: 'Sent'
  });

  await MaterialRequest.updateOne(
    { _id: materialRequest._id },
    { status: 'Quotation Sent', quotationId }
  );

  if (materialRequest.user) {
    await Notification.create({
      recipient: 'customer',
      userId: String(materialRequest.user),
      title: 'Formal Builder Quotation Ready!',
      message: `Quotation #${quotationId} for Request #${materialRequest.requestId} is ready for your review. Total: ₹${quotation.totalAmount.toLocaleString('en-IN')}`,
      type: 'quotation',
      referenceId: quotationId,
      link: '/account?tab=quotations'
    });
  }

  if (materialRequest.customer?.email) {
    sendEmail({
      email: materialRequest.customer.email,
      subject: `Quotation Ready: #${quotationId} - BuildMart`,
      mailgenContent: {
        body: {
          name: materialRequest.customer.name || 'Valued Builder',
          intro: `Your formal quotation #${quotationId} for request #${materialRequest.requestId} has been generated.`,
          action: {
            instructions: `Total Quoted: ₹${quotation.totalAmount.toLocaleString('en-IN')}. Review and accept your quote:`,
            button: {
              color: '#d97706',
              text: 'Review Quotation',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account?tab=quotations`
            }
          },
          outro: `This quotation is valid until ${quotation.validUntil}.`
        }
      }
    }).catch(err => console.warn('[Email] Quotation email delivery skipped:', err.message));
  }

  return res.status(201).json(
    new ApiResponse(201, { quotation }, 'Quotation created and sent successfully.')
  );
});

/**
 * Customer: Get checkout payload from an accepted quotation.
 * POST /api/quotations/:id/checkout
 */
export const checkoutQuotation = asyncHandler(async (req, res) => {
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { quotationId: req.params.id };
  const quotation = await Quotation.findOne(query).lean();

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found.');
  }

  assertOwnerOrAdmin(quotation.user, req.user);

  if (quotation.status !== 'Accepted') {
    throw new ApiError(400, `Quotation status is "${quotation.status}". Only "Accepted" quotations can be checked out.`);
  }

  if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
    throw new ApiError(400, 'This quotation has expired. Please request a refreshed quote.');
  }

  // Validate current stock for each quotation item
  const stockShortages = [];
  for (const item of quotation.items) {
    if (item.productId) {
      const prod = await Product.findById(item.productId).lean();
      if (!prod || (prod.stock || 0) < Number(item.quantity)) {
        stockShortages.push({
          productId: item.productId,
          name: item.name,
          requested: item.quantity,
          available: prod?.stock || 0
        });
      }
    }
  }

  if (stockShortages.length > 0) {
    await Notification.create({
      recipient: 'admin',
      title: 'Quotation Stock Shortage on Checkout',
      message: `Quotation #${quotation.quotationId} has ${stockShortages.length} item(s) short in warehouse stock.`,
      type: 'stock',
      referenceId: quotation.quotationId,
      link: '/admin/inventory'
    });
    throw new ApiError(409, `Warehouse stock shortage for: ${stockShortages.map(s => `${s.name} (${s.available} left)`).join(', ')}. Admin notified.`);
  }

  // Compute pricing using quotation locked rates
  const pricing = await computePricing({
    items: quotation.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    shipping: { state: quotation.customer?.state || 'Karnataka', pincode: quotation.customer?.pincode },
    userId: quotation.user,
    quotation
  });

  return res.status(200).json(
    new ApiResponse(200, {
      quotationId: quotation.quotationId,
      validUntil: quotation.validUntil,
      customer: quotation.customer,
      items: quotation.items,
      pricing
    }, 'Quotation checkout initialized successfully.')
  );
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { quotationId: req.params.id };
  const quotation = await Quotation.findOne(query).lean();

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found.');
  }

  assertOwnerOrAdmin(quotation.user, req.user);

  return res.status(200).json(
    new ApiResponse(200, quotation, 'Quotation fetched successfully')
  );
});

export const getMyQuotations = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);

  const quotations = await Quotation.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, quotations, 'Quotations fetched successfully')
  );
});

import PDFDocument from 'pdfkit';
import SiteSetting from '../models/SiteSetting.js';

export const getAllQuotations = asyncHandler(async (req, res) => {
  const { status, page, limit, q, sort = 'newest' } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (q) {
    const term = q.trim();
    filter.$or = [
      { quotationId: { $regex: term, $options: 'i' } },
      { requestId: { $regex: term, $options: 'i' } },
      { 'customer.name': { $regex: term, $options: 'i' } },
      { 'customer.phone': { $regex: term, $options: 'i' } }
    ];
  }

  const sortObj = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [quotations, total] = await Promise.all([
      Quotation.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Quotation.countDocuments(filter)
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        quotations,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }, 'Quotations fetched successfully')
    );
  }

  const quotations = await Quotation.find(filter).sort(sortObj).lean();
  return res.status(200).json(
    new ApiResponse(200, quotations, 'Quotations fetched successfully')
  );
});

/**
 * Streams formal Quotation PDF.
 */
export const exportQuotationPDF = asyncHandler(async (req, res) => {
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { quotationId: req.params.id };
  const quotation = await Quotation.findOne(query).lean();

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found.');
  }

  assertOwnerOrAdmin(quotation.user, req.user);

  const settings = (await SiteSetting.findOne().lean()) || {};
  const doc = new PDFDocument({ margin: 36, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Quotation-${quotation.quotationId}.pdf"`
  );

  doc.pipe(res);

  // Header
  doc
    .fillColor('#0F172A')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(settings.siteName || 'BuildMart', 36, 36)
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#475569')
    .text(settings.officeAddress || 'BuildMart HQ, Bengaluru', 36, 60)
    .text(`GSTIN: ${settings.sellerGstin || '29AABCB1234F1Z5'} | Hotline: ${settings.supportPhone || '1800-890-5000'}`);

  doc
    .fillColor('#2563EB')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('FORMAL TRADE QUOTATION', 360, 36, { align: 'right', width: 200 })
    .fillColor('#0F172A')
    .fontSize(9)
    .font('Helvetica')
    .text(`Quote ID: #${quotation.quotationId}`, 360, 56, { align: 'right', width: 200 })
    .text(`Ref Request: #${quotation.requestId}`, 360, 68, { align: 'right', width: 200 })
    .text(`Date: ${new Date(quotation.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 360, 80, { align: 'right', width: 200 })
    .text(`Valid Until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : '7 Days'}`, 360, 92, { align: 'right', width: 200 });

  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(36, 115).lineTo(560, 115).stroke();

  // Customer block
  const custY = 125;
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#0F172A')
    .text('Customer & Site Details:', 36, custY);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text(`Name: ${quotation.customer?.name || ''}`, 36, custY + 16)
    .text(`Phone: ${quotation.customer?.phone || ''}`, 36, custY + 28)
    .text(`Delivery Site: ${quotation.customer?.siteAddress || ''}, ${quotation.customer?.city || ''} - ${quotation.customer?.pincode || ''}`, 36, custY + 40)
    .text(`Status: ${quotation.status}`, 380, custY + 16, { align: 'right', width: 180 });

  // Items table
  const tblY = custY + 65;
  doc.rect(36, tblY, 524, 20).fill('#F8FAFC');
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#0F172A')
    .text('#', 42, tblY + 6)
    .text('Description of Quoted Materials', 65, tblY + 6)
    .text('Qty', 290, tblY + 6)
    .text('Quoted Unit Price (₹)', 340, tblY + 6)
    .text('Total (₹)', 485, tblY + 6, { align: 'right', width: 70 });

  let rowY = tblY + 25;
  (quotation.items || []).forEach((item, idx) => {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#0F172A')
      .text(String(idx + 1), 42, rowY)
      .text(`${item.name} (${item.brand || 'Standard'})`, 65, rowY, { width: 215 })
      .text(`${item.quantity} ${item.unit || ''}`, 290, rowY)
      .text(Number(item.unitPrice || 0).toLocaleString('en-IN'), 340, rowY)
      .text(Number(item.totalPrice || (item.unitPrice * item.quantity)).toLocaleString('en-IN'), 485, rowY, { align: 'right', width: 70 });
    rowY += 20;
  });

  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(36, rowY).lineTo(560, rowY).stroke();
  rowY += 10;

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text('Material Subtotal:', 340, rowY)
    .text(`₹${Number(quotation.subtotal || 0).toLocaleString('en-IN')}`, 460, rowY, { align: 'right', width: 95 });
  rowY += 14;

  if (quotation.tax > 0) {
    doc.text('Estimated GST:', 340, rowY)
      .text(`₹${Number(quotation.tax).toLocaleString('en-IN')}`, 460, rowY, { align: 'right', width: 95 });
    rowY += 14;
  }
  if (quotation.deliveryCharge > 0) {
    doc.text('Delivery Logistics:', 340, rowY)
      .text(`₹${Number(quotation.deliveryCharge).toLocaleString('en-IN')}`, 460, rowY, { align: 'right', width: 95 });
    rowY += 14;
  }
  if (quotation.labourCharge > 0) {
    doc.text('Labour Services:', 340, rowY)
      .text(`₹${Number(quotation.labourCharge).toLocaleString('en-IN')}`, 460, rowY, { align: 'right', width: 95 });
    rowY += 14;
  }
  if (quotation.discount > 0) {
    doc.text('Contractor Discount:', 340, rowY)
      .text(`-₹${Number(quotation.discount).toLocaleString('en-IN')}`, 460, rowY, { align: 'right', width: 95 });
    rowY += 14;
  }

  doc.strokeColor('#0F172A').lineWidth(1.5).moveTo(340, rowY).lineTo(560, rowY).stroke();
  rowY += 6;

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0F172A')
    .text('Total Quoted Value:', 340, rowY)
    .text(`₹${Number(quotation.totalAmount).toLocaleString('en-IN')}`, 460, rowY, { align: 'right', width: 95 });

  // Notes
  if (quotation.notes) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#475569')
      .text(`Notes: ${quotation.notes}`, 36, rowY + 20, { width: 280 });
  }

  doc.end();
});

export const respondToQuotation = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    throw new ApiError(400, 'Action must be "accept" or "reject".');
  }

  const query = req.params.id.length === 24 ? { _id: req.params.id } : { quotationId: req.params.id };
  const quotation = await Quotation.findOne({
    ...query,
    user: String(req.user._id),
    status: 'Sent'
  });

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found, already responded to, or you do not have permission.');
  }

  if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
    throw new ApiError(400, 'This quotation has expired and can no longer be accepted.');
  }

  if (action === 'accept') {
    const updated = await Quotation.findOneAndUpdate(
      { _id: quotation._id, status: 'Sent' },
      { status: 'Accepted' },
      { new: true }
    );

    if (!updated) {
      throw new ApiError(409, 'Quotation status updated concurrently.');
    }

    if (quotation.requestId) {
      await MaterialRequest.updateOne(
        { $or: [{ requestId: quotation.requestId }, { _id: quotation.requestId.length === 24 ? quotation.requestId : undefined }] },
        { status: 'Quotation Accepted' }
      );
    }

    await Notification.create({
      recipient: 'admin',
      title: 'Quotation Accepted by Customer',
      message: `${quotation.customer?.name || 'Customer'} accepted Quotation #${quotation.quotationId} (₹${quotation.totalAmount}). Ready for payment.`,
      type: 'quotation',
      referenceId: quotation.quotationId,
      link: '/admin/orders'
    });

    return res.status(200).json(
      new ApiResponse(200, { quotation: updated }, 'Quotation accepted! You can now proceed to payment and confirm delivery.')
    );
  } else {
    const updated = await Quotation.findOneAndUpdate(
      { _id: quotation._id, status: 'Sent' },
      { status: 'Rejected', rejectionReason: rejectionReason || 'Declined by customer' },
      { new: true }
    );

    if (quotation.requestId) {
      await MaterialRequest.updateOne(
        { $or: [{ requestId: quotation.requestId }, { _id: quotation.requestId.length === 24 ? quotation.requestId : undefined }] },
        { status: 'Quotation Rejected' }
      );
    }

    await Notification.create({
      recipient: 'admin',
      title: 'Quotation Declined',
      message: `${quotation.customer?.name || 'Customer'} declined Quotation #${quotation.quotationId}. Reason: ${updated.rejectionReason}`,
      type: 'quotation',
      referenceId: quotation.quotationId,
      link: '/admin/quotations'
    });

    return res.status(200).json(
      new ApiResponse(200, { quotation: updated }, 'Quotation marked as declined.')
    );
  }
});

/**
 * Admin: Revise, resend, or expire a quotation.
 * PUT /api/quotations/admin/:id
 */
export const updateQuotationAdmin = asyncHandler(async (req, res) => {
  const { status, notes, validUntil, deliveryCharge, labourCharge, discount, items, resendEmail } = req.body;
  const query = req.params.id.length === 24 ? { _id: req.params.id } : { quotationId: req.params.id };
  const quotation = await Quotation.findOne(query);

  if (!quotation) {
    throw new ApiError(404, 'Quotation not found.');
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;
  if (validUntil) updateData.validUntil = validUntil;
  if (deliveryCharge != null) updateData.deliveryCharge = Number(deliveryCharge);
  if (labourCharge != null) updateData.labourCharge = Number(labourCharge);
  if (discount != null) updateData.discount = Number(discount);

  if (Array.isArray(items) && items.length > 0) {
    updateData.items = items.map(it => ({
      productId: it.productId,
      name: it.name,
      quantity: Number(it.quantity) || 1,
      unit: it.unit || 'units',
      price: Number(it.price) || 0,
      discount: Number(it.discount) || 0,
      total: ((Number(it.price) || 0) * (Number(it.quantity) || 1)) - (Number(it.discount) || 0),
      inStock: it.inStock !== false
    }));

    const newSubtotal = updateData.items.reduce((sum, it) => sum + (it.total || 0), 0);
    const newTax = Math.round(newSubtotal * 0.18);
    updateData.subtotal = newSubtotal;
    updateData.tax = newTax;
  }

  // Recalculate total if charges or items were updated
  const sub = updateData.subtotal != null ? updateData.subtotal : (quotation.subtotal || 0);
  const tx = updateData.tax != null ? updateData.tax : (quotation.tax || 0);
  const dc = deliveryCharge != null ? Number(deliveryCharge) : (quotation.deliveryCharge || 0);
  const lc = labourCharge != null ? Number(labourCharge) : (quotation.labourCharge || 0);
  const disc = discount != null ? Number(discount) : (quotation.discount || 0);
  updateData.totalAmount = Math.max(0, sub + tx + dc + lc - disc);

  const updated = await Quotation.findByIdAndUpdate(quotation._id, updateData, { new: true }).lean();

  if (resendEmail && quotation.customer?.email) {
    try {
      await Notification.create({
        recipient: 'customer',
        userId: String(quotation.user || ''),
        title: `Quotation #${quotation.quotationId} Revised`,
        message: `Your material quotation #${quotation.quotationId} has been updated. Valid until: ${new Date(updated.validUntil || Date.now() + 48*3600*1000).toLocaleDateString()}.`,
        type: 'quotation',
        referenceId: quotation.quotationId,
        link: `/account?tab=quotations`
      });
    } catch (e) {}
  }

  return res.status(200).json(
    new ApiResponse(200, { quotation: updated }, 'Quotation updated successfully.')
  );
});

export default {
  createQuotation,
  checkoutQuotation,
  getQuotationById,
  getMyQuotations,
  getAllQuotations,
  respondToQuotation,
  updateQuotationAdmin,
  exportQuotationPDF
};
