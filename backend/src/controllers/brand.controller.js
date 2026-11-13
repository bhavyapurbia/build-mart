import Brand from '../models/Brand.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/index.js';

export const DEFAULT_BRANDS = [
  {
    name: 'Dr. Fixit by Pidilite',
    slug: 'dr-fixit',
    logo: '/brands/dr-fixit.svg',
    description: 'Comprehensive waterproofing and leak-repair solutions.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Havells India Ltd.',
    slug: 'havells',
    logo: '/brands/havells.svg',
    description: 'Fast-moving electrical goods, conduits, cables & switchgear.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Futura',
    slug: 'futura',
    logo: '/brands/futura.svg',
    description: 'Sinks that think: Premium kitchen sinks, faucets & sanitary fittings.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Hettich India',
    slug: 'hettich',
    logo: '/brands/hettich.svg',
    description: 'German precision furniture hardware, soft-close hinges & drawer channels.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Fevicol by Pidilite',
    slug: 'fevicol',
    logo: '/brands/fevicol.svg',
    description: 'The ultimate wood adhesives, sealants and bonding chemicals.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Goldmedal Electricals',
    slug: 'goldmedal',
    logo: '/brands/goldmedal.svg',
    description: 'Modern modular switches, sockets, wires and home automation.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Jaquar Group',
    slug: 'jaquar',
    logo: '/brands/jaquar.svg',
    description: 'Complete luxury bathroom and lighting solutions.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Luminous Power Technologies',
    slug: 'luminous',
    logo: '/brands/luminous.svg',
    description: 'Heavy duty inverters, backup batteries and solar power units.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Philips Lighting',
    slug: 'philips',
    logo: '/brands/philips.svg',
    description: 'Energy-saving LED battens, downlights and smart architectural lights.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Asian Paints',
    slug: 'asian-paints',
    logo: '/brands/asian-paints.svg',
    description: 'India’s leading paint, primer and wall texture brand.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'UltraTech Cement',
    slug: 'ultratech-cement',
    logo: '/brands/ultratech.svg',
    description: 'The Engineer’s Choice for structural building cement.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Tata Tiscon',
    slug: 'tata-tiscon',
    logo: '/brands/tata-tiscon.svg',
    description: 'GreenPro certified 550D super ductile TMT rebars.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Astral Pipes',
    slug: 'astral-pipes',
    logo: '/brands/astral.svg',
    description: 'Pioneers in CPVC plumbing, drainage & GI fittings.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Kajaria Ceramics',
    slug: 'kajaria-ceramics',
    logo: '/brands/kajaria.svg',
    description: 'India’s largest manufacturer of ceramic & vitrified tiles.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Greenply',
    slug: 'greenply',
    logo: '/brands/greenply.svg',
    description: 'Borer and termite-proof calibrated plywood and blockboards.',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Godrej Locks',
    slug: 'godrej-locks',
    logo: '/brands/godrej.svg',
    description: 'High-security mortise door locks, handles & architectural hardware.',
    isFeatured: true,
    isActive: true
  }
];

export const getBrands = asyncHandler(async (req, res) => {
  let brands = await Brand.find({ isActive: { $ne: false } }).sort({ isFeatured: -1, createdAt: 1 });
  if (!brands || brands.length === 0) {
    try {
      brands = await Brand.insertMany(DEFAULT_BRANDS);
    } catch (e) {
      // If index clash or already existing
      brands = await Brand.find({ isActive: { $ne: false } });
    }
  }
  return res.status(200).json(
    new ApiResponse(200, brands, 'Brands fetched successfully')
  );
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, description, isFeatured } = req.body;
  if (!name) {
    throw new ApiError(400, 'Brand name is required.');
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const brand = await Brand.create({
    name,
    slug,
    logo: logo || '',
    description: description || '',
    isFeatured: !!isFeatured,
    isActive: true
  });
  return res.status(201).json(
    new ApiResponse(201, { brand }, 'Brand created successfully')
  );
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  if (updateData.name) {
    updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const updated = await Brand.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    throw new ApiError(404, 'Brand not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, { brand: updated }, 'Brand updated successfully')
  );
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Brand.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Brand not found.');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'Brand deleted successfully.')
  );
});

export default {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
};
