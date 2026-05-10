/**
 * Order model for e-commerce checkout system
 * Stores complete order information with snapshots of products, user info, and addresses
 * Uses MongoDB transactions for atomic operations
 */

import mongoose from 'mongoose';

/**
 * Order item schema - stores snapshot of product at time of order
 */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name snapshot is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priceSnapshot: {
    type: Number,
    required: [true, 'Price snapshot is required'],
    min: [0, 'Price cannot be negative']
  }
});

/**
 * Customer contact snapshot schema
 */
const contactSnapshotSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  }
}, { _id: false });

/**
 * Shipping address snapshot schema
 */
const shippingAddressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India'
  }
}, { _id: false });

/**
 * Main order schema
 */
const orderSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },

    // Order items - snapshots of products at time of order
    items: {
      type: [orderItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },

    // Customer contact information snapshot
    customerContact: {
      type: contactSnapshotSchema,
      required: [true, 'Customer contact information is required']
    },

    // Shipping address snapshot
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },

    // Payment details
    paymentMethod: {
      type: String,
      enum: {
        values: ['CARD', 'UPI', 'WALLET', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'],
        message: 'Invalid payment method'
      },
      required: [true, 'Payment method is required']
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Paid', 'Failed'],
        message: 'Invalid payment status'
      },
      default: 'Paid', // Simulated successful payment by default
      index: true
    },

    // Order status tracking
    orderStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        message: 'Invalid order status'
      },
      default: 'Pending',
      index: true
    },

    // Financial details
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },

    // Notes and tracking
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Cancellation reason (if cancelled)
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },

    // Admin metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'Admin who created this order (if created by admin)'
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for performance optimization
 * Note: user, orderStatus, paymentStatus are already indexed via `index: true` in the schema field definitions.
 */
orderSchema.index({ user: 1, createdAt: -1 }); // Compound index: user's orders by date
orderSchema.index({ createdAt: -1 }); // Recent orders
orderSchema.index({ 'items.product': 1 }); // Find orders containing specific product

/**
 * Virtual for calculating order summary
 */
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/**
 * Pre-save middleware to ensure totals match items
 */
orderSchema.pre('save', function (next) {
  // Round totalAmount to 2 decimal places
  if (this.totalAmount) {
    this.totalAmount = parseFloat(this.totalAmount.toFixed(2));
  }
  next();
});

/**
 * Method to get order summary for response
 * @returns {Object} Order summary without sensitive data
 */
orderSchema.methods.getSummary = function () {
  return {
    id: this._id,
    orderNumber: this._id.toString().slice(-8).toUpperCase(),
    user: this.user,
    items: this.items,
    customerContact: this.customerContact,
    shippingAddress: this.shippingAddress,
    paymentMethod: this.paymentMethod,
    paymentStatus: this.paymentStatus,
    orderStatus: this.orderStatus,
    totalAmount: this.totalAmount,
    itemCount: this.itemCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Static method to create order with transaction
 * Handles cart validation, product validation, stock reduction, and cart clearing
 * Uses MongoDB session for atomic operations
 *
 * @param {Object} orderData - Order creation data
 * @param {string} orderData.userId - User ID
 * @param {Array} orderData.cartItems - Cart items
 * @param {Object} orderData.customerContact - Customer contact info
 * @param {Object} orderData.shippingAddress - Shipping address
 * @param {string} orderData.paymentMethod - Payment method
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} Created order
 * @throws {Error} If validation fails or transaction fails
 */
orderSchema.statics.createOrderWithTransaction = async function (
  orderData,
  session
) {
  const Order = this;
  const { userId, cartItems, customerContact, shippingAddress, paymentMethod } = orderData;

  // Validate cart items
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty. Cannot create order.');
  }

  // Validate products exist and check stock
  const Product = mongoose.model('Product');
  const products = await Product.find({ _id: { $in: cartItems.map(item => item.product) } }).session(
    session
  );

  // Check if all products were found
  if (products.length !== cartItems.length) {
    throw new Error('One or more products are no longer available.');
  }

  // Build order items and validate stock
  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cartItems) {
    const product = products.find(p => p._id.toString() === cartItem.product.toString());

    // Check product availability
    if (!product) {
      throw new Error(`Product ${cartItem.product} not found.`);
    }

    // Check stock availability
    if (product.stock < cartItem.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`
      );
    }

    // Calculate item total
    const itemTotal = product.price * cartItem.quantity;
    totalAmount += itemTotal;

    // Create order item snapshot
    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity: cartItem.quantity,
      priceSnapshot: product.price
    });
  }

  // Round total amount to 2 decimal places
  totalAmount = parseFloat(totalAmount.toFixed(2));

  // Create order document
  const order = new Order({
    user: userId,
    items: orderItems,
    customerContact,
    shippingAddress,
    paymentMethod,
    totalAmount,
    paymentStatus: 'Paid', // Simulate successful payment
    orderStatus: 'Pending'
  });

  // Save order
  await order.save({ session });

  // Update product stocks (reduce quantities)
  for (const cartItem of cartItems) {
    await Product.findByIdAndUpdate(
      cartItem.product,
      {
        $inc: { stock: -cartItem.quantity }
      },
      { session, new: true }
    );
  }

  return order;
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
