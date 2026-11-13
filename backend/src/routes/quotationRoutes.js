import express from 'express';
const router = express.Router();
import quotationController from '../controllers/quotation.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// Customer quotation endpoints
router.get('/my', authenticate, quotationController.getMyQuotations);
router.get('/:id', authenticate, quotationController.getQuotationById);
router.get('/:id/export.pdf', authenticate, quotationController.exportQuotationPDF);
router.post('/:id/respond', authenticate, quotationController.respondToQuotation);
router.post('/:id/checkout', authenticate, quotationController.checkoutQuotation);

// Admin quotation endpoints
router.post('/admin', authenticate, requireAdmin, quotationController.createQuotation);
router.get('/admin/all', authenticate, requireAdmin, quotationController.getAllQuotations);
router.put('/admin/:id', authenticate, requireAdmin, quotationController.updateQuotationAdmin);

export default router;
