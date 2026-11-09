import express from 'express';
const router = express.Router();
import cartController from '../controllers/cart.controller.js';
import { optionalAuth  } from '../middleware/auth.middleware.js';

router.get('/', optionalAuth, cartController.getCart);
router.post('/sync', optionalAuth, cartController.syncCart);
router.post('/clear', optionalAuth, cartController.clearCart);

export default router;

