import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ALL_SITE_SECTIONS = [
  {
    id: 'cement_steel',
    title: 'Cement & Steel',
    categoryName: 'Cement & Steel',
    viewAllLink: '/products?category=Cement%20%26%20Steel',
    items: [
      {
        id: 'cement_bags',
        name: 'Cement Bags (PPC & OPC)',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Cement%20Bags',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'tmt_bars',
        name: 'TMT Rebar (Fe 550D)',
        link: '/products?category=Cement%20%26%20Steel&subcategory=TMT%20Bars',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'steel_bars',
        name: 'Structural Steel Bars',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Steel%20Bars',
        image: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'binding_wire',
        name: 'GI Binding Materials',
        link: '/products?category=Cement%20%26%20Steel&subcategory=Binding%20Materials',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
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
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'wall_tiles',
        name: 'Glazed Wall Tiles',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Wall%20Tiles',
        image: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97ba4?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'tile_adhesives',
        name: 'Polymer Tile Adhesives',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Tile%20Adhesives',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'tile_grout',
        name: 'Epoxy Tile Grout & Spacers',
        link: '/products?category=Tiles%20%26%20Adhesives&subcategory=Tile%20Grout',
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'waterproofing',
    title: 'Waterproofing Solutions',
    categoryName: 'Waterproofing',
    viewAllLink: '/products?category=Waterproofing',
    items: [
      {
        id: 'waterproofing_chemicals',
        name: 'Integral Liquid Waterproofing',
        link: '/products?category=Waterproofing&subcategory=Waterproofing%20Chemicals',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'roof_waterproofing',
        name: 'Elastomeric Roof Coatings',
        link: '/products?category=Waterproofing&subcategory=Waterproofing%20Coatings',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'crack_fillers',
        name: 'Flexible Crack Fillers',
        link: '/products?category=Waterproofing&subcategory=Crack%20Fillers',
        image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'damp_proof',
        name: 'Damp Proof & Primers',
        link: '/products?category=Waterproofing&subcategory=Waterproofing%20Solutions',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'paints_wall_care',
    title: 'Paints & Wall Care (Asian Paints & Birla)',
    categoryName: 'Paints & Wall Care',
    viewAllLink: '/products?category=Paints%20%26%20Wall%20Care',
    items: [
      {
        id: 'interior_emulsions',
        name: 'Royale & Birla Opus Emulsion',
        link: '/products?category=Paints%20%26%20Wall%20Care&subcategory=Interior%20Emulsions',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'exterior_paints',
        name: 'Apex Ultima & AllDry Weather',
        link: '/products?category=Paints%20%26%20Wall%20Care&subcategory=Exterior%20Paints',
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'wall_putty_primers',
        name: 'Birla White & TruCare Putty',
        link: '/products?category=Paints%20%26%20Wall%20Care&subcategory=Wall%20Putty%20%26%20Primers',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'enamels_wood',
        name: 'Apcolite Gloss & Wood Finish',
        link: '/products?category=Paints%20%26%20Wall%20Care&subcategory=Enamels%20%26%20Wood%20Finishes',
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
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
        image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'pvc_pipes',
        name: 'PVC Drainage Pipes',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=PVC%20Pipes',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'gi_fittings',
        name: 'GI Pipes & Fittings',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=GI%20Pipes',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'brass_valves',
        name: 'Brass Ball Valves',
        link: '/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings&subcategory=Valves',
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'hardware_locks',
    title: 'Hardware & Locks',
    categoryName: 'Hardware & Locks',
    viewAllLink: '/products?category=Hardware%20%26%20Locks',
    items: [
      {
        id: 'door_locks',
        name: 'Rim & Mortise Door Locks',
        link: '/products?category=Hardware%20%26%20Locks&subcategory=Door%20Locks',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'handles',
        name: 'Architectural Door Handles',
        link: '/products?category=Hardware%20%26%20Locks&subcategory=Handles',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'hinges',
        name: 'SS 304 Bearing Hinges',
        link: '/products?category=Hardware%20%26%20Locks&subcategory=Hinges',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'tower_bolts',
        name: 'Tower Bolts & Fasteners',
        link: '/products?category=Hardware%20%26%20Locks&subcategory=Tower%20Bolts',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
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
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'bathroom_faucets',
        name: 'Basin Mixers & Taps',
        link: '/products?category=Bathware&subcategory=Bathroom%20Faucets',
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'shower_fittings',
        name: 'Overhead Rain Showers',
        link: '/products?category=Bathware&subcategory=Shower%20Fittings',
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'sanitary_products',
        name: 'Sanitary Commodes & Sinks',
        link: '/products?category=Bathware&subcategory=Sanitary%20Products',
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
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
        image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'measuring_tools',
        name: 'Steel Measuring Tapes',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Measuring%20Tools',
        image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'angle_grinders',
        name: 'Construction Angle Grinders',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Construction%20Tools',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cutting_accessories',
        name: 'Diamond Cutting Blades',
        link: '/products?category=Tools%20%26%20Accessories&subcategory=Cutting%20Accessories',
        image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'construction_materials',
    title: 'Construction Materials',
    categoryName: 'Construction Materials',
    viewAllLink: '/products?category=Construction%20Materials',
    items: [
      {
        id: 'm_sand',
        name: 'Washed Plastering M-Sand',
        link: '/products?category=Construction%20Materials&subcategory=Sand',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'aggregate',
        name: '20mm Granite Aggregate',
        link: '/products?category=Construction%20Materials&subcategory=Aggregate',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'red_bricks',
        name: 'First-Class Red Burnt Bricks',
        link: '/products?category=Construction%20Materials&subcategory=Bricks',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'aac_blocks',
        name: 'High-Strength AAC Blocks',
        link: '/products?category=Construction%20Materials&subcategory=Blocks',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80'
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

            {/* 4 Cards Grid Row (Matches the exact phone screenshot) */}
            <div className="category-cards-orange-grid">
              {group.items.map(item => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="category-peach-card"
                  title={`Shop ${item.name}`}
                >
                  <div className="category-img-box">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="category-item-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <span className="category-label-text">
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
