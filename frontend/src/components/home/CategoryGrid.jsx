import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const ALL_SITE_SECTIONS = [
  // 1. WOOD AND HARDWARE (Exact Match with Image)
  {
    id: 'wood_and_hardware',
    title: 'Wood and Hardware',
    categoryName: 'Wood and Hardware',
    viewAllLink: '/products?category=Wood%20and%20Hardware',
    items: [
      {
        id: 'plywood_mdf_hdhmr',
        name: 'Plywood, MDF & HDHMR',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Plywood%2C%20MDF%20%26%20HDHMR',
        image: '/categories/plywood-mdf-hdhmr.png'
      },
      {
        id: 'hinges_channels',
        name: 'Hinges & Channels',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Hinges%20%26%20Channels',
        image: '/categories/hinges-and-channels.png'
      },
      {
        id: 'kitchen_wardrobe_hardware',
        name: 'Kitchen & Wardrobe Hardware',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Kitchen%20%26%20Wardrobe%20Hardware',
        image: '/categories/kitchen-wardrobe-hardware.png'
      },
      {
        id: 'door_hardware_locks_handles',
        name: 'Door Hardware, Locks & Handles',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Door%20Hardware%2C%20Locks%20%26%20Handles',
        image: '/categories/door-hardware-locks-handles.png'
      }
    ]
  },

  // 2. PAINT, FEVICOL & CEMENT (Exact Match with Image)
  {
    id: 'paint_fevicol_cement',
    title: 'Paint, Fevicol & Cement',
    categoryName: 'Paint, Fevicol & Cement',
    viewAllLink: '/products?category=Paint%2C%20Fevicol%20%26%20Cement',
    items: [
      {
        id: 'fevicol_sealants',
        name: 'Fevicol & Sealants',
        link: '/products?category=Paint%2C%20Fevicol%20%26%20Cement&subcategory=Fevicol%20%26%20Sealants',
        image: '/categories/fevicol-sealants.svg'
      },
      {
        id: 'tiling_waterproofing',
        name: 'Tiling and Waterproofing',
        link: '/products?category=Paint%2C%20Fevicol%20%26%20Cement&subcategory=Tiling%20and%20Waterproofing',
        image: '/categories/tiling-waterproofing.svg'
      },
      {
        id: 'paints_putty_sundries',
        name: 'Paints, Putty & Sundries',
        link: '/products?category=Paint%2C%20Fevicol%20%26%20Cement&subcategory=Paints%2C%20Putty%20%26%20Sundries',
        image: '/categories/paints-putty-sundries.svg'
      },
      {
        id: 'cement',
        name: 'Cement',
        link: '/products?category=Paint%2C%20Fevicol%20%26%20Cement&subcategory=Cement',
        image: '/categories/cement-bags-trio.svg'
      }
    ]
  },

  // 3. KITCHEN, SANITARY & BATH FITTINGS (Exact Match with Image)
  {
    id: 'kitchen_sanitary_bath',
    title: 'Kitchen, Sanitary & Bath Fittings',
    categoryName: 'Kitchen, Sanitary & Bath Fittings',
    viewAllLink: '/products?category=Kitchen%2C%20Sanitary%20%26%20Bath%20Fittings',
    items: [
      {
        id: 'bath_faucets_mixers',
        name: 'Bath Faucets & Mixers',
        link: '/products?category=Kitchen%2C%20Sanitary%20%26%20Bath%20Fittings&subcategory=Bath%20Faucets%20%26%20Mixers',
        image: '/categories/bath-faucets-mixers.svg'
      },
      {
        id: 'overhead_showers',
        name: 'Overhead Showers',
        link: '/products?category=Kitchen%2C%20Sanitary%20%26%20Bath%20Fittings&subcategory=Overhead%20Showers',
        image: '/categories/overhead-showers.svg'
      },
      {
        id: 'wash_basins_sinks',
        name: 'Wash Basins & Sinks',
        link: '/products?category=Kitchen%2C%20Sanitary%20%26%20Bath%20Fittings&subcategory=Wash%20Basins%20%26%20Sinks',
        image: '/categories/wash-basins-sinks.svg'
      },
      {
        id: 'sanitaryware_commodes',
        name: 'Sanitaryware & Commodes',
        link: '/products?category=Kitchen%2C%20Sanitary%20%26%20Bath%20Fittings&subcategory=Sanitaryware%20%26%20Commodes',
        image: '/categories/sanitaryware-commodes.svg'
      }
    ]
  },

  // 4. PIPES, PLUMBING & WATER TANKS
  {
    id: 'pipes_plumbing_water',
    title: 'Pipes, Plumbing & Water Tanks',
    categoryName: 'Pipes, Plumbing & Water Tanks',
    viewAllLink: '/products?category=Pipes%2C%20Plumbing%20%26%20Water%20Tanks',
    items: [
      {
        id: 'cpvc_pipes_fittings',
        name: 'CPVC Pipes & Fittings',
        link: '/products?category=Pipes%2C%20Plumbing%20%26%20Water%20Tanks&subcategory=CPVC%20Pipes%20%26%20Fittings',
        image: '/categories/cpvc-pipes-podium.svg'
      },
      {
        id: 'pvc_drainage_pipes',
        name: 'PVC Drainage & SWR Pipes',
        link: '/products?category=Pipes%2C%20Plumbing%20%26%20Water%20Tanks&subcategory=PVC%20Drainage%20%26%20SWR%20Pipes',
        image: '/categories/pvc-drainage-podium.svg'
      },
      {
        id: 'brass_valves_cocks',
        name: 'Brass Valves & Cocks',
        link: '/products?category=Pipes%2C%20Plumbing%20%26%20Water%20Tanks&subcategory=Brass%20Valves%20%26%20Cocks',
        image: '/categories/brass-valves-podium.svg'
      },
      {
        id: 'gi_pipe_fittings',
        name: 'GI Pipe Fittings',
        link: '/products?category=Pipes%2C%20Plumbing%20%26%20Water%20Tanks&subcategory=GI%20Pipe%20Fittings',
        image: '/categories/gi-fittings-podium.svg'
      }
    ]
  },

  // 5. TILES, FLOORING & ADHESIVES
  {
    id: 'tiles_flooring_adhesives',
    title: 'Tiles, Flooring & Adhesives',
    categoryName: 'Tiles, Flooring & Adhesives',
    viewAllLink: '/products?category=Tiles%2C%20Flooring%20%26%20Adhesives',
    items: [
      {
        id: 'vitrified_floor_tiles',
        name: 'Vitrified Floor Tiles',
        link: '/products?category=Tiles%2C%20Flooring%20%26%20Adhesives&subcategory=Vitrified%20Floor%20Tiles',
        image: '/categories/floor-tiles-podium.svg'
      },
      {
        id: 'wall_ceramic_tiles',
        name: 'Wall Ceramic Tiles',
        link: '/products?category=Tiles%2C%20Flooring%20%26%20Adhesives&subcategory=Wall%20Ceramic%20Tiles',
        image: '/categories/wall-tiles-podium.svg'
      },
      {
        id: 'heavy_duty_tile_adhesive',
        name: 'Tile Adhesive & Grouts',
        link: '/products?category=Tiles%2C%20Flooring%20%26%20Adhesives&subcategory=Tile%20Adhesive%20%26%20Grouts',
        image: '/categories/tile-adhesive-podium.svg'
      },
      {
        id: 'tiling_waterproofing_solutions',
        name: 'Tiling Waterproofing',
        link: '/products?category=Tiles%2C%20Flooring%20%26%20Adhesives&subcategory=Tiling%20Waterproofing',
        image: '/categories/tiling-waterproofing.svg'
      }
    ]
  },

  // 6. CEMENT, STEEL & FOUNDATION
  {
    id: 'cement_steel_foundation',
    title: 'Cement, Steel & Foundation',
    categoryName: 'Cement, Steel & Foundation',
    viewAllLink: '/products?category=Cement%2C%20Steel%20%26%20Foundation',
    items: [
      {
        id: 'ultratech_acc_cement',
        name: 'UltraTech & ACC Cement',
        link: '/products?category=Cement%2C%20Steel%20%26%20Foundation&subcategory=UltraTech%20%26%20ACC%20Cement',
        image: '/categories/cement-bags-trio.svg'
      },
      {
        id: 'tmt_550d_rebar',
        name: 'Tata Tiscon 550D TMT Rebar',
        link: '/products?category=Cement%2C%20Steel%20%26%20Foundation&subcategory=Tata%20Tiscon%20550D%20TMT%20Rebar',
        image: '/categories/tmt-rebar-podium.svg'
      },
      {
        id: 'gi_binding_wire',
        name: 'Annealed GI Binding Wire',
        link: '/products?category=Cement%2C%20Steel%20%26%20Foundation&subcategory=Annealed%20GI%20Binding%20Wire',
        image: '/categories/binding-wire-podium.svg'
      },
      {
        id: 'structural_steel_bars',
        name: 'Structural Steel Bars',
        link: '/products?category=Cement%2C%20Steel%20%26%20Foundation&subcategory=Structural%20Steel%20Bars',
        image: '/categories/steel-bars.svg'
      }
    ]
  },

  // 7. CONSTRUCTION MATERIALS & MASONRY
  {
    id: 'construction_materials_masonry',
    title: 'Construction Materials & Masonry',
    categoryName: 'Construction Materials & Masonry',
    viewAllLink: '/products?category=Construction%20Materials%20%26%20Masonry',
    items: [
      {
        id: 'plastering_m_sand',
        name: 'Washed Plastering M-Sand',
        link: '/products?category=Construction%20Materials%20%26%20Masonry&subcategory=Washed%20Plastering%20M-Sand',
        image: '/categories/m-sand-podium.svg'
      },
      {
        id: 'blue_metal_granite',
        name: '20mm Granite Aggregate',
        link: '/products?category=Construction%20Materials%20%26%20Masonry&subcategory=20mm%20Granite%20Aggregate',
        image: '/categories/granite-aggregate-podium.svg'
      },
      {
        id: 'red_burnt_clay_bricks',
        name: 'Wire-Cut Red Clay Bricks',
        link: '/products?category=Construction%20Materials%20%26%20Masonry&subcategory=Wire-Cut%20Red%20Clay%20Bricks',
        image: '/categories/red-bricks-podium.svg'
      },
      {
        id: 'aac_lightweight_blocks',
        name: 'AAC Lightweight Blocks',
        link: '/products?category=Construction%20Materials%20%26%20Masonry&subcategory=AAC%20Lightweight%20Blocks',
        image: '/categories/aac-blocks-podium.svg'
      }
    ]
  },

  // 8. POWER TOOLS & JOBSITE EQUIPMENT
  {
    id: 'tools_equipment',
    title: 'Tools & Jobsite Equipment',
    categoryName: 'Tools & Jobsite Equipment',
    viewAllLink: '/products?category=Tools%20%26%20Jobsite%20Equipment',
    items: [
      {
        id: 'bosch_angle_grinder',
        name: 'Professional Angle Grinder',
        link: '/products?category=Tools%20%26%20Jobsite%20Equipment&subcategory=Professional%20Angle%20Grinder',
        image: '/categories/angle-grinder-podium.svg'
      },
      {
        id: 'diamond_cutting_blades',
        name: 'Diamond Cutting Blades',
        link: '/products?category=Tools%20%26%20Jobsite%20Equipment&subcategory=Diamond%20Cutting%20Blades',
        image: '/categories/cutting-blades-podium.svg'
      },
      {
        id: 'precision_measuring_tape',
        name: 'Steel Measuring Tape',
        link: '/products?category=Tools%20%26%20Jobsite%20Equipment&subcategory=Steel%20Measuring%20Tape',
        image: '/categories/measuring-tape-podium.svg'
      },
      {
        id: 'masonry_hand_tools',
        name: 'Masonry Trowels & Tools',
        link: '/products?category=Tools%20%26%20Jobsite%20Equipment&subcategory=Masonry%20Trowels%20%26%20Tools',
        image: '/categories/masonry-tools-podium.svg'
      }
    ]
  }
];

