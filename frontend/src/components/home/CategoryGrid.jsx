import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ALL_SITE_SECTIONS = [
  // 1. ELECTRICAL (Exact match with mobile phone screenshot)
  {
    id: 'electrical',
    title: 'Electrical',
    categoryName: 'Electrical',
    viewAllLink: '/products?category=Electrical',
    items: [
      {
        id: 'wires_cables',
        name: 'Wires & Cables',
        link: '/products?category=Electrical&subcategory=Wires%20%26%20Cables',
        image: '/categories/wires-and-cables.png',
        fallback: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'switches_sockets',
        name: 'Switches & Sockets',
        link: '/products?category=Electrical&subcategory=Switches%20%26%20Sockets',
        image: '/categories/switches-and-sockets.png',
        fallback: 'https://images.unsplash.com/photo-1558346489-0c61a1a74d26?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'mcb_rccb_db',
        name: 'MCB, RCCB & DB',
        link: '/products?category=Electrical&subcategory=MCB%2C%20RCCB%20%26%20DB',
        image: '/categories/mcb-rccb-db.png',
        fallback: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'conduits_boxes_fittings',
        name: 'Conduits, Boxes & Fittings',
        link: '/products?category=Electrical&subcategory=Conduits%2C%20Boxes%20%26%20Fittings',
        image: '/categories/conduits-boxes-fittings.png',
        fallback: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },

  // 2. WOOD AND HARDWARE (Exact match with mobile phone screenshot)
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
        image: '/categories/plywood-mdf-hdhmr.png',
        fallback: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'hinges_channels',
        name: 'Hinges & Channels',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Hinges%20%26%20Channels',
        image: '/categories/hinges-and-channels.png',
        fallback: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'kitchen_wardrobe_hardware',
        name: 'Kitchen & Wardrobe Hardware',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Kitchen%20%26%20Wardrobe%20Hardware',
        image: '/categories/kitchen-wardrobe-hardware.png',
        fallback: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'door_hardware_locks_handles',
        name: 'Door Hardware, Locks & Handles',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Door%20Hardware%2C%20Locks%20%26%20Handles',
        image: '/categories/door-hardware-locks-handles.png',
        fallback: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },

  // 3. PAINT, FEVICOL & CEMENT (Exact match with mobile phone screenshot heading)
  {
    id: 'paint_fevicol_cement',
    title: 'Paint, Fevicol & Cement',
    categoryName: 'Paints & Wall Care',
    viewAllLink: '/products?category=Paints%20%26%20Wall%20Care',
    items: [
      {
        id: 'asian_birla_paints',
        name: 'Asian & Birla Paints',
        link: '/products?category=Paints%20%26%20Wall%20Care',
        image: '/categories/asian-birla-paints.png',
        fallback: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'fevicol_adhesives',
        name: 'Fevicol & Adhesives',
        link: '/products?category=Wood%20and%20Hardware&subcategory=Adhesives',
        image: '/categories/fevicol-wood-adhesives.png',
        fallback: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cement_bags',
        name: 'Cement Bags (UltraTech & Ambuja)',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Cement%20Bags',
        image: '/categories/cement-bags-ultratech.png',
        fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'wall_putty_waterproofing',
        name: 'Birla Putty & Waterproofing',
        link: '/products?category=Waterproofing',
        image: '/categories/wall-putty-waterproofing.png',
        fallback: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },

  // 4. CPVC, PVC & GI FITTINGS
  {
    id: 'cpvc_pvc_fittings',
    title: 'CPVC, PVC & GI Fittings',
    categoryName: 'CPVC, PVC & GI Fittings',
    viewAllLink: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings',
    items: [
      {
        id: 'cpvc_pipes',
        name: 'CPVC Pipes & Fittings',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=CPVC%20Pipes',
        image: '/categories/cpvc-pipe.svg',
        fallback: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'pvc_pipes',
        name: 'PVC Drainage Pipes',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=PVC%20Pipes',
        image: '/categories/pvc-pipe.svg',
        fallback: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'gi_fittings',
        name: 'GI Pipes & Fittings',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=GI%20Pipes',
        image: '/categories/gi-fittings.svg',
        fallback: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'brass_valves',
        name: 'Brass Ball Valves',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=Valves',
        image: '/categories/brass-valve.svg',
        fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },

  // 5. TILES & ADHESIVES
  {
    id: 'tiles_adhesives',
    title: 'Tiles & Adhesives',
    categoryName: 'Tiles & Adhesives',
    viewAllLink: '/products?category=Tiles%20%26%20Adhesives',
    items: [
      {
        id: 'floor_tiles',
        name: 'Vitrified Floor Tiles',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Floor%20Tiles',
        image: '/categories/floor-tiles.svg',
        fallback: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'wall_tiles',
        name: 'Glazed Wall Tiles',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Wall%20Tiles',
        image: '/categories/wall-tiles.svg',
        fallback: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97ba4?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'tile_adhesives',
        name: 'Polymer Tile Adhesives',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Tile%20Adhesives',
        image: '/categories/tile-adhesive.svg',
        fallback: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'tile_grout',
        name: 'Epoxy Tile Grout & Spacers',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Tile%20Grout',
        image: '/categories/tile-grout.svg',
        fallback: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },

  // 6. BATHWARE & SANITARY
  {
    id: 'bathware',
    title: 'Bathware & Sanitary',
    categoryName: 'Bathware',
    viewAllLink: '/products?category=Bathware',
    items: [
      {
        id: 'washbasins',
        name: 'Vitreous China Washbasins',
        link: '/products?category=Bathware&subcategory=Washbasins',
        image: '/categories/washbasin.svg',
        fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'bathroom_faucets',
        name: 'Basin Mixers & Taps',
        link: '/products?category=Bathware&subcategory=Bathroom%20Faucets',
        image: '/categories/bath-faucet.svg',
        fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'shower_fittings',
        name: 'Overhead Rain Showers',
        link: '/products?category=Bathware&subcategory=Shower%20Fittings',
        image: '/categories/rain-shower.svg',
        fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'sanitary_products',
        name: 'Sanitary Commodes & Sinks',
        link: '/products?category=Bathware&subcategory=Sanitary%20Products',
        image: '/categories/toilet-seat.svg',
        fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },

  // 7. TOOLS & ACCESSORIES
  {
    id: 'tools_accessories',
    title: 'Tools & Accessories',
    categoryName: 'Tools & Accessories',
    viewAllLink: '/products?category=Tools%20%26%20Accessories',
    items: [
      {
        id: 'hand_tools',
        name: 'Masonry Trowels & Tools',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Hand%20Tools',
        image: '/categories/mason-trowel.svg',
        fallback: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'measuring_tools',
        name: 'Steel Measuring Tapes',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Measuring%20Tools',
        image: '/categories/measuring-tape.svg',
        fallback: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'angle_grinders',
        name: 'Construction Angle Grinders',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Construction%20Tools',
        image: '/categories/angle-grinder.svg',
        fallback: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cutting_accessories',
        name: 'Diamond Cutting Blades',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Cutting%20Accessories',
        image: '/categories/cutting-blade.svg',
        fallback: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      }
    ]
  }
];

const CategoryGrid = () => {
  const { t } = useLanguage();

  return (
    <section className="buildmart-orange-category-section" id="buildmart-categories-section">
      <div className="container">
        {ALL_SITE_SECTIONS.map((group) => (
          <div key={group.id || group.title} className="category-group-block">
            {/* Group Header: Bold Black Headline + Explore All link */}
            <div className="category-group-header-row">
              <h2 className="category-group-heading">
                {group.title}
              </h2>
              <Link to={group.viewAllLink} className="category-group-explore-link">
                <span>{t('viewAll') || 'Explore All'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* 4 Cards Grid Row (Matches the exact phone screenshot: 4 squarish peach cards with black text below) */}
            <div className="category-cards-orange-grid">
              {group.items.map(item => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="category-mobile-card-item"
                  title={`Shop ${item.name}`}
                >
                  <div className="category-card-peach-box">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="category-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        if (item.fallback) {
                          e.target.src = item.fallback;
                        }
                      }}
                    />
                  </div>
                  <span className="category-card-title-text">
                    {item.name}
                  </span>
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
