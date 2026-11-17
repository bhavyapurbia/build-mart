import { connectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';

export const CATALOG_PRODUCTS = [
  // ── 1. Wood and Hardware ──
  {
    name: 'CenturyPly Club Prime BWP Marine Plywood (19mm, 8x4 Ft)',
    slug: 'centuryply-club-prime-bwp-marine-plywood-19mm',
    sku: 'BM-PLY-001',
    category: 'Wood and Hardware',
    subcategory: 'Plywood, MDF & HDHMR',
    brand: 'CenturyPly',
    price: 3650,
    mrp: 4200,
    discount: 13,
    unit: '8x4 Sheet',
    stock: 120,
    rating: 4.9,
    reviewsCount: 42,
    images: ['/categories/plywood-mdf-hdhmr.png'],
    isFeatured: true,
    description: 'CenturyPly Club Prime is boiling water proof (BWP) marine grade plywood made with selected hardwood veneers and bonded with high quality un-extended phenol formaldehyde synthetic resin.'
  },
  {
    name: 'Greenpanel Club HDHMR High Moisture Resistant Board (18mm, 8x4 Ft)',
    slug: 'greenpanel-club-hdhmr-board-18mm',
    sku: 'BM-MDF-002',
    category: 'Wood and Hardware',
    subcategory: 'Plywood, MDF & HDHMR',
    brand: 'Greenpanel',
    price: 2450,
    mrp: 2900,
    discount: 15,
    unit: '8x4 Sheet',
    stock: 85,
    rating: 4.8,
    reviewsCount: 29,
    images: ['/categories/plywood-mdf-hdhmr.png'],
    isFeatured: false,
    description: 'Greenpanel Club HDHMR is an ultra-dense, water-resistant board engineered with eucalyptus hardwood fibers for modular kitchens, wardrobes, and high-moisture paneling.'
  },
  {
    name: 'Hettich Sensys 8645i Soft-Close Hydraulic Concealed Hinges (Pair)',
    slug: 'hettich-sensys-soft-close-hydraulic-hinges',
    sku: 'BM-HET-003',
    category: 'Wood and Hardware',
    subcategory: 'Hinges & Channels',
    brand: 'Hettich',
    price: 520,
    mrp: 650,
    discount: 20,
    unit: 'Pair (2 Pcs)',
    stock: 350,
    rating: 4.9,
    reviewsCount: 65,
    images: ['/categories/hinges-and-channels.png'],
    isDeal: true,
    description: 'German engineered Hettich Sensys hydraulic soft-close hinges with integrated Silent System damping for whisper-quiet furniture doors.'
  },
  {
    name: 'Hafele Matrix Box P Soft Close Modular Kitchen Drawer Channel (500mm)',
    slug: 'hafele-matrix-box-soft-close-drawer-channel',
    sku: 'BM-HAF-004',
    category: 'Wood and Hardware',
    subcategory: 'Kitchen & Wardrobe Hardware',
    brand: 'Hafele',
    price: 2950,
    mrp: 3600,
    discount: 18,
    unit: 'Set',
    stock: 70,
    rating: 4.7,
    reviewsCount: 18,
    images: ['/categories/kitchen-wardrobe-hardware.png'],
    description: 'Premium tandem box drawer system with full extension synchronized runners and integrated liquid damping.'
  },
  {
    name: 'Godrej Classic Mortise Lock Handle Set (Antique Brass Finish)',
    slug: 'godrej-classic-mortise-lock-handle-set',
    sku: 'BM-GOD-005',
    category: 'Wood and Hardware',
    subcategory: 'Door Hardware, Locks & Handles',
    brand: 'Godrej',
    price: 1850,
    mrp: 2350,
    discount: 21,
    unit: 'Set',
    stock: 140,
    rating: 4.8,
    reviewsCount: 54,
    images: ['/categories/door-hardware-locks-handles.png'],
    isFeatured: true,
    description: 'High-security 6-lever double throw mortise deadbolt with scratch-resistant antique brass designer handles for main doors.'
  },
  {
    name: 'Godrej Nav-Tal 8 Levers Heavy Brass Padlock',
    slug: 'godrej-nav-tal-8-levers-brass-padlock',
    sku: 'BM-GOD-006',
    category: 'Wood and Hardware',
    subcategory: 'Door Hardware, Locks & Handles',
    brand: 'Godrej',
    price: 580,
    mrp: 690,
    discount: 16,
    unit: 'Piece',
    stock: 220,
    rating: 4.9,
    reviewsCount: 88,
    images: ['/categories/door-hardware-locks-handles.png'],
    description: 'Solid brass extruded body with hardened steel shackle and 8 precision anti-pick brass levers.'
  },

  // ── 2. Paint, Fevicol & Cement ──
  {
    name: 'Fevicol Marine Waterproof Synthetic Resin Adhesive (5kg Bucket)',
    slug: 'fevicol-marine-waterproof-adhesive-5kg',
    sku: 'BM-FEV-001',
    category: 'Paint, Fevicol & Cement',
    subcategory: 'Fevicol & Sealants',
    brand: 'Fevicol',
    price: 1350,
    mrp: 1550,
    discount: 13,
    unit: '5kg Bucket',
    stock: 180,
    rating: 4.9,
    reviewsCount: 95,
    images: ['/categories/fevicol-sealants.svg'],
    isFeatured: true,
    isDeal: true,
    description: 'Fevicol Marine offers superior bonding with 48 hours continuous boiling water resistance and 10 days normal water resistance.'
  },
  {
    name: 'Asian Paints Apex Ultima Protek Exterior Emulsion (20L)',
    slug: 'asian-paints-apex-ultima-protek-20l',
    sku: 'BM-AP-002',
    category: 'Paint, Fevicol & Cement',
    subcategory: 'Paints, Putty & Sundries',
    brand: 'Asian Paints',
    price: 7450,
    mrp: 8900,
    discount: 16,
    unit: '20L Bucket',
    stock: 90,
    rating: 4.9,
    reviewsCount: 76,
    images: ['/categories/paints-putty-sundries.svg'],
    isFeatured: true,
    description: 'Nanotechnology exterior emulsion with lamination guard and 10-year durability warranty against algae, fungal growth, and dampness.'
  },
  {
    name: 'Birla White WallCare Waterproof Wall Putty (40kg Bag)',
    slug: 'birla-white-wallcare-waterproof-putty-40kg',
    sku: 'BM-BW-003',
    category: 'Paint, Fevicol & Cement',
    subcategory: 'Paints, Putty & Sundries',
    brand: 'Birla White',
    price: 890,
    mrp: 1050,
    discount: 15,
    unit: '40kg Bag',
    stock: 250,
    rating: 4.8,
    reviewsCount: 51,
    images: ['/categories/birla-wall-putty.svg'],
    description: 'Extra HP polymer fortified white cement-based putty that seals pores and provides a porcelain-smooth waterproof finish.'
  },
  {
    name: 'Dr. Fixit Newcoat Elastomeric Terrace Waterproofing Membrane (20L)',
    slug: 'dr-fixit-newcoat-terrace-waterproofing-20l',
    sku: 'BM-FIX-004',
    category: 'Paint, Fevicol & Cement',
    subcategory: 'Tiling and Waterproofing',
    brand: 'Dr. Fixit',
    price: 5400,
    mrp: 6774,
    discount: 20,
    unit: '20L Bucket',
    stock: 120,
    rating: 4.8,
    reviewsCount: 63,
    images: ['/categories/tiling-waterproofing.svg'],
    isDeal: true,
    description: 'Heavy duty, UV-resistant elastomeric waterproofing coating formulated with high performance elastomeric acrylic polymers.'
  },
  {
    name: 'Dr. Fixit Crack-X Paste Acrylic Flexible Crack Filler (1kg)',
    slug: 'dr-fixit-crack-x-paste-1kg',
    sku: 'BM-FIX-005',
    category: 'Paint, Fevicol & Cement',
    subcategory: 'Tiling and Waterproofing',
    brand: 'Dr. Fixit',
    price: 195,
    mrp: 240,
    discount: 19,
    unit: '1kg Tub',
    stock: 300,
    rating: 4.7,
    reviewsCount: 34,
    images: ['/categories/tiling-waterproofing.svg'],
    description: 'Ready-to-use flexible acrylic paste for non-structural plaster cracks up to 5mm with excellent adhesion.'
  },
  {
    name: 'Dr. Fixit LW+ Integral Waterproofing Liquid for Concrete (5L)',
    slug: 'dr-fixit-lw-plus-integral-waterproofing-5l',
    sku: 'BM-FIX-006',
    category: 'Paint, Fevicol & Cement',
    subcategory: 'Tiling and Waterproofing',
    brand: 'Dr. Fixit',
    price: 780,
    mrp: 960,
    discount: 19,
    unit: '5L Can',
    stock: 160,
    rating: 4.9,
    reviewsCount: 47,
    images: ['/categories/dr-fixit-can.svg'],
    description: 'Specially formulated integral liquid waterproofing compound for concrete and mortar that increases compressive strength and prevents water seepage.'
  },

  // ── 3. Kitchen, Sanitary & Bath Fittings ──
  {
    name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome Finish)',
    slug: 'jaquar-alive-single-lever-basin-mixer',
    sku: 'BM-JAQ-001',
    category: 'Kitchen, Sanitary & Bath Fittings',
    subcategory: 'Bath Faucets & Mixers',
    brand: 'Jaquar',
    price: 3250,
    mrp: 4100,
    discount: 21,
    unit: 'Piece',
    stock: 75,
    rating: 4.9,
    reviewsCount: 82,
    images: ['/categories/bath-faucets-mixers.svg'],
    isFeatured: true,
    description: 'Solid brass body single lever basin mixer with durable ceramic cartridge tested for 500,000 cycles and high-gloss chrome plating.'
  },
  {
    name: 'Jaquar Rain Overhead Shower (8 Inch Round with 9 Inch Arm)',
    slug: 'jaquar-rain-overhead-shower-8-inch',
    sku: 'BM-JAQ-002',
    category: 'Kitchen, Sanitary & Bath Fittings',
    subcategory: 'Overhead Showers',
    brand: 'Jaquar',
    price: 2150,
    mrp: 2800,
    discount: 23,
    unit: 'Set',
    stock: 110,
    rating: 4.8,
    reviewsCount: 57,
    images: ['/categories/overhead-showers.svg'],
    isDeal: true,
    description: 'Wide coverage drenching rain shower with anti-clog silicon spray nozzles and mirror finish chrome plating.'
  },
  {
    name: 'Cera Vitreous China Tabletop Washbasin (Oval 480mm, Glossy White)',
    slug: 'cera-vitreous-tabletop-washbasin-oval',
    sku: 'BM-CER-003',
    category: 'Kitchen, Sanitary & Bath Fittings',
    subcategory: 'Wash Basins & Sinks',
    brand: 'Cera',
    price: 2650,
    mrp: 3450,
    discount: 23,
    unit: 'Piece',
    stock: 65,
    rating: 4.7,
    reviewsCount: 39,
    images: ['/categories/wash-basins-sinks.svg'],
    description: 'High-density stain-free vitreous china ceramic basin with overflow prevention and smooth glazed surfaces.'
  },
  {
    name: 'Futura Stainless Steel Kitchen Sink (24x18 Inch, 304 Grade Satin)',
    slug: 'futura-stainless-steel-kitchen-sink-24x18',
    sku: 'BM-FUT-004',
    category: 'Kitchen, Sanitary & Bath Fittings',
    subcategory: 'Wash Basins & Sinks',
    brand: 'Futura',
    price: 4850,
    mrp: 6490,
    discount: 25,
    unit: 'Piece',
    stock: 45,
    rating: 4.8,
    reviewsCount: 38,
    images: ['/categories/wash-basins-sinks.svg'],
    description: '1.2mm thick heavy gauge 304 grade austenitic stainless steel single bowl sink with anti-sound rubber padding.'
  },
  {
    name: 'Hindware Italian Wall Hung Western Commode with Soft Close Seat',
    slug: 'hindware-italian-wall-hung-western-commode',
    sku: 'BM-HIN-005',
    category: 'Kitchen, Sanitary & Bath Fittings',
    subcategory: 'Sanitaryware & Commodes',
    brand: 'Hindware',
    price: 6850,
    mrp: 9200,
    discount: 26,
    unit: 'Set',
    stock: 35,
    rating: 4.9,
    reviewsCount: 44,
    images: ['/categories/sanitaryware-commodes.svg'],
    isFeatured: true,
    description: 'Rimless dual-flush wall hung European water closet with 360-degree tornado flush and anti-bacterial glaze.'
  },

  // ── 4. Pipes, Plumbing & Water Tanks ──
  {
    name: 'Astral CPVC PRO Pipe SDR 11 (1 Inch / 3 Meter)',
    slug: 'astral-cpvc-pro-pipe-sdr11-1-inch',
    sku: 'BM-AST-001',
    category: 'Pipes, Plumbing & Water Tanks',
    subcategory: 'CPVC Pipes & Fittings',
    brand: 'Astral Pipes',
    price: 495,
    mrp: 580,
    discount: 15,
    unit: '3m Length',
    stock: 400,
    rating: 4.9,
    reviewsCount: 92,
    images: ['/categories/cpvc-pipes-podium.svg'],
    isFeatured: true,
    description: 'NSF certified chlorine-resistant CPVC plumbing pipes engineered for hot and cold potable water distributions up to 93°C.'
  },
  {
    name: 'Astral CPVC Brass Female Threaded Elbow (1 Inch x 1/2 Inch)',
    slug: 'astral-cpvc-brass-fta-elbow-1x05',
    sku: 'BM-AST-002',
    category: 'Pipes, Plumbing & Water Tanks',
    subcategory: 'CPVC Pipes & Fittings',
    brand: 'Astral Pipes',
    price: 185,
    mrp: 220,
    discount: 16,
    unit: 'Piece',
    stock: 350,
    rating: 4.8,
    reviewsCount: 46,
    images: ['/categories/cpvc-pipes-podium.svg'],
    description: 'High-strength lead-free brass insert transition elbow for connecting faucets and angle valves to CPVC pipeline.'
  },
  {
    name: 'Supreme SWR PVC Drainage Pipe (110mm / 4 Inch, 10 Feet)',
    slug: 'supreme-swr-pvc-drainage-pipe-110mm',
    sku: 'BM-SUP-003',
    category: 'Pipes, Plumbing & Water Tanks',
    subcategory: 'PVC Drainage & SWR Pipes',
    brand: 'Supreme',
    price: 760,
    mrp: 890,
    discount: 15,
    unit: '10ft Pipe',
    stock: 190,
    rating: 4.8,
    reviewsCount: 53,
    images: ['/categories/pvc-drainage-podium.svg'],
    description: 'Ring-fit rubber jointed soil, waste, and rainwater PVC pipe compliant with IS 13592 standards.'
  },
  {
    name: 'Zoloto Heavy Brass Ball Valve (1 Inch Screwed)',
    slug: 'zoloto-heavy-brass-ball-valve-1-inch',
    sku: 'BM-ZOL-004',
    category: 'Pipes, Plumbing & Water Tanks',
    subcategory: 'Brass Valves & Cocks',
    brand: 'Zoloto',
    price: 890,
    mrp: 1080,
    discount: 18,
    unit: 'Piece',
    stock: 120,
    rating: 4.9,
    reviewsCount: 41,
    images: ['/categories/brass-valves-podium.svg'],
    description: 'Forged brass full-bore quarter-turn ball valve rated for PN-25 working pressure with chrome plated brass ball and PTFE seats.'
  },
  {
    name: 'Sintex Pure Antimicrobial Overhead Water Tank (1000 Litres, 4 Layer)',
    slug: 'sintex-pure-antimicrobial-water-tank-1000l',
    sku: 'BM-SIN-005',
    category: 'Pipes, Plumbing & Water Tanks',
    subcategory: 'Overhead Loft Water Tanks',
    brand: 'Sintex',
    price: 7490,
    mrp: 9100,
    discount: 18,
    unit: '1000L Tank',
    stock: 25,
    rating: 4.9,
    reviewsCount: 35,
    images: ['/categories/cpvc-pipes-podium.svg'],
    isFeatured: true,
    description: '4-layer virgin food grade FDA approved polyethylene overhead storage tank with 99% antimicrobial protection.'
  },

  // ── 5. Tiles, Flooring & Adhesives ──
  {
    name: 'Kajaria Eternity Polished Glazed Vitrified Tiles (600x1200mm, Royal Marfil)',
    slug: 'kajaria-eternity-pgvt-tiles-600x1200',
    sku: 'BM-KAJ-001',
    category: 'Tiles, Flooring & Adhesives',
    subcategory: 'Vitrified Floor Tiles',
    brand: 'Kajaria',
    price: 1150,
    mrp: 1420,
    discount: 19,
    unit: 'Box (2 Tiles / 15.5 Sq.Ft)',
    stock: 150,
    rating: 4.9,
    reviewsCount: 58,
    images: ['/categories/floor-tiles-podium.svg'],
    isFeatured: true,
    description: 'High-gloss nano-polished digital vitrified floor tiles with high breaking strength and stain-resistant finish.'
  },
  {
    name: 'Somany Duragres Matte Ceramic Wall Tiles (300x600mm)',
    slug: 'somany-duragres-matte-ceramic-wall-tiles',
    sku: 'BM-SOM-002',
    category: 'Tiles, Flooring & Adhesives',
    subcategory: 'Wall Ceramic Tiles',
    brand: 'Somany',
    price: 680,
    mrp: 850,
    discount: 20,
    unit: 'Box (5 Tiles / 9.6 Sq.Ft)',
    stock: 180,
    rating: 4.8,
    reviewsCount: 32,
    images: ['/categories/wall-tiles-podium.svg'],
    description: 'Glazed ceramic tiles with feather-soft matte texture and zero water absorption backing for kitchen and bathroom walls.'
  },
  {
    name: 'Roff T01 Powerflex Heavy Duty Polymer Tile Adhesive (20kg Bag)',
    slug: 'roff-t01-powerflex-tile-adhesive-20kg',
    sku: 'BM-ROF-003',
    category: 'Tiles, Flooring & Adhesives',
    subcategory: 'Tile Adhesive & Grouts',
    brand: 'Roff by Pidilite',
    price: 490,
    mrp: 600,
    discount: 18,
    unit: '20kg Bag',
    stock: 300,
    rating: 4.9,
    reviewsCount: 71,
    images: ['/categories/tile-adhesive-podium.svg'],
    isDeal: true,
    description: 'Polymer modified cementitious tile adhesive for fixing ceramic, vitrified floor tiles, and natural stones with superior sag resistance.'
  },
  {
    name: 'Dr. Fixit Dampguard High-Performance Epoxy Tiling Waterproofing (1kg)',
    slug: 'dr-fixit-dampguard-epoxy-tiling-1kg',
    sku: 'BM-FIX-007',
    category: 'Tiles, Flooring & Adhesives',
    subcategory: 'Tiling Waterproofing',
    brand: 'Dr. Fixit',
    price: 420,
    mrp: 520,
    discount: 19,
    unit: '1kg Set',
    stock: 200,
    rating: 4.7,
    reviewsCount: 28,
    images: ['/categories/tiling-waterproofing.svg'],
    description: 'Two-component water-based epoxy damp-proof coating for priming and sealing internal wet areas before tile fixing.'
  },

  // ── 6. Cement, Steel & Foundation ──
  {
    name: 'Tata Tiscon 550D TMT Rebar (12mm, 12 Meter)',
    slug: 'tata-tiscon-550d-tmt-rebar-12mm',
    sku: 'BM-TAT-001',
    category: 'Cement, Steel & Foundation',
    subcategory: 'Tata Tiscon 550D TMT Rebar',
    brand: 'Tata Tiscon',
    price: 840,
    mrp: 960,
    discount: 13,
    unit: '12m Piece',
    stock: 500,
    rating: 4.9,
    reviewsCount: 110,
    images: ['/categories/tmt-rebar-podium.svg'],
    isFeatured: true,
    description: 'Fe 550D super-ductile rib-patterned high strength steel rebar manufactured from virgin iron ore.'
  },
  {
    name: 'Tata Tiscon 550D TMT Rebar (16mm, 12 Meter)',
    slug: 'tata-tiscon-550d-tmt-rebar-16mm',
    sku: 'BM-TAT-002',
    category: 'Cement, Steel & Foundation',
    subcategory: 'Tata Tiscon 550D TMT Rebar',
    brand: 'Tata Tiscon',
    price: 1480,
    mrp: 1650,
    discount: 10,
    unit: '12m Piece',
    stock: 350,
    rating: 4.9,
    reviewsCount: 78,
    images: ['/categories/tmt-rebar-podium.svg'],
    description: 'Heavy 16mm seismic resistant steel reinforcement bar for columns and foundation footings.'
  },
  {
    name: 'UltraTech Super Portland Pozzolana Cement (PPC 50kg Bag)',
    slug: 'ultratech-super-ppc-cement-50kg',
    sku: 'BM-ULT-003',
    category: 'Cement, Steel & Foundation',
    subcategory: 'UltraTech & ACC Cement',
    brand: 'UltraTech',
    price: 395,
    mrp: 440,
    discount: 10,
    unit: '50kg Bag',
    stock: 600,
    rating: 4.9,
    reviewsCount: 145,
    images: ['/categories/cement-bags-trio.svg'],
    isFeatured: true,
    isDeal: true,
    description: 'Engineered micro-fine particles providing exceptional 28-day compressive strength and chemical corrosion resistance.'
  },
  {
    name: 'ACC Gold Water Shield Water Repellent Cement (50kg Bag)',
    slug: 'acc-gold-water-shield-cement-50kg',
    sku: 'BM-ACC-004',
    category: 'Cement, Steel & Foundation',
    subcategory: 'UltraTech & ACC Cement',
    brand: 'ACC',
    price: 410,
    mrp: 460,
    discount: 11,
    unit: '50kg Bag',
    stock: 400,
    rating: 4.8,
    reviewsCount: 89,
    images: ['/categories/cement-bags-trio.svg'],
    description: 'Water-shield hydro-repellent cement that prevents seepage and efflorescence in all roof slabs and masonry walls.'
  },
  {
    name: 'GI Annealed Rebar Binding Wire (18 Gauge, 25kg Bundle)',
    slug: 'gi-annealed-binding-wire-18g-25kg',
    sku: 'BM-TAT-005',
    category: 'Cement, Steel & Foundation',
    subcategory: 'Annealed GI Binding Wire',
    brand: 'Tata Tiscon',
    price: 1850,
    mrp: 2150,
    discount: 14,
    unit: '25kg Bundle',
    stock: 150,
    rating: 4.8,
    reviewsCount: 42,
    images: ['/categories/binding-wire-podium.svg'],
    description: 'Soft annealed zinc galvanized binding wire for secure rebar tying without snapping.'
  },
  {
    name: 'JSW Steel MS Structural Angle (50x50x6mm, 6m Length)',
    slug: 'jsw-steel-ms-structural-angle-50x50x6',
    sku: 'BM-JSW-006',
    category: 'Cement, Steel & Foundation',
    subcategory: 'Structural Steel Bars',
    brand: 'JSW Steel',
    price: 1680,
    mrp: 1950,
    discount: 14,
    unit: '6m Length',
    stock: 80,
    rating: 4.7,
    reviewsCount: 22,
    images: ['/categories/steel-bars.svg'],
    description: 'Hot rolled structural mild steel equal angle for shed framing, gates, and industrial fabrication.'
  },

  // ── 7. Construction Materials & Masonry ──
  {
    name: 'Washed Plastering M-Sand (Triple Washed Silty-Free Alternative to River Sand)',
    slug: 'washed-plastering-m-sand-ton',
    sku: 'BM-MAT-001',
    category: 'Construction Materials & Masonry',
    subcategory: 'Washed Plastering M-Sand',
    brand: 'BuildPlace Direct',
    price: 1850,
    mrp: 2200,
    discount: 16,
    unit: 'Ton (1000 kg)',
    stock: 500,
    rating: 4.9,
    reviewsCount: 61,
    images: ['/categories/m-sand-podium.svg'],
    isFeatured: true,
    description: 'Triple-washed manufactured sand with uniform granule distribution conforming to IS 383 Zone II specifications.'
  },
  {
    name: '20mm Blue Metal Granite Aggregate (RCC Foundation Grade)',
    slug: '20mm-granite-aggregate-ton',
    sku: 'BM-MAT-002',
    category: 'Construction Materials & Masonry',
    subcategory: '20mm Granite Aggregate',
    brand: 'BuildPlace Direct',
    price: 1450,
    mrp: 1750,
    discount: 17,
    unit: 'Ton (1000 kg)',
    stock: 600,
    rating: 4.8,
    reviewsCount: 45,
    images: ['/categories/granite-aggregate-podium.svg'],
    description: 'Crushed hard blue metal granite gravel aggregate suitable for all high-strength ready-mix concrete applications.'
  },
  {
    name: 'Wire-Cut Machine-Made Red Clay Bricks (High Compressive Strength)',
    slug: 'wire-cut-red-clay-bricks-1000-pcs',
    sku: 'BM-MAT-003',
    category: 'Construction Materials & Masonry',
    subcategory: 'Wire-Cut Red Clay Bricks',
    brand: 'BuildPlace Direct',
    price: 9800,
    mrp: 11500,
    discount: 15,
    unit: '1000 Bricks',
    stock: 40,
    rating: 4.8,
    reviewsCount: 39,
    images: ['/categories/red-bricks-podium.svg'],
    isDeal: true,
    description: 'Chamber-burned wire-cut red bricks with sharp edges, zero efflorescence, and superior load-bearing capacity.'
  },
  {
    name: 'Godrej TUFF AAC Lightweight Aerated Autoclaved Blocks (600x200x150mm)',
    slug: 'godrej-tuff-aac-blocks-600x200x150',
    sku: 'BM-MAT-004',
    category: 'Construction Materials & Masonry',
    subcategory: 'AAC Lightweight Blocks',
    brand: 'Godrej',
    price: 68,
    mrp: 82,
    discount: 17,
    unit: 'Piece',
    stock: 2500,
    rating: 4.9,
    reviewsCount: 52,
    images: ['/categories/aac-blocks-podium.svg'],
    description: 'Thermal insulating lightweight wall blocks that reduce structural foundation deadload by up to 50%.'
  },

  // ── 8. Tools & Jobsite Equipment ──
  {
    name: 'Bosch GWS 600 Professional Angle Grinder (670W, 4 Inch)',
    slug: 'bosch-gws-600-angle-grinder-670w',
    sku: 'BM-BOS-001',
    category: 'Tools & Jobsite Equipment',
    subcategory: 'Professional Angle Grinder',
    brand: 'Bosch',
    price: 2450,
    mrp: 3100,
    discount: 21,
    unit: 'Set',
    stock: 90,
    rating: 4.9,
    reviewsCount: 88,
    images: ['/categories/angle-grinder-podium.svg'],
    isFeatured: true,
    isDeal: true,
    description: 'Compact 670W angle grinder with armored coils, burst-proof guard, and ergonomic two-motion safety switch.'
  },
  {
    name: 'Bosch 4-Inch Expert for Marble Diamond Cutting Wheel',
    slug: 'bosch-4-inch-diamond-cutting-wheel',
    sku: 'BM-BOS-002',
    category: 'Tools & Jobsite Equipment',
    subcategory: 'Diamond Cutting Blades',
    brand: 'Bosch',
    price: 320,
    mrp: 420,
    discount: 24,
    unit: 'Piece',
    stock: 250,
    rating: 4.8,
    reviewsCount: 64,
    images: ['/categories/cutting-blades-podium.svg'],
    description: 'Hot-pressed continuous rim diamond disc for clean, chip-free cutting of marble, granite, ceramic, and vitrified tiles.'
  },
  {
    name: 'Stanley PowerLock Measuring Tape (5 Meter / 16 Feet)',
    slug: 'stanley-powerlock-measuring-tape-5m',
    sku: 'BM-STA-003',
    category: 'Tools & Jobsite Equipment',
    subcategory: 'Steel Measuring Tape',
    brand: 'Stanley',
    price: 290,
    mrp: 360,
    discount: 19,
    unit: 'Piece',
    stock: 180,
    rating: 4.8,
    reviewsCount: 47,
    images: ['/categories/measuring-tape-podium.svg'],
    description: 'Mylar polyester coated steel blade with Tru-Zero end hook and high-impact chrome plated ABS case.'
  },
  {
    name: 'Taparia Heavy Duty Masonry Brick Trowel (8 Inch, Forged Steel)',
    slug: 'taparia-masonry-brick-trowel-8-inch',
    sku: 'BM-TAP-004',
    category: 'Tools & Jobsite Equipment',
    subcategory: 'Masonry Trowels & Tools',
    brand: 'Taparia',
    price: 240,
    mrp: 300,
    discount: 20,
    unit: 'Piece',
    stock: 150,
    rating: 4.7,
    reviewsCount: 33,
    images: ['/categories/masonry-tools-podium.svg'],
    description: 'Single-piece drop forged carbon steel masonry trowel with polished blade and comfortable grip handle.'
  }
];

