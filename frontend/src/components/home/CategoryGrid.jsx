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
    categoryName: 'Paints & Wall Care',
    viewAllLink: '/products?category=Paints%20%26%20Wall%20Care',
    items: [
      {
        id: 'fevicol_sealants',
        name: 'Fevicol & Sealants',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Adhesives',
        image: '/categories/fevicol-sealants.svg'
      },
      {
        id: 'tiling_waterproofing',
        name: 'Tiling and Waterproofing',
        link: '/products?category=Waterproofing',
        image: '/categories/tiling-waterproofing.svg'
      },
      {
        id: 'paints_putty_sundries',
        name: 'Paints, Putty & Sundries',
        link: '/products?category=Paints%20%26%20Wall%20Care',
        image: '/categories/paints-putty-sundries.svg'
      },
      {
        id: 'cement',
        name: 'Cement',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Cement%20Bags',
        image: '/categories/cement-bags-trio.svg'
      }
    ]
  },

  // 3. KITCHEN, SANITARY & BATH FITTINGS (Exact Match with Image)
  {
    id: 'kitchen_sanitary_bath',
    title: 'Kitchen, Sanitary & Bath Fittings',
    categoryName: 'Bathware',
    viewAllLink: '/products?category=Bathware',
    items: [
      {
        id: 'bath_faucets_mixers',
        name: 'Bath Faucets & Mixers',
        link: '/products?category=Bathware&subcategory=Bathroom%20Faucets',
        image: '/categories/bath-faucets-mixers.svg'
      },
      {
        id: 'overhead_showers',
        name: 'Overhead Showers',
        link: '/products?category=Bathware&subcategory=Shower%20Fittings',
        image: '/categories/overhead-showers.svg'
      },
      {
        id: 'wash_basins_sinks',
        name: 'Wash Basins & Sinks',
        link: '/products?category=Bathware&subcategory=Washbasins',
        image: '/categories/wash-basins-sinks.svg'
      },
      {
        id: 'sanitaryware_commodes',
        name: 'Sanitaryware & Commodes',
        link: '/products?category=Bathware&subcategory=Sanitary%20Products',
        image: '/categories/sanitaryware-commodes.svg'
      }
    ]
  },

  // 4. PIPES, PLUMBING & WATER TANKS
  {
    id: 'pipes_plumbing_water',
    title: 'Pipes, Plumbing & Water Tanks',
    categoryName: 'CPVC, PVC & GI Fittings',
    viewAllLink: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings',
    items: [
      {
        id: 'cpvc_pipes_fittings',
        name: 'CPVC Pipes & Fittings',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=CPVC%20Pipes',
        image: '/categories/cpvc-pipes-podium.svg'
      },
      {
        id: 'pvc_drainage_pipes',
        name: 'PVC Drainage & SWR Pipes',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=PVC%20Pipes',
        image: '/categories/pvc-drainage-podium.svg'
      },
      {
        id: 'brass_valves_cocks',
        name: 'Brass Valves & Cocks',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=Valves',
        image: '/categories/brass-valves-podium.svg'
      },
      {
        id: 'gi_pipe_fittings',
        name: 'GI Pipe Fittings',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=GI%20Pipes',
        image: '/categories/gi-fittings-podium.svg'
      }
    ]
  },

  // 5. TILES, FLOORING & ADHESIVES
  {
    id: 'tiles_flooring_adhesives',
    title: 'Tiles, Flooring & Adhesives',
    categoryName: 'Tiles & Adhesives',
    viewAllLink: '/products?category=Tiles%20%26%20Adhesives',
    items: [
      {
        id: 'vitrified_floor_tiles',
        name: 'Vitrified Floor Tiles',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Floor%20Tiles',
        image: '/categories/floor-tiles-podium.svg'
      },
      {
        id: 'wall_ceramic_tiles',
        name: 'Wall Ceramic Tiles',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Wall%20Tiles',
        image: '/categories/wall-tiles-podium.svg'
      },
      {
        id: 'heavy_duty_tile_adhesive',
        name: 'Tile Adhesive & Grouts',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Tile%20Adhesives',
        image: '/categories/tile-adhesive-podium.svg'
      },
      {
        id: 'tiling_waterproofing_solutions',
        name: 'Tiling Waterproofing',
        link: '/products?category=Waterproofing',
        image: '/categories/tiling-waterproofing.svg'
      }
    ]
  },

  // 6. CEMENT, STEEL & FOUNDATION
  {
    id: 'cement_steel_foundation',
    title: 'Cement, Steel & Foundation',
    categoryName: 'Cement & Steel',
    viewAllLink: '/products?category=Cement%20%26%20Steel',
    items: [
      {
        id: 'ultratech_acc_cement',
        name: 'UltraTech & ACC Cement',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Cement%20Bags',
        image: '/categories/cement-bags-trio.svg'
      },
      {
        id: 'tmt_550d_rebar',
        name: 'Tata Tiscon 550D TMT Rebar',
        link: '/products?category=Cement%20%26%20Steel&subcategory=TMT%20Bars',
        image: '/categories/tmt-rebar-podium.svg'
      },
      {
        id: 'gi_binding_wire',
        name: 'Annealed GI Binding Wire',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Binding%20Materials',
        image: '/categories/binding-wire-podium.svg'
      },
      {
        id: 'structural_steel_bars',
        name: 'Structural Steel Bars',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Steel%20Bars',
        image: '/categories/steel-bars.svg'
      }
    ]
  },

  // 7. CONSTRUCTION MATERIALS & MASONRY
  {
    id: 'construction_materials_masonry',
    title: 'Construction Materials & Masonry',
    categoryName: 'Construction Materials',
    viewAllLink: '/products?category=Construction%20Materials',
    items: [
      {
        id: 'plastering_m_sand',
        name: 'Washed Plastering M-Sand',
        link: '/products?category=Construction%20Materials&subcategory=Sand',
        image: '/categories/m-sand-podium.svg'
      },
      {
        id: 'blue_metal_granite',
        name: '20mm Granite Aggregate',
        link: '/products?category=Construction%20Materials&subcategory=Aggregate',
        image: '/categories/granite-aggregate-podium.svg'
      },
      {
        id: 'red_burnt_clay_bricks',
        name: 'Wire-Cut Red Clay Bricks',
        link: '/products?category=Construction%20Materials&subcategory=Bricks',
        image: '/categories/red-bricks-podium.svg'
      },
      {
        id: 'aac_lightweight_blocks',
        name: 'AAC Lightweight Blocks',
        link: '/products?category=Construction%20Materials&subcategory=Blocks',
        image: '/categories/aac-blocks-podium.svg'
      }
    ]
  },

  // 8. POWER TOOLS & JOBSITE EQUIPMENT
  {
    id: 'tools_equipment',
    title: 'Tools & Jobsite Equipment',
    categoryName: 'Tools & Accessories',
    viewAllLink: '/products?category=Tools%20%26%20Accessories',
    items: [
      {
        id: 'bosch_angle_grinder',
        name: 'Professional Angle Grinder',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Construction%20Tools',
        image: '/categories/angle-grinder-podium.svg'
      },
      {
        id: 'diamond_cutting_blades',
        name: 'Diamond Cutting Blades',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Cutting%20Accessories',
        image: '/categories/cutting-blades-podium.svg'
      },
      {
        id: 'precision_measuring_tape',
        name: 'Steel Measuring Tape',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Measuring%20Tools',
        image: '/categories/measuring-tape-podium.svg'
      },
      {
        id: 'masonry_hand_tools',
        name: 'Masonry Trowels & Tools',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Hand%20Tools',
        image: '/categories/masonry-tools-podium.svg'
      }
    ]
  }
];

