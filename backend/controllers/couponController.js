const Coupon = require('../models/Coupon');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code.' });
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    const total = Number(cartTotal) || 0;
    if (total < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`
      });
    }

    const calculatedDiscount = Math.min(
      Math.round((total * coupon.discountPercent) / 100),
      coupon.maxDiscount || 5000
    );

    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: calculatedDiscount,
      message: `Coupon applied! You save ₹${calculatedDiscount}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Error validating coupon', error: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching coupons', error: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, description, discountPercent, maxDiscount, minOrderValue, validUntil } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ message: 'Code and discount percentage are required.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'A coupon with this code already exists.' });
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

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (err) {
    res.status(500).json({ message: 'Error creating coupon', error: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting coupon', error: err.message });
  }
};

