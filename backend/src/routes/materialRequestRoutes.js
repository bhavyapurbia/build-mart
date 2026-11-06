import express from 'express';
const router = express.Router();
import materialRequestController from '../controllers/materialRequestController.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.js';

router.post('/', optionalAuth, materialRequestController.submitMaterialRequest);
router.get('/my', optionalAuth, materialRequestController.getMyMaterialRequests);
router.get('/:id', optionalAuth, materialRequestController.getMaterialRequestById);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, materialRequestController.getAllMaterialRequests);
router.put('/admin/:id/status', authenticate, requireAdmin, materialRequestController.updateMaterialRequestStatus);

export default router;

