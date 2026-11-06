import { createUnifiedModel } from './dbAdapter.js';

const Banner = createUnifiedModel('Banner', {
  title: { type: String, required: true },
  subtitle: { type: String },
  badge: { type: String, default: 'SPECIAL OFFER' },
  couponCode: { type: String, default: 'BUILD50K' },
  ctaText: { type: String, default: 'SHOP NOW' },
  link: { type: String, default: '/products' },
  bgGradient: { type: String, default: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)' },
  image: { type: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  type: { type: String, default: 'hero' }
});

export default Banner;
export { Banner };

