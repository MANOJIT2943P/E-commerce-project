/**
 * Cart Routes
 * All routes are PROTECTED - Authentication required
 * User can only access/modify their own cart
 */

import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/cart
 * @desc    Get current user's cart with all items and totals
 * @access  Private (Authenticated)
 * @returns {Object} Cart with items and calculated totals
 *
 * Example: GET /api/cart
 * Headers: Authorization: Bearer $TOKEN
 */
router.get('/', authMiddleware, cartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Add new item to cart or update quantity if item exists
 * @access  Private (Authenticated)
 * @body    {productId: string, quantity: number}
 * @returns {Object} Updated cart
 *
 * Example: POST /api/cart
 * Body: {"productId": "507f1f77bcf86cd799439011", "quantity": 2}
 * Headers: Authorization: Bearer $TOKEN
 */
router.post('/', authMiddleware, cartController.addToCart);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove specific item from cart by product ID
 * @access  Private (Authenticated)
 * @param   {productId} - ObjectId of product to remove
 * @returns {Object} Updated cart
 *
 * Example: DELETE /api/cart/items/507f1f77bcf86cd799439011
 * Headers: Authorization: Bearer $TOKEN
 */
router.delete('/items/:productId', authMiddleware, cartController.removeFromCart);

/**
 * @route   PATCH /api/cart/items/:productId
 * @desc    Update quantity of specific item in cart
 * @access  Private (Authenticated)
 * @param   {productId} - ObjectId of product to update
 * @body    {quantity: number}
 * @returns {Object} Updated cart
 *
 * Example: PATCH /api/cart/items/507f1f77bcf86cd799439011
 * Body: {"quantity": 5}
 * Headers: Authorization: Bearer $TOKEN
 */
router.patch('/items/:productId', authMiddleware, cartController.updateCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart (remove all items)
 * @access  Private (Authenticated)
 * @returns {Object} Empty cart
 *
 * Example: DELETE /api/cart
 * Headers: Authorization: Bearer $TOKEN
 */
router.delete('/', authMiddleware, cartController.clearCart);

export default router;
