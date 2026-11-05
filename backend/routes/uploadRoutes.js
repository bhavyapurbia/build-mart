const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload error', error: err.message });
  }
});

router.post('/multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({
      message: 'Files uploaded successfully',
      urls
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload error', error: err.message });
  }
});

module.exports = router;

