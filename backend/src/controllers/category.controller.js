import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  // Find all active products with images to map reference images dynamically
  const activeProducts = await Product.find({
    isActive: true,
    images: { $exists: true, $not: { $size: 0 } }
  })
  .select('name category subcategory images')
  .lean();

  const enrichedCategories = categories.map((cat) => {
    const cleanCatName = (cat.name || '').trim().toLowerCase();

    // Find products belonging to this category (match exact, contains, or prefix, e.g. 'Cement' matches 'Cement & Steel')
    const categoryProducts = activeProducts.filter(p => {
      if (!p.category) return false;
      const pCat = p.category.trim().toLowerCase();
      return pCat === cleanCatName || pCat.includes(cleanCatName) || cleanCatName.includes(pCat);
    });

    // Populate each subcategory with a distinct product image
    const usedImages = new Set();
    const enrichedSubcategories = (cat.subcategories || []).map((sub) => {
      const subName = (typeof sub === 'object' ? sub.name : sub || '').trim().toLowerCase();

      // 1. Find product with matching subcategory
      let matchingProduct = categoryProducts.find(p => {
        const pSub = (p.subcategory || '').trim().toLowerCase();
        return pSub && (pSub === subName || pSub.includes(subName) || subName.includes(pSub));
      });

      // 2. If not found by subcategory, find by product name
      if (!matchingProduct) {
        matchingProduct = categoryProducts.find(p => {
          const pName = (p.name || '').toLowerCase();
          return pName.includes(subName);
        });
      }

      // 3. If still not found, pick an unused product from this category so every card has a distinct product photo
      if (!matchingProduct) {
        matchingProduct = categoryProducts.find(p => p.images?.[0] && !usedImages.has(p.images[0])) || categoryProducts[0];
      }

      const img = matchingProduct?.images?.[0] || (typeof sub === 'object' ? sub.image : null) || '/placeholder-material.svg';
      if (matchingProduct?.images?.[0]) {
        usedImages.add(matchingProduct.images[0]);
      }

      return {
        ...(typeof sub === 'object' ? sub : { name: sub, slug: String(sub).toLowerCase().replace(/[^a-z0-9]+/g, '-') }),
        image: img,
        productName: matchingProduct?.name || null
      };
    });

    // Category's primary referenced image: first product image in this category
    const categoryRefImage = categoryProducts[0]?.images?.[0] || cat.image || '/placeholder-material.svg';

    return {
      ...cat,
      image: categoryRefImage,
      productImageReference: categoryRefImage,
      productCount: categoryProducts.length,
      subcategories: enrichedSubcategories
    };
  });

  return res.status(200).json(
    new ApiResponse(200, enrichedCategories, 'Categories fetched successfully')
  );
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const cleanCatName = (category.name || '').trim().toLowerCase();
  const categoryProducts = await Product.find({
    isActive: true,
    images: { $exists: true, $not: { $size: 0 } }
  })
  .select('name category subcategory images')
  .lean()
  .then(prods => prods.filter(p => {
    if (!p.category) return false;
    const pCat = p.category.trim().toLowerCase();
    return pCat === cleanCatName || pCat.includes(cleanCatName) || cleanCatName.includes(pCat);
  }));

  const usedImages = new Set();
  const enrichedSubcategories = (category.subcategories || []).map((sub) => {
    const subName = (sub.name || '').trim().toLowerCase();
    let matchingProduct = categoryProducts.find(p => {
      const pSub = (p.subcategory || '').trim().toLowerCase();
      return pSub && (pSub === subName || pSub.includes(subName) || subName.includes(pSub));
    }) || categoryProducts.find(p => (p.name || '').toLowerCase().includes(subName))
       || categoryProducts.find(p => p.images?.[0] && !usedImages.has(p.images[0]))
       || categoryProducts[0];

    const img = matchingProduct?.images?.[0] || sub.image || '/placeholder-material.svg';
    if (matchingProduct?.images?.[0]) usedImages.add(matchingProduct.images[0]);

    return {
      ...sub,
      image: img,
      productName: matchingProduct?.name || null
    };
  });

  const categoryRefImage = categoryProducts[0]?.images?.[0] || category.image || '/placeholder-material.svg';

  return res.status(200).json(
    new ApiResponse(200, {
      ...category,
      image: categoryRefImage,
      productImageReference: categoryRefImage,
      productCount: categoryProducts.length,
      subcategories: enrichedSubcategories
    }, 'Category fetched successfully')
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
