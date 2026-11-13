import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true, trim: true },
  products: [{ type: String, trim: true }]
}, {
  timestamps: true,
  minimize: false
});

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
export { Wishlist };

