import api from './api';

/**
 * Cart Service
 * API calls for cart operations
 * All endpoints require authentication (Bearer token)
 */

export const cartService = {
  /**
   * GET /api/cart
   * Fetch current user's cart with all items and totals
   * @returns {Object} { success, cart: { items, totals } }
   */
  getCart: async () => {
    return api.get('/cart').then(res => res.data);
  },

  /**
   * POST /api/cart
   * Add item to cart or update quantity if already exists
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Object} { success, message, cart }
   */
  addToCart: async (productId, quantity) => {
    return api.post('/cart', {
      productId,
      quantity
    }).then(res => res.data);
  },

  /**
   * PATCH /api/cart/items/:productId
   * Update quantity of existing cart item
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Object} { success, message, cart }
   */
  updateCartItem: async (productId, quantity) => {
    return api.patch(`/cart/items/${productId}`, {
      quantity
    }).then(res => res.data);
  },

  /**
   * DELETE /api/cart/items/:productId
   * Remove specific item from cart
   * @param {string} productId - Product ID to remove
   * @returns {Object} { success, message, cart }
   */
  removeFromCart: async (productId) => {
    return api.delete(`/cart/items/${productId}`).then(res => res.data);
  },

  /**
   * DELETE /api/cart
   * Clear entire cart (remove all items)
   * @returns {Object} { success, message, cart }
   */
  clearCart: async () => {
    return api.delete('/cart').then(res => res.data);
  }
};
