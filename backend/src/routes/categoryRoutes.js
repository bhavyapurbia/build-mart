import express from 'express';
const router = express.Router();
import categoryController from '../controllers/category.controller.js';
import { authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin category management
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

export default router;

