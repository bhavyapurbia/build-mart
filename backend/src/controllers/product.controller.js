import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { nextSequence } from '../utils/counter.js';

const LIST_PROJECTION = 'name slug sku category subcategory brand price mrp discount unit stock minOrderQty gstRate hsnCode images isFeatured isDeal rating reviewsCount';

/**
 * GET /api/products
 * Scalable product search & listing with DB-level filtering, sorting, pagination, and projections.
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    brand,
    search,
    q,
    deal,
    featured,
    inStock,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 24
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  const filter = { isActive: true, deletedAt: null };

  // Category filter (by name or slug)
  if (category) {
    filter.$or = [
      { category: category },
      { category: { $regex: `^${category.replace(/-/g, ' ')}$`, $options: 'i' } }
    ];
  }

  // Subcategory filter
  if (subcategory) {
    filter.subcategory = subcategory;
  }

  // Brand filter (supports comma-separated string or array)
  if (brand) {
    const brandList = Array.isArray(brand)
      ? brand
      : brand.split(',').map(b => b.trim()).filter(Boolean);
    if (brandList.length === 1) {
      filter.brand = { $regex: brandList[0], $options: 'i' };
    } else if (brandList.length > 1) {
      filter.brand = { $in: brandList.map(b => new RegExp(b, 'i')) };
    }
  }

  // In stock filter
  if (inStock === 'true' || inStock === true) {
    filter.stock = { $gt: 0 };
  }

  // Deals and Featured filters
  if (deal === 'true' || deal === true) {
    filter.isDeal = true;
  }
  if (featured === 'true' || featured === true) {
    filter.isFeatured = true;
  }

  // Price range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // Full-text search with regex fallback for short terms (< 3 chars)
  const searchQuery = (search || q || '').trim();
  let isTextSearch = false;

  if (searchQuery) {
    if (searchQuery.length >= 3) {
      filter.$text = { $search: searchQuery };
      isTextSearch = true;
    } else {
      const regex = new RegExp(searchQuery, 'i');
      filter.$or = [
        { name: regex },
        { brand: regex },
        { category: regex },
        { sku: regex }
      ];
    }
  }

  // Determine sort order
  let sortObj = { createdAt: -1 };
  let projection = LIST_PROJECTION;

  if (sort === 'relevance' && isTextSearch) {
    sortObj = { score: { $meta: 'textScore' } };
    projection += ' score';
  } else if (sort === 'price-asc') {
    sortObj = { price: 1 };
  } else if (sort === 'price-desc') {
    sortObj = { price: -1 };
  } else if (sort === 'rating') {
    sortObj = { rating: -1, reviewsCount: -1 };
  } else if (sort === 'discount') {
    sortObj = { discount: -1 };
  } else if (sort === 'newest') {
    sortObj = { createdAt: -1 };
  }

  // Execute find query and count query in parallel
  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(projection)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages
    }, 'Products fetched successfully')
  );
});

/**
 * GET /api/products/facets
 * Aggregation endpoint returning dynamic brand counts, category counts, and price min/max.
 */
export const getProductFacets = asyncHandler(async (req, res) => {
  const { category, subcategory, brand } = req.query;
  const match = { isActive: true, deletedAt: null };

  if (category) {
    match.$or = [
      { category },
      { category: { $regex: `^${category.replace(/-/g, ' ')}$`, $options: 'i' } }
    ];
  }
  if (subcategory) {
    match.subcategory = subcategory;
  }
  if (brand) {
    match.brand = { $regex: brand, $options: 'i' };
  }

  const facets = await Product.aggregate([
    { $match: match },
    {
      $facet: {
        brands: [
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } }
        ],
        categories: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } }
        ],
        subcategories: [
          { $match: { subcategory: { $ne: '' } } },
          { $group: { _id: '$subcategory', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } }
        ],
        priceRange: [
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' }
            }
          }
        ]
      }
    }
  ]);

  const result = facets[0] || { brands: [], categories: [], subcategories: [], priceRange: [] };
  const priceInfo = result.priceRange[0] || { minPrice: 0, maxPrice: 100000 };

  return res.status(200).json(
    new ApiResponse(200, {
      brands: result.brands.map(b => ({ name: b._id, count: b.count })),
      categories: result.categories.map(c => ({ name: c._id, count: c.count })),
      subcategories: result.subcategories.map(s => ({ name: s._id, count: s.count })),
      minPrice: priceInfo.minPrice || 0,
      maxPrice: priceInfo.maxPrice || 100000
    }, 'Facets retrieved successfully')
  );
});

/**
 * GET /api/products/suggest?q=
 * Lightweight typeahead endpoint returning up to 8 products with minimal projection.
 */
export const getProductSuggestions = asyncHandler(async (req, res) => {
  const query = (req.query.q || req.query.search || '').trim();
  if (!query) {
    return res.status(200).json(new ApiResponse(200, [], 'Empty query'));
  }

  const regex = new RegExp(query, 'i');
  const suggestions = await Product.find({
    isActive: true,
    deletedAt: null,
    $or: [
      { name: regex },
      { brand: regex },
      { category: regex },
      { sku: regex }
    ]
  })
    .select('_id name slug price mrp unit images brand category')
    .limit(8)
    .lean();

  const formatted = suggestions.map(p => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    mrp: p.mrp,
    brand: p.brand,
    category: p.category,
    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '/placeholder-material.jpg'
  }));

  return res.status(200).json(
    new ApiResponse(200, formatted, 'Suggestions retrieved successfully')
  );
});

