import express from 'express';
const router = express.Router();
import productController from '../controllers/product.controller.js';
import { createReview, getProductReviews } from '../controllers/review.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { rejectOperatorInjection } from '../middleware/validate.middleware.js';

router.get('/', rejectOperatorInjection, productController.getProducts);
router.get('/facets', productController.getProductFacets);
router.get('/suggest', productController.getProductSuggestions);
router.get('/deals', productController.getDeals);
router.get('/bestsellers', productController.getBestsellers);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);

// Reviews sub-routes for products
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', authenticate, createReview);

// Admin product endpoints
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

export default router;
