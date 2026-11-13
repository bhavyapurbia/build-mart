import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notification.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// All notification routes require authentication
router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.post('/read-all', authenticate, notificationController.markAllAsRead);

export default router;
