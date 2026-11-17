import { connectDB } from '../src/config/db.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';

export const MASTER_CATEGORIES = [
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
      { name: 'Door Hardware, Locks & Handles', slug: 'door-hardware-locks-handles', description: 'Mortise locksets, main door handles, pull handles', image: '/categories/door-hardware-locks-handles.png' },
      { name: 'Door Locks', slug: 'door-locks', description: 'Main door rim locks, mortise handles & cylinders', image: '/categories/door-hardware-locks-handles.png' },
      { name: 'Handles', slug: 'handles', description: 'Designer zinc alloy and brass door pulls', image: '/categories/door-handle.svg' },
      { name: 'Tower Bolts', slug: 'tower-bolts', description: 'Heavy-duty brass and stainless barrel bolts', image: '/categories/hinges-and-channels.png' }
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
      { name: 'Cement', slug: 'cement', description: '50kg standard PPC, OPC 43 & 53 grade cement', image: '/categories/cement-bags-trio.svg' },
      { name: 'Waterproofing Chemicals', slug: 'waterproofing-chemicals', description: 'Integral waterproofing liquid for concrete', image: '/categories/dr-fixit-can.svg' },
      { name: 'Waterproofing Coatings', slug: 'waterproofing-coatings', description: 'Elastomeric roof and terrace membranes', image: '/categories/damp-proof.svg' },
      { name: 'Crack Fillers', slug: 'crack-fillers', description: 'Polymer acrylic flexible crack repair paste', image: '/categories/crack-filler.svg' }
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
      { name: 'Sanitaryware & Commodes', slug: 'sanitaryware-commodes', description: 'One-piece western commodes, wall hung toilets', image: '/categories/sanitaryware-commodes.svg' },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towel bars, soap dishes, and robe hooks', image: '/categories/bath-faucets-mixers.svg' },
      { name: 'Bathroom Fittings', slug: 'bathroom-fittings', description: 'Floor drains, angle cocks, and waste couplings', image: '/categories/overhead-showers.svg' }
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
      { name: 'GI Pipe Fittings', slug: 'gi-pipe-fittings', description: 'Galvanized iron pipes, heavy duty fittings', image: '/categories/gi-fittings-podium.svg' },
      { name: 'Valves', slug: 'valves', description: 'Concealed and ball valves', image: '/categories/brass-valves-podium.svg' }
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

export async function syncCategories() {
  await connectDB();
  console.log('🔄 Starting Category Synchronization...');

  // 1. Upsert all 8 master categories
  for (const master of MASTER_CATEGORIES) {
    const existing = await Category.findOne({
      $or: [
        { name: master.name },
        { slug: master.slug }
      ]
    });

    if (existing) {
      console.log(`ℹ️ Updating existing category: "${master.name}"`);
      // Preserve any custom images the admin might have uploaded
      const existingSubsMap = new Map();
      (existing.subcategories || []).forEach(s => {
        if (s.name) existingSubsMap.set(s.name.toLowerCase().trim(), s);
      });

      const mergedSubs = master.subcategories.map(sub => {
        const found = existingSubsMap.get(sub.name.toLowerCase().trim());
        if (found && found.image && !found.image.startsWith('/placeholder')) {
          return { ...sub, image: found.image };
        }
        return sub;
      });

      // Also append any extra subcategories the admin created
      const masterSubNames = new Set(master.subcategories.map(s => s.name.toLowerCase().trim()));
      (existing.subcategories || []).forEach(s => {
        if (s.name && !masterSubNames.has(s.name.toLowerCase().trim())) {
          mergedSubs.push(s);
        }
      });

      existing.name = master.name;
      existing.slug = master.slug;
      existing.description = existing.description || master.description;
      if (!existing.image || existing.image.startsWith('/placeholder')) {
        existing.image = master.image;
      }
      existing.icon = master.icon;
      existing.order = master.order;
      existing.subcategories = mergedSubs;
      existing.isActive = true;
      await existing.save();
    } else {
      console.log(`✨ Creating missing master category: "${master.name}"`);
      await Category.create(master);
    }
  }

  // 2. Map old/partial categories in products to new unified categories
  const catRenames = [
    { from: ['Hardware & Locks', 'Hardware'], to: 'Wood and Hardware' },
    { from: ['paint', 'Waterproofing', 'Paints & Wall Care'], to: 'Paint, Fevicol & Cement' },
    { from: ['Bathware', 'Plumbing & Sanitary'], to: 'Kitchen, Sanitary & Bath Fittings' },
    { from: ['CPVC, PVC & GI Fittings'], to: 'Pipes, Plumbing & Water Tanks' },
    { from: ['Cement & Steel'], to: 'Cement, Steel & Foundation' },
    { from: ['Tiles & Adhesives'], to: 'Tiles, Flooring & Adhesives' },
    { from: ['Tools & Accessories', 'Tools & Equipment'], to: 'Tools & Jobsite Equipment' },
    { from: ['Construction Materials'], to: 'Construction Materials & Masonry' }
  ];

  for (const { from, to } of catRenames) {
    const res = await Product.updateMany(
      { category: { $in: from } },
      { $set: { category: to } }
    );
    if (res.modifiedCount > 0) {
      console.log(`📦 Re-mapped ${res.modifiedCount} products from [${from.join(', ')}] to "${to}"`);
    }
  }

  // Remove duplicate/legacy category docs if they match old names and now have 0 products
  const legacyNames = ['paint', 'Waterproofing', 'CPVC, PVC & GI Fittings', 'Hardware & Locks', 'Bathware', 'Tools & Accessories', 'Tiles & Adhesives', 'Cement & Steel', 'Construction Materials'];
  for (const legacy of legacyNames) {
    const cat = await Category.findOne({ name: legacy });
    if (cat) {
      const prodCount = await Product.countDocuments({ category: legacy });
      if (prodCount === 0) {
        await Category.deleteOne({ _id: cat._id });
        console.log(`🧹 Cleaned up obsolete category document: "${legacy}"`);
      }
    }
  }

  const finalCats = await Category.find({}).sort({ order: 1 }).lean();
  console.log(`\n✅ CATEGORY SYNC COMPLETE! Total categories in DB: ${finalCats.length}`);
  finalCats.forEach(c => {
    console.log(`  ${c.order}. ${c.name} (${c.subcategories?.length || 0} subcategories)`);
  });
}

// Allow standalone execution
if (process.argv[1]?.endsWith('sync_categories.js')) {
  syncCategories().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
}
