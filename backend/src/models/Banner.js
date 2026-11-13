import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },
  badge: { type: String, default: 'SPECIAL PROMO', trim: true },
  couponCode: { type: String, default: 'BUILD50K', trim: true },
  ctaText: { type: String, default: 'EXPLORE SUPPLIES', trim: true },
  link: { type: String, default: '/products', trim: true },
  bgGradient: { type: String, default: 'linear-gradient(135deg, #181C9A 0%, #282DCB 100%)' },
  image: { type: String, default: '' },
  benefit1Text: { type: String, default: '30-Min' },
  benefit1Sub: { type: String, default: 'Site Delivery' },
  benefit2Text: { type: String, default: '100% Factory' },
  benefit2Sub: { type: String, default: 'GST Invoices' },
  coinText: { type: String, default: 'OFFER' },
  accentColor: { type: String, default: '#FF9900' },
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
