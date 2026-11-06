import express from 'express';
import upload from '../middleware/upload.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Upload a single file (e.g. image, document, invoice, specification sheet)
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }

  // Upload to Cloudinary CDN with automatic format/type detection
  const cloudinaryResult = await uploadOnCloudinary(req.file.path, 'buildmart/uploads');

  const fileUrl = cloudinaryResult ? cloudinaryResult.secure_url : `/uploads/${req.file.filename}`;

  return res.status(200).json(
    new ApiResponse(200, {
      url: fileUrl,
      publicId: cloudinaryResult?.public_id || null,
      filename: req.file.filename,
      size: req.file.size
    }, 'File uploaded successfully')
  );
}));

// Upload multiple files (up to 10 files)
router.post('/multiple', upload.array('files', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded.');
  }

  const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path, 'buildmart/uploads'));
  const results = await Promise.all(uploadPromises);

  const urls = results.map((result, idx) => result ? result.secure_url : `/uploads/${req.files[idx].filename}`);

  return res.status(200).json(
    new ApiResponse(200, {
      urls,
      count: urls.length
    }, 'Files uploaded successfully')
  );
}));

export default router;
