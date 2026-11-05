const BulkEnquiry = require('../models/BulkEnquiry');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

exports.submitBulkEnquiry = async (req, res) => {
  try {
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
      return res.status(400).json({ message: 'Full name, phone, email, and project location are required.' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ message: 'At least one product requirement must be specified.' });
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

    res.status(201).json({
      message: 'Bulk material enquiry submitted successfully! A dedicated commercial key accounts manager will review specifications and respond with trade tier pricing.',
      enquiryId,
      enquiry
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting bulk enquiry', error: err.message });
  }
};

exports.getMyBulkEnquiries = async (req, res) => {
  try {
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
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bulk enquiries', error: err.message });
  }
};

exports.getAllBulkEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const enquiries = await BulkEnquiry.find(filter).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bulk enquiries', error: err.message });
  }
};

exports.updateBulkEnquiry = async (req, res) => {
  try {
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
      return res.status(404).json({ message: 'Bulk enquiry not found.' });
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
    res.json({ message: 'Bulk enquiry updated successfully', enquiry: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating bulk enquiry', error: err.message });
  }
};

