import mongoose from 'mongoose';

const serviceAreaSchema = new mongoose.Schema({
  city: { type: String, required: true, trim: true },
  state: { type: String, default: 'Karnataka', trim: true },
  pincodes: [{ type: String, trim: true }],
  etaLabel: { type: String, default: '⚡ 30-60 Min Express Delivery', trim: true },
  isAvailable: { type: Boolean, default: true },
  deliveryFee: { type: Number, default: 350, min: 0 },
  minOrder: { type: Number, default: 1000, min: 0 },
  freeDeliveryThreshold: { type: Number, default: 5000, min: 0 }
}, {
  timestamps: true,
  minimize: false
});

serviceAreaSchema.index({ city: 1 });
serviceAreaSchema.index({ pincodes: 1 });

const ServiceArea = mongoose.models.ServiceArea || mongoose.model('ServiceArea', serviceAreaSchema);

export default ServiceArea;
export { ServiceArea };

