import mongoose from 'mongoose';

const couponRedemptionSchema = new mongoose.Schema({
  code: { type: String, required: true, uppercase: true, trim: true },
  user: { type: String, required: true, trim: true },
  orderId: { type: String, default: null },
  discountAmount: { type: Number, default: 0, min: 0 },
  redeemedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C indexes
couponRedemptionSchema.index({ code: 1, user: 1 });

const CouponRedemption = mongoose.models.CouponRedemption || mongoose.model('CouponRedemption', couponRedemptionSchema);

export default CouponRedemption;
export { CouponRedemption };
