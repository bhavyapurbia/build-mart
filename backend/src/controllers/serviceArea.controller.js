import ServiceArea from '../models/ServiceArea.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/serviceability?pincode=
 * Public check for pincode delivery availability, ETA, and delivery fee.
 */
export const checkServiceability = asyncHandler(async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) {
    throw new ApiError(400, 'Pincode is required.');
  }

  const cleanPincode = String(pincode).trim();
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
        etaLabel: area.etaLabel,
        deliveryFee: area.deliveryFee,
        minOrder: area.minOrder,
        freeDeliveryThreshold: area.freeDeliveryThreshold
      }, 'Pincode is serviceable')
    );
  }

  return res.status(200).json(
    new ApiResponse(200, {
      serviceable: false,
      pincode: cleanPincode,
      message: 'Direct delivery is currently unavailable for this pincode. Commercial builders can request customized freight via Bulk Enquiry.'
    }, 'Pincode is not currently serviceable')
  );
});

export const getAllServiceAreas = asyncHandler(async (req, res) => {
  const areas = await ServiceArea.find().sort({ city: 1 }).lean();
  return res.status(200).json(
    new ApiResponse(200, areas, 'Service areas fetched successfully')
  );
});

export const createServiceArea = asyncHandler(async (req, res) => {
  const { city, state = 'Karnataka', pincodes, etaLabel, deliveryFee, minOrder, freeDeliveryThreshold } = req.body;
  if (!city || !pincodes || !pincodes.length) {
    throw new ApiError(400, 'City and at least one pincode are required.');
  }

  const area = await ServiceArea.create({
    city,
    state,
    pincodes: Array.isArray(pincodes) ? pincodes.map(String) : pincodes.split(',').map(s => s.trim()),
    etaLabel: etaLabel || '⚡ 30-60 Min Express Delivery',
    deliveryFee: Number(deliveryFee) || 350,
    minOrder: Number(minOrder) || 1000,
    freeDeliveryThreshold: Number(freeDeliveryThreshold) || 5000,
    isAvailable: true
  });

  return res.status(201).json(
    new ApiResponse(201, area, 'Service area created successfully')
  );
});

export const updateServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (updateData.pincodes && typeof updateData.pincodes === 'string') {
    updateData.pincodes = updateData.pincodes.split(',').map(s => s.trim());
  }

  const updated = await ServiceArea.findByIdAndUpdate(id, updateData, { new: true }).lean();
  if (!updated) {
    throw new ApiError(404, 'Service area not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, updated, 'Service area updated successfully')
  );
});

export const deleteServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ServiceArea.findByIdAndDelete(id);
  return res.status(200).json(
    new ApiResponse(200, null, 'Service area deleted successfully')
  );
});

export default {
  checkServiceability,
  getAllServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea
};

