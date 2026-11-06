import Coupon from '../models/Coupon.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    throw new ApiError(400, 'Coupon code is required.');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired coupon code.');
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    throw new ApiError(400, 'This coupon has expired.');
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
    }, `Coupon applied! You save ₹${calculatedDiscount}`)
  );
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  return res.status(200).json(
    new ApiResponse(200, coupons, 'Coupons fetched successfully')
  );
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, description, discountPercent, maxDiscount, minOrderValue, validUntil } = req.body;
  if (!code || !discountPercent) {
    throw new ApiError(400, 'Code and discount percentage are required.');
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) {
    throw new ApiError(400, 'A coupon with this code already exists.');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description: description || '',
    discountPercent: Number(discountPercent),
    maxDiscount: Number(maxDiscount) || 5000,
    minOrderValue: Number(minOrderValue) || 1000,
    validUntil: validUntil || '',
    isActive: true
  });

  return res.status(201).json(
    new ApiResponse(201, { coupon }, 'Coupon created successfully')
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
  deleteCoupon
};
