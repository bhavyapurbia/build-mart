import Banner from '../models/Banner.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const DEFAULT_BANNERS = [
  {
    title: 'Flat 5% OFF on Electrical Wires',
    subtitle: 'on orders above 10000. Use Coupon WIREBONANZA',
    badge: 'WIRE BONANZA',
    couponCode: 'WIREBONANZA',
    ctaText: 'ORDER NOW',
    link: '/products?category=Electrical%20%26%20Automation',
    image: '/banners/wirebonanza-offer.jpg',
    bgGradient: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)',
    benefit1Text: '30-Min',
    benefit1Sub: 'Site Delivery',
    benefit2Text: '100% Original',
    benefit2Sub: 'Finolex & Polycab',
    coinText: '5% OFF',
    accentColor: '#FF7800',
    active: true,
    type: 'hero',
    order: 1
  },
  {
    title: 'diwali offer',
    subtitle: 'on order above 4000 get flat 200 off',
    badge: 'SPECIAL PROMO',
    couponCode: 'DIWALI200',
    ctaText: 'EXPLORE SUPPLIES',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #181C9A 0%, #282DCB 100%)',
    image: '',
    benefit1Text: '30-Min',
    benefit1Sub: 'Site Delivery',
    benefit2Text: '100% Factory',
    benefit2Sub: 'GST Invoices',
    coinText: 'OFFER',
    accentColor: '#FF9900',
    active: true,
    type: 'hero',
    order: 2
  },
  {
    title: 'FLAT 5% CASHBACK',
    subtitle: 'on orders above ₹50,000. No limits on bulk supplies.',
    badge: 'MEGABUILDMART',
    couponCode: 'BUILD50K',
    ctaText: 'SHOP NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
    image: '',
    benefit1Text: 'Express 30-Min',
    benefit1Sub: 'Dispatch to Site',
    benefit2Text: 'Batch Tested',
    benefit2Sub: 'MTC Certificates',
    coinText: '5% OFF',
    accentColor: '#FF9900',
    active: true,
    type: 'hero',
    order: 3
  }
];

export const getBanners = asyncHandler(async (req, res) => {
  let banners = await Banner.find({ active: { $ne: false } }).sort({ order: 1, createdAt: -1 });
  if (!banners || banners.length === 0) {
    try {
      banners = await Banner.insertMany(DEFAULT_BANNERS);
    } catch (e) {
      banners = await Banner.find({ active: { $ne: false } });
    }
  }
  return res.status(200).json(
    new ApiResponse(200, banners, 'Active banners fetched successfully')
  );
});

export const getAllBanners = asyncHandler(async (req, res) => {
  let banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  if (!banners || banners.length === 0) {
    try {
      banners = await Banner.insertMany(DEFAULT_BANNERS);
    } catch (e) {
      banners = await Banner.find();
    }
  }
  return res.status(200).json(
    new ApiResponse(200, banners, 'All banners fetched successfully')
  );
});

export const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    badge,
    couponCode,
    ctaText,
    link,
    bgGradient,
    image,
    benefit1Text,
    benefit1Sub,
    benefit2Text,
    benefit2Sub,
    coinText,
    accentColor,
    type
  } = req.body;

  if (!title) {
    throw new ApiError(400, 'Banner title is required.');
  }

  const banner = await Banner.create({
    title,
    subtitle: subtitle || '',
    badge: badge || 'SPECIAL PROMO',
    couponCode: couponCode || '',
    ctaText: ctaText || 'EXPLORE SUPPLIES',
    link: link || '/products',
    bgGradient: bgGradient || 'linear-gradient(135deg, #181C9A 0%, #282DCB 100%)',
    image: image || '',
    benefit1Text: benefit1Text || '30-Min',
    benefit1Sub: benefit1Sub || 'Site Delivery',
    benefit2Text: benefit2Text || '100% Factory',
    benefit2Sub: benefit2Sub || 'GST Invoices',
    coinText: coinText || 'OFFER',
    accentColor: accentColor || '#FF9900',
    active: true,
    type: type || 'hero',
    order: Date.now()
  });

  return res.status(201).json(
    new ApiResponse(201, { banner }, 'Banner created successfully')
  );
});

export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
  if (!banner) {
    throw new ApiError(404, 'Banner not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, { banner }, 'Banner updated successfully')
  );
});

export const toggleBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, 'Banner not found.');
  }
  banner.active = !banner.active;
  await banner.save();
  return res.status(200).json(
    new ApiResponse(200, { banner }, 'Banner status toggled successfully')
  );
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) {
    throw new ApiError(404, 'Banner not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'Banner deleted successfully')
  );
});

export default {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner
};
