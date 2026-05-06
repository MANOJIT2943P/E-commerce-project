/**
 * Local Image Upload Utilities
 * Replaces Cloudinary integration with local file storage
 * Handles image storage, deletion, and path generation
 */

import fs from 'fs/promises';
import path from 'path';

const PRODUCT_IMAGES_DIR = 'D:\\col pro ep\\E-commerce-project\\Product_db';

/**
 * Get relative image path from filename
 * Used for storing in database and serving via HTTP
 * @param {string} filename - The filename (e.g., product_uuid.jpg)
 * @returns {string} Relative path (e.g., /images/product_uuid.jpg)
 */
export const getImagePath = (filename) => {
  if (!filename) return null;
  return `/images/${filename}`;
};

/**
 * Get full filesystem path from filename
 * @param {string} filename - The filename
 * @returns {string} Full filesystem path
 */
export const getFullImagePath = (filename) => {
  if (!filename) return null;
  return path.join(PRODUCT_IMAGES_DIR, filename);
};

/**
 * Extract filename from stored path
 * Handles both /images/filename and direct filename formats
 * @param {string} imagePath - The stored image path
 * @returns {string} Filename only
 */
export const extractFilenameFromPath = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('/images/')) {
    return imagePath.replace('/images/', '');
  }
  return imagePath;
};

/**
 * Handle local file upload after multer processing
 * @param {object} file - Multer file object
 * @returns {object} Upload result with image path
 */
export const handleLocalUpload = async (file) => {
  try {
    if (!file) {
      return {
        success: false,
        message: 'No file provided'
      };
    }

    const filename = file.filename;
    const imagePath = getImagePath(filename);

    return {
      success: true,
      filename: filename,
      imagePath: imagePath,
      fullPath: getFullImagePath(filename),
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('Local upload error:', error);
    return {
      success: false,
      message: 'Failed to process local upload'
    };
  }
};

/**
 * Delete image file from local storage
 * @param {string} imagePath - The image path from database (/images/filename)
 * @returns {object} Deletion result
 */
export const deleteLocalImage = async (imagePath) => {
  try {
    if (!imagePath) {
      return { success: true }; // Nothing to delete
    }

    const filename = extractFilenameFromPath(imagePath);
    const fullPath = getFullImagePath(filename);

    // Check if file exists before deletion
    try {
      await fs.access(fullPath);
    } catch (error) {
      // File doesn't exist - consider it a success
      console.warn(`⚠️ Image file not found: ${filename}`);
      return { success: true, existed: false };
    }

    // Delete the file
    await fs.unlink(fullPath);
    console.log(`✅ Image deleted: ${filename}`);
    return { success: true, deleted: true };
  } catch (error) {
    console.error('Local image deletion error:', error);
    // Don't throw - deletion failure should not break the operation
    return { success: false, error: error.message };
  }
};

/**
 * Delete multiple image files
 * @param {array} imagePaths - Array of image paths
 * @returns {object} Deletion results
 */
export const deleteLocalImages = async (imagePaths = []) => {
  const results = await Promise.allSettled(
    imagePaths.map(imagePath => deleteLocalImage(imagePath))
  );

  const deleted = results.filter(r => r.status === 'fulfilled' && r.value.deleted).length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    success: true,
    deleted: deleted,
    failed: failed,
    total: imagePaths.length
  };
};

/**
 * Validate image file exists
 * @param {string} imagePath - The image path from database
 * @returns {boolean} True if file exists
 */
export const imageExists = async (imagePath) => {
  try {
    if (!imagePath) return false;
    const filename = extractFilenameFromPath(imagePath);
    const fullPath = getFullImagePath(filename);
    await fs.access(fullPath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get image file statistics
 * @param {string} imagePath - The image path from database
 * @returns {object} File stats or null if not found
 */
export const getImageStats = async (imagePath) => {
  try {
    if (!imagePath) return null;
    const filename = extractFilenameFromPath(imagePath);
    const fullPath = getFullImagePath(filename);
    const stats = await fs.stat(fullPath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    return null;
  }
};

export default {
  getImagePath,
  getFullImagePath,
  extractFilenameFromPath,
  handleLocalUpload,
  deleteLocalImage,
  deleteLocalImages,
  imageExists,
  getImageStats
};
