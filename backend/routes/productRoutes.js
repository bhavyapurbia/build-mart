const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/deals', productController.getDeals);
router.get('/bestsellers', productController.getBestsellers);
router.get('/:id', productController.getProductById);

// Admin product endpoints
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;

