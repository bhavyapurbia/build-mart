import express from 'express';
const router = express.Router();
import cartController from '../controllers/cartController.js';
import { optionalAuth  } from '../middleware/auth.js';

router.get('/', optionalAuth, cartController.getCart);
router.post('/sync', optionalAuth, cartController.syncCart);
router.post('/clear', optionalAuth, cartController.clearCart);

export default router;

