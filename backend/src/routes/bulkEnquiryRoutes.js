import express from 'express';
const router = express.Router();
import bulkEnquiryController from '../controllers/bulkEnquiry.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// Public/customer bulk endpoints
router.post('/', bulkEnquiryController.submitBulkEnquiry);
router.get('/my', authenticate, bulkEnquiryController.getMyBulkEnquiries);
router.post('/:id/respond', authenticate, bulkEnquiryController.respondToBulkEnquiry);

// Admin bulk endpoints
router.get('/admin', authenticate, requireAdmin, bulkEnquiryController.getAllBulkEnquiries);
router.put('/admin/:id', authenticate, requireAdmin, bulkEnquiryController.updateBulkEnquiry);
router.post('/admin/:id/convert-to-order', authenticate, requireAdmin, bulkEnquiryController.convertBulkEnquiryToOrder);

export default router;
