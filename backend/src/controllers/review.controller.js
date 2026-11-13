import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { NOTIFICATION_RECIPIENT, NOTIFICATION_TYPE } from '../constants/enums.js';

/**
 * Helper to atomically recalculate ratingAvg and reviewsCount onto Product.
 */
export const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId: String(productId), isHidden: false } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;

  const isObjectId = mongoose.Types.ObjectId.isValid(productId);
  await Product.updateOne(
    isObjectId ? { _id: productId } : { slug: productId },
    { rating: avgRating, reviewsCount: count }
  );

  return { avgRating, count };
};

/**
 * POST /api/products/:id/reviews
 * Creates a verified/unverified customer review and denormalizes rating to Product.
 */
export const createReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5.');
  }

  if (!comment || comment.trim().length < 5) {
    throw new ApiError(400, 'Review comment must be at least 5 characters long.');
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const product = await Product.findOne(
    isObjectId ? { $or: [{ _id: id }, { slug: id }], isActive: true } : { slug: id, isActive: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const userId = String(req.user._id);
  const prodIdStr = String(product._id);

  // Review spam check: only 1 review per user per product
  const existingReview = await Review.findOne({ productId: prodIdStr, user: userId });
  if (existingReview) {
    throw new ApiError(400, 'You have already submitted a review for this product.');
  }

  // Server-side verified purchase check: check if user has a delivered order containing this product
  const deliveredOrder = await Order.findOne({
    user: userId,
    orderStatus: 'Delivered',
    'items.productId': prodIdStr
  });
  const verifiedPurchase = !!deliveredOrder;

  const review = await Review.create({
    productId: prodIdStr,
    user: userId,
    userName: req.user.name || 'Verified Customer',
    rating: Math.round(Number(rating)),
    comment: comment.trim(),
    verifiedPurchase,
    isHidden: false
  });

  // Atomically update product's rating stats
  await updateProductRatingStats(prodIdStr);

  // Notify admin of new review
  Notification.create({
    recipient: NOTIFICATION_RECIPIENT.ADMIN,
    title: `⭐ New Review on ${product.name}`,
    message: `${req.user.name} rated ${rating}★: "${comment.trim().slice(0, 80)}..."`,
    type: NOTIFICATION_TYPE.REVIEW,
    referenceId: prodIdStr,
    link: `/admin/products`
  }).catch(e => console.warn('Review notification skipped:', e.message));

  return res.status(201).json(
    new ApiResponse(201, { review }, 'Review submitted successfully!')
  );
});

/**
 * GET /api/products/:id/reviews
 * Paginated reviews with rating breakdown histogram.
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const product = await Product.findOne(
    isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const prodIdStr = String(product._id);

  // Fetch paginated reviews and histogram breakdown in parallel
  const [reviews, total, histogramAgg] = await Promise.all([
    Review.find({ productId: prodIdStr, isHidden: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ productId: prodIdStr, isHidden: false }),
    Review.aggregate([
      { $match: { productId: prodIdStr, isHidden: false } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ])
  ]);

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const h of histogramAgg) {
    if (ratingCounts[h._id] !== undefined) {
      ratingCounts[h._id] = h.count;
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      averageRating: product.rating || 0,
      reviewsCount: product.reviewsCount || 0,
      ratingCounts
    }, 'Product reviews fetched successfully')
  );
});

/**
 * PUT /api/reviews/admin/:id/hide
 * Admin moderation: toggles review visibility.
 */
export const toggleHideReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  review.isHidden = !review.isHidden;
  await review.save();

  await updateProductRatingStats(review.productId);

  return res.status(200).json(
    new ApiResponse(200, { review }, `Review is now ${review.isHidden ? 'hidden' : 'visible'}.`)
  );
});

/**
 * DELETE /api/reviews/admin/:id
 * Admin moderation: deletes review and recalculates rating stats.
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  await updateProductRatingStats(review.productId);

  return res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully.')
  );
});

export default {
  createReview,
  getProductReviews,
  toggleHideReview,
  deleteReview
};

