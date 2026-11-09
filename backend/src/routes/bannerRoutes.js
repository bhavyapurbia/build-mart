import express from 'express';
const router = express.Router();
import bannerController from '../controllers/banner.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

router.get('/', bannerController.getBanners);
router.get('/admin', authenticate, requireAdmin, bannerController.getAllBanners);
router.post('/', authenticate, requireAdmin, bannerController.createBanner);
router.put('/:id', authenticate, requireAdmin, bannerController.updateBanner);
router.put('/:id/toggle', authenticate, requireAdmin, bannerController.toggleBanner);
router.delete('/:id', authenticate, requireAdmin, bannerController.deleteBanner);

export default router;

