import express from 'express';
const router = express.Router();
import quotationController from '../controllers/quotation.controller.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.get('/my', optionalAuth, quotationController.getMyQuotations);
router.get('/:id', optionalAuth, quotationController.getQuotationById);
router.post('/:id/respond', optionalAuth, quotationController.respondToQuotation);

// Admin endpoints
router.post('/admin', authenticate, requireAdmin, quotationController.createQuotation);
router.get('/admin/all', authenticate, requireAdmin, quotationController.getAllQuotations);

export default router;

