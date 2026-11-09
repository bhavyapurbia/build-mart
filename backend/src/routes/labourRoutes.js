import express from 'express';
const router = express.Router();
import labourController from '../controllers/labour.controller.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.post('/', optionalAuth, labourController.submitLabourRequest);
router.get('/my', optionalAuth, labourController.getMyLabourBookings);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, labourController.getAllLabourRequests);
router.put('/admin/:id', authenticate, requireAdmin, labourController.updateLabourRequest);

export default router;

