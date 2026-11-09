import Category from '../models/Category.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  return res.status(200).json(
    new ApiResponse(200, categories, 'Categories fetched successfully')
  );
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, category, 'Category fetched successfully')
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, icon, subcategories } = req.body;
  if (!name) {
    throw new ApiError(400, 'Category name is required.');
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCategory = await Category.create({
    name,
    slug,
    description: description || '',
    image: image || '',
    icon: icon || '',
    subcategories: subcategories || [],
    isActive: true
  });
  return res.status(201).json(
    new ApiResponse(201, { category: newCategory }, 'Category created successfully')
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  if (updateData.name) {
    updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Category not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, { category: updated }, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Category not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully.')
  );
});

export default {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
