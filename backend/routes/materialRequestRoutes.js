const express = require('express');
const router = express.Router();
const materialRequestController = require('../controllers/materialRequestController');
const { optionalAuth, authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', optionalAuth, materialRequestController.submitMaterialRequest);
router.get('/my', optionalAuth, materialRequestController.getMyMaterialRequests);
router.get('/:id', optionalAuth, materialRequestController.getMaterialRequestById);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, materialRequestController.getAllMaterialRequests);
router.put('/admin/:id/status', authenticate, requireAdmin, materialRequestController.updateMaterialRequestStatus);

module.exports = router;

