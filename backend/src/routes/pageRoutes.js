import express from 'express';
const router = express.Router();
import pageController from '../controllers/page.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

router.get('/pages/:slug', pageController.getPageBySlug);
router.put('/pages/admin/:slug', authenticate, requireAdmin, pageController.updatePageContent);
router.post('/contact', pageController.submitContactForm);

export default router;

