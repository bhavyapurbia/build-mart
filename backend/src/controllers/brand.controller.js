import Brand from '../models/Brand.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: { $ne: false } });
  return res.status(200).json(
    new ApiResponse(200, brands, 'Brands fetched successfully')
  );
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, description, isFeatured } = req.body;
  if (!name) {
    throw new ApiError(400, 'Brand name is required.');
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const brand = await Brand.create({
    name,
    slug,
    logo: logo || '',
    description: description || '',
    isFeatured: !!isFeatured,
    isActive: true
  });
  return res.status(201).json(
    new ApiResponse(201, { brand }, 'Brand created successfully')
  );
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  if (updateData.name) {
    updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const updated = await Brand.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Brand not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, { brand: updated }, 'Brand updated successfully')
  );
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Brand.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Brand not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'Brand deleted successfully.')
  );
});

export default {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
};
