import express from 'express';
const router = express.Router();
import pageController from '../controllers/page.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { cacheControlPublic } from '../utils/cache.js';

router.get('/pages/:slug', cacheControlPublic(120, 600), pageController.getPageBySlug);
router.put('/pages/admin/:slug', authenticate, requireAdmin, pageController.updatePageContent);
router.post('/contact', pageController.submitContactForm);

export default router;

