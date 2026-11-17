import express from 'express';
const router = express.Router();
import materialRequestController from '../controllers/materialRequest.controller.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.post('/', optionalAuth, materialRequestController.submitMaterialRequest);
router.get('/my', optionalAuth, materialRequestController.getMyMaterialRequests);
router.get('/:id', optionalAuth, materialRequestController.getMaterialRequestById);
router.post('/:id/pay-bill', optionalAuth, materialRequestController.paySnapListBill);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, materialRequestController.getAllMaterialRequests);
router.put('/admin/:id/status', authenticate, requireAdmin, materialRequestController.updateMaterialRequestStatus);
router.post('/admin/:id/generate-bill', authenticate, requireAdmin, materialRequestController.generateSnapListBill);

export default router;

