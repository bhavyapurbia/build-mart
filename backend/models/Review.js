const { createUnifiedModel } = require('./dbAdapter');

const Review = createUnifiedModel('Review', {
  productId: { type: String, required: true },
  user: { type: String },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true }
});

module.exports = Review;

