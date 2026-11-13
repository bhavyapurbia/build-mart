import express from 'express';
const router = express.Router();
import adminController from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

// All admin routes require authenticated staff
router.use(authenticate);

// Overview (admin & manager)
router.get('/overview', requireRole('admin', 'manager', 'support'), adminController.getOverviewKPIs);

// Audit logs (admin only)
router.get('/audit-log', requireRole('admin'), adminController.getAuditLogs);

// Customers
router.get('/customers', requireRole('admin', 'support', 'manager'), adminController.getCustomers);
router.put('/customers/:id/status', requireRole('admin', 'support'), adminController.updateCustomerStatus);
router.get('/customers/:id/orders', requireRole('admin', 'support', 'manager'), adminController.getCustomerOrders);

// Inventory
router.get('/inventory', requireRole('admin', 'manager', 'support'), adminController.getInventory);
router.put('/inventory/stock', requireRole('admin', 'manager'), adminController.updateInventoryStock);
router.post('/inventory/bulk-update', requireRole('admin', 'manager'), adminController.bulkUpdateInventory);
router.get('/inventory/:productId/history', requireRole('admin', 'manager'), adminController.getInventoryHistory);

// Product Admin Tools
router.post('/products/:id/duplicate', requireRole('admin', 'manager'), adminController.duplicateProduct);
router.post('/products/bulk-import', requireRole('admin', 'manager'), adminController.bulkImportProducts);

// Export
router.get('/export/:resource', requireRole('admin'), adminController.exportResource);

export default router;
