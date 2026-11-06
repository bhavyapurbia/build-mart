import express from 'express';
const router = express.Router();
import couponController from '../controllers/couponController.js';
import { authenticate, requireAdmin  } from '../middleware/auth.js';

router.post('/validate', couponController.validateCoupon);
router.get('/', couponController.getCoupons);
router.post('/', authenticate, requireAdmin, couponController.createCoupon);
router.delete('/:id', authenticate, requireAdmin, couponController.deleteCoupon);

export default router;

