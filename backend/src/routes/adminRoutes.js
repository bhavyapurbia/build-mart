import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController.js';
import { authenticate, requireAdmin  } from '../middleware/auth.js';

router.get('/overview', authenticate, requireAdmin, adminController.getOverviewKPIs);
router.get('/customers', authenticate, requireAdmin, adminController.getCustomers);
router.get('/inventory', authenticate, requireAdmin, adminController.getInventory);
router.put('/inventory/stock', authenticate, requireAdmin, adminController.updateInventoryStock);

export default router;

