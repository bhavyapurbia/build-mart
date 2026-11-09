import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Quotation from '../models/Quotation.js';
import LabourRequest from '../models/LabourRequest.js';
import BulkEnquiry from '../models/BulkEnquiry.js';
import Inventory from '../models/Inventory.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const getOverviewKPIs = asyncHandler(async (req, res) => {
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

  return res.status(200).json(
    new ApiResponse(200, {
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
    }, 'Admin overview compiled successfully')
  );
});

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: 'customer' });
  const safeCustomers = customers.map(c => {
    const { password, ...safe } = c;
    return safe;
  });
  return res.status(200).json(
    new ApiResponse(200, safeCustomers, 'Customers fetched successfully')
  );
});

export const getInventory = asyncHandler(async (req, res) => {
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
  return res.status(200).json(
    new ApiResponse(200, inventoryList, 'Inventory fetched successfully')
  );
});

export const updateInventoryStock = asyncHandler(async (req, res) => {
  const { productId, stock, minStockLevel } = req.body;
  if (!productId || stock === undefined) {
    throw new ApiError(400, 'Product ID and new stock level required.');
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

  return res.status(200).json(
    new ApiResponse(200, { product: updatedProduct }, 'Inventory updated successfully')
  );
});

export default {
  getOverviewKPIs,
  getCustomers,
  getInventory,
  updateInventoryStock
};
