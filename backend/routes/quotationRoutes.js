const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { optionalAuth, authenticate, requireAdmin } = require('../middleware/auth');

router.get('/my', optionalAuth, quotationController.getMyQuotations);
router.get('/:id', optionalAuth, quotationController.getQuotationById);
router.post('/:id/respond', optionalAuth, quotationController.respondToQuotation);

// Admin endpoints
router.post('/admin', authenticate, requireAdmin, quotationController.createQuotation);
router.get('/admin/all', authenticate, requireAdmin, quotationController.getAllQuotations);

module.exports = router;