const SUBCATEGORY_FALLBACK_IMAGES = {
  'cement bags': '/categories/cement-bags-ultratech.png',
  'different cement brands': '/categories/cement-bags-trio.svg',
  'steel bars': '/categories/steel-bars.svg',
  'tmt bars': '/categories/tmt-rebar-podium.svg',
  'binding materials': '/categories/binding-wire-podium.svg',
  'waterproofing chemicals': '/categories/dr-fixit-can.svg',
  'waterproofing coatings': '/categories/damp-proof.svg',
  'roof waterproofing': '/categories/roof-membrane.svg',
  'crack fillers': '/categories/crack-filler.svg',
  'floor tiles': '/categories/floor-tiles-podium.svg',
  'wall tiles': '/categories/wall-tiles-podium.svg',
  'tile adhesives': '/categories/tile-adhesive-podium.svg',
  'tile grout': '/categories/tile-grout.svg',
  'tile spacers': '/categories/tile-adhesive.svg',
  'cpvc pipes': '/categories/cpvc-pipes-podium.svg',
  'pvc pipes': '/categories/pvc-drainage-podium.svg',
  'gi pipes': '/categories/gi-fittings-podium.svg',
  'valves': '/categories/brass-valves-podium.svg',
  'door locks': '/categories/door-hardware-locks-handles.png',
  'handles': '/categories/door-handle.svg',
  'hinges': '/categories/hinges-and-channels.png',
  'bathroom faucets': '/categories/bath-faucets-mixers.svg',
  'shower fittings': '/categories/overhead-showers.svg',
  'washbasins': '/categories/wash-basins-sinks.svg',
  'sanitaryware': '/categories/sanitaryware-commodes.svg',
  'construction tools': '/categories/angle-grinder-podium.svg',
  'cutting accessories': '/categories/cutting-blades-podium.svg',
  'measuring tools': '/categories/measuring-tape-podium.svg',
  'bricks': '/categories/red-bricks-podium.svg',
  'blocks': '/categories/aac-blocks-podium.svg',
  'sand': '/categories/m-sand-podium.svg',
  'aggregate': '/categories/granite-aggregate-podium.svg',
  'paint': '/categories/interior-emulsion.svg',
  'primer': '/categories/exterior-paint.svg',
  'putti': '/categories/birla-wall-putty.svg',
  'putty': '/categories/birla-wall-putty.svg',
  'damproof': '/categories/damp-proof.svg',
  'damp proof': '/categories/damp-proof.svg'
};

