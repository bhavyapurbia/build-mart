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

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg|pdf|doc|docx|csv|xlsx/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and valid document formats are permitted.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter
});

export default upload;
export { upload };
