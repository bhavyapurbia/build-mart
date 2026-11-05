const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { optionalAuth, authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my', optionalAuth, orderController.getMyOrders);
router.get('/:id', optionalAuth, orderController.getOrderById);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

module.exports = router;

