/**
 * Image Upload Middleware
 * Handles multipart/form-data parsing and image validation
 * Local file storage configuration - replaced Cloudinary
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';

dotenv.config();

// ==========================================
// CONFIGURATION CONSTANTS
// ==========================================
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file
const PRODUCT_IMAGES_DIR = process.env.PRODUCT_IMAGES_DIR;

// ==========================================
// CREATE UPLOAD DIRECTORY
// ==========================================
// Ensure upload directory exists
try {
  await fs.mkdir(PRODUCT_IMAGES_DIR, { recursive: true });
  console.log(`✅ Image storage directory ready: ${PRODUCT_IMAGES_DIR}`);
} catch (error) {
  console.error('⚠️ Failed to create image storage directory:', error.message);
}

/**
 * Multer storage configuration
 * Stores files directly in Product_db directory with unique naming
 * Uses timestamp + random number to ensure uniqueness
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCT_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    // Use timestamp + random suffix for unique naming to prevent collisions
    const fileExt = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const uniqueFilename = `product_${timestamp}_${randomSuffix}${fileExt}`;
    cb(null, uniqueFilename);
  }
});

/**
 * File filter for multer
 * Validates file type and size
 */
const fileFilter = (req, file, cb) => {
  // Validate MIME type - only allow specific formats
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type. Allowed types: JPEG, PNG, WebP`
    );
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
};

/**
 * Multer instance for single image upload
 * Field name: 'image'
 */
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).single('image');

/**
 * Multer instance for multiple images
 * Field name: 'images'
 */
export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).array('images', 5); // Max 5 images

/**
 * Cleanup uploaded file from disk
 * Called when upload fails or is replaced
 */
export const deleteUploadedFile = async (filename) => {
  try {
    if (!filename) return;
    const filepath = path.join(PRODUCT_IMAGES_DIR, filename);
    await fs.unlink(filepath);
    console.log(`✅ File deleted: ${filename}`);
  } catch (error) {
    console.warn(`⚠️ Failed to delete file: ${filename}`, error.message);
    // Don't throw - cleanup failure shouldn't break the operation
  }
};

/**
 * Cleanup multiple files from disk
 */
export const deleteUploadedFiles = async (filenames = []) => {
  const results = await Promise.allSettled(
    filenames.map(fn => deleteUploadedFile(fn))
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`⚠️ Failed to delete file at index ${index}`);
    }
  });
};

/**
 * Global error handler for multer errors
 * Use this in route error handling
 */
export const handleMulterError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed'
      });
    }
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
};

export default { 
  uploadImage, 
  uploadImages, 
  deleteUploadedFile, 
  deleteUploadedFiles,
  PRODUCT_IMAGES_DIR
};
