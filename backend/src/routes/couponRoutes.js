import express from 'express';
const router = express.Router();
import couponController from '../controllers/coupon.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const couponValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many coupon requests, please try again later.' }
});

// Public: validate a coupon code (rate-limited)
router.post('/validate', couponValidateLimiter, couponController.validateCoupon);

// Admin only: list all coupons (private — includes inactive, usage counts, etc.)
router.get('/', authenticate, requireAdmin, couponController.getCoupons);
router.post('/', authenticate, requireAdmin, couponController.createCoupon);
router.put('/:id/toggle', authenticate, requireAdmin, couponController.toggleCoupon);
router.put('/:id', authenticate, requireAdmin, couponController.updateCoupon);
router.delete('/:id', authenticate, requireAdmin, couponController.deleteCoupon);

export default router;
