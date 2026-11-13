import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, trim: true },
  user: { type: String, default: null },
  userName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  verifiedPurchase: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false }
}, {
  timestamps: true,
  minimize: false
});

// Appendix C indexes
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, user: 1 }, { unique: true, sparse: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
export { Review };
