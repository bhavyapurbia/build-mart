import express from 'express';
const router = express.Router();
import brandController from '../controllers/brandController.js';
import { authenticate, requireAdmin  } from '../middleware/auth.js';

router.get('/', brandController.getBrands);
router.post('/', authenticate, requireAdmin, brandController.createBrand);
router.put('/:id', authenticate, requireAdmin, brandController.updateBrand);
router.delete('/:id', authenticate, requireAdmin, brandController.deleteBrand);

export default router;

