import Coupon from '../models/Coupon.js';
import CouponRedemption from '../models/CouponRedemption.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    throw new ApiError(400, 'Coupon code is required.');
  }

  const cleanCode = code.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired coupon code.');
  }

  const now = new Date();
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    throw new ApiError(400, 'This coupon has expired.');
  }
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    throw new ApiError(400, 'This coupon campaign has not started yet.');
  }

  if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its maximum total redemptions.');
  }

  // Check per-user limit if user is logged in
  if (req.user && coupon.perUserLimit) {
    const userRedemptions = await CouponRedemption.countDocuments({
      code: cleanCode,
      user: String(req.user._id)
    });
    if (userRedemptions >= coupon.perUserLimit) {
      throw new ApiError(400, `You have already redeemed this coupon the maximum allowed times (${coupon.perUserLimit}).`);
    }
  }

  const total = Number(cartTotal) || 0;
  if (total < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`);
  }

  const calculatedDiscount = Math.min(
    Math.round((total * coupon.discountPercent) / 100),
    coupon.maxDiscount || 5000
  );

  return res.status(200).json(
    new ApiResponse(200, {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: calculatedDiscount
    }, `Coupon applied! You save ₹${calculatedDiscount.toLocaleString('en-IN')}`)
  );
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, coupons, 'Coupons fetched successfully')
  );
});

export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountPercent,
    maxDiscount,
    minOrderValue,
    startsAt,
    validUntil,
    usageLimit,
    perUserLimit
  } = req.body;

  if (!code || !discountPercent) {
    throw new ApiError(400, 'Code and discount percentage are required.');
  }

  const cleanCode = code.toUpperCase().trim();
  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) {
    throw new ApiError(400, 'A coupon with this code already exists.');
  }

  const coupon = await Coupon.create({
    code: cleanCode,
    description: description || '',
    discountPercent: Number(discountPercent),
    maxDiscount: Number(maxDiscount) || 5000,
    minOrderValue: Number(minOrderValue) || 1000,
    startsAt: startsAt ? new Date(startsAt) : null,
    validUntil: validUntil ? new Date(validUntil) : null,
    usageLimit: Number(usageLimit) || 1000,
    perUserLimit: Number(perUserLimit) || 1,
    isActive: true,
    usageCount: 0
  });

  return res.status(201).json(
    new ApiResponse(201, { coupon }, 'Coupon created successfully')
  );
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (updateData.code) updateData.code = updateData.code.toUpperCase().trim();
  if (updateData.discountPercent) updateData.discountPercent = Number(updateData.discountPercent);
  if (updateData.maxDiscount) updateData.maxDiscount = Number(updateData.maxDiscount);
  if (updateData.minOrderValue) updateData.minOrderValue = Number(updateData.minOrderValue);
  if (updateData.startsAt) updateData.startsAt = new Date(updateData.startsAt);
  if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);

  const updated = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Coupon not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, { coupon: updated }, 'Coupon updated successfully')
  );
});

export const toggleCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  const newStatus = coupon.isActive === false;
  const updated = await Coupon.findByIdAndUpdate(
    id,
    { isActive: newStatus },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { coupon: updated }, `Coupon ${newStatus ? 'turned ON (Active)' : 'turned OFF (Disabled)'} successfully`)
  );
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const deleted = await Coupon.findByIdAndDelete(req.params.id);
  if (!deleted) {
    throw new ApiError(404, 'Coupon not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'Coupon deleted successfully')
  );
});

export default {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon
};
