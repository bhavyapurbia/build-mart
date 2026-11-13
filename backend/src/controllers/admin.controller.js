import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Quotation from '../models/Quotation.js';
import LabourRequest from '../models/LabourRequest.js';
import BulkEnquiry from '../models/BulkEnquiry.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

/**
 * GET /api/admin/overview
 * Real-time analytics computed strictly using MongoDB aggregations and countDocuments.
 * Zero unconstrained collection scans or in-memory arrays.
 */
export const getOverviewKPIs = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Parallel KPI count queries and aggregations
  const [
    totalCustomers,
    totalProducts,
    totalOrders,
    pendingMaterialRequests,
    pendingQuotations,
    bulkEnquiries,
    labourRequests,
    salesAgg,
    revenuePerDay,
    ordersByStatusAgg,
    topProducts,
    lowStockCount,
    lowStockProducts,
    recentOrders,
    recentMaterialRequests,
    funnelCounts
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true, deletedAt: null }),
    Order.countDocuments(),
    MaterialRequest.countDocuments({ status: 'Pending Review' }),
    Quotation.countDocuments({ status: 'Sent' }),
    BulkEnquiry.countDocuments({ status: 'Received' }),
    LabourRequest.countDocuments({ status: 'Pending Review' }),

    // Total revenue aggregation (excluding cancelled orders)
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]),

    // Revenue per day over last 30 days
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Order status distribution
    Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]),

    // Top 10 selling products by quantity
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          productId: { $first: '$items.productId' },
          brand: { $first: '$items.brand' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 }
    ]),

    // Low stock count
    Product.countDocuments({ isActive: true, deletedAt: null, stock: { $lte: 15 } }),

    // Low stock product preview (capped at 15 items)
    Product.find({ isActive: true, deletedAt: null, stock: { $lte: 15 } })
      .select('name sku category brand stock unit price')
      .sort({ stock: 1 })
      .limit(15)
      .lean(),

    // Recent orders (projection only)
    Order.find()
      .select('orderId customer.name customer.phone totalAmount orderStatus paymentStatus paymentMethod createdAt')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),

    // Recent material requests (projection only)
    MaterialRequest.find()
      .select('requestId customer.name customer.phone status items quotationId createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Sales Funnel
    Promise.all([
      MaterialRequest.countDocuments(),
      Quotation.countDocuments(),
      Quotation.countDocuments({ status: { $in: ['Accepted', 'Converted to Order'] } }),
      Order.countDocuments({ quotationId: { $exists: true, $ne: '' } })
    ])
  ]);

  const totalSales = salesAgg[0]?.totalSales || 0;
  const ordersByStatus = ordersByStatusAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const funnel = {
    requests: funnelCounts[0],
    quotations: funnelCounts[1],
    accepted: funnelCounts[2],
    converted: funnelCounts[3]
  };

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
        lowStockCount
      },
      ordersByStatus,
      revenuePerDay,
      topProducts,
      funnel,
      lowStockProducts,
      recentOrders,
      recentMaterialRequests
    }, 'Admin overview compiled successfully')
  );
});

/**
 * GET /api/admin/customers
 * Paginated customers query with search.
 */
export const getCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q, sort = 'newest' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = { role: 'customer' };
  if (q) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex }
    ];
  }

  const sortObj = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      customers,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }, 'Customers fetched successfully')
  );
});

/**
 * GET /api/admin/inventory
 * Paginated inventory view with category and lowStock filters.
 */
export const getInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, q, category, lowStock, sort } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  const filter = { isActive: true, deletedAt: null };

  if (category) {
    filter.category = category;
  }
  if (lowStock === 'true' || lowStock === true) {
    filter.stock = { $lte: 15 };
  }
  if (q) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { name: regex },
      { sku: regex },
      { brand: regex }
    ];
  }

  let sortObj = { stock: 1 };
  if (sort === 'stock-desc') sortObj = { stock: -1 };
  else if (sort === 'name-asc') sortObj = { name: 1 };
  else if (sort === 'newest') sortObj = { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('name sku category brand stock unit price minOrderQty')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter)
  ]);

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
    new ApiResponse(200, {
      inventory: inventoryList,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }, 'Inventory fetched successfully')
  );
});

export const updateInventoryStock = asyncHandler(async (req, res) => {
  const { productId, stock } = req.body;
  if (!productId || stock === undefined) {
    throw new ApiError(400, 'Product ID and new stock level required.');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { stock: Number(stock) },
    { new: true }
  );

  await Inventory.updateOne(
    { productId: String(productId) },
    { currentStock: Number(stock) }
  );

  return res.status(200).json(
    new ApiResponse(200, { product: updatedProduct }, 'Inventory updated successfully')
  );
});

/**
 * GET /api/admin/export/:resource?format=csv
 * Streams CSV export for orders, customers, or products.
 */
