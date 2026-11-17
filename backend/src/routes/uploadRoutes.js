import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import upload, { detectMagic, IMAGE_MAX, PDF_MAX } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Rate limit for public paper-list photo uploads (generous to ensure real users/contractors are never blocked)
const paperListLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 60 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV === 'test',
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many paper-list photo uploads from this IP. Please wait a moment and try again.'
  }
});

/**
 * Helper to save local fallback copy if cloud upload is unconfigured or unavailable
 */
const saveLocalFallback = (filePath, subfolder = 'uploads') => {
  try {
    const destDir = path.resolve(__dirname, `../uploads/${subfolder}`);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const safeFilename = `${Date.now()}-${path.basename(filePath)}`;
    const destPath = path.join(destDir, safeFilename);
    fs.copyFileSync(filePath, destPath);
    return `/uploads/${subfolder}/${safeFilename}`;
  } catch (err) {
    console.error('Local fallback storage error:', err);
    return null;
  }
};

/**
 * POST /api/upload/paper-list
 * Auth optional + generous rate limit + images only.
 * Stores photo in Cloudinary (with automatic local static fallback) and returns URL + publicId.
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

  let fileUrl = null;
  let publicId = null;

  // 1. Try Cloudinary upload
  try {
    const cloudinaryResult = await uploadOnCloudinary(req.file.path, 'buildmart/paper-lists');
    if (cloudinaryResult?.secure_url) {
      fileUrl = cloudinaryResult.secure_url;
      publicId = cloudinaryResult.public_id || null;
    }
  } catch (cloudErr) {
    console.warn('Cloudinary upload warning:', cloudErr.message);
  }

  // 2. Local fallback if Cloudinary didn't return a URL
  if (!fileUrl && fs.existsSync(req.file.path)) {
    fileUrl = saveLocalFallback(req.file.path, 'paper-lists');
  }

  // Clean up multer temporary file
  if (fs.existsSync(req.file.path)) {
    try { fs.unlinkSync(req.file.path); } catch {}
  }

  if (!fileUrl) {
    throw new ApiError(500, 'Failed to store image. Please try again.');
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: fileUrl,
      publicId: publicId,
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

  const subfolder = (req.body?.folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');
  const targetFolder = `buildmart/${subfolder}`;
  
  let fileUrl = null;
  let publicId = null;

  try {
    const cloudinaryResult = await uploadOnCloudinary(req.file.path, targetFolder);
    if (cloudinaryResult?.secure_url) {
      fileUrl = cloudinaryResult.secure_url;
      publicId = cloudinaryResult.public_id || null;
    }
  } catch (cloudErr) {
    console.warn('Cloudinary upload warning:', cloudErr.message);
  }

  if (!fileUrl && fs.existsSync(req.file.path)) {
    fileUrl = saveLocalFallback(req.file.path, subfolder);
  }

  // Clean up temp file
  if (fs.existsSync(req.file.path)) {
    try { fs.unlinkSync(req.file.path); } catch {}
  }

  if (!fileUrl) {
    throw new ApiError(500, 'Upload failed. Please try again.');
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: fileUrl,
      publicId: publicId,
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

  const subfolder = (req.body?.folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '');
  const targetFolder = `buildmart/${subfolder}`;
  const results = [];
  for (const file of req.files) {
    const buffer = fs.readFileSync(file.path);
    const detectedMime = detectMagic(buffer);
    if (!detectedMime || (detectedMime !== 'application/pdf' && file.size > IMAGE_MAX)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new ApiError(400, `Invalid or oversized file: ${file.originalname}`);
    }

    let itemUrl = null;
    let itemId = null;

    try {
      const result = await uploadOnCloudinary(file.path, targetFolder);
      if (result?.secure_url) {
        itemUrl = result.secure_url;
        itemId = result.public_id || null;
      }
    } catch (e) {}

    if (!itemUrl && fs.existsSync(file.path)) {
      itemUrl = saveLocalFallback(file.path, subfolder);
    }

    if (fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch {}
    }

    if (itemUrl) {
      results.push({ url: itemUrl, publicId: itemId });
    }
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