export async function seedCatalogProducts() {
  await connectDB();
  console.log('🔄 Seeding/Updating Catalog Products...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of CATALOG_PRODUCTS) {
    const existing = await Product.findOne({
      $or: [
        { sku: item.sku },
        { name: item.name },
        { slug: item.slug }
      ]
    });

    if (existing) {
      existing.category = item.category;
      existing.subcategory = item.subcategory;
      existing.brand = item.brand;
      existing.price = item.price;
      existing.mrp = item.mrp;
      existing.unit = item.unit;
      existing.stock = Math.max(existing.stock || 0, item.stock);
      existing.images = item.images;
      existing.description = item.description;
      existing.isActive = true;
      existing.deletedAt = null;
      await existing.save();
      updatedCount++;
    } else {
      await Product.create({
        ...item,
        isActive: true,
        deletedAt: null
      });
      createdCount++;
    }
  }

  // Update any stray General Construction products to Wood and Hardware
  await Product.updateMany(
    { category: 'General Construction' },
    { $set: { category: 'Wood and Hardware', subcategory: 'Door Hardware, Locks & Handles' } }
  );

  const total = await Product.countDocuments({ isActive: true, deletedAt: null });
  console.log(`✅ PRODUCT CATALOG SEED COMPLETE! Created: ${createdCount}, Updated: ${updatedCount}, Total Active: ${total}`);

  const byCat = await Product.aggregate([
    { $match: { isActive: true, deletedAt: null } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log('\nPRODUCTS PER CATEGORY:');
  byCat.forEach(c => console.log(`  - ${c._id}: ${c.count} products`));
}

if (process.argv[1]?.endsWith('seed_products.js')) {
  seedCatalogProducts().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(err => {
    console.error('Seeding products failed:', err);
    process.exit(1);
  });
}
