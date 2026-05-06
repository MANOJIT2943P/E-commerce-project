/**
 * Public Product Routes
 * All routes are PUBLIC ACCESS - NO AUTHENTICATION REQUIRED
 * These routes allow anyone to browse and view product information
 *
 * IMPORTANT: More specific routes must be defined before parameterized routes
 * Order:
 * 1. Collection routes (search/suggestions, categories/list, brands/list)
 * 2. List route with queries (GET /)
 * 3. Detail route (GET /:id)
 */

import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

/**
 * @route   GET /api/products/search/suggestions
 * @desc    Get product name suggestions for autocomplete
 * @access  Public (NO AUTH REQUIRED)
 * @query   q - Search query (required)
 * @query   limit - Max number of suggestions (default: 5, max: 10)
 *
 * Useful for search autocomplete UI components
 * Example: GET /api/products/search/suggestions?q=iph&limit=5
 *
 * MUST be defined before /:id route to avoid param collision
 */
router.get('/search/suggestions', productController.getSearchSuggestions);

/**
 * @route   GET /api/products/categories/list
 * @desc    Get all available product categories
 * @access  Public (NO AUTH REQUIRED)
 *
 * Useful for category filter dropdowns in UI
 * Example: GET /api/products/categories/list
 *
 * MUST be defined before /:id route to avoid param collision
 */
router.get('/categories/list', productController.getCategories);

/**
 * @route   GET /api/products/brands/list
 * @desc    Get all available product brands
 * @access  Public (NO AUTH REQUIRED)
 *
 * Useful for brand filter dropdowns in UI
 * Example: GET /api/products/brands/list
 *
 * MUST be defined before /:id route to avoid param collision
 */
router.get('/brands/list', productController.getBrands);

/**
 * @route   GET /api/products
 * @desc    Get all active products with pagination, sorting, and filtering
 * @access  Public (NO AUTH REQUIRED)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   sort - Sort field with optional '-' prefix for descending (e.g., 'price', '-createdAt')
 * @query   category - Filter by category
 * @query   brand - Filter by brand
 * @query   minPrice - Minimum price filter
 * @query   maxPrice - Maximum price filter
 * @query   search - Full-text search in name and description
 *
 * Examples:
 * GET /api/products
 * GET /api/products?page=2&limit=20
 * GET /api/products?sort=-price&category=electronics
 * GET /api/products?minPrice=100&maxPrice=1000&sort=name
 * GET /api/products?search=iphone&brand=Apple
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get detailed information for a single product
 * @access  Public (NO AUTH REQUIRED)
 * @param   id - Product ID (MongoDB ObjectId)
 *
 * Returns full product details including description, all images, metadata
 * Only returns products marked as active
 *
 * MUST be defined last to avoid interfering with specific routes above
 */
router.get('/:id', productController.getProductById);

export default router;
