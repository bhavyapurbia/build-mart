import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists for initial multer upload before Cloudinary processing
const tempDir = path.resolve(__dirname, '../../public/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, (err, raw) => {
      if (err) return cb(err);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${raw.toString('hex')}${ext}`);
    });
  }
});

/**
 * Allowed MIME types by magic bytes (first 8 bytes of the file buffer).
 * Extension alone is insufficient — browsers allow renaming files.
 */
const ALLOWED_IMAGE_MAGIC = {
  'ffd8ff': 'image/jpeg',  // JPEG
  '89504e47': 'image/png', // PNG
  '52494646': 'image/webp',// WEBP (RIFF header)
  '47494638': 'image/gif', // GIF
};
const ALLOWED_PDF_MAGIC = '25504446'; // %PDF

function detectMagic(buffer) {
  const hex = buffer.toString('hex', 0, 8);
  for (const [magic, mime] of Object.entries(ALLOWED_IMAGE_MAGIC)) {
    if (hex.startsWith(magic)) return mime;
  }
  if (hex.startsWith(ALLOWED_PDF_MAGIC)) return 'application/pdf';
  return null;
}

const IMAGE_MAX = 8 * 1024 * 1024;  // 8 MB
const PDF_MAX = 15 * 1024 * 1024;   // 15 MB
const GLOBAL_MAX = PDF_MAX;

const fileFilter = (req, file, cb) => {
  // Allow only safe types — no svg, doc, docx, csv, xlsx on public routes
  const allowedExts = /jpeg|jpg|png|webp|gif|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (!allowedExts.test(ext)) {
    return cb(new Error('Only images (JPEG, PNG, WebP, GIF) and PDFs are permitted.'));
  }
  // Magic-byte check runs in the route after file is written (see uploadRoutes.js)
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: GLOBAL_MAX },
  fileFilter
});

export { IMAGE_MAX, PDF_MAX, detectMagic };
export default upload;
export { upload };
