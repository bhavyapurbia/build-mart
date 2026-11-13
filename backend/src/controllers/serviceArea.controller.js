import ServiceArea from '../models/ServiceArea.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const DEFAULT_CITIES = [
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    hub: 'Central Fulfillment Hub (Bellandur)',
    pincodes: ['560001', '560002', '560003', '560004', '560008', '560025', '560034', '560037', '560038', '560066', '560068', '560076', '560078', '560100', '560102', '560103'],
    etaLabel: '⚡ 30-60 Min Express Delivery',
    deliveryFee: 299,
    minOrder: 500,
    freeDeliveryThreshold: 4000,
    isAvailable: true
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    hub: 'Western Suburbs Hub (Andheri)',
    pincodes: ['400001', '400002', '400050', '400051', '400053', '400058', '400069', '400076', '400092'],
    etaLabel: '⚡ 45-90 Min Express Delivery',
    deliveryFee: 350,
    minOrder: 1000,
    freeDeliveryThreshold: 5000,
    isAvailable: true
  },
  {
    city: 'Delhi NCR',
    state: 'Delhi',
    hub: 'Gurugram Sector 48 Hub',
    pincodes: ['110001', '110002', '110003', '110017', '110020', '110025', '122001', '122002', '122018'],
    etaLabel: '⚡ 45-90 Min Express Delivery',
    deliveryFee: 350,
    minOrder: 1000,
    freeDeliveryThreshold: 5000,
    isAvailable: true
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    hub: 'HITEC City Logistics Yard',
    pincodes: ['500001', '500002', '500016', '500032', '500081', '500082', '500084'],
    etaLabel: '⚡ 30-60 Min Express Delivery',
    deliveryFee: 300,
    minOrder: 800,
    freeDeliveryThreshold: 4500,
    isAvailable: true
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    hub: 'Kharadi Industrial Zone',
    pincodes: ['411001', '411004', '411014', '411028', '411038', '411045', '411057'],
    etaLabel: '⚡ 45-60 Min Express Delivery',
    deliveryFee: 300,
    minOrder: 800,
    freeDeliveryThreshold: 4500,
    isAvailable: true
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    hub: 'Guindy Central Depot',
    pincodes: ['600001', '600002', '600004', '600018', '600028', '600032', '600096'],
    etaLabel: '⚡ 45-60 Min Express Delivery',
    deliveryFee: 350,
    minOrder: 1000,
    freeDeliveryThreshold: 5000,
    isAvailable: true
  }
];

const autoSeedServiceAreas = async () => {
  const count = await ServiceArea.countDocuments();
  if (count === 0) {
    try {
      await ServiceArea.insertMany(DEFAULT_CITIES);
    } catch (e) {
      console.warn('Auto-seed service areas notice:', e.message);
    }
  }
};

/**
 * GET /api/serviceability?pincode=
 * Public check for pincode delivery availability, ETA, and delivery fee.
 */
export const checkServiceability = asyncHandler(async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) {
    throw new ApiError(400, 'Pincode is required.');
  }

  const cleanPincode = String(pincode).trim().replace(/\D/g, '');
  if (cleanPincode.length !== 6) {
    throw new ApiError(400, 'Please enter a valid 6-digit Indian PIN code (e.g. 560001).');
  }

  await autoSeedServiceAreas();

  // Find if this pincode is mapped to any city where isAvailable is TRUE
  const area = await ServiceArea.findOne({
    pincodes: cleanPincode,
    isAvailable: true
  }).lean();

  if (area) {
    return res.status(200).json(
      new ApiResponse(200, {
        serviceable: true,
        pincode: cleanPincode,
        city: area.city,
        state: area.state,
        hub: area.hub || `${area.city} Central Hub`,
        etaLabel: area.etaLabel,
        deliveryFee: area.deliveryFee,
        minOrder: area.minOrder,
        freeDeliveryThreshold: area.freeDeliveryThreshold
      }, `Delivery is available in ${area.city}!`)
    );
  }

  // If not serviceable, fetch list of currently active cities to provide helpful guidance
  const activeAreas = await ServiceArea.find({ isAvailable: true }).select('city').lean();
  const activeCityNames = activeAreas.map(a => a.city).join(', ') || 'Bengaluru, Mumbai, Delhi NCR';

  return res.status(200).json(
    new ApiResponse(200, {
      serviceable: false,
      pincode: cleanPincode,
      message: `Direct delivery is currently unavailable for PIN code ${cleanPincode}. BuildMart is currently serving: ${activeCityNames}. You can submit a Bulk Enquiry for custom truckload freight.`
    }, 'Pincode is not currently serviceable')
  );
});

