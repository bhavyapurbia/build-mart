import express from 'express';
const router = express.Router();
import settingsController from '../controllers/settings.controller.js';
import { authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.get('/', settingsController.getSettings);
router.put('/', authenticate, requireAdmin, settingsController.updateSettings);

export default router;

