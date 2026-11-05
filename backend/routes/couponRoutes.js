const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/validate', couponController.validateCoupon);
router.get('/', couponController.getCoupons);
router.post('/', authenticate, requireAdmin, couponController.createCoupon);
router.delete('/:id', authenticate, requireAdmin, couponController.deleteCoupon);

module.exports = router;

