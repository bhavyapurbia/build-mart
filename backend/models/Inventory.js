const { createUnifiedModel } = require('./dbAdapter');

const Inventory = createUnifiedModel('Inventory', {
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  currentStock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  reorderPoint: { type: Number, default: 15 },
  unit: { type: String, default: 'Piece' },
  warehouseLocation: { type: String, default: 'Central Hub - BLR-01' },
  history: [{
    change: Number,
    reason: String,
    timestamp: String,
    updatedBy: String
  }]
});

module.exports = Inventory;

