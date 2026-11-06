import express from 'express';
const router = express.Router();
import settingsController from '../controllers/settingsController.js';
import { authenticate, requireAdmin  } from '../middleware/auth.js';

router.get('/', settingsController.getSettings);
router.put('/', authenticate, requireAdmin, settingsController.updateSettings);

export default router;

