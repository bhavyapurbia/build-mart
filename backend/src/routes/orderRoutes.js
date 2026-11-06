import express from 'express';
const router = express.Router();
import orderController from '../controllers/orderController.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.js';

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my', optionalAuth, orderController.getMyOrders);
router.get('/:id', optionalAuth, orderController.getOrderById);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

export default router;

