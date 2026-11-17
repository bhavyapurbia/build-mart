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

  const normalized = [];

  for (const rawSub of subcategories) {
    const name = (typeof rawSub === 'object' ? rawSub.name : rawSub || '').trim();
    if (!name) continue;

    const slug = (typeof rawSub === 'object' && rawSub.slug ? toSlug(rawSub.slug) : toSlug(name)) || toSlug(name);
    const description = typeof rawSub === 'object' && rawSub.description ? String(rawSub.description).trim() : `${name} products`;
    const image = typeof rawSub === 'object' && rawSub.image ? String(rawSub.image).trim() : '';

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

const MASTER_CATEGORIES = [
  {
    name: 'Wood and Hardware',
    slug: 'wood-and-hardware',
    description: 'Plywood, MDF & HDHMR, architectural hinges, channels, kitchen and wardrobe hardware, locks & handles',
    image: '/categories/plywood-mdf-hdhmr.png',
    icon: 'Hammer',
    order: 1,
    subcategories: [
      { name: 'Plywood, MDF & HDHMR', slug: 'plywood-mdf-hdhmr', description: 'Commercial & marine plywood, HDHMR boards', image: '/categories/plywood-mdf-hdhmr.png' },
      { name: 'Hinges & Channels', slug: 'hinges-channels', description: 'Soft close hinges, telescopic drawer channels', image: '/categories/hinges-and-channels.png' },
      { name: 'Kitchen & Wardrobe Hardware', slug: 'kitchen-wardrobe-hardware', description: 'Modular kitchen tandem boxes, wardrobe fittings', image: '/categories/kitchen-wardrobe-hardware.png' },
      { name: 'Door Hardware, Locks & Handles', slug: 'door-hardware-locks-handles', description: 'Mortise locksets, main door handles, pull handles', image: '/categories/door-hardware-locks-handles.png' }
    ]
  },
  {
    name: 'Paint, Fevicol & Cement',
    slug: 'paint-fevicol-cement',
    description: 'Wall paints, primers, putty, synthetic resin adhesives, tiling waterproofing, and cement bags',
    image: '/categories/paints-putty-sundries.svg',
    icon: 'Building2',
    order: 2,
    subcategories: [
      { name: 'Fevicol & Sealants', slug: 'fevicol-sealants', description: 'Synthetic resin adhesives, silicone sealants', image: '/categories/fevicol-sealants.svg' },
      { name: 'Tiling and Waterproofing', slug: 'tiling-waterproofing', description: 'Waterproof coatings and tiling adhesives', image: '/categories/tiling-waterproofing.svg' },
      { name: 'Paints, Putty & Sundries', slug: 'paints-putty-sundries', description: 'Emulsions, primers, wall putty, and rollers', image: '/categories/paints-putty-sundries.svg' },
      { name: 'Cement', slug: 'cement', description: '50kg standard PPC, OPC 43 & 53 grade cement', image: '/categories/cement-bags-trio.svg' }
    ]
  },
  {
    name: 'Kitchen, Sanitary & Bath Fittings',
    slug: 'kitchen-sanitary-bath-fittings',
    description: 'Vitreous chinaware basins, single-lever brass faucets, showers, and sanitary products',
    image: '/categories/bath-faucets-mixers.svg',
    icon: 'Bath',
    order: 3,
    subcategories: [
      { name: 'Bath Faucets & Mixers', slug: 'bath-faucets-mixers', description: 'Chrome brass basin mixers and pillar taps', image: '/categories/bath-faucets-mixers.svg' },
      { name: 'Overhead Showers', slug: 'overhead-showers', description: 'Rain showers, multi-flow hand showers', image: '/categories/overhead-showers.svg' },
      { name: 'Wash Basins & Sinks', slug: 'wash-basins-sinks', description: 'Tabletop, counter, and kitchen sinks', image: '/categories/wash-basins-sinks.svg' },
      { name: 'Sanitaryware & Commodes', slug: 'sanitaryware-commodes', description: 'One-piece western commodes, wall hung toilets', image: '/categories/sanitaryware-commodes.svg' }
    ]
  },
  {
    name: 'Pipes, Plumbing & Water Tanks',
    slug: 'pipes-plumbing-water-tanks',
    description: 'High-pressure CPVC pipes, drainage PVC, GI pipes, brass valves, and water tanks',
    image: '/categories/cpvc-pipes-podium.svg',
    icon: 'Wrench',
    order: 4,
    subcategories: [
      { name: 'CPVC Pipes & Fittings', slug: 'cpvc-pipes-fittings', description: 'SDR 11 & SDR 13.5 hot & cold plumbing pipes', image: '/categories/cpvc-pipes-podium.svg' },
      { name: 'PVC Drainage & SWR Pipes', slug: 'pvc-drainage-swr-pipes', description: 'SWR drainage, rainwater, and soil pipes', image: '/categories/pvc-drainage-podium.svg' },
      { name: 'Brass Valves & Cocks', slug: 'brass-valves-cocks', description: 'Brass ball valves, concealed stop cocks', image: '/categories/brass-valves-podium.svg' },
      { name: 'GI Pipe Fittings', slug: 'gi-pipe-fittings', description: 'Galvanized iron pipes, heavy duty fittings', image: '/categories/gi-fittings-podium.svg' }
    ]
  },
  {
    name: 'Tiles, Flooring & Adhesives',
    slug: 'tiles-flooring-adhesives',
    description: 'Vitrified floor tiles, wall ceramics, heavy-duty tile adhesives, and grouts',
    image: '/categories/floor-tiles-podium.svg',
    icon: 'LayoutGrid',
    order: 5,
    subcategories: [
      { name: 'Vitrified Floor Tiles', slug: 'vitrified-floor-tiles', description: 'Double charged vitrified & porcelain floor tiles', image: '/categories/floor-tiles-podium.svg' },
      { name: 'Wall Ceramic Tiles', slug: 'wall-ceramic-tiles', description: 'Glossy & matte glazed wall ceramic tiles', image: '/categories/wall-tiles-podium.svg' },
      { name: 'Tile Adhesive & Grouts', slug: 'tile-adhesive-grouts', description: 'Polymer modified cementitious tile adhesive and epoxy grout', image: '/categories/tile-adhesive-podium.svg' },
      { name: 'Tiling Waterproofing', slug: 'tiling-waterproofing', description: 'Substrate primer and waterproofing membrane', image: '/categories/tiling-waterproofing.svg' }
    ]
  },
  {
    name: 'Cement, Steel & Foundation',
    slug: 'cement-steel-foundation',
    description: 'UltraTech & ACC cement, Tata Tiscon TMT rebar, binding wire, and structural steel',
    image: '/categories/cement-bags-trio.svg',
    icon: 'ShieldCheck',
    order: 6,
    subcategories: [
      { name: 'UltraTech & ACC Cement', slug: 'ultratech-acc-cement', description: '50kg standard PPC, OPC 43 & 53 grade cement', image: '/categories/cement-bags-trio.svg' },
      { name: 'Tata Tiscon 550D TMT Rebar', slug: 'tata-tiscon-550d-tmt-rebar', description: 'Fe 550D TMT rebar 8mm to 32mm', image: '/categories/tmt-rebar-podium.svg' },
      { name: 'Annealed GI Binding Wire', slug: 'annealed-gi-binding-wire', description: 'Annealed GI binding wire, cover blocks', image: '/categories/binding-wire-podium.svg' },
      { name: 'Structural Steel Bars', slug: 'structural-steel-bars', description: 'MS channels, angles, beams, and flats', image: '/categories/steel-bars.svg' }
    ]
  },
  {
    name: 'Construction Materials & Masonry',
    slug: 'construction-materials-masonry',
    description: 'Manufactured M-Sand, 20mm granite aggregate, red burnt clay bricks, and AAC blocks',
    image: '/categories/red-bricks-podium.svg',
    icon: 'HardHat',
    order: 7,
    subcategories: [
      { name: 'Washed Plastering M-Sand', slug: 'washed-plastering-m-sand', description: 'Fine filtered M-sand for plastering and masonry', image: '/categories/m-sand-podium.svg' },
      { name: '20mm Granite Aggregate', slug: '20mm-granite-aggregate', description: 'Crushed blue metal granite aggregate for RCC', image: '/categories/granite-aggregate-podium.svg' },
      { name: 'Wire-Cut Red Clay Bricks', slug: 'wire-cut-red-clay-bricks', description: 'High-compressive chamber red bricks', image: '/categories/red-bricks-podium.svg' },
      { name: 'AAC Lightweight Blocks', slug: 'aac-lightweight-blocks', description: 'Autoclaved aerated concrete wall blocks', image: '/categories/aac-blocks-podium.svg' }
    ]
  },
  {
    name: 'Tools & Jobsite Equipment',
    slug: 'tools-jobsite-equipment',
    description: 'Professional angle grinders, diamond cutting blades, measuring tape, and masonry tools',
    image: '/categories/angle-grinder-podium.svg',
    icon: 'Hammer',
    order: 8,
    subcategories: [
      { name: 'Professional Angle Grinder', slug: 'professional-angle-grinder', description: 'Bosch / Dewalt 4-inch heavy duty angle grinders', image: '/categories/angle-grinder-podium.svg' },
      { name: 'Diamond Cutting Blades', slug: 'diamond-cutting-blades', description: 'Laser welded 4-inch tile and granite blades', image: '/categories/cutting-blades-podium.svg' },
      { name: 'Steel Measuring Tape', slug: 'steel-measuring-tape', description: '5m / 8m rugged shockproof steel measuring tapes', image: '/categories/measuring-tape-podium.svg' },
      { name: 'Masonry Trowels & Tools', slug: 'masonry-trowels-tools', description: 'Forged steel masonry trowels, spirit levels', image: '/categories/masonry-tools-podium.svg' }
    ]
  }
];

export const getCategories = asyncHandler(async (req, res) => {
  let categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();

  // ONLY auto-populate master categories if the collection is completely empty (0 categories in DB)
  if (!categories || categories.length === 0) {
    const totalCount = await Category.countDocuments();
    if (totalCount === 0) {
      try {
        await Category.insertMany(MASTER_CATEGORIES);
        categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
      } catch (e) {
        console.error('Initial category seed warning:', e.message);
      }
    }
  }

  const activeProducts = await Product.find({
    isActive: true,
    images: { $exists: true, $not: { $size: 0 } }
  })
    .select('name category subcategory images')
    .lean();

  const enrichedCategories = (categories || []).map((cat) => enrichCategoryWithImages(cat, activeProducts));

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

  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    throw new ApiError(404, 'Category not found.');
  }
  const oldName = existingCategory.name;

  if (updateData.name) {
    updateData.name = updateData.name.trim();
    if (updateData.name !== oldName) {
      let slug = toSlug(updateData.name);
      const conflict = await Category.findOne({ slug, _id: { $ne: id } });
      if (conflict) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
      updateData.slug = slug;
    }
  }
  if ('image' in updateData) {
    updateData.image = (updateData.image || '').trim();
  }
  if ('subcategories' in updateData) {
    updateData.subcategories = normalizeSubcategories(updateData.subcategories);
  }

  const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Category not found.');
  }

  // Synchronously update products assigned to this category if renamed
  if (updateData.name && updateData.name !== oldName) {
    await Product.updateMany(
      { category: oldName },
      { $set: { category: updateData.name } }
    );
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

  // Update existing products referencing this deleted category
  await Product.updateMany(
    { category: deleted.name },
    { $set: { category: 'General Construction', subcategory: '' } }
  );

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
