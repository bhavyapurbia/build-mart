import express from 'express';
const router = express.Router();
import cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

// Cart routes
router.get('/', authenticate, cartController.getCart);
router.post('/sync', authenticate, cartController.syncCart);
router.post('/merge', authenticate, cartController.mergeCart);
router.post('/validate', cartController.validateCart);
router.post('/clear', authenticate, cartController.clearCart);

export default router;