/**
 * GET /api/serviceability/cities
 * Public endpoint to list all active serviceable cities.
 */
export const getActiveCities = asyncHandler(async (req, res) => {
  await autoSeedServiceAreas();
  const areas = await ServiceArea.find({ isAvailable: { $ne: false } }).sort({ city: 1 }).lean();
  return res.status(200).json(
    new ApiResponse(200, areas, 'Active cities fetched successfully')
  );
});

/**
 * GET /api/serviceability/admin/all
 * Admin endpoint to fetch all cities with full pincode rosters and metrics.
 */
export const getAllServiceAreas = asyncHandler(async (req, res) => {
  await autoSeedServiceAreas();
  const areas = await ServiceArea.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json(
    new ApiResponse(200, areas, 'All service areas fetched successfully')
  );
});

/**
 * POST /api/serviceability/admin
 * Admin endpoint to add a new city with serviceable pincodes.
 */
export const createServiceArea = asyncHandler(async (req, res) => {
  const {
    city,
    state = 'Karnataka',
    hub = 'Central Fulfillment Hub',
    pincodes,
    etaLabel = '⚡ 30-60 Min Express Delivery',
    deliveryFee = 299,
    minOrder = 500,
    freeDeliveryThreshold = 4000,
    isAvailable = true
  } = req.body;

  if (!city || !city.trim()) {
    throw new ApiError(400, 'City name is required.');
  }

  let formattedPincodes = [];
  if (Array.isArray(pincodes)) {
    formattedPincodes = pincodes.map(p => String(p).trim().replace(/\D/g, '')).filter(p => p.length === 6);
  } else if (typeof pincodes === 'string') {
    formattedPincodes = pincodes.split(',').map(p => p.trim().replace(/\D/g, '')).filter(p => p.length === 6);
  }

  if (formattedPincodes.length === 0) {
    throw new ApiError(400, 'At least one valid 6-digit PIN code is required for the city.');
  }

  // Deduplicate pincodes
  formattedPincodes = [...new Set(formattedPincodes)];

  const area = await ServiceArea.create({
    city: city.trim(),
    state: state.trim(),
    hub: hub.trim(),
    pincodes: formattedPincodes,
    etaLabel: etaLabel.trim(),
    deliveryFee: Number(deliveryFee) || 0,
    minOrder: Number(minOrder) || 0,
    freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
    isAvailable: Boolean(isAvailable)
  });

  return res.status(201).json(
    new ApiResponse(201, area, `City "${area.city}" added successfully with ${formattedPincodes.length} serviceable PIN codes.`)
  );
});

/**
 * PUT /api/serviceability/admin/:id
 * Admin endpoint to update an existing city and its pincodes.
 */
export const updateServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (updateData.pincodes) {
    if (typeof updateData.pincodes === 'string') {
      updateData.pincodes = updateData.pincodes.split(',').map(p => p.trim().replace(/\D/g, '')).filter(p => p.length === 6);
    } else if (Array.isArray(updateData.pincodes)) {
      updateData.pincodes = updateData.pincodes.map(p => String(p).trim().replace(/\D/g, '')).filter(p => p.length === 6);
    }
    updateData.pincodes = [...new Set(updateData.pincodes)];
  }

  const updated = await ServiceArea.findByIdAndUpdate(id, updateData, { new: true }).lean();
  if (!updated) {
    throw new ApiError(404, 'Service area not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, updated, `City "${updated.city}" updated successfully.`)
  );
});

/**
 * PUT /api/serviceability/admin/:id/toggle
 * Admin endpoint to toggle a city ON or OFF.
 */
export const toggleServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const area = await ServiceArea.findById(id);
  if (!area) {
    throw new ApiError(404, 'Service area not found.');
  }

  area.isAvailable = !area.isAvailable;
  await area.save();

  return res.status(200).json(
    new ApiResponse(200, area, `City "${area.city}" delivery service is now ${area.isAvailable ? 'ON (Active)' : 'OFF (Paused)'}.`)
  );
});

/**
 * DELETE /api/serviceability/admin/:id
 * Admin endpoint to delete a city.
 */
export const deleteServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ServiceArea.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Service area not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, null, `City "${deleted.city}" deleted successfully.`)
  );
});

export default {
  checkServiceability,
  getActiveCities,
  getAllServiceAreas,
  createServiceArea,
  updateServiceArea,
  toggleServiceArea,
  deleteServiceArea
};
