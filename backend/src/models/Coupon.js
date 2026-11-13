import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  maxDiscount: { type: Number, default: 5000, min: 0 },
  minOrderValue: { type: Number, default: 1000, min: 0 },
  startsAt: { type: Date, default: null },
  validUntil: { type: Date, default: null },
  usageLimit: { type: Number, default: 1000, min: 0 },
  perUserLimit: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0, min: 0 }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C query indexes
couponSchema.index({ isActive: 1, validUntil: 1 });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon;
export { Coupon };
