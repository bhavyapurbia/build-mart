import express from 'express';
const router = express.Router();
import brandController from '../controllers/brand.controller.js';
import { authenticate, requireAdmin  } from '../middleware/auth.middleware.js';

router.get('/', brandController.getBrands);
router.post('/', authenticate, requireAdmin, brandController.createBrand);
router.put('/:id', authenticate, requireAdmin, brandController.updateBrand);
router.delete('/:id', authenticate, requireAdmin, brandController.deleteBrand);

export default router;

