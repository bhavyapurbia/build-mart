import express from 'express';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import upload, { detectMagic, IMAGE_MAX, PDF_MAX } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Strict rate limit for public paper-list photo uploads (10 uploads per 15 minutes)
const paperListLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many paper-list photo uploads from this IP. Please wait 15 minutes.'
  }
});

/**
 * POST /api/upload/paper-list
 * Auth optional + strict rate limit + images only.
 * Stores photo in Cloudinary and returns secure URL + publicId.
 */
router.post('/paper-list', paperListLimiter, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file uploaded.');
  }

  const buffer = fs.readFileSync(req.file.path);
  const detectedMime = detectMagic(buffer);

  // Images only (no PDFs or executable binaries)
  if (!detectedMime || !['image/jpeg', 'image/png', 'image/webp'].includes(detectedMime)) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'Invalid image format. Only JPEG, PNG, and WebP photos are permitted.');
  }

  if (req.file.size > IMAGE_MAX) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'Paper-list image must be under 8 MB.');
  }

  const cloudinaryResult = await uploadOnCloudinary(req.file.path, 'buildmart/paper-lists');
  if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

  const fileUrl = cloudinaryResult ? cloudinaryResult.secure_url : null;
  if (!fileUrl) {
    throw new ApiError(500, 'Failed to store image in cloud storage. Please try again.');
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: fileUrl,
      publicId: cloudinaryResult.public_id || null,
      filename: req.file.filename,
      size: req.file.size
    }, 'Paper-list image uploaded successfully')
  );
}));

// All general upload endpoints require authenticated user session
router.use(authenticate);

// Upload a single file (image or PDF)
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }

  // Magic-byte verification
  const buffer = fs.readFileSync(req.file.path);
  const detectedMime = detectMagic(buffer);
  if (!detectedMime) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'File type not allowed. Only JPEG, PNG, WebP, GIF, and PDF are permitted.');
  }

  // Size limits by type
  if (detectedMime === 'application/pdf' && req.file.size > PDF_MAX) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'PDF files must be under 15 MB.');
  }
  if (detectedMime !== 'application/pdf' && req.file.size > IMAGE_MAX) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(400, 'Image files must be under 8 MB.');
  }

  const cloudinaryResult = await uploadOnCloudinary(req.file.path, 'buildmart/uploads');

  // Clean up temp file
  if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

  const fileUrl = cloudinaryResult ? cloudinaryResult.secure_url : null;
  if (!fileUrl) {
    throw new ApiError(500, 'Upload failed. Please try again.');
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: fileUrl,
      publicId: cloudinaryResult?.public_id || null,
      filename: req.file.filename,
      size: req.file.size
    }, 'File uploaded successfully')
  );
}));

// Upload multiple files (up to 10)
router.post('/multiple', upload.array('files', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded.');
  }

  const results = [];
  for (const file of req.files) {
    const buffer = fs.readFileSync(file.path);
    const detectedMime = detectMagic(buffer);
    if (!detectedMime || (detectedMime !== 'application/pdf' && file.size > IMAGE_MAX)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new ApiError(400, `Invalid or oversized file: ${file.originalname}`);
    }
    const result = await uploadOnCloudinary(file.path, 'buildmart/uploads');
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    if (result) results.push({ url: result.secure_url, publicId: result.public_id });
  }

  return res.status(200).json(
    new ApiResponse(200, {
      urls: results.map(r => r.url),
      files: results,
      count: results.length
    }, 'Files uploaded successfully')
  );
}));

export default router;
