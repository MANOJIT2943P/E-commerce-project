/**
 * Public Product Controller
 * Handles public-facing product browsing with no authentication required
 * Supports pagination, sorting, and filtering
 */

import { PRODUCT_MESSAGES } from '../constants/messages.js';
import Product from '../models/Product.js';

/**
 * GET /api/products
 * Get all active products with pagination, sorting, and filtering
 * PUBLIC ACCESS - NO AUTHENTICATION REQUIRED
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - sort: Sort field and direction (e.g., 'price', '-createdAt', 'name')
 * - category: Filter by category
 * - brand: Filter by brand
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - search: Search in name and description (text search)
 *
 * Examples:
 * /api/products
 * /api/products?page=2&limit=20
 * /api/products?sort=-price&category=electronics
 * /api/products?minPrice=100&maxPrice=1000
 * /api/products?search=iphone
 */
export const getAllProducts = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Build filters object
    const filters = { isActive: { $ne: false } }; // Active or legacy docs without isActive field

    // Category filter
    if (req.query.category && req.query.category.trim()) {
      filters.category = req.query.category.trim();
    }

    // Brand filter
    if (req.query.brand && req.query.brand.trim()) {
      filters.brand = req.query.brand.trim();
    }

    // Price range filters
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      filters.price = {};

      if (req.query.minPrice !== undefined) {
        const minPrice = parseFloat(req.query.minPrice);
        if (!isNaN(minPrice) && minPrice >= 0) {
          filters.price.$gte = minPrice;
        }
      }

      if (req.query.maxPrice !== undefined) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (!isNaN(maxPrice) && maxPrice >= 0) {
          filters.price.$lte = maxPrice;
        }
      }

      // If price object is empty, remove it
      if (Object.keys(filters.price).length === 0) {
        delete filters.price;
      }
    }

    // Text search filter (searches in name and description)
    const searchTrimmed = req.query.search && req.query.search.trim();
    if (searchTrimmed) {
      filters.$text = { $search: searchTrimmed };
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: newest first
    if (req.query.sort) {
      const sortField = req.query.sort.trim();
      if (sortField.startsWith('-')) {
        sortObj = { [sortField.substring(1)]: -1 };
      } else {
        sortObj = { [sortField]: 1 };
      }
    }

    const fetchProductPage = async (queryFilters) => {
      const totalCount = await Product.countDocuments(queryFilters);
      const rows = await Product.find(queryFilters)
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .select('-createdBy -updatedBy -minStockLevel')
        .lean();
      return { totalCount, rows };
    };

    let total;
    let products;

    try {
      ({ totalCount: total, rows: products } = await fetchProductPage(filters));
    } catch (err) {
      // Common dev issue: no text index on name/description — fall back to regex search
      if (searchTrimmed && filters.$text) {
        console.warn('[getAllProducts] $text search failed; retrying with regex:', err.message);
        const fallbackFilters = { ...filters };
        delete fallbackFilters.$text;
        const escaped = searchTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        fallbackFilters.$or = [
          { name: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } }
        ];
        ({ totalCount: total, rows: products } = await fetchProductPage(fallbackFilters));
      } else {
        throw err;
      }
    }

    // Map to public response format
    const productsData = products.map((product) => {
      // Build images array: use provided images, or fallback to imageUrl
      let images = product.images && product.images.length > 0 
        ? product.images 
        : (product.imageUrl ? [product.imageUrl] : []);
      
      return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        imageUrl: product.imageUrl,
        images: images,
        hasStock: product.stock > 0,
        createdAt: product.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: productsData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * GET /api/products/:id
 * Get a single product by ID
 * PUBLIC ACCESS - NO AUTHENTICATION REQUIRED
 *
 * Returns detailed product information only if product is active
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Find products that are available for purchase (not explicitly deactivated)
    const product = await Product.findOne({
      _id: id,
      isActive: { $ne: false }
    })
      .select('-createdBy -updatedBy -minStockLevel')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Format response
    const productData = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      imageUrl: product.imageUrl,
      images: product.images && product.images.length > 0 
        ? product.images 
        : (product.imageUrl ? [product.imageUrl] : []),
      hasStock: product.stock > 0,
      metadata: product.metadata || {},
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.status(200).json({
      success: true,
      data: productData
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * GET /api/products/search/suggestions
 * Get product search suggestions based on partial query
 * Useful for autocomplete/search suggestions
 * PUBLIC ACCESS - NO AUTHENTICATION REQUIRED
 */
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit: queryLimit } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const limit = Math.min(10, parseInt(queryLimit) || 5);
    const searchQuery = q.trim();

    // Get distinct product names matching the search
    const suggestions = await Product.find(
      {
        isActive: { $ne: false },
        name: { $regex: searchQuery, $options: 'i' }
      },
      { name: 1 }
    )
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: suggestions.map((product) => ({
        id: product._id,
        name: product.name
      }))
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
};

/**
 * GET /api/products/categories/list
 * Get all available product categories
 * Useful for filtering UI
 * PUBLIC ACCESS - NO AUTHENTICATION REQUIRED
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: { $ne: false } });

    res.status(200).json({
      success: true,
      data: categories.filter((cat) => cat && cat.trim()) // Remove null/empty values
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

/**
 * GET /api/products/brands/list
 * Get all available product brands
 * Useful for filtering UI
 * PUBLIC ACCESS - NO AUTHENTICATION REQUIRED
 */
export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: { $ne: false } });

    res.status(200).json({
      success: true,
      data: brands.filter((brand) => brand && brand.trim()) // Remove null/empty values
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands'
    });
  }
};