export const exportResource = asyncHandler(async (req, res) => {
  const { resource } = req.params;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="buildmart-${resource}-${new Date().toISOString().slice(0, 10)}.csv"`);

  if (resource === 'orders') {
    res.write('Order ID,Customer Name,Customer Phone,Customer City,Total Amount,Status,Payment Status,Payment Method,Created At\r\n');
    const cursor = Order.find()
      .select('orderId customer.name customer.phone customer.city totalAmount orderStatus paymentStatus paymentMethod createdAt')
      .sort({ createdAt: -1 })
      .cursor();

    for await (const doc of cursor) {
      const line = [
        `"${doc.orderId || ''}"`,
        `"${(doc.customer?.name || '').replace(/"/g, '""')}"`,
        `"${doc.customer?.phone || ''}"`,
        `"${doc.customer?.city || ''}"`,
        doc.totalAmount || 0,
        `"${doc.orderStatus || ''}"`,
        `"${doc.paymentStatus || ''}"`,
        `"${doc.paymentMethod || ''}"`,
        `"${doc.createdAt ? new Date(doc.createdAt).toISOString() : ''}"`
      ].join(',');
      res.write(line + '\r\n');
    }
    return res.end();
  }

  if (resource === 'customers') {
    res.write('Name,Email,Phone,Created At\r\n');
    const cursor = User.find({ role: 'customer' })
      .select('name email phone createdAt')
      .sort({ createdAt: -1 })
      .cursor();

    for await (const doc of cursor) {
      const line = [
        `"${(doc.name || '').replace(/"/g, '""')}"`,
        `"${doc.email || ''}"`,
        `"${doc.phone || ''}"`,
        `"${doc.createdAt ? new Date(doc.createdAt).toISOString() : ''}"`
      ].join(',');
      res.write(line + '\r\n');
    }
    return res.end();
  }

  if (resource === 'products') {
    res.write('SKU,Name,Category,Brand,Price,MRP,Stock,Unit,Is Active\r\n');
    const cursor = Product.find({ deletedAt: null })
      .select('sku name category brand price mrp stock unit isActive')
      .sort({ name: 1 })
      .cursor();

    for await (const doc of cursor) {
      const line = [
        `"${doc.sku || ''}"`,
        `"${(doc.name || '').replace(/"/g, '""')}"`,
        `"${doc.category || ''}"`,
        `"${doc.brand || ''}"`,
        doc.price || 0,
        doc.mrp || 0,
        doc.stock || 0,
        `"${doc.unit || ''}"`,
        doc.isActive ? 'true' : 'false'
      ].join(',');
      res.write(line + '\r\n');
    }
    return res.end();
  }

  throw new ApiError(400, `Unsupported export resource: ${resource}. Supported: orders, customers, products.`);
});

import AuditLog from '../models/AuditLog.js';
import { recordAuditLog } from '../utils/audit.js';
import { nextSequence } from '../utils/counter.js';

/**
 * GET /api/admin/audit-log
 * Paginated audit trail viewer with entity and actor filtering.
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, entity, action } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (entity) filter.entity = entity;
  if (action) filter.action = action;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }, 'Audit logs retrieved successfully')
  );
});

/**
 * PUT /api/admin/customers/:id/status
 * Deactivates/reactivates a customer and saves internal notes.
 */
export const updateCustomerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, internalNotes } = req.body;

  const customer = await User.findById(id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  const before = { isActive: customer.isActive, internalNotes: customer.internalNotes };

  if (isActive !== undefined) customer.isActive = !!isActive;
  if (internalNotes !== undefined) customer.internalNotes = String(internalNotes);
  await customer.save();

  await recordAuditLog({
    actor: req.user,
    action: 'UPDATE_CUSTOMER_STATUS',
    entity: 'User',
    entityId: customer._id,
    before,
    after: { isActive: customer.isActive, internalNotes: customer.internalNotes },
    req
  });

  return res.status(200).json(
    new ApiResponse(200, { customer }, 'Customer record updated successfully.')
  );
});

/**
 * GET /api/admin/customers/:id/orders
 * Returns all historical orders for a given customer.
 */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await User.findById(id).lean();
  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  const orders = await Order.find({
    $or: [
      { user: String(customer._id) },
      { 'customer.phone': customer.phone },
      { 'customer.email': customer.email }
    ]
  }).sort({ createdAt: -1 }).lean();

  return res.status(200).json(
    new ApiResponse(200, { orders, count: orders.length }, 'Customer orders fetched successfully')
  );
});

/**
 * POST /api/admin/inventory/bulk-update
 * Bulk updates stock levels and thresholds across multiple inventory items.
 */
