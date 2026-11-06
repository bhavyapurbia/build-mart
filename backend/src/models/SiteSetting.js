import { createUnifiedModel } from './dbAdapter.js';

const SiteSetting = createUnifiedModel('SiteSetting', {
  siteName: { type: String, default: 'BuildMart' },
  tagline: { type: String, default: 'India’s Leading Construction & Building Materials Platform' },
  whatsappNumber: { type: String, default: '+91 98765 43210' },
  supportPhone: { type: String, default: '1800-890-5000' },
  supportEmail: { type: String, default: 'support@buildmart.in' },
  officeAddress: { type: String, default: 'BuildMart HQ, 4th Floor, Tech Innovation Park, Bengaluru, Karnataka 560100' },
  announcementBar: { type: String, default: '⚡ Lightning 30-60 Min Job-Site Delivery in Bengaluru & Major Hubs | 100% Genuine Certified Brands' },
  freeDeliveryThreshold: { type: Number, default: 5000 },
  cities: [{ type: String }],
  heroBanners: [{
    title: String,
    subtitle: String,
    tag: String,
    badge: String,
    image: String,
    ctaText: String,
    ctaLink: String,
    accent: String
  }]
});

export default SiteSetting;
export { SiteSetting };

