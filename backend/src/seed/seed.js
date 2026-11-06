import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Coupon from '../models/Coupon.js';
import SiteSetting from '../models/SiteSetting.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Quotation from '../models/Quotation.js';
import Order from '../models/Order.js';
import LabourRequest from '../models/LabourRequest.js';
import BulkEnquiry from '../models/BulkEnquiry.js';

const seedData = async () => {
  await connectDB();
  console.log('🌱 Starting BuildMart Database Seeding...');

  // 1. Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const customerPassword = await bcrypt.hash('customer123', salt);

  await User.deleteMany({});
  const adminUser = await User.create({
    name: 'BuildMart Admin',
    email: 'admin@buildmart.com',
    password: adminPassword,
    phone: '+91 98765 00001',
    role: 'admin',
    addresses: [{
      street: '4th Floor, Tech Innovation Park',
      landmark: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      isDefault: true
    }]
  });

  const demoCustomer = await User.create({
    name: 'Rajesh Sharma',
    email: 'customer@buildmart.com',
    password: customerPassword,
    phone: '+91 98765 43210',
    role: 'customer',
    addresses: [{
      street: 'Plot 42, Green Glen Layout, Bellandur',
      landmark: 'Behind Central Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: true
    }]
  });

  console.log('✅ Users seeded: admin@buildmart.com / admin123, customer@buildmart.com / customer123');

  // 2. Categories (8 categories, NO ELECTRICAL)
  await Category.deleteMany({});
  const categoriesData = [
    {
      name: 'Cement & Steel',
      slug: 'cement-steel',
      description: 'Portland cement, OPC/PPC bags, high-tensile TMT bars, and binding wire',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      icon: 'Building2',
      order: 1,
      subcategories: [
        { name: 'Cement Bags', slug: 'cement-bags', description: '50kg standard PPC, OPC 43 & 53 grade cement' },
        { name: 'Different Cement Brands', slug: 'cement-brands', description: 'UltraTech, ACC, Birla A1, Dalmia' },
        { name: 'Steel Bars', slug: 'steel-bars', description: 'Structural MS bars, angles, channels' },
        { name: 'TMT Bars', slug: 'tmt-bars', description: 'Fe 550D TMT rebar 8mm to 32mm' },
        { name: 'Binding Materials', slug: 'binding-materials', description: 'Annealed GI binding wire, cover blocks' }
      ]
    },
    {
      name: 'Tiles & Adhesives',
      slug: 'tiles-adhesives',
      description: 'Vitrified floor tiles, wall ceramics, heavy-duty tile adhesives, and grouts',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      icon: 'LayoutGrid',
      order: 2,
      subcategories: [
        { name: 'Floor Tiles', slug: 'floor-tiles', description: 'Double charged vitrified & porcelain floor tiles' },
        { name: 'Wall Tiles', slug: 'wall-tiles', description: 'Glossy & matte glazed wall ceramic tiles' },
        { name: 'Bathroom Tiles', slug: 'bathroom-tiles', description: 'Anti-skid vitrified safety tiles' },
        { name: 'Tile Adhesives', slug: 'tile-adhesives', description: 'Polymer modified cementitious tile adhesive' },
        { name: 'Tile Grout', slug: 'tile-grout', description: 'Stain-free epoxy and cementitious tile grout' },
        { name: 'Tile Spacers', slug: 'tile-spacers', description: '2mm to 5mm tile levelling clips and spacers' }
      ]
    },
    {
      name: 'Waterproofing',
      slug: 'waterproofing',
      description: 'Roof waterproofing solutions, crystalline coatings, and crack sealants',
      image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
      icon: 'ShieldCheck',
      order: 3,
      subcategories: [
        { name: 'Waterproofing Chemicals', slug: 'waterproofing-chemicals', description: 'Integral waterproofing liquid for concrete' },
        { name: 'Waterproofing Coatings', slug: 'waterproofing-coatings', description: 'Elastomeric roof and terrace membranes' },
        { name: 'Roof Waterproofing Products', slug: 'roof-waterproofing', description: 'UV-resistant protective topcoats' },
        { name: 'Crack Fillers', slug: 'crack-fillers', description: 'Polymer acrylic flexible crack repair paste' },
        { name: 'Waterproofing Solutions', slug: 'waterproofing-solutions', description: 'Bathroom, sunken slab, and basement protection' }
      ]
    },
    {
      name: 'CPVC, PVC & GI Fittings',
      slug: 'cpvc-pvc-gi-fittings',
      description: 'High-pressure CPVC pipes, drainage PVC, GI pipes, brass valves, and fittings',
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
      icon: 'Wrench',
      order: 4,
      subcategories: [
        { name: 'CPVC Pipes', slug: 'cpvc-pipes', description: 'SDR 11 & SDR 13.5 hot & cold plumbing pipes' },
        { name: 'PVC Pipes', slug: 'pvc-pipes', description: 'SWR drainage, rainwater, and soil pipes' },
        { name: 'GI Pipes', slug: 'gi-pipes', description: 'Galvanized iron pipes B-class and C-class' },
        { name: 'Pipe Fittings', slug: 'pipe-fittings', description: 'Solvent weld fittings and threaded adaptors' },
        { name: 'Elbows', slug: 'elbows', description: '90-degree and 45-degree plumbing bends' },
        { name: 'Tees', slug: 'tees', description: 'Equal and reducing tees' },
        { name: 'Couplings', slug: 'couplings', description: 'Straight socket connectors and unions' },
        { name: 'Connectors', slug: 'connectors', description: 'Brass male and female threaded connectors' },
        { name: 'Valves', slug: 'valves', description: 'Brass ball valves, concealed valves, and check valves' }
      ]
    },
    {
      name: 'Hardware & Locks',
      slug: 'hardware-locks',
      description: 'Mortise locksets, stainless steel architectural hinges, handles, and tower bolts',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      icon: 'Lock',
      order: 5,
      subcategories: [
        { name: 'Door Locks', slug: 'door-locks', description: 'Main door rim locks, mortise handles & cylinders' },
        { name: 'Handles', slug: 'handles', description: 'Designer zinc alloy and brass door pulls' },
        { name: 'Hinges', slug: 'hinges', description: 'SS 304 bearing butt hinges and hydraulic hinges' },
        { name: 'Tower Bolts', slug: 'tower-bolts', description: 'Heavy-duty brass and stainless barrel bolts' },
        { name: 'Door Accessories', slug: 'door-accessories', description: 'Door stoppers, eye-viewers, and chain latches' },
        { name: 'Screws and Fasteners', slug: 'screws-fasteners', description: 'Drywall, self-drilling, and concrete anchors' }
      ]
    },
    {
      name: 'Bathware',
      slug: 'bathware',
      description: 'Vitreous chinaware basins, single-lever brass faucets, showers, and sanitary products',
      image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80',
      icon: 'Bath',
      order: 6,
      subcategories: [
        { name: 'Washbasins', slug: 'washbasins', description: 'Tabletop, counter, and wall-hung ceramic basins' },
        { name: 'Bathroom Faucets', slug: 'bathroom-faucets', description: 'Chrome brass basin mixers and pillar taps' },
        { name: 'Shower Fittings', slug: 'shower-fittings', description: 'Rain showers, hand showers, and shower arms' },
        { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towel bars, soap dishes, and robe hooks' },
        { name: 'Sanitary Products', slug: 'sanitary-products', description: 'One-piece western commodes, health faucets' },
        { name: 'Bathroom Fittings', slug: 'bathroom-fittings', description: 'Floor drains, angle cocks, and waste couplings' }
      ]
    },
    {
      name: 'Tools & Accessories',
      slug: 'tools-accessories',
      description: 'Construction hand tools, diamond cutting blades, rotary drill bits, and levels',
      image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
      icon: 'Hammer',
      order: 7,
      subcategories: [
        { name: 'Hand Tools', slug: 'hand-tools', description: 'Masonry trowels, claw hammers, and plumb bobs' },
        { name: 'Measuring Tools', slug: 'measuring-tools', description: '5m/8m steel measuring tapes, laser distance meters' },
        { name: 'Construction Tools', slug: 'construction-tools', description: 'Aluminum spirit levels, plastering floats' },
        { name: 'Cutting Accessories', slug: 'cutting-accessories', description: '4-inch tile & marble diamond cutting blades' },
        { name: 'Drilling Accessories', slug: 'drilling-accessories', description: 'SDS-Plus hammer drill bits and hole saws' }
      ]
    },
    {
      name: 'Construction Materials',
      slug: 'construction-materials',
      description: 'Manufactured M-Sand, 20mm aggregate, red burnt clay bricks, and AAC blocks',
      image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
      icon: 'HardHat',
      order: 8,
      subcategories: [
        { name: 'Sand', slug: 'sand', description: 'Washed M-Sand for plastering and concrete' },
        { name: 'Aggregate', slug: 'aggregate', description: 'Blue metal 20mm and 40mm crushed stone' },
        { name: 'Bricks', slug: 'bricks', description: 'First-class wire-cut burnt red clay bricks' },
        { name: 'Blocks', slug: 'blocks', description: 'Autoclaved Aerated Concrete (AAC) light blocks' },
        { name: 'Construction Chemicals', slug: 'construction-chemicals', description: 'Concrete curing compounds and retarders' },
        { name: 'Other Building Materials', slug: 'other-materials', description: 'Gypsum plaster, wall putty, and fiber mesh' }
      ]
    }
  ];

  await Category.insertMany(categoriesData);
  console.log('✅ 8 Core Categories seeded successfully (No Electrical category)');

  // 3. Brands
  await Brand.deleteMany({});
  const brandsData = [
    { name: 'UltraTech', slug: 'ultratech', isFeatured: true, description: 'The Engineer’s Choice - Leading cement & concrete manufacturer', logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=200&q=80' },
    { name: 'Tata Tiscon', slug: 'tata-tiscon', isFeatured: true, description: 'GreenPro certified high-ductility Fe 550D TMT rebar', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80' },
    { name: 'Dr. Fixit', slug: 'dr-fixit', isFeatured: true, description: 'India’s benchmark in waterproofing & crack repairs', logo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80' },
    { name: 'Astral Pipes', slug: 'astral-pipes', isFeatured: true, description: 'India’s trusted CPVC, PVC and plumbing pipes system', logo: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=200&q=80' },
    { name: 'Jaquar', slug: 'jaquar', isFeatured: true, description: 'Complete luxury bathroom faucets, showers & sanitaryware', logo: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=200&q=80' },
    { name: 'Asian Paints', slug: 'asian-paints', isFeatured: true, description: 'SmartCare waterproofing, primers, and wall putties', logo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=200&q=80' },
    { name: 'Bosch', slug: 'bosch', isFeatured: true, description: 'Professional grade power tools, cutting blades, and drill bits', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80' },
    { name: 'Kajaria', slug: 'kajaria', isFeatured: true, description: 'India’s No. 1 tile company - Vitrified & ceramic excellence', logo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80' },
    { name: 'ACC', slug: 'acc', isFeatured: true, description: 'Concrete and cement pioneers for heavy construction', logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80' },
    { name: 'Godrej', slug: 'godrej', isFeatured: true, description: 'High-security architectural locks and door hardware', logo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=200&q=80' },
    { name: 'Supreme', slug: 'supreme', isFeatured: true, description: 'Supreme Industries piping, drainage & water storage tanks', logo: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=200&q=80' },
    { name: 'Pidilite', slug: 'pidilite', isFeatured: true, description: 'Roff tile adhesives, grouts, and construction chemicals', logo: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=200&q=80' }
  ];

  await Brand.insertMany(brandsData);
  console.log('✅ Brands seeded successfully');

  // 4. Products (Rich catalog across 8 categories with prices, units, deals, bst-sellers)
  await Product.deleteMany({});
  await Inventory.deleteMany({});

  const productsData = [
    // 1. Cement & Steel
    {
      name: 'UltraTech Super Portland Pozzolana Cement (PPC)',
      category: 'Cement & Steel',
      subcategory: 'Cement Bags',
      brand: 'UltraTech',
      price: 395,
      mrp: 440,
      unit: '50kg Bag',
      stock: 450,
      isDeal: true,
      isFeatured: true,
      description: 'UltraTech Super is an engineered PPC cement produced with micro-fine particles providing exceptional compressive strength, resistance to cracks, and superior finishing for concrete slabs and brick masonry.',
      specifications: [
        { key: 'Grade', value: 'PPC (IS 1489 Part 1)' },
        { key: 'Package Weight', value: '50 kg' },
        { key: 'Initial Setting Time', value: '≥ 30 minutes' },
        { key: 'Application', value: 'RCC Slabs, Columns, Foundation, Plastering' }
      ],
      images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Tata Tiscon 550D TMT Rebar (12mm)',
      category: 'Cement & Steel',
      subcategory: 'TMT Bars',
      brand: 'Tata Tiscon',
      price: 840,
      mrp: 960,
      unit: '12m Piece',
      stock: 300,
      isDeal: false,
      isFeatured: true,
      description: 'Tata Tiscon 550D is India’s first GreenPro certified rebar manufactured using virgin iron ore and primary steelmaking. High ductility protects structures against seismic shocks.',
      specifications: [
        { key: 'Diameter', value: '12 mm' },
        { key: 'Grade', value: 'Fe 550D' },
        { key: 'Length per Piece', value: '12 meters' },
        { key: 'Standard', value: 'IS 1786:2008' }
      ],
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Tata Tiscon 550D TMT Rebar (16mm)',
      category: 'Cement & Steel',
      subcategory: 'TMT Bars',
      brand: 'Tata Tiscon',
      price: 1480,
      mrp: 1650,
      unit: '12m Piece',
      stock: 200,
      isDeal: true,
      isFeatured: true,
      description: 'Heavy structural 16mm Fe 550D rebar designed for multi-storey beams, heavy civil footings, and structural pillars.',
      specifications: [
        { key: 'Diameter', value: '16 mm' },
        { key: 'Grade', value: 'Fe 550D' },
        { key: 'Standard', value: 'IS 1786' }
      ],
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'ACC Gold Water Shield Water Repellent Cement',
      category: 'Cement & Steel',
      subcategory: 'Different Cement Brands',
      brand: 'ACC',
      price: 435,
      mrp: 490,
      unit: '50kg Bag',
      stock: 180,
      isDeal: true,
      isFeatured: false,
      description: 'ACC Gold Water Shield is a premium water-repellent cement with unique silane additives that shield home walls from seepage and efflorescence from day one.',
      specifications: [
        { key: 'Type', value: 'Hydrophobic Engineered Cement' },
        { key: 'Weight', value: '50 kg' }
      ],
      images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'GI Annealed Rebar Binding Wire (18 Gauge)',
      category: 'Cement & Steel',
      subcategory: 'Binding Materials',
      brand: 'Tata Tiscon',
      price: 115,
      mrp: 140,
      unit: '1 Kg Bundle',
      stock: 500,
      isDeal: false,
      isFeatured: false,
      description: 'Soft annealed zinc-coated GI wire ensures easy manual knotting of TMT rebar intersections without snapping.',
      specifications: [
        { key: 'Gauge', value: '18 SWG (1.2mm)' },
        { key: 'Finish', value: 'Rust-Resistant Annealed Galvanized' }
      ],
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80']
    },

    // 2. Tiles & Adhesives
    {
      name: 'Kajaria Eternity 600x1200mm Glazed Vitrified Tiles (Statwario Marble)',
      category: 'Tiles & Adhesives',
      subcategory: 'Floor Tiles',
      brand: 'Kajaria',
      price: 1480,
      mrp: 1850,
      unit: 'Box (2 Pcs / 15.5 Sq.Ft)',
      stock: 120,
      isDeal: true,
      isFeatured: true,
      description: 'Stunning Italian Calacatta Statuario marble finish double-charged vitrified floor tiles with high abrasion resistance (PEI IV) and mirror gloss finish.',
      specifications: [
        { key: 'Dimensions', value: '600 x 1200 mm' },
        { key: 'Finish', value: 'High Gloss Polished' },
        { key: 'Thickness', value: '9 mm' },
        { key: 'Coverage', value: '15.5 Sq. Ft per Box' }
      ],
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Roff New Construction Tile Adhesive (T01 Gray)',
      category: 'Tiles & Adhesives',
      subcategory: 'Tile Adhesives',
      brand: 'Pidilite',
      price: 360,
      mrp: 420,
      unit: '20kg Bag',
      stock: 250,
      isDeal: false,
      isFeatured: true,
      description: 'Polymer modified cementitious adhesive specifically designed for fixing ceramic, terracotta and small format vitrified tiles on internal floors and walls.',
      specifications: [
        { key: 'Classification', value: 'IS 15477 Type 1' },
        { key: 'Pot Life', value: '60 minutes' },
        { key: 'Coverage', value: '50-60 sq.ft at 3mm bed' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Roff Rainbow Epoxy Tile Grout (Stain-Free)',
      category: 'Tiles & Adhesives',
      subcategory: 'Tile Grout',
      brand: 'Pidilite',
      price: 850,
      mrp: 990,
      unit: '1 Kg Kit (Resin + Hardener + Filler)',
      stock: 180,
      isDeal: true,
      isFeatured: false,
      description: 'Three-part 100% solid epoxy grout impervious to chemical staining, mold, and acid cleaning. Ideal for bathrooms and kitchen counters.',
      specifications: [
        { key: 'Color', value: 'Ivory / Classic White' },
        { key: 'Joint Width', value: '1mm - 6mm' }
      ],
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Cross Tile Levelling Spacers (3mm, Pack of 500)',
      category: 'Tiles & Adhesives',
      subcategory: 'Tile Spacers',
      brand: 'Pidilite',
      price: 240,
      mrp: 320,
      unit: 'Pack of 500',
      stock: 350,
      isDeal: false,
      isFeatured: false,
      description: 'Precision molded polypropylene tile spacers ensure uniform 3mm grout joints across all floor and wall tile layouts.',
      specifications: [
        { key: 'Joint Spacing', value: '3 mm' },
        { key: 'Material', value: 'Virgin PP' }
      ],
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80']
    },

    // 3. Waterproofing
    {
      name: 'Dr. Fixit LW+ Integral Liquid Waterproofing Compound',
      category: 'Waterproofing',
      subcategory: 'Waterproofing Chemicals',
      brand: 'Dr. Fixit',
      price: 195,
      mrp: 240,
      unit: '1 Liter Bottle',
      stock: 400,
      isDeal: true,
      isFeatured: true,
      description: 'Specially formulated plasticizing additive for cement mortar and concrete that improves cohesiveness and prevents water bleeding & capillary action.',
      specifications: [
        { key: 'Dosage', value: '200 ml per 50kg cement bag' },
        { key: 'Standard', value: 'IS 2645-2003' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Dr. Fixit Newcoat Elastomeric Terrace Waterproofing Membrane',
      category: 'Waterproofing',
      subcategory: 'Waterproofing Coatings',
      brand: 'Dr. Fixit',
      price: 3650,
      mrp: 4400,
      unit: '20 Liter Bucket',
      stock: 75,
      isDeal: true,
      isFeatured: true,
      description: 'Heavy-duty 3-coat elastomeric coating reinforced with synthetic fibers. Bridges thermal cracks up to 2mm on building roofs and terraces with 10-year durability.',
      specifications: [
        { key: 'Elongation at Break', value: '> 250%' },
        { key: 'Coverage', value: '25-30 sq.ft/liter in 3 coats' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Dr. Fixit Crack-X Paste Acrylic Flexible Crack Filler',
      category: 'Waterproofing',
      subcategory: 'Crack Fillers',
      brand: 'Dr. Fixit',
      price: 210,
      mrp: 260,
      unit: '1 Kg Tub',
      stock: 220,
      isDeal: false,
      isFeatured: false,
      description: 'Single-component acrylic ready-to-use paste for filling plaster cracks up to 5mm on interior and exterior walls.',
      specifications: [
        { key: 'Max Crack Width', value: '5 mm' },
        { key: 'Paintability', value: 'Paintable with water-based coatings after 24 hrs' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },

    // 4. CPVC, PVC & GI Fittings
    {
      name: 'Astral CPVC PRO Pipe SDR 11 (1 Inch / 3 Meter)',
      category: 'CPVC, PVC & GI Fittings',
      subcategory: 'CPVC Pipes',
      brand: 'Astral Pipes',
      price: 495,
      mrp: 580,
      unit: '3m Length',
      stock: 280,
      isDeal: false,
      isFeatured: true,
      description: 'Astral CPVC PRO is designed for hot and cold potable water distribution up to 93°C. Lead-free, anti-corrosive with NSF-61 safety certification.',
      specifications: [
        { key: 'Nominal Bore', value: '1 Inch (25mm)' },
        { key: 'Pressure Rating', value: 'SDR 11 (Class 1)' },
        { key: 'Length', value: '3 Meters' }
      ],
      images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Astral CPVC Brass Female Threaded Elbow (1 Inch x 1/2 Inch)',
      category: 'CPVC, PVC & GI Fittings',
      subcategory: 'Elbows',
      brand: 'Astral Pipes',
      price: 185,
      mrp: 220,
      unit: 'Piece',
      stock: 350,
      isDeal: false,
      isFeatured: false,
      description: 'Molded brass insert elbow for secure transition to bathroom faucets, health sprays, and shower arms.',
      specifications: [
        { key: 'CPVC End', value: '1 Inch Socket' },
        { key: 'Thread End', value: '1/2 Inch Female BSP Brass Insert' }
      ],
      images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Supreme SWR PVC Drainage Pipe (110mm / 4 Inch, 10 Feet)',
      category: 'CPVC, PVC & GI Fittings',
      subcategory: 'PVC Pipes',
      brand: 'Supreme',
      price: 780,
      mrp: 920,
      unit: '10ft Pipe',
      stock: 150,
      isDeal: true,
      isFeatured: true,
      description: 'Supreme ring-fit SWR drainage pipe for non-pressure soil, waste and rainwater drainage with pre-fitted rubber sealing rings.',
      specifications: [
        { key: 'Diameter', value: '110 mm (4 Inch)' },
        { key: 'Joint Type', value: 'Solvent / Ring-Fit Rubber' },
        { key: 'Standard', value: 'IS 13592' }
      ],
      images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Zoloto Heavy Brass Ball Valve (1 Inch Screwed)',
      category: 'CPVC, PVC & GI Fittings',
      subcategory: 'Valves',
      brand: 'Astral Pipes',
      price: 680,
      mrp: 810,
      unit: 'Piece',
      stock: 120,
      isDeal: false,
      isFeatured: false,
      description: 'Full-bore forged brass ball valve with PTFE seat and chrome-plated brass ball for leakproof water tank and line isolation.',
      specifications: [
        { key: 'Size', value: '1 Inch (25mm)' },
        { key: 'Rating', value: 'PN 25' }
      ],
      images: ['https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80']
    },

    // 5. Hardware & Locks
    {
      name: 'Godrej Nav-Tal 8 Levers Heavy Brass Padlock',
      category: 'Hardware & Locks',
      subcategory: 'Door Locks',
      brand: 'Godrej',
      price: 520,
      mrp: 610,
      unit: 'Piece',
      stock: 160,
      isDeal: true,
      isFeatured: true,
      description: 'Iconic high-security brass padlock with hardened electroplated steel shackle and 8 precision brass levers for uncompromising defense.',
      specifications: [
        { key: 'Levers', value: '8 Brass Levers' },
        { key: 'Keys', value: '3 Nickelled Brass Keys' },
        { key: 'Material', value: 'Solid Extruded Brass' }
      ],
      images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Godrej Classic Mortise Lock Handle Set (Antique Brass Finish)',
      category: 'Hardware & Locks',
      subcategory: 'Door Locks',
      brand: 'Godrej',
      price: 2450,
      mrp: 2950,
      unit: 'Complete Set',
      stock: 85,
      isDeal: false,
      isFeatured: true,
      description: 'Elegant dual-turn mortise door lock with heavy zinc alloy handles in antique brass finish, 60mm brass double cylinder, and 3 computer keys.',
      specifications: [
        { key: 'Backset', value: '50 mm' },
        { key: 'Door Thickness', value: '30 mm - 50 mm' },
        { key: 'Keys', value: '3 Dimple Computer Keys' }
      ],
      images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'SS 304 Heavy Duty Bearing Door Hinges (5x3x3mm, Pair)',
      category: 'Hardware & Locks',
      subcategory: 'Hinges',
      brand: 'Godrej',
      price: 380,
      mrp: 460,
      unit: 'Pair (2 Pcs)',
      stock: 240,
      isDeal: false,
      isFeatured: false,
      description: 'Stainless steel grade 304 ball-bearing hinges for heavy solid wood and flush main doors with silent smooth swing.',
      specifications: [
        { key: 'Size', value: '5 Inch x 3 Inch x 3mm' },
        { key: 'Material', value: 'SS 304 Non-Magnetic' }
      ],
      images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80']
    },

    // 6. Bathware
    {
      name: 'Jaquar Alive Single Lever Basin Mixer Tap',
      category: 'Bathware',
      subcategory: 'Bathroom Faucets',
      brand: 'Jaquar',
      price: 3250,
      mrp: 3850,
      unit: 'Piece',
      stock: 90,
      isDeal: true,
      isFeatured: true,
      description: 'Precision engineered brass body basin mixer with ceramic cartridge tested for 500,000 cycles and high-gloss chrome finish with Neoperl aerator.',
      specifications: [
        { key: 'Operating Pressure', value: '0.5 to 5 Bar' },
        { key: 'Cartridge', value: '35mm Ceramic' },
        { key: 'Warranty', value: '10 Years Jaquar Warranty' }
      ],
      images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Jaquar Rain Overhead Shower (8 Inch Round)',
      category: 'Bathware',
      subcategory: 'Shower Fittings',
      brand: 'Jaquar',
      price: 1850,
      mrp: 2300,
      unit: 'Piece',
      stock: 110,
      isDeal: false,
      isFeatured: true,
      description: 'Stainless steel ultra-slim 8-inch rainfall overhead shower with anti-lime silicon self-cleaning nozzles and swivel ball joint.',
      specifications: [
        { key: 'Diameter', value: '200 mm (8 Inch)' },
        { key: 'Finish', value: 'Chrome Plated SS 304' }
      ],
      images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Cera Vitreous China Tabletop Washbasin (Oval 480mm)',
      category: 'Bathware',
      subcategory: 'Washbasins',
      brand: 'Jaquar',
      price: 2150,
      mrp: 2700,
      unit: 'Piece',
      stock: 65,
      isDeal: true,
      isFeatured: false,
      description: 'Glossy snow-white ceramic tabletop vessel basin with antibacterial glaze that resists lime-scale buildup and soap marks.',
      specifications: [
        { key: 'Dimensions', value: '480 x 370 x 135 mm' },
        { key: 'Color', value: 'Glossy Alpine White' }
      ],
      images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80']
    },

    // 7. Tools & Accessories
    {
      name: 'Bosch GWS 600 Professional Angle Grinder (670W, 4 Inch)',
      category: 'Tools & Accessories',
      subcategory: 'Construction Tools',
      brand: 'Bosch',
      price: 2450,
      mrp: 2990,
      unit: 'Set',
      stock: 75,
      isDeal: true,
      isFeatured: true,
      description: 'Ergonomic 670W motor angle grinder with anti-rotation protective guard and armored coils that protect motor against sharp grinding dust.',
      specifications: [
        { key: 'Power Input', value: '670 W' },
        { key: 'No-Load Speed', value: '11,000 RPM' },
        { key: 'Disc Diameter', value: '100 mm (4 Inch)' }
      ],
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Bosch 4-Inch Expert for Marble Diamond Cutting Wheel',
      category: 'Tools & Accessories',
      subcategory: 'Cutting Accessories',
      brand: 'Bosch',
      price: 220,
      mrp: 280,
      unit: 'Piece',
      stock: 300,
      isDeal: false,
      isFeatured: false,
      description: 'Continuous rim diamond blade for chip-free clean cutting of marble, vitrified tiles, granite, and glazed ceramics.',
      specifications: [
        { key: 'Bore', value: '20 / 16 mm with reduction ring' },
        { key: 'Max Speed', value: '15,300 RPM' }
      ],
      images: ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Stanley PowerLock Measuring Tape (5 Meter / 16 Feet)',
      category: 'Tools & Accessories',
      subcategory: 'Measuring Tools',
      brand: 'Bosch',
      price: 260,
      mrp: 320,
      unit: 'Piece',
      stock: 250,
      isDeal: false,
      isFeatured: true,
      description: 'Durable die-cast metal casing with Mylar polyester film coated blade for 10x longer blade life on demanding construction job sites.',
      specifications: [
        { key: 'Blade Length', value: '5 m (16 ft)' },
        { key: 'Blade Width', value: '19 mm' }
      ],
      images: ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80']
    },

    // 8. Construction Materials
    {
      name: 'Washed Plastering M-Sand (Graded 0-2.36mm)',
      category: 'Construction Materials',
      subcategory: 'Sand',
      brand: 'UltraTech',
      price: 45,
      mrp: 55,
      unit: '50kg Bag',
      stock: 800,
      isDeal: false,
      isFeatured: true,
      description: 'Triple-washed manufactured sand with zero silt and organic impurities. Ensures 20% higher mortar strength and silky smooth wall plastering.',
      specifications: [
        { key: 'Fineness Modulus', value: '1.8 - 2.2' },
        { key: 'Silt Content', value: '< 2%' },
        { key: 'Standard', value: 'IS 383:2016 Zone IV' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Blue Metal 20mm Crushed Granite Aggregate',
      category: 'Construction Materials',
      subcategory: 'Aggregate',
      brand: 'UltraTech',
      price: 48,
      mrp: 60,
      unit: '50kg Bag',
      stock: 650,
      isDeal: false,
      isFeatured: false,
      description: 'Clean angular hard-rock granite aggregate ideal for RCC beams, slabs, columns, and foundations. Zero dust content.',
      specifications: [
        { key: 'Nominal Size', value: '20 mm' },
        { key: 'Specific Gravity', value: '2.65' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'Birla Aerocon High-Strength AAC Lightweight Blocks (600x200x150mm)',
      category: 'Construction Materials',
      subcategory: 'Blocks',
      brand: 'UltraTech',
      price: 68,
      mrp: 80,
      unit: 'Piece',
      stock: 1200,
      isDeal: true,
      isFeatured: true,
      description: 'Thermal insulating lightweight AAC blocks reduce structural dead weight by 50% and save up to 30% on masonry jointing mortar.',
      specifications: [
        { key: 'Dimensions', value: '600 x 200 x 150 mm' },
        { key: 'Compressive Strength', value: '≥ 4 N/mm²' },
        { key: 'Fire Rating', value: 'Up to 4 Hours' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    },
    {
      name: 'First-Class Wire-Cut Red Burnt Clay Bricks',
      category: 'Construction Materials',
      subcategory: 'Bricks',
      brand: 'UltraTech',
      price: 11,
      mrp: 14,
      unit: 'Piece',
      stock: 5000,
      isDeal: false,
      isFeatured: false,
      description: 'Kiln-fired first class red clay bricks with sharp uniform edges, resonant metallic sound on impact, and high crushing strength.',
      specifications: [
        { key: 'Dimensions', value: '230 x 110 x 70 mm' },
        { key: 'Water Absorption', value: '< 15%' }
      ],
      images: ['https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80']
    }
  ];

  for (const item of productsData) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = 'BM-' + Math.floor(100000 + Math.random() * 900000);
    const discount = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

    const prod = await Product.create({
      ...item,
      slug,
      sku,
      discount,
      isActive: true,
      rating: +(4.4 + Math.random() * 0.5).toFixed(1),
      reviewsCount: Math.floor(12 + Math.random() * 80)
    });

    await Inventory.create({
      productId: prod._id,
      productName: prod.name,
      sku: prod.sku,
      currentStock: prod.stock,
      unit: prod.unit
    });
  }

  console.log(`✅ ${productsData.length} Products and Inventories seeded across 8 Categories!`);

  // 5. Coupons
  await Coupon.deleteMany({});
  await Coupon.insertMany([
    { code: 'BUILD10', description: 'Flat 10% off on all construction essentials', discountPercent: 10, maxDiscount: 2000, minOrderValue: 2000, isActive: true },
    { code: 'FIRST500', description: '₹500 flat off for new site builders', discountPercent: 15, maxDiscount: 500, minOrderValue: 3000, isActive: true },
    { code: 'CONTRACTOR20', description: '20% special volume discount for contractors', discountPercent: 20, maxDiscount: 8000, minOrderValue: 10000, isActive: true }
  ]);
  console.log('✅ Coupons seeded: BUILD10, FIRST500, CONTRACTOR20');

  // 6. Site Settings
  await SiteSetting.deleteMany({});
  await SiteSetting.create({
    siteName: 'BuildMart',
    tagline: 'Direct Site Procurement & Express Construction Materials Platform',
    whatsappNumber: '+919876543210',
    supportPhone: '1800-890-5000',
    supportEmail: 'orders@buildmart.in',
    officeAddress: 'BuildMart Central Hub 01, ORR Tech Park, Bellandur, Bengaluru 560103',
    announcementBar: '⚡ 30-60 Min Direct Job-Site Delivery in Bengaluru & Major Metros | Free Delivery on Orders Above ₹5,000',
    freeDeliveryThreshold: 5000,
    cities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'],
    heroBanners: [
      {
        title: 'Everything You Need to Build Your Dream Project',
        subtitle: 'From foundation to finishing: UltraTech Cement, Tata Tiscon TMT, Kajaria Tiles & Astral Plumbing delivered direct to site in 30-60 mins.',
        tag: 'EXPRESS SITE DELIVERY',
        badge: 'Up to 35% Contractor Off',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1400&q=80',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        accent: '#F59E0B'
      },
      {
        title: 'Click Product Images to Create Instant Material List',
        subtitle: 'Build your project requirement list with a single click. Our materials supervisor reviews stock & issues your formal quotation with best site rates.',
        tag: 'CONTRACTOR FAVORITE',
        badge: 'Zero Upfront Risk',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
        ctaText: 'Explore Materials',
        ctaLink: '/products',
        accent: '#2563EB'
      },
      {
        title: 'Need High-Volume Steel, Cement or AAC Blocks?',
        subtitle: 'Direct plant dispatch with factory invoice for developers, commercial builders, and registered contractors. Dedicated project manager assigned.',
        tag: 'BULK ENQUIRY HUB',
        badge: 'Tier-1 Trade Pricing',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1400&q=80',
        ctaText: 'Request Bulk Order',
        ctaLink: '/bulk-enquiry',
        accent: '#10B981'
      }
    ]
  });

  // 7. Seed Sample Material Requests, Quotations, Orders, Labour, Bulk Enquiries
  await MaterialRequest.deleteMany({});
  await Quotation.deleteMany({});
  await Order.deleteMany({});
  await LabourRequest.deleteMany({});
  await BulkEnquiry.deleteMany({});

  const sampleReq = await MaterialRequest.create({
    requestId: 'BM-REQ-1001',
    user: String(demoCustomer._id),
    customer: {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'customer@buildmart.com',
      siteAddress: 'Villa 14, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      pincode: '560066',
      requiredDate: '2026-11-10',
      notes: 'Need morning delivery before 9 AM for slab casting.'
    },
    items: [
      {
        name: 'UltraTech Super Portland Pozzolana Cement (PPC)',
        brand: 'UltraTech',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        quantity: 50,
        unit: '50kg Bag',
        unitPrice: 395,
        estimatedTotal: 19750
      },
      {
        name: 'Tata Tiscon 550D TMT Rebar (12mm)',
        brand: 'Tata Tiscon',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        quantity: 20,
        unit: '12m Piece',
        unitPrice: 840,
        estimatedTotal: 16800
      }
    ],
    status: 'Quotation Sent',
    quotationId: 'BM-QUO-1001',
    adminNotes: 'Stock verified in Central Hub. 50 bags reserved.'
  });

  await Quotation.create({
    quotationId: 'BM-QUO-1001',
    requestId: 'BM-REQ-1001',
    user: String(demoCustomer._id),
    customer: sampleReq.customer,
    items: [
      {
        name: 'UltraTech Super Portland Pozzolana Cement (PPC)',
        brand: 'UltraTech',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        quantity: 50,
        unit: '50kg Bag',
        unitPrice: 390,
        totalPrice: 19500,
        inStock: true
      },
      {
        name: 'Tata Tiscon 550D TMT Rebar (12mm)',
        brand: 'Tata Tiscon',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        quantity: 20,
        unit: '12m Piece',
        unitPrice: 835,
        totalPrice: 16700,
        inStock: true
      }
    ],
    subtotal: 36200,
    deliveryCharge: 0,
    tax: 6516,
    discount: 1000,
    totalAmount: 41716,
    validUntil: '2026-11-15',
    notes: 'Free heavy hydraulic truck delivery included. Test certificate attached.',
    status: 'Sent'
  });

  await Order.create({
    orderId: 'BM-ORD-1001',
    invoiceNumber: 'INV-2026-00001',
    user: String(demoCustomer._id),
    customer: {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'customer@buildmart.com',
      address: 'Villa 14, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      pincode: '560066',
      deliveryInstructions: 'Call site engineer Mr. Anil before unloading.'
    },
    items: [
      {
        name: 'Dr. Fixit LW+ Integral Liquid Waterproofing Compound',
        brand: 'Dr. Fixit',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
        quantity: 5,
        unit: '1 Liter Bottle',
        price: 195,
        total: 975
      },
      {
        name: 'Astral CPVC PRO Pipe SDR 11 (1 Inch / 3 Meter)',
        brand: 'Astral Pipes',
        image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
        quantity: 6,
        unit: '3m Length',
        price: 495,
        total: 2970
      }
    ],
    materialCost: 3945,
    labourCost: 0,
    labourDetails: { hasLabour: false },
    deliveryCharge: 250,
    tax: 710,
    discount: 0,
    totalAmount: 4905,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    timeline: [
      { status: 'Confirmed', note: 'Order placed by customer', timestamp: new Date().toISOString() }
    ]
  });

  await LabourRequest.create({
    bookingId: 'BM-LBR-1001',
    user: String(demoCustomer._id),
    customer: {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'customer@buildmart.com',
      workLocation: 'Villa 14, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      pincode: '560066'
    },
    labourType: 'Mason',
    workersRequired: 2,
    workCategory: 'Brickwork & Plastering',
    preferredStartDate: '2026-11-12',
    expectedDuration: '3 Days',
    additionalInstructions: 'Need experienced masons for external wall elevation plastering.',
    labourCharges: 4800,
    assignedWorkers: [
      { name: 'Ramesh Kumar', phone: '+91 98111 22233', trade: 'Senior Mason' },
      { name: 'Sunil Yadav', phone: '+91 98222 33344', trade: 'Mason Assistant' }
    ],
    status: 'Assigned',
    adminNotes: 'Supervised team assigned. Daily rate ₹800/mason.'
  });

  await BulkEnquiry.create({
    enquiryId: 'BM-BLK-1001',
    user: String(demoCustomer._id),
    customer: {
      fullName: 'Vikram Mehta',
      companyName: 'Mehta Infrastructure Pvt Ltd',
      phone: '+91 99887 76655',
      email: 'procurement@mehtainfra.com',
      projectLocation: 'Electronic City Phase 1 Commercial Tech Park, Bengaluru',
      deliveryRequirement: 'Staggered Weekly Loads (400 Tons total)',
      expectedPurchaseDate: '2026-11-20'
    },
    items: [
      {
        category: 'Cement & Steel',
        productName: 'Tata Tiscon 550D TMT Rebar (Assorted 10mm, 12mm, 16mm, 20mm)',
        quantity: 120,
        unit: 'Tons',
        notes: 'Mill test certificates required for RERA audit'
      },
      {
        category: 'Cement & Steel',
        productName: 'UltraTech OPC 53 Grade Bulk Bags',
        quantity: 2500,
        unit: '50kg Bags',
        notes: 'Unloading by site crane'
      }
    ],
    additionalDetails: 'Commercial project spanning 80,000 sq ft built-up area. Credit terms requested upon BG submission.',
    status: 'Received',
    adminNotes: 'High-value developer enquiry. Account manager Arvind to call.'
  });

  console.log('✅ Seed completed successfully! All entities initialized.');
  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

