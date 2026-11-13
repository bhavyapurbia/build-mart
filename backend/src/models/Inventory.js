import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, trim: true },
  productName: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  currentStock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 10, min: 0 },
  reorderPoint: { type: Number, default: 15, min: 0 },
  unit: { type: String, default: 'Piece', trim: true },
  warehouseLocation: { type: String, default: 'Central Hub - BLR-01', trim: true },
  history: [{
    change: { type: Number, required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' }
  }]
}, {
  timestamps: true,
  minimize: false
});

inventorySchema.index({ currentStock: 1 });

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

export default Inventory;
export { Inventory };
