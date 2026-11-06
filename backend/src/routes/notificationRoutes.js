import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notificationController.js';
import { optionalAuth  } from '../middleware/auth.js';

router.get('/', optionalAuth, notificationController.getNotifications);
router.put('/:id/read', optionalAuth, notificationController.markAsRead);
router.post('/read-all', optionalAuth, notificationController.markAllAsRead);

export default router;

