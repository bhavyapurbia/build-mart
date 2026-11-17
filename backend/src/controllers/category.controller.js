import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

const PLACEHOLDER_IMAGES = new Set([
  '/placeholder-material.svg',
  '/placeholder-material.jpg',
  '/placeholder.svg'
]);

const isCustomImage = (url) => {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && !PLACEHOLDER_IMAGES.has(trimmed);
};

const toSlug = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeSubcategories = (subcategories = []) => {
  if (!Array.isArray(subcategories)) return [];

  const seenImages = new Map();
  const normalized = [];

  for (const rawSub of subcategories) {
    const name = (typeof rawSub === 'object' ? rawSub.name : rawSub || '').trim();
    if (!name) continue;

    const slug = (typeof rawSub === 'object' && rawSub.slug ? toSlug(rawSub.slug) : toSlug(name)) || toSlug(name);
    const description = typeof rawSub === 'object' && rawSub.description ? String(rawSub.description).trim() : `${name} products`;
    const image = typeof rawSub === 'object' && isCustomImage(rawSub.image) ? rawSub.image.trim() : '';

    if (image) {
      if (seenImages.has(image)) {
        const prevName = seenImages.get(image);
        throw new ApiError(
          400,
          `Each subcategory must use a unique image. "${name}" cannot reuse the same image as "${prevName}".`
        );
      }
      seenImages.set(image, name);
    }

    normalized.push({ name, slug, description, image });
  }

  return normalized;
};

const enrichCategoryWithImages = (cat, activeProducts) => {
  const cleanCatName = (cat.name || '').trim().toLowerCase();

  const categoryProducts = activeProducts.filter((p) => {
    if (!p.category) return false;
    const pCat = p.category.trim().toLowerCase();
    return pCat === cleanCatName || pCat.includes(cleanCatName) || cleanCatName.includes(pCat);
  });

  // Track already-used images so no two subcategories in the same category repeat the same photo
  const usedImages = new Set();
  const rawSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];

  // Reserve all explicitly uploaded subcategory images first
  rawSubs.forEach((sub) => {
    if (typeof sub === 'object' && isCustomImage(sub.image)) {
      usedImages.add(sub.image.trim());
    }
  });

  const enrichedSubcategories = rawSubs.map((sub) => {
    const subObj =
      typeof sub === 'object'
        ? sub
        : { name: String(sub), slug: toSlug(sub), description: `${sub} products`, image: '' };
    const subName = (subObj.name || '').trim().toLowerCase();

    // 1. Always prioritize subcategory's own uploaded Cloudinary/custom image
    if (isCustomImage(subObj.image)) {
      return {
        ...subObj,
        image: subObj.image.trim(),
        customImage: subObj.image.trim(),
        productName: null
      };
    }

    // 2. Fallback: find an unused matching product image from this category
    let matchingProduct = categoryProducts.find((p) => {
      const pSub = (p.subcategory || '').trim().toLowerCase();
      const pImg = p.images?.[0];
      return pImg && !usedImages.has(pImg) && pSub && (pSub === subName || pSub.includes(subName) || subName.includes(pSub));
    });

    if (!matchingProduct) {
      matchingProduct = categoryProducts.find((p) => {
        const pName = (p.name || '').toLowerCase();
        const pImg = p.images?.[0];
        return pImg && !usedImages.has(pImg) && pName.includes(subName);
      });
    }

    if (!matchingProduct) {
      matchingProduct = categoryProducts.find((p) => p.images?.[0] && !usedImages.has(p.images[0]));
    }

    const fallbackImg = matchingProduct?.images?.[0] || '';
    if (fallbackImg) {
      usedImages.add(fallbackImg);
    }

    return {
      ...subObj,
      image: fallbackImg,
      customImage: '',
      productName: matchingProduct?.name || null
    };
  });

  const storedCatImage = isCustomImage(cat.image) ? cat.image.trim() : '';
  const firstSubImage = enrichedSubcategories.find((s) => isCustomImage(s.image))?.image || '';
  const resolvedCatImage =
    storedCatImage ||
    firstSubImage ||
    categoryProducts[0]?.images?.[0] ||
    '/placeholder-material.svg';

  return {
    ...cat,
    image: resolvedCatImage,
    customImage: storedCatImage,
    productImageReference: resolvedCatImage,
    productCount: categoryProducts.length,
    subcategories: enrichedSubcategories
  };
};

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  const activeProducts = await Product.find({
    isActive: true,
    images: { $exists: true, $not: { $size: 0 } }
  })
    .select('name category subcategory images')
    .lean();

  const enrichedCategories = categories.map((cat) => enrichCategoryWithImages(cat, activeProducts));

  return res.status(200).json(
    new ApiResponse(200, enrichedCategories, 'Categories fetched successfully')
  );
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const activeProducts = await Product.find({
    isActive: true,
    images: { $exists: true, $not: { $size: 0 } }
  })
    .select('name category subcategory images')
    .lean();

  const enriched = enrichCategoryWithImages(category, activeProducts);

  return res.status(200).json(
    new ApiResponse(200, enriched, 'Category fetched successfully')
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, icon, subcategories } = req.body;
  if (!name || !name.trim()) {
    throw new ApiError(400, 'Category name is required.');
  }
  const slug = toSlug(name);
  const normalizedSubs = normalizeSubcategories(subcategories);
  const cleanImage = isCustomImage(image) ? image.trim() : '';

  const newCategory = await Category.create({
    name: name.trim(),
    slug,
    description: description || '',
    image: cleanImage,
    icon: icon || '',
    subcategories: normalizedSubs,
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
    updateData.name = updateData.name.trim();
    updateData.slug = toSlug(updateData.name);
  }
  if ('image' in updateData) {
    updateData.image = isCustomImage(updateData.image) ? updateData.image.trim() : '';
  }
  if ('subcategories' in updateData) {
    updateData.subcategories = normalizeSubcategories(updateData.subcategories);
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
