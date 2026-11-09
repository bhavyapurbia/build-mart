import express from 'express';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  getPaymentTransactions,
  getPaymentStats,
  refundPayment
} from '../controllers/payment.controller.js';

const router = express.Router();

// ── Customer payment routes ────────────────────────────────────────────────
// Works for both logged-in and guest users (optionalAuth)
router.post('/razorpay/create-order', optionalAuth, createRazorpayOrder);
router.post('/razorpay/verify', optionalAuth, verifyRazorpayPayment);
router.get('/razorpay/status/:razorpayOrderId', optionalAuth, getPaymentStatus);

// ── Admin payment routes ───────────────────────────────────────────────────
router.get('/admin/transactions', authenticate, requireAdmin, getPaymentTransactions);
router.get('/admin/stats', authenticate, requireAdmin, getPaymentStats);
router.post('/admin/refund', authenticate, requireAdmin, refundPayment);

export default router;
