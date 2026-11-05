const LabourRequest = require('../models/LabourRequest');
const Notification = require('../models/Notification');

exports.submitLabourRequest = async (req, res) => {
  try {
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
      return res.status(400).json({ message: 'Customer name, phone, and work location are required.' });
    }
    if (!labourType || !preferredStartDate || !expectedDuration) {
      return res.status(400).json({ message: 'Labour trade, start date, and expected duration are required.' });
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

    res.status(201).json({
      message: 'Labour service request submitted! Our contractor supervisor will review availability and contact you with rate estimates.',
      bookingId,
      labourRequest: newLabour
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting labour request', error: err.message });
  }
};

exports.getMyLabourBookings = async (req, res) => {
  try {
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
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching labour bookings', error: err.message });
  }
};

exports.getAllLabourRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await LabourRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching labour requests', error: err.message });
  }
};

exports.updateLabourRequest = async (req, res) => {
  try {
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

    const updated = await LabourRequest.findByIdAndUpdate(id, updateData, { new: true }) ||
      await LabourRequest.updateOne({ bookingId: id }, updateData);

    res.json({ message: 'Labour request updated successfully', labourRequest: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating labour request', error: err.message });
  }
};

