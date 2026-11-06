import express from 'express';
const router = express.Router();
import labourController from '../controllers/labourController.js';
import { optionalAuth, authenticate, requireAdmin  } from '../middleware/auth.js';

router.post('/', optionalAuth, labourController.submitLabourRequest);
router.get('/my', optionalAuth, labourController.getMyLabourBookings);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, labourController.getAllLabourRequests);
router.put('/admin/:id', authenticate, requireAdmin, labourController.updateLabourRequest);

export default router;