/**
 * GET /api/products/:idOrSlug
 * Resolves by slug or valid ObjectId without throwing CastError on invalid ids.
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);

  const query = isObjectId
    ? { $or: [{ _id: id }, { slug: id }], isActive: true, deletedAt: null }
    : { slug: id, isActive: true, deletedAt: null };

  const product = await Product.findOne(query).lean();
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, product, 'Product fetched successfully')
  );
});

/**
 * GET /api/products/:id/related
 * Returns up to 8 related products in the same category or brand, excluding current item.
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);

  const current = isObjectId
    ? await Product.findById(id).select('category brand').lean()
    : await Product.findOne({ slug: id }).select('category brand').lean();

  if (!current) {
    throw new ApiError(404, 'Product not found.');
  }

  const related = await Product.find({
    _id: { $ne: current._id },
    isActive: true,
    deletedAt: null,
    category: current.category,
    stock: { $gt: 0 }
  })
    .select(LIST_PROJECTION)
    .limit(8)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, related, 'Related products fetched successfully')
  );
});

export const getDeals = asyncHandler(async (req, res) => {
  const deals = await Product.find({ isDeal: true, isActive: true, deletedAt: null })
    .select(LIST_PROJECTION)
    .limit(8)
    .lean();
  return res.status(200).json(
    new ApiResponse(200, deals, 'Deals fetched successfully')
  );
});

export const getBestsellers = asyncHandler(async (req, res) => {
  const bestsellers = await Product.find({ isFeatured: true, isActive: true, deletedAt: null })
    .select(LIST_PROJECTION)
    .limit(8)
    .lean();
  return res.status(200).json(
    new ApiResponse(200, bestsellers, 'Bestsellers fetched successfully')
  );
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    subcategory,
    brand,
    price,
    mrp,
    unit,
    stock = 0,
    minOrderQty = 1,
    gstRate = 18,
    hsnCode = '2523',
    weightKg = 0,
    description,
    specifications,
    images,
    isFeatured,
    isDeal
  } = req.body;

  if (!name || !category || !brand || price === undefined || mrp === undefined) {
    throw new ApiError(400, 'Name, category, brand, price and MRP are required.');
  }

  // Unique SKU via atomic counter
  const skuSeq = await nextSequence('product_sku');
  const sku = req.body.sku || `BM-SKU-${skuSeq.toString().padStart(6, '0')}`;

  // Unique slug with collision handling
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const numPrice = Number(price);
  const numMrp = Number(mrp);
  const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

  const product = await Product.create({
    name,
    slug,
    sku,
    category,
    subcategory: subcategory || '',
    brand,
    price: numPrice,
    mrp: numMrp,
    discount,
    unit: unit || 'Piece',
    stock: Math.max(0, Number(stock) || 0),
    minOrderQty: Math.max(1, Number(minOrderQty) || 1),
    gstRate: Number(gstRate) || 18,
    hsnCode: hsnCode || '2523',
    weightKg: Number(weightKg) || 0,
    description: description || '',
    specifications: specifications || [],
    images: Array.isArray(images) && images.length ? images : ['/placeholder-material.jpg'],
    isFeatured: !!isFeatured,
    isDeal: !!isDeal,
    isActive: true
  });

  // Sync inventory record
  await Inventory.create({
    productId: String(product._id),
    productName: product.name,
    sku: product.sku,
    currentStock: product.stock,
    unit: product.unit
  });

  return res.status(201).json(
    new ApiResponse(201, { product }, 'Product created successfully')
  );
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Strict whitelist for updatable fields
  const allowedFields = [
    'name', 'category', 'subcategory', 'brand', 'price', 'mrp',
    'unit', 'stock', 'minOrderQty', 'gstRate', 'hsnCode', 'weightKg',
    'description', 'specifications', 'images', 'isFeatured', 'isDeal', 'isActive'
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.mrp !== undefined) updateData.mrp = Number(updateData.mrp);
  if (updateData.stock !== undefined) updateData.stock = Math.max(0, Number(updateData.stock));
  if (updateData.minOrderQty !== undefined) updateData.minOrderQty = Math.max(1, Number(updateData.minOrderQty));

  if (updateData.mrp && updateData.price) {
    updateData.discount = updateData.mrp > updateData.price
      ? Math.round(((updateData.mrp - updateData.price) / updateData.mrp) * 100)
      : 0;
  }

  const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Product not found.');
  }

  // Update inventory current stock if stock was explicitly modified
  if (updateData.stock !== undefined) {
    await Inventory.updateOne(
      { productId: String(id) },
      { currentStock: updateData.stock }
    );
  }

  return res.status(200).json(
    new ApiResponse(200, { product: updated }, 'Product updated successfully')
  );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Soft delete if referenced in any order to preserve purchase history & invoice integrity
  const orderWithProduct = await Order.findOne({ 'items.productId': String(id) });

  if (orderWithProduct) {
    await Product.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() });
    return res.status(200).json(
      new ApiResponse(200, null, 'Product deactivated (soft-deleted) because existing orders reference it.')
    );
  }

  await Product.findByIdAndDelete(id);
  await Inventory.deleteOne({ productId: String(id) });

  return res.status(200).json(
    new ApiResponse(200, null, 'Product deleted successfully.')
  );
});

export default {
  getProducts,
  getProductFacets,
  getProductSuggestions,
  getProductById,
  getRelatedProducts,
  getDeals,
  getBestsellers,
  createProduct,
  updateProduct,
  deleteProduct
};
