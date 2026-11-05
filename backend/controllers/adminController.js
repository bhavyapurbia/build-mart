const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const MaterialRequest = require('../models/MaterialRequest');
const Quotation = require('../models/Quotation');
const LabourRequest = require('../models/LabourRequest');
const BulkEnquiry = require('../models/BulkEnquiry');
const Inventory = require('../models/Inventory');

exports.getOverviewKPIs = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingMaterialRequests = await MaterialRequest.countDocuments({ status: 'Pending Review' });
    const pendingQuotations = await Quotation.countDocuments({ status: 'Sent' });
    const bulkEnquiries = await BulkEnquiry.countDocuments({ status: 'Received' });
    const labourRequests = await LabourRequest.countDocuments({ status: 'Pending Review' });

    // Calculate total sales
    const allOrders = await Order.find();
    const totalSales = allOrders.reduce((sum, ord) => {
      if (ord.orderStatus !== 'Cancelled') {
        return sum + (Number(ord.totalAmount) || 0);
      }
      return sum;
    }, 0);

    // Low stock products (e.g. stock <= 15)
    const allProducts = await Product.find({ isActive: true });
    const lowStockProducts = allProducts.filter(p => Number(p.stock) <= 15);

    // Recent orders
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    // Recent material requests
    const recentMaterialRequests = (await MaterialRequest.find())
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    res.json({
      metrics: {
        totalCustomers,
        totalProducts,
        totalOrders,
        pendingMaterialRequests,
        pendingQuotations,
        bulkEnquiries,
        labourRequests,
        totalSales,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders,
      recentMaterialRequests
    });
  } catch (err) {
    res.status(500).json({ message: 'Error compiling admin overview', error: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    const safeCustomers = customers.map(c => {
      const { password, ...safe } = c;
      return safe;
    });
    res.json(safeCustomers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const inventoryList = products.map(p => ({
      productId: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      unit: p.unit,
      price: p.price,
      isLowStock: Number(p.stock) <= 15
    }));
    res.json(inventoryList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inventory', error: err.message });
  }
};

exports.updateInventoryStock = async (req, res) => {
  try {
    const { productId, stock, minStockLevel } = req.body;
    if (!productId || stock === undefined) {
      return res.status(400).json({ message: 'Product ID and new stock level required.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { stock: Number(stock) },
      { new: true }
    );

    await Inventory.updateOne(
      { productId },
      { currentStock: Number(stock) }
    );

    res.json({ message: 'Inventory updated successfully', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error updating inventory', error: err.message });
  }
};

