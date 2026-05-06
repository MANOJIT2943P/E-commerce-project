/**
 * Cart model for user shopping cart
 * Stores user's cart items with product references
 * One cart per user
 */

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema(
  {
    // User reference - ensures one cart per user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },

    // Cart items
    items: {
      type: [cartItemSchema],
      default: []
    },

    // Status flags
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for performance
 */
cartSchema.index({ user: 1 }); // User lookup
cartSchema.index({ 'items.product': 1 }); // Product lookup in items
cartSchema.index({ updatedAt: -1 }); // Recent carts

/**
 * Calculate cart totals
 * @returns {Object} { itemCount, totalPrice }
 */
cartSchema.methods.getCartTotals = async function () {
  await this.populate('items.product', 'price');
  
  let totalPrice = 0;
  let itemCount = 0;

  this.items.forEach((item) => {
    if (item.product && item.product.price) {
      totalPrice += item.product.price * item.quantity;
      itemCount += item.quantity;
    }
  });

  return {
    itemCount,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
};

/**
 * Get cart with populated product details
 * @returns {Object} Cart with full product information
 */
cartSchema.methods.getCartWithDetails = async function () {
  await this.populate('items.product', 'name price description imageUrl category brand stock');
  return this;
};

/**
 * Add or update item in cart
 * @param {ObjectId} productId - Product to add
 * @param {Number} quantity - Quantity to add
 * @returns {Object} Updated cart
 */
cartSchema.methods.addItem = async function (productId, quantity) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }

  return this.save();
};

/**
 * Remove item from cart
 * @param {ObjectId} productId - Product to remove
 * @returns {Object} Updated cart
 */
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

/**
 * Clear all items from cart
 * @returns {Object} Updated cart
 */
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

export default mongoose.model('Cart', cartSchema);
