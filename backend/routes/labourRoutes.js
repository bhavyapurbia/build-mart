const express = require('express');
const router = express.Router();
const labourController = require('../controllers/labourController');
const { optionalAuth, authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', optionalAuth, labourController.submitLabourRequest);
router.get('/my', optionalAuth, labourController.getMyLabourBookings);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, labourController.getAllLabourRequests);
router.put('/admin/:id', authenticate, requireAdmin, labourController.updateLabourRequest);

module.exports = router;