const CategoryGrid = ({ categories = [] }) => {
  // Combine pre-configured master construction categories with any custom categories from admin database
  const renderedSections = useMemo(() => {
    const list = [...ALL_SITE_SECTIONS];

    if (Array.isArray(categories) && categories.length > 0) {
      // Check if admin created additional categories not covered by standard sections
      const existingNames = new Set(ALL_SITE_SECTIONS.map(s => s.categoryName.toLowerCase()));
      const customDbCats = categories.filter(c => c && c.name && !existingNames.has(c.name.toLowerCase()));

      customDbCats.forEach(dbCat => {
        const subItems = (dbCat.subcategories && dbCat.subcategories.length > 0)
          ? dbCat.subcategories.slice(0, 4).map((sub, sIdx) => ({
              id: `${dbCat.slug || dbCat._id}_sub_${sIdx}`,
              name: sub.name || sub,
              link: `/products?category=${encodeURIComponent(dbCat.name)}&subcategory=${encodeURIComponent(sub.name || sub)}`,
              image: sub.image || dbCat.image || '/placeholder-material.svg'
            }))
          : [
              {
                id: `${dbCat.slug || dbCat._id}_main`,
                name: dbCat.name,
                link: `/products?category=${encodeURIComponent(dbCat.name)}`,
                image: dbCat.image || '/placeholder-material.svg'
              }
            ];

        list.push({
          id: dbCat.slug || String(dbCat._id),
          title: dbCat.name,
          categoryName: dbCat.name,
          viewAllLink: `/products?category=${encodeURIComponent(dbCat.name)}`,
          items: subItems
        });
      });
    }

    return list;
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
