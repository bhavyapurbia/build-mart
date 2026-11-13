import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'BuildMart', trim: true },
  tagline: { type: String, default: 'India’s Leading Construction & Building Materials Platform', trim: true },
  whatsappNumber: { type: String, default: '+91 98765 43210', trim: true },
  supportPhone: { type: String, default: '1800-890-5000', trim: true },
  supportEmail: { type: String, default: 'support@buildmart.in', trim: true, lowercase: true },
  officeAddress: { type: String, default: 'BuildMart HQ, 4th Floor, Tech Innovation Park, Bengaluru, Karnataka 560100', trim: true },
  announcementBar: { type: String, default: '⚡ Fast Job-Site Delivery in Bengaluru & Major Hubs | 100% Genuine Certified Brands', trim: true },
  freeDeliveryThreshold: { type: Number, default: 5000, min: 0 },
  sellerGstin: { type: String, default: '29AABCB1234F1Z5', trim: true },
  sellerState: { type: String, default: 'Karnataka', trim: true },
  sellerPan: { type: String, default: 'AABCB1234F', trim: true },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/buildmart' },
    twitter: { type: String, default: 'https://twitter.com/buildmart' },
    linkedin: { type: String, default: 'https://linkedin.com/company/buildmart' },
    instagram: { type: String, default: 'https://instagram.com/buildmart' }
  },
  themeAccent: { type: String, default: '#E05A00' },
  cities: [{ type: String, trim: true }],
  heroBanners: [{
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    tag: { type: String, trim: true },
    badge: { type: String, trim: true },
    image: { type: String },
    ctaText: { type: String, trim: true },
    ctaLink: { type: String, trim: true },
    accent: { type: String, trim: true }
  }]
}, {
  timestamps: true,
  minimize: false
});

const SiteSetting = mongoose.models.SiteSetting || mongoose.model('SiteSetting', siteSettingSchema);

export default SiteSetting;
export { SiteSetting };
