import express from 'express';
const router = express.Router();
import { toggleHideReview, deleteReview } from '../controllers/review.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

router.put('/admin/:id/hide', authenticate, requireAdmin, toggleHideReview);
router.delete('/admin/:id', authenticate, requireAdmin, deleteReview);

export default router;

