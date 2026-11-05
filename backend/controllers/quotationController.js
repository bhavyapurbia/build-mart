const Quotation = require('../models/Quotation');
const MaterialRequest = require('../models/MaterialRequest');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

exports.createQuotation = async (req, res) => {
  try {
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
      return res.status(400).json({ message: 'Request ID and quotation items are required.' });
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

    res.status(201).json({ message: 'Quotation generated and sent to customer successfully!', quotation });
  } catch (err) {
    res.status(500).json({ message: 'Error creating quotation', error: err.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id) ||
      await Quotation.findOne({ quotationId: req.params.id });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quotation', error: err.message });
  }
};

exports.getMyQuotations = async (req, res) => {
  try {
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
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quotations', error: err.message });
  }
};

exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quotations', error: err.message });
  }
};

exports.respondToQuotation = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // 'accept' or 'reject'
    const quotation = await Quotation.findById(req.params.id) ||
      await Quotation.findOne({ quotationId: req.params.id });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
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

      return res.json({
        message: 'Quotation accepted! You can now proceed to finalize checkout and schedule delivery.',
        quotation
      });
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

      return res.json({ message: 'Quotation marked as declined.', quotation });
    } else {
      return res.status(400).json({ message: 'Action must be "accept" or "reject".' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating quotation response', error: err.message });
  }
};

