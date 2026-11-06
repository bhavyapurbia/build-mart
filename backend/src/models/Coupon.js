import { createUnifiedModel } from './dbAdapter.js';

const Coupon = createUnifiedModel('Coupon', {
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discountPercent: { type: Number, required: true },
  maxDiscount: { type: Number, default: 5000 },
  minOrderValue: { type: Number, default: 1000 },
  validUntil: { type: String },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 }
});

export default Coupon;
export { Coupon };

