import express from 'express';
const router = express.Router();
import bulkEnquiryController from '../controllers/bulkEnquiryController.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.js';

router.post('/', optionalAuth, bulkEnquiryController.submitBulkEnquiry);
router.get('/my', optionalAuth, bulkEnquiryController.getMyBulkEnquiries);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, bulkEnquiryController.getAllBulkEnquiries);
router.put('/admin/:id', authenticate, requireAdmin, bulkEnquiryController.updateBulkEnquiry);

export default router;

