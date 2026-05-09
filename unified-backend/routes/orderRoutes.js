/**
 * Order Routes
 * All routes are PROTECTED - Authentication required
 * Users can only access/modify their own orders
 * Admins can access all orders
 */

import express from 'express';
import { ROLES } from '../constants/roles.js';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @route   POST /api/orders/checkout
 * @desc    Create a new order from user's cart
 * @access  Private (Authenticated users only)
 * @body    {
 *            customerContact: { fullName, email, phone },
 *            shippingAddress: { addressLine1, city, state, postalCode, country },
 *            paymentMethod: string
 *          }
 * @returns {Object} Created order with details
 *
 * Example:
 * POST /api/orders/checkout
 * Headers: Authorization: Bearer $TOKEN
 * Body: {
 *   "customerContact": {
 *     "fullName": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "+919876543210"
 *   },
 *   "shippingAddress": {
 *     "addressLine1": "123 Main Street",
 *     "city": "Mumbai",
 *     "state": "Maharashtra",
 *     "postalCode": "400001",
 *     "country": "India"
 *   },
 *   "paymentMethod": "CARD"
 * }
 */
router.post('/checkout', authMiddleware, orderController.checkout);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders for the authenticated user
 * @access  Private (Authenticated users only)
 * @query   {number} limit - Items per page (default: 10, max: 100)
 * @query   {number} page - Page number (default: 1)
 * @query   {string} status - Filter by order status (optional)
 * @returns {Object} Paginated orders list
 *
 * Example: GET /api/orders/my-orders?page=1&limit=10&status=Pending
 * Headers: Authorization: Bearer $TOKEN
 */
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get a specific order by ID
 * @access  Private (Authenticated users only)
 * @security Users can only fetch their own orders (unless admin)
 * @param   {string} id - Order ID (MongoDB ObjectId)
 * @returns {Object} Order details
 *
 * Example: GET /api/orders/507f1f77bcf86cd799439011
 * Headers: Authorization: Bearer $TOKEN
 */
router.get('/:id', authMiddleware, orderController.getOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (ADMIN only)
 * @access  Private (Admin only)
 * @query   {number} limit - Items per page (default: 20, max: 100)
 * @query   {number} page - Page number (default: 1)
 * @query   {string} status - Filter by order status (optional)
 * @query   {string} sortBy - Sort field (default: createdAt)
 * @query   {string} sortOrder - Sort order: asc or desc (default: desc)
 * @returns {Object} Paginated orders list
 *
 * Example: GET /api/orders?page=1&limit=20&status=Confirmed&sortOrder=asc
 * Headers: Authorization: Bearer $TOKEN
 */
router.get('/', authMiddleware, rbac([ROLES.ADMIN]), orderController.getAllOrders);

export default router;