export const bulkUpdateInventory = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Updates array is required.');
  }

  let updatedCount = 0;
  for (const item of updates) {
    if (item.productId && item.stock !== undefined) {
      await Product.findByIdAndUpdate(item.productId, {
        stock: Math.max(0, Number(item.stock))
      });

      const invUpdate = { currentStock: Math.max(0, Number(item.stock)) };
      if (item.minStockLevel !== undefined) invUpdate.minStockLevel = Number(item.minStockLevel);
      if (item.reorderPoint !== undefined) invUpdate.reorderPoint = Number(item.reorderPoint);

      await Inventory.updateOne(
        { productId: String(item.productId) },
        invUpdate
      );
      updatedCount++;
    }
  }

  await recordAuditLog({
    actor: req.user,
    action: 'BULK_INVENTORY_UPDATE',
    entity: 'Inventory',
    entityId: 'multiple',
    after: { updatedCount },
    req
  });

  return res.status(200).json(
    new ApiResponse(200, { updatedCount }, `Successfully updated ${updatedCount} inventory item(s).`)
  );
});

/**
 * GET /api/admin/inventory/:productId/history
 * Views stock movement audit history for an inventory item.
 */
export const getInventoryHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const inv = await Inventory.findOne({ productId: String(productId) }).lean();
  if (!inv) {
    throw new ApiError(404, 'Inventory record not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { history: inv.history || [] }, 'Inventory history fetched successfully')
  );
});

/**
 * POST /api/admin/products/:id/duplicate
 * Clones a product with unique slug and SKU counter.
 */
export const duplicateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const original = await Product.findById(id).lean();
  if (!original) {
    throw new ApiError(404, 'Original product not found.');
  }

  const skuSeq = await nextSequence('product_sku');
  const newSku = `BM-SKU-${skuSeq.toString().padStart(6, '0')}`;
  const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;

  const duplicateData = {
    ...original,
    _id: undefined,
    name: `${original.name} (Copy)`,
    sku: newSku,
    slug: newSlug,
    rating: 0,
    reviewsCount: 0,
    createdAt: undefined,
    updatedAt: undefined
  };

  const copy = await Product.create(duplicateData);
  await Inventory.create({
    productId: String(copy._id),
    productName: copy.name,
    sku: copy.sku,
    currentStock: copy.stock,
    unit: copy.unit
  });

  await recordAuditLog({
    actor: req.user,
    action: 'DUPLICATE_PRODUCT',
    entity: 'Product',
    entityId: copy._id,
    after: { originalId: id, newSku },
    req
  });

  return res.status(201).json(
    new ApiResponse(201, { product: copy }, 'Product duplicated successfully!')
  );
});

/**
 * POST /api/admin/products/bulk-import
 * Imports multiple products with dry-run verification mode.
 */
export const bulkImportProducts = asyncHandler(async (req, res) => {
  const { products, dryRun = false } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, 'Products list is required for bulk import.');
  }

  const errors = [];
  const validProducts = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.name || !p.category || !p.brand || p.price === undefined || p.mrp === undefined) {
      errors.push({ row: i + 1, error: 'Missing name, category, brand, price, or mrp.' });
      continue;
    }

    const price = Number(p.price);
    const mrp = Number(p.mrp);
    if (isNaN(price) || isNaN(mrp)) {
      errors.push({ row: i + 1, error: 'Price and MRP must be valid numbers.' });
      continue;
    }

    validProducts.push({
      ...p,
      price,
      mrp,
      discount: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
      stock: Math.max(0, Number(p.stock) || 0),
      minOrderQty: Math.max(1, Number(p.minOrderQty) || 1),
      gstRate: Number(p.gstRate) || 18,
      hsnCode: p.hsnCode || '2523',
      unit: p.unit || 'Piece',
      images: Array.isArray(p.images) && p.images.length ? p.images : ['/placeholder-material.jpg'],
      isActive: p.isActive !== false
    });
  }

  if (dryRun) {
    return res.status(200).json(
      new ApiResponse(200, {
        dryRun: true,
        totalSubmitted: products.length,
        validCount: validProducts.length,
        errorCount: errors.length,
        errors,
        preview: validProducts.slice(0, 5)
      }, 'Dry-run validation complete.')
    );
  }

  const inserted = [];
  for (const item of validProducts) {
    const skuSeq = await nextSequence('product_sku');
    const sku = item.sku || `BM-SKU-${skuSeq.toString().padStart(6, '0')}`;
    const baseSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const doc = await Product.create({ ...item, sku, slug });
    await Inventory.create({
      productId: String(doc._id),
      productName: doc.name,
      sku: doc.sku,
      currentStock: doc.stock,
      unit: doc.unit
    });
    inserted.push(doc);
  }

  return res.status(201).json(
    new ApiResponse(201, {
      importedCount: inserted.length,
      errorsCount: errors.length,
      errors
    }, `Successfully imported ${inserted.length} product(s).`)
  );
});

export default {
  getOverviewKPIs,
  getCustomers,
  getInventory,
  updateInventoryStock,
  exportResource,
  getAuditLogs,
  updateCustomerStatus,
  getCustomerOrders,
  bulkUpdateInventory,
  getInventoryHistory,
  duplicateProduct,
  bulkImportProducts
};
