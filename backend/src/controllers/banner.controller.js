import Banner from '../models/Banner.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ active: { $ne: false } });
  return res.status(200).json(
    new ApiResponse(200, banners, 'Active banners fetched successfully')
  );
});

export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  return res.status(200).json(
    new ApiResponse(200, banners, 'All banners fetched successfully')
  );
});

export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, badge, couponCode, ctaText, link, bgGradient, image, type } = req.body;
  if (!title) {
    throw new ApiError(400, 'Banner title is required.');
  }

  const banner = await Banner.create({
    title,
    subtitle: subtitle || '',
    badge: badge || 'SPECIAL OFFER',
    couponCode: couponCode || '',
    ctaText: ctaText || 'SHOP NOW',
    link: link || '/products',
    bgGradient: bgGradient || 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
    image: image || '',
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
  const updated = await Banner.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Banner not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, { banner: updated }, 'Banner updated successfully')
  );
});

export const toggleBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, 'Banner not found.');
  }

  const updated = await Banner.findByIdAndUpdate(
    id,
    { active: !banner.active },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { banner: updated }, `Banner ${updated.active ? 'activated' : 'disabled'} successfully`)
  );
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Banner.findByIdAndDelete(id);
  if (!deleted) {
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

