import express from 'express';
import { handleWebhook } from '../controllers/payment.controller.js';

const router = express.Router();

/**
 * Razorpay webhook endpoint.
 *
 * express.raw({ type: 'application/json' }) is applied as route-level middleware
 * so we receive the raw Buffer needed for HMAC signature verification, even
 * though the global app.js applies express.json() to all other routes.
 */
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default router;
