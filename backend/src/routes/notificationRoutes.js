import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notification.controller.js';
import { optionalAuth  } from '../middleware/auth.middleware.js';

router.get('/', optionalAuth, notificationController.getNotifications);
router.put('/:id/read', optionalAuth, notificationController.markAsRead);
router.post('/read-all', optionalAuth, notificationController.markAllAsRead);

export default router;

