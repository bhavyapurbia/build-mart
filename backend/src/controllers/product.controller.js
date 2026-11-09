import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    subcategory,
    brand,
    search,
    deal,
    featured,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 24
  } = req.query;

  let filter = { isActive: true };

  if (category) {
    filter.category = category;
  }
  if (subcategory) {
    filter.subcategory = subcategory;
  }
  if (brand) {
    const coreBrand = brand.split(' by ')[0].replace(/India.*|Group.*|Ltd\.*/gi, '').trim();
    filter.brand = { $regex: coreBrand || brand, $options: 'i' };
  }
  if (deal === 'true') {
    filter.isDeal = true;
  }
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  let products = await Product.find(filter);

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    products = products.filter(p => Number(p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => Number(p.price) <= Number(maxPrice));
  }

  // Sort
  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === 'discount') {
    products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else {
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const total = products.length;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      products: paginatedProducts,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      total
    }, 'Products fetched successfully')
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, product, 'Product fetched successfully')
  );
});

export const getDeals = asyncHandler(async (req, res) => {
  const deals = await Product.find({ isDeal: true, isActive: true }).limit(8);
  return res.status(200).json(
    new ApiResponse(200, deals, 'Deals fetched successfully')
  );
});

export const getBestsellers = asyncHandler(async (req, res) => {
  const bestsellers = await Product.find({ isFeatured: true, isActive: true }).limit(8);
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
    stock,
    description,
    specifications,
    images,
    isFeatured,
    isDeal
  } = req.body;

  if (!name || !category || !brand || price === undefined || mrp === undefined) {
    throw new ApiError(400, 'Name, category, brand, price and MRP are required.');
  }

  const sku = 'BM-' + Date.now().toString().slice(-6);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const product = await Product.create({
    name,
    slug,
    sku,
    category,
    subcategory: subcategory || '',
    brand,
    price: Number(price),
    mrp: Number(mrp),
    discount,
    unit: unit || 'Piece',
    stock: Number(stock) || 50,
    description: description || '',
    specifications: specifications || [],
    images: Array.isArray(images) && images.length ? images : ['/placeholder-material.jpg'],
    isFeatured: !!isFeatured,
    isDeal: !!isDeal,
    isActive: true
  });

  // Sync inventory record
  await Inventory.create({
    productId: product._id,
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
  const updateData = { ...req.body };

  if (updateData.mrp && updateData.price) {
    updateData.discount = updateData.mrp > updateData.price
      ? Math.round(((updateData.mrp - updateData.price) / updateData.mrp) * 100)
      : 0;
  }

  const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Product not found.');
  }

  // Update inventory if stock changed
  if (updateData.stock !== undefined) {
    await Inventory.updateOne(
      { productId: id },
      { currentStock: Number(updateData.stock) }
    );
  }

  return res.status(200).json(
    new ApiResponse(200, { product: updated }, 'Product updated successfully')
  );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const removed = await Product.findByIdAndDelete(id);
  if (!removed) {
    throw new ApiError(404, 'Product not found.');
  }
  await Inventory.deleteOne({ productId: id });
  return res.status(200).json(
    new ApiResponse(200, null, 'Product deleted successfully.')
  );
});

export default {
  getProducts,
  getProductById,
  getDeals,
  getBestsellers,
  createProduct,
  updateProduct,
  deleteProduct
};
