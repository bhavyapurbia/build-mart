const SiteSetting = require('../models/SiteSetting');

exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({
        siteName: 'BuildMart',
        tagline: 'Direct Site Procurement & Express Construction Materials Platform',
        whatsappNumber: '+919876543210',
        supportPhone: '1800-890-5000',
        supportEmail: 'orders@buildmart.in',
        officeAddress: 'BuildMart Fulfillment Hub 01, Outer Ring Road, Bengaluru 560103',
        announcementBar: '⚡ 30-60 Minute Direct Job-Site Delivery in Bengaluru | Genuine Certified Construction Supplies',
        freeDeliveryThreshold: 5000,
        cities: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi NCR', 'Pune', 'Chennai'],
        heroBanners: [
          {
            title: 'Everything You Need to Build Your Dream Project',
            subtitle: 'Direct from authorized manufacturers with certified batch test reports. Cement, TMT Steel, Tiles & Plumbing delivered in 30-60 minutes.',
            tag: 'EXPRESS SITE DELIVERY',
            badge: 'Up to 35% Contractor Off',
            image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1400&q=80',
            ctaText: 'Shop Now',
            ctaLink: '/products',
            accent: '#F59E0B'
          },
          {
            title: 'Click Any Product Image to Auto-Build Material List',
            subtitle: 'One-click selection directly into your quote request. No upfront payment required until our materials engineer verifies stock & sends you a formal quotation.',
            tag: 'CONTRACTOR FAVORITE',
            badge: 'Zero Upfront Risk',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
            ctaText: 'Start Material List',
            ctaLink: '/products',
            accent: '#2563EB'
          },
          {
            title: 'Need High-Volume Steel, Cement or AAC Blocks?',
            subtitle: 'Direct plant dispatch with factory invoices for developers, commercial builders, and registered contractors. Dedicated account supervisor assigned.',
            tag: 'BULK ENQUIRY HUB',
            badge: 'Tier-1 Trade Pricing',
            image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1400&q=80',
            ctaText: 'Request Bulk Order',
            ctaLink: '/bulk-enquiry',
            accent: '#10B981'
          }
        ]
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching settings', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (settings) {
      settings = await SiteSetting.findByIdAndUpdate(settings._id, req.body, { new: true });
    } else {
      settings = await SiteSetting.create(req.body);
    }
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: 'Error updating settings', error: err.message });
  }
};