const isRealImg = (url) =>
  typeof url === 'string' &&
  url.trim().length > 0 &&
  url !== '/placeholder-material.svg' &&
  url !== '/placeholder-material.jpg';

const getFallbackSubcategoryImage = (subName) => {
  if (!subName) return null;
  const key = subName.toLowerCase().trim();
  if (SUBCATEGORY_FALLBACK_IMAGES[key]) return SUBCATEGORY_FALLBACK_IMAGES[key];
  for (const [k, v] of Object.entries(SUBCATEGORY_FALLBACK_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
};

const CategoryGrid = ({ categories = [] }) => {
  // Dynamically render categories from the database (persisted via AdminCategories)
  const renderedSections = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((dbCat) => {
        const catName = dbCat.name;
        const usedInSection = new Set();
        const rawSubs = Array.isArray(dbCat.subcategories) ? dbCat.subcategories : [];

        let subItems = [];
        if (rawSubs.length > 0) {
          subItems = rawSubs.map((sub, sIdx) => {
            const subName = (typeof sub === 'object' ? sub.name : sub) || '';
            const customSubImg = typeof sub === 'object' && isRealImg(sub.customImage) ? sub.customImage.trim() : '';
            const backendSubImg = typeof sub === 'object' && isRealImg(sub.image) ? sub.image.trim() : '';
            const fallbackSvg = getFallbackSubcategoryImage(subName);

            let resolvedImg = '';
            if (customSubImg && !usedInSection.has(customSubImg)) {
              resolvedImg = customSubImg;
            } else if (backendSubImg && !usedInSection.has(backendSubImg)) {
              resolvedImg = backendSubImg;
            } else if (fallbackSvg && !usedInSection.has(fallbackSvg)) {
              resolvedImg = fallbackSvg;
            } else {
              resolvedImg = customSubImg || backendSubImg || fallbackSvg || dbCat.customImage || dbCat.image || '/placeholder-material.svg';
            }

            if (isRealImg(resolvedImg)) {
              usedInSection.add(resolvedImg);
            }

            return {
              id: `${dbCat.slug || dbCat._id}_sub_${sIdx}`,
              name: subName,
              link: `/products?category=${encodeURIComponent(catName)}&subcategory=${encodeURIComponent(subName)}`,
              image: resolvedImg
            };
          });
        } else {
          subItems = [
            {
              id: `${dbCat.slug || dbCat._id}_main`,
              name: catName,
              link: `/products?category=${encodeURIComponent(catName)}`,
              image: isRealImg(dbCat.customImage) ? dbCat.customImage : (isRealImg(dbCat.image) ? dbCat.image : '/placeholder-material.svg')
            }
          ];
        }

        return {
          id: dbCat.slug || String(dbCat._id),
          title: catName,
          categoryName: catName,
          viewAllLink: `/products?category=${encodeURIComponent(catName)}`,
          items: subItems
        };
      });
    }

    // Fallback if categories are not yet loaded from DB
    return ALL_SITE_SECTIONS;
  }, [categories]);

  return (
    <section className="category-showcase-section" id="home-categories-grid">
      <div className="container">
        {renderedSections.map((section) => (
          <div key={section.id} className="category-showcase-group">
            {/* Section Heading (Solid Bold Black matching reference screenshot) */}
            <div className="category-showcase-header">
              <h2 className="category-showcase-title">
                {section.title}
              </h2>
            </div>

            {/* 4 Cards Grid (Peach/Cream Rounded Tiles side-by-side) */}
            <div className="category-peach-grid">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="category-peach-item"
                  title={`Shop ${item.name}`}
                >
                  <div className="category-peach-box">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="category-peach-img"
                      loading="lazy"
                    />
                  </div>
                  <span className="category-peach-label">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
