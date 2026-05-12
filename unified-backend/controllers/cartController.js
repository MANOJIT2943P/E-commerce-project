/**
 * Cart Controller
 * Handles cart operations: fetch, add item, remove item, clear cart
 * User must be authenticated for all cart operations
 */

import mongoose from 'mongoose';
import { PRODUCT_MESSAGES } from '../constants/messages.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * GET /api/cart
 * Get current user's cart with populated product details
 * @access Protected (Authenticated users only)
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Set by auth middleware

    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create empty cart for new user
      cart = new Cart({
        user: userId,
        items: []
      });
      await cart.save();
    }

    // Populate product details
    await cart.populate('items.product', 'name price description imageUrl category brand stock');

    // Calculate totals inline from already-populated data
    let totalPrice = 0;
    let itemCount = 0;
    cart.items.forEach((item) => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
        itemCount += item.quantity;
      }
    });
    const totals = { itemCount, totalPrice: parseFloat(totalPrice.toFixed(2)) };

    res.status(200).json({
      success: true,
      cart: {
        id: cart._id,
        user: cart.user,
        items: cart.items.map((item) => ({
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            description: item.product.description,
            imageUrl: item.product.imageUrl,
            category: item.product.category,
            brand: item.product.brand,
            stock: item.product.stock
          },
          quantity: item.quantity,
          subtotal: parseFloat((item.product.price * item.quantity).toFixed(2)),
          addedAt: item.addedAt
        })),
        totals
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
};

/**
 * POST /api/cart
 * Add item to cart or update quantity if item already exists
 * @access Protected (Authenticated users only)
 * @body {productId, quantity}
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // Set by auth middleware
    const { productId: rawProductId, quantity: rawQuantity } = req.body;

    const productId =
      typeof rawProductId === 'string' ? rawProductId.trim() : String(rawProductId || '').trim();
    const quantity = Number.parseInt(String(rawQuantity), 10);

    if (!productId || !Number.isFinite(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({
        success: false,
        message: `${PRODUCT_MESSAGES.PRODUCT_NOT_FOUND} No product exists with this id.`,
        code: 'PRODUCT_NOT_IN_CATALOG'
      });
    }

    if (product.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          'This product exists in the database but is deactivated (isActive: false), so it cannot be added to the cart. Set isActive to true in MongoDB or via the admin panel.',
        code: 'PRODUCT_INACTIVE'
      });
    }

    const availableStock =
      typeof product.stock === 'number' && !Number.isNaN(product.stock) ? product.stock : 0;

    // Check stock availability
    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} items available in stock`,
        availableStock
      });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    // Add or update item
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${availableStock - existingItem.quantity} additional items available`,
          currentQuantity: existingItem.quantity,
          availableToAdd: availableStock - existingItem.quantity
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    // Save cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price description imageUrl category brand stock');

    // Calculate totals inline from already-populated data
    let totalPrice = 0;
    let itemCount = 0;
    cart.items.forEach((item) => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
        itemCount += item.quantity;
      }
    });
    const totals = { itemCount, totalPrice: parseFloat(totalPrice.toFixed(2)) };

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        id: cart._id,
        items: cart.items.map((item) => ({
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl
          },
          quantity: item.quantity,
          subtotal: parseFloat((item.product.price * item.quantity).toFixed(2))
        })),
        totals
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart'
    });
  }
};

/**
 * DELETE /api/cart/items/:productId
 * Remove specific item from cart
 * @access Protected (Authenticated users only)
 * @param {productId} - Product ID to remove from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id; // Set by auth middleware
    const { productId } = req.params;

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find and remove item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);

    // Save updated cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price description imageUrl category brand stock');

    // Calculate totals inline from already-populated data
    let totalPrice = 0;
    let itemCount = 0;
    cart.items.forEach((item) => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
        itemCount += item.quantity;
      }
    });
    const totals = { itemCount, totalPrice: parseFloat(totalPrice.toFixed(2)) };

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        id: cart._id,
        items: cart.items.map((item) => ({
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl
          },
          quantity: item.quantity,
          subtotal: parseFloat((item.product.price * item.quantity).toFixed(2))
        })),
        totals
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart'
    });
  }
};

/**
 * PATCH /api/cart/items/:productId
 * Update quantity of specific item in cart
 * @access Protected (Authenticated users only)
 * @param {productId} - Product ID to update
 * @body {quantity} - New quantity
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id; // Set by auth middleware
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Check if product exists and get stock info
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Check stock availability
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
        availableStock: product.stock
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find and update item
    const item = cart.items.find((item) => item.product.toString() === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    item.quantity = quantity;

    // Save updated cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price description imageUrl category brand stock');

    // Calculate totals inline from already-populated data
    let totalPrice = 0;
    let itemCount = 0;
    cart.items.forEach((item) => {
      if (item.product && item.product.price) {
        totalPrice += item.product.price * item.quantity;
        itemCount += item.quantity;
      }
    });
    const totals = { itemCount, totalPrice: parseFloat(totalPrice.toFixed(2)) };

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart: {
        id: cart._id,
        items: cart.items.map((item) => ({
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl
          },
          quantity: item.quantity,
          subtotal: parseFloat((item.product.price * item.quantity).toFixed(2))
        })),
        totals
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item'
    });
  }
};

/**
 * DELETE /api/cart
 * Clear entire cart
 * @access Protected (Authenticated users only)
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id; // Set by auth middleware

    // Find cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear items
    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        id: cart._id,
        items: [],
        totals: {
          itemCount: 0,
          totalPrice: 0
        }
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
};
