import mongoose from 'mongoose';

const stockReservationSchema = new mongoose.Schema({
  reservationId: { type: String, required: true, unique: true, trim: true },
  paymentId: { type: String, default: null },
  razorpayOrderId: { type: String, default: null },
  user: { type: String, default: null },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  status: {
    type: String,
    enum: ['active', 'confirmed', 'released', 'expired'],
    default: 'active'
  },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true,
  minimize: false
});

// TTL index on expiresAt
stockReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
stockReservationSchema.index({ razorpayOrderId: 1 });

const StockReservation = mongoose.models.StockReservation || mongoose.model('StockReservation', stockReservationSchema);

export default StockReservation;
export { StockReservation };
