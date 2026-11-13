import express from 'express';
import rateLimit from 'express-rate-limit';
import orderController from '../controllers/order.controller.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many tracking attempts, please try again later.' }
});

// Customer order routes
router.post('/', authenticate, orderController.createOrder);
router.get('/my', authenticate, orderController.getMyOrders);
router.post('/track', trackLimiter, orderController.trackOrder);
router.get('/:id', authenticate, orderController.getOrderById);
router.get('/:id/invoice.pdf', authenticate, orderController.downloadInvoice);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

export default router;
