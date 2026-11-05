const express = require('express');
const router = express.Router();
const bulkEnquiryController = require('../controllers/bulkEnquiryController');
const { optionalAuth, authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', optionalAuth, bulkEnquiryController.submitBulkEnquiry);
router.get('/my', optionalAuth, bulkEnquiryController.getMyBulkEnquiries);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, bulkEnquiryController.getAllBulkEnquiries);
router.put('/admin/:id', authenticate, requireAdmin, bulkEnquiryController.updateBulkEnquiry);

module.exports = router;

