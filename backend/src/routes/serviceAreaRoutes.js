import express from 'express';
const router = express.Router();
import serviceAreaController from '../controllers/serviceArea.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// Public check
router.get('/', serviceAreaController.checkServiceability);

// Admin CRUD
router.get('/admin/all', authenticate, requireAdmin, serviceAreaController.getAllServiceAreas);
router.post('/admin', authenticate, requireAdmin, serviceAreaController.createServiceArea);
router.put('/admin/:id', authenticate, requireAdmin, serviceAreaController.updateServiceArea);
router.delete('/admin/:id', authenticate, requireAdmin, serviceAreaController.deleteServiceArea);

export default router;

