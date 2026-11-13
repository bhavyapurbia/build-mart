import express from 'express';
const router = express.Router();
import settingsController from '../controllers/settings.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { cacheControlPublic } from '../utils/cache.js';

router.get('/', cacheControlPublic(60, 300), settingsController.getSettings);
router.get('/public', cacheControlPublic(60, 300), settingsController.getSettings);
router.put('/', authenticate, requireAdmin, settingsController.updateSettings);

export default router;
