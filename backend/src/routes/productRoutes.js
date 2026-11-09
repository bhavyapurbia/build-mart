import express from 'express';
const router = express.Router();
import productController from '../controllers/product.controller.js';
import { authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.get('/', productController.getProducts);
router.get('/deals', productController.getDeals);
router.get('/bestsellers', productController.getBestsellers);
router.get('/:id', productController.getProductById);

// Admin product endpoints
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

export default router;

