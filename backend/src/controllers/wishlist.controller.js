import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const LIST_PROJECTION = 'name slug sku category subcategory brand price mrp discount unit stock images isFeatured isDeal rating reviewsCount';

/**
 * GET /api/wishlist
 * Fetches user's saved wishlist products.
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);
  const wishlist = await Wishlist.findOne({ user: userId }).lean();

  if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { items: [], count: 0 }, 'Wishlist is empty')
    );
  }

  const products = await Product.find({
    _id: { $in: wishlist.products },
    isActive: true,
    deletedAt: null
  }).select(LIST_PROJECTION).lean();

  return res.status(200).json(
    new ApiResponse(200, { items: products, count: products.length }, 'Wishlist retrieved successfully')
  );
});

/**
 * POST /api/wishlist
 * Adds a single product or merges multiple products (from guest localStorage on login).
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);
  const { productId, productIds } = req.body;

  let idsToAdd = [];
  if (Array.isArray(productIds)) {
    idsToAdd = productIds.map(String).filter(Boolean);
  } else if (productId) {
    idsToAdd = [String(productId)];
  }

  if (idsToAdd.length === 0) {
    throw new ApiError(400, 'Product ID or array of product IDs required.');
  }

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  // Add without duplicates
  const existingSet = new Set(wishlist.products.map(String));
  for (const id of idsToAdd) {
    existingSet.add(id);
  }
  wishlist.products = Array.from(existingSet);
  await wishlist.save();

  return res.status(200).json(
    new ApiResponse(200, { productIds: wishlist.products, count: wishlist.products.length }, 'Item(s) added to wishlist')
  );
});

/**
 * DELETE /api/wishlist/:productId
 * Removes item from wishlist.
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    return res.status(200).json(
      new ApiResponse(200, { count: 0 }, 'Wishlist is empty')
    );
  }

  wishlist.products = wishlist.products.filter(id => String(id) !== String(productId));
  await wishlist.save();

  return res.status(200).json(
    new ApiResponse(200, { productIds: wishlist.products, count: wishlist.products.length }, 'Item removed from wishlist')
  );
});

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};

