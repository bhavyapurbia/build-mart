const MaterialRequest = require('../models/MaterialRequest');
const Notification = require('../models/Notification');
const Quotation = require('../models/Quotation');

exports.submitMaterialRequest = async (req, res) => {
  try {
    const { customer, items, isPaperList, paperListImage } = req.body;
    if (!customer || !customer.name || !customer.phone || !customer.siteAddress) {
      return res.status(400).json({ message: 'Customer name, phone, and site address are required.' });
    }

    let processedItems = items || [];
    if (isPaperList) {
      if (!paperListImage) {
        return res.status(400).json({ message: 'Please provide or snap a photo of the paper material list.' });
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
      return res.status(400).json({ message: 'At least one material item must be selected.' });
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

    res.status(201).json({
      message: isPaperList
        ? 'Paper material list photo uploaded successfully! Our materials engineer is reviewing your handwritten list and will issue a formal quotation.'
        : 'Material list submitted successfully! Our materials engineer will review stock and provide your formal quotation shortly.',
      requestId,
      request: newRequest
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting material list', error: err.message });
  }
};

exports.getMyMaterialRequests = async (req, res) => {
  try {
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
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your material requests', error: err.message });
  }
};

exports.getAllMaterialRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await MaterialRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching material requests', error: err.message });
  }
};

exports.getMaterialRequestById = async (req, res) => {
  try {
    const request = await MaterialRequest.findById(req.params.id) ||
      await MaterialRequest.findOne({ requestId: req.params.id });

    if (!request) {
      return res.status(404).json({ message: 'Material request not found.' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching request details', error: err.message });
  }
};

exports.updateMaterialRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updated = await MaterialRequest.findByIdAndUpdate(req.params.id, updateData, { new: true }) ||
      await MaterialRequest.updateOne({ requestId: req.params.id }, updateData);

    res.json({ message: 'Material request status updated', request: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating material request', error: err.message });
  }
};

