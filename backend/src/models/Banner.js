import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },
  badge: { type: String, default: 'SPECIAL OFFER', trim: true },
  couponCode: { type: String, default: 'BUILD50K', trim: true },
  ctaText: { type: String, default: 'SHOP NOW', trim: true },
  link: { type: String, default: '/products', trim: true },
  bgGradient: { type: String, default: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)' },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  type: { type: String, default: 'hero', trim: true }
}, {
  timestamps: true,
  minimize: false
});

bannerSchema.index({ active: 1, order: 1 });

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default Banner;
export { Banner };
