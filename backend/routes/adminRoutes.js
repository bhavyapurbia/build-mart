const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/overview', authenticate, requireAdmin, adminController.getOverviewKPIs);
router.get('/customers', authenticate, requireAdmin, adminController.getCustomers);
router.get('/inventory', authenticate, requireAdmin, adminController.getInventory);
router.put('/inventory/stock', authenticate, requireAdmin, adminController.updateInventoryStock);

module.exports = router;

