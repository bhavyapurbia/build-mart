import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, folder = 'buildmart') => {
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder
    });

    // Remove the locally saved temporary file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    // Clean up local temp file on failure as well
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkErr) {
        // ignore unlink error
      }
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error('Cloudinary deletion error:', error.message);
    return null;
  }
};




export  {
  cloudinary,
  uploadOnCloudinary,
  deleteFromCloudinary
};