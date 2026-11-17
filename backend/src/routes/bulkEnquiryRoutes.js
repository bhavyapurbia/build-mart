import express from 'express';
const router = express.Router();
import bulkEnquiryController from '../controllers/bulkEnquiry.controller.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.middleware.js';

// Public/customer bulk endpoints
router.post('/', optionalAuth, bulkEnquiryController.submitBulkEnquiry);
router.get('/my', authenticate, bulkEnquiryController.getMyBulkEnquiries);
router.post('/:id/respond', authenticate, bulkEnquiryController.respondToBulkEnquiry);

// Admin bulk endpoints (accessible by admin, manager, support)
router.get('/admin', authenticate, requireRole('admin', 'manager', 'support'), bulkEnquiryController.getAllBulkEnquiries);
router.get('/admin/all', authenticate, requireRole('admin', 'manager', 'support'), bulkEnquiryController.getAllBulkEnquiries);
router.put('/admin/:id', authenticate, requireRole('admin', 'manager', 'support'), bulkEnquiryController.updateBulkEnquiry);
router.post('/admin/:id/convert-to-order', authenticate, requireRole('admin', 'manager', 'support'), bulkEnquiryController.convertBulkEnquiryToOrder);

export default router;
