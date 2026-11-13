import express from 'express';
const router = express.Router();
import serviceAreaController from '../controllers/serviceArea.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// Public endpoints
router.get('/', serviceAreaController.checkServiceability);
router.get('/cities', serviceAreaController.getActiveCities);

// Admin endpoints (Cities & Pincodes management)
router.get('/admin/all', authenticate, requireAdmin, serviceAreaController.getAllServiceAreas);
router.post('/admin', authenticate, requireAdmin, serviceAreaController.createServiceArea);
router.put('/admin/:id', authenticate, requireAdmin, serviceAreaController.updateServiceArea);
router.put('/admin/:id/toggle', authenticate, requireAdmin, serviceAreaController.toggleServiceArea);
router.delete('/admin/:id', authenticate, requireAdmin, serviceAreaController.deleteServiceArea);

export default router;
