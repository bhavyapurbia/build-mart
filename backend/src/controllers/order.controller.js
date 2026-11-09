import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import LabourRequest from '../models/LabourRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/Email.js';

export const createOrder = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, 'Customer name, phone, full address, city, and pincode are required.');
  }
  if (!items || !items.length) {
    throw new ApiError(400, 'Cart items cannot be empty.');
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
  const calculatedDelivery = 0; // Free delivery (removed for payment testing)
  const labourCost = (labourDetails && labourDetails.hasLabour && labourDetails.labourCharges)
    ? Number(labourDetails.labourCharges)
    : 0;

  const totalAmount = Math.max(0, materialCost + tax + calculatedDelivery + labourCost - Number(discount || 0));

  let labourBookingId = null;
  if (labourDetails && labourDetails.hasLabour) {
    const lCount = await LabourRequest.countDocuments();
    labourBookingId = `BM-LBR-${Date.now().toString().slice(-4)}-${(lCount + 1).toString().padStart(3, '0')}`;
    await LabourRequest.create({
      requestId: labourBookingId,
      user: req.user ? String(req.user._id) : null,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        siteAddress: `${customer.address}, ${customer.city} - ${customer.pincode}`
      },
      workType: labourDetails.workType || 'Masonry & General Construction',
      workersNeeded: Number(labourDetails.workersNeeded) || 2,
      daysNeeded: Number(labourDetails.daysNeeded) || 3,
      startDate: labourDetails.startDate || new Date().toISOString().split('T')[0],
      siteLocation: `${customer.city}, ${customer.state || 'Karnataka'}`,
      estimatedCost: labourCost,
      status: 'Pending Assignment',
      notes: `Booked alongside Material Order #${orderId}`
    });
  }

  const order = await Order.create({
    orderId,
    invoiceNumber,
    user: req.user ? String(req.user._id) : null,
    customer,
    items: orderItems,
    quotationId: quotationId || '',
    pricing: {
      subtotal: materialCost,
      tax,
      deliveryCharge: calculatedDelivery,
      labourCost,
      discount: Number(discount || 0),
      total: totalAmount
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'Online' || paymentMethod === 'UPI' ? 'Paid' : 'Pending',
    orderStatus: 'Confirmed',
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

  // Asynchronous order confirmation email
  if (customer.email) {
    sendEmail({
      email: customer.email,
      subject: `Order Confirmation - #${orderId} - BuildMart`,
      mailgenContent: {
        body: {
          name: customer.name,
          intro: `Your order #${orderId} has been confirmed and forwarded to the nearest fulfillment hub.`,
          action: {
            instructions: `Total Amount Payable: ₹${totalAmount.toLocaleString('en-IN')}. Payment Mode: ${paymentMethod}.`,
            button: {
              color: '#e05a00',
              text: 'View Your Orders',
              link: `${process.env.CLIENT_URL || 'http://localhost:5173'}/account`
            }
          },
          outro: 'Thank you for choosing BuildMart for your construction materials procurement!'
        }
      }
    }).catch(err => console.warn('Order confirmation email skipped:', err.message));
  }

  return res.status(201).json(
    new ApiResponse(201, {
      orderId,
      invoiceNumber,
      order
    }, 'Order placed successfully! We are preparing your building materials for dispatch.')
  );
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id || req.user.id || '') : null;
  const userEmail = req.user ? req.user.email : null;

  let orders = [];
  if (userId || userEmail) {
    const orConditions = [];
    if (userId) orConditions.push({ user: userId });
    if (userEmail) orConditions.push({ 'customer.email': userEmail });

    orders = await Order.find({ $or: orConditions }).sort({ createdAt: -1 });

    // Link unlinked orders with matching email to this user
    if (userId && orders.length > 0) {
      for (const ord of orders) {
        if (!ord.user) {
          try {
            await Order.updateOne({ _id: ord._id }, { user: userId });
          } catch (e) {}
        }
      }
    }
  }

  return res.status(200).json(
    new ApiResponse(200, orders, 'Orders fetched successfully')
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id) || await Order.findOne({ orderId: req.params.id });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, order, 'Order retrieved successfully')
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, orders, 'Orders fetched successfully')
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id) || await Order.findOne({ orderId: req.params.id });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
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
  return res.status(200).json(
    new ApiResponse(200, { order: updated }, 'Order updated successfully')
  );
});

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
