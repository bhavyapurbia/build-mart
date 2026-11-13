import express from 'express';
const router = express.Router();
import categoryController from '../controllers/category.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { cacheControlPublic } from '../utils/cache.js';

router.get('/', cacheControlPublic(60, 300), categoryController.getCategories);
router.get('/:slug', cacheControlPublic(60, 300), categoryController.getCategoryBySlug);

// Admin category management
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

export default router;
