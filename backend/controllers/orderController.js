const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const LabourRequest = require('../models/LabourRequest');

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod = 'COD',
      labourDetails,
      couponApplied,
      discount = 0,
      deliveryCharge = 0,
      quotationId
    } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
      return res.status(400).json({ message: 'Customer name, phone, full address, city, and pincode are required.' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart items cannot be empty.' });
    }

    const count = await Order.countDocuments();
    const orderId = `BM-ORD-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(4, '0')}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    let materialCost = 0;
    const orderItems = items.map(item => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const total = price * quantity;
      materialCost += total;
      return {
        productId: item.productId || item._id,
        name: item.name,
        brand: item.brand || '',
        image: item.image || (item.images && item.images[0]) || '',
        quantity,
        unit: item.unit || 'Piece',
        price,
        total
      };
    });

    const tax = Math.round(materialCost * 0.18); // 18% GST typical for construction supplies
    const calculatedDelivery = materialCost >= 5000 ? 0 : Number(deliveryCharge || 250);
    const labourCost = (labourDetails && labourDetails.hasLabour && labourDetails.labourCharges)
      ? Number(labourDetails.labourCharges)
      : 0;

    const totalAmount = Math.max(0, materialCost + tax + calculatedDelivery + labourCost - Number(discount || 0));

    let labourBookingId = null;
    if (labourDetails && labourDetails.hasLabour) {
      const lCount = await LabourRequest.countDocuments();
      labourBookingId = `BM-LBR-${Date.now().toString().slice(-4)}-${(lCount + 1).toString().padStart(3, '0')}`;
      await LabourRequest.create({
        bookingId: labourBookingId,
        user: req.user ? String(req.user._id) : customer.email,
        orderId,
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || '',
          workLocation: `${customer.address}, ${customer.city}`,
          city: customer.city,
          pincode: customer.pincode
        },
        labourType: labourDetails.labourType || 'General construction worker',
        workersRequired: Number(labourDetails.workersRequired) || 1,
        preferredStartDate: labourDetails.preferredStartDate || new Date().toISOString().split('T')[0],
        expectedDuration: labourDetails.expectedDuration || '1 Day',
        additionalInstructions: labourDetails.additionalInstructions || '',
        status: 'Pending Review'
      });
    }

    const order = await Order.create({
      orderId,
      invoiceNumber,
      user: req.user ? String(req.user._id) : (customer.email || 'guest'),
      customer,
      items: orderItems,
      materialCost,
      labourCost,
      labourDetails: labourDetails || { hasLabour: false },
      deliveryCharge: calculatedDelivery,
      tax,
      discount: Number(discount || 0),
      totalAmount,
      couponApplied: couponApplied || '',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      quotationId: quotationId || '',
      labourBookingId: labourBookingId || '',
      timeline: [
        {
          status: 'Confirmed',
          note: 'Order successfully placed. Warehouse notified for picking.',
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Update product stock and inventory
    for (const item of orderItems) {
      if (item.productId) {
        const prod = await Product.findById(item.productId);
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
          await Product.updateOne({ _id: prod._id }, { stock: newStock });
          await Inventory.updateOne({ productId: String(prod._id) }, { currentStock: newStock });
        }
      }
    }

    // Admin notification
    await Notification.create({
      recipient: 'admin',
      title: 'New Confirmed Order Placed!',
      message: `Order #${orderId} placed by ${customer.name} for ₹${totalAmount.toLocaleString('en-IN')}`,
      type: 'order',
      referenceId: orderId,
      link: '/admin/orders'
    });

    res.status(201).json({
      message: 'Order placed successfully! We are preparing your building materials for dispatch.',
      orderId,
      invoiceNumber,
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? String(req.user._id) : null;
    const userEmail = req.user ? req.user.email : null;

    let orders = [];
    if (userId || userEmail) {
      orders = await Order.find({
        $or: [
          { user: userId },
          { 'customer.email': userEmail }
        ]
      }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id) || await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id) || await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const updateData = {};
    if (status) {
      updateData.orderStatus = status;
      const timeline = order.timeline || [];
      timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        timestamp: new Date().toISOString()
      });
      updateData.timeline = timeline;
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true });
    res.json({ message: 'Order updated successfully', order: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
};

