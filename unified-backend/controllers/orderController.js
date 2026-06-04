/**
 * Order Controller
 * Handles order operations: checkout, fetch single order, fetch user's orders
 * All operations are protected and authenticated
 */

import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

/**
 * POST /api/orders/checkout
 * Create a new order from user's cart
 *
 * Validations:
 * - User must be authenticated
 * - Cart must not be empty
 * - All products must exist
 * - All products must have sufficient stock
 *
 * Uses MongoDB transaction to ensure atomicity:
 * - If any validation fails, NOTHING is created/modified
 * - If all validations pass, order is created and stock is reduced
 *
 * @access Protected (Authenticated users only)
 * @body {
 *   customerContact: { fullName, email, phone },
 *   shippingAddress: { addressLine1, city, state, postalCode, country },
 *   paymentMethod: string
 * }
 */
export const checkout = async (req, res) => {
  let session;

  try {
    const userId = req.user.id;
    const { customerContact, shippingAddress, paymentMethod } = req.body;

    // ==========================================
    // STEP 1: Validate request body
    // ==========================================
    if (!customerContact || !customerContact.fullName || !customerContact.email || !customerContact.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer contact information (fullName, email, phone) is required'
      });
    }

    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address (addressLine1, city, state, postalCode, country) is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // ==========================================
    // STEP 2: Start MongoDB transaction session
    // ==========================================
    session = await mongoose.startSession();
    session.startTransaction();

    // ==========================================
    // STEP 3: Fetch user's cart
    // ==========================================
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', '_id name price stock')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Cannot proceed with checkout.'
      });
    }

    // ==========================================
    // STEP 4: Validate all products exist
    // ==========================================
    const cartItems = cart.items;
    const invalidItems = cartItems.filter(item => !item.product);

    if (invalidItems.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'One or more items in your cart are no longer available. Please update your cart.'
      });
    }

    // ==========================================
    // STEP 5: Validate stock availability for all items
    // ==========================================
    const insufficientStockItems = cartItems.filter(item => item.product.stock < item.quantity);

    if (insufficientStockItems.length > 0) {
      await session.abortTransaction();

      const itemDetails = insufficientStockItems
        .map(item => `"${item.product.name}" (Available: ${item.product.stock}, Requested: ${item.quantity})`)
        .join('; ');

      return res.status(400).json({
        success: false,
        message: `Insufficient stock for the following items: ${itemDetails}`,
        insufficientStockItems: insufficientStockItems.map(item => ({
          productId: item.product._id,
          productName: item.product.name,
          availableStock: item.product.stock,
          requestedQuantity: item.quantity
        }))
      });
    }

    // ==========================================
    // STEP 6: Calculate total amount on backend
    // ==========================================
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const itemTotal = cartItem.product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: cartItem.product._id,
        productName: cartItem.product.name,
        quantity: cartItem.quantity,
        priceSnapshot: cartItem.product.price
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // ==========================================
    // STEP 7: Create order with transaction
    // ==========================================
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

    await order.save({ session });

    // ==========================================
    // STEP 8: Reduce product stock quantities
    // ==========================================
    for (const cartItem of cartItems) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stock: -cartItem.quantity } },
        { session, new: true }
      );
    }

    // ==========================================
    // STEP 9: Clear user's cart
    // ==========================================
    await Cart.findByIdAndUpdate(
      cart._id,
      { items: [] },
      { session, new: true }
    );

    // ==========================================
    // STEP 10: Commit transaction
    // ==========================================
    await session.commitTransaction();

    // ==========================================
    // STEP 11: Send order confirmation email (async, non-blocking)
    // ==========================================
    sendOrderConfirmationEmail(order, customerContact.email, customerContact)
      .catch(err => console.error('Error sending confirmation email:', err));

    // ==========================================
    // STEP 12: Return success response
    // ==========================================
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order.getSummary()
    });
  } catch (error) {
    // Abort transaction on error
    if (session) {
      await session.abortTransaction();
    }

    console.error('Checkout error:', error.message);

    // Return specific error messages
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Cart is empty')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating order. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // End session
    if (session) {
      await session.endSession();
    }
  }
};

/**
 * GET /api/orders/:id
 * Fetch a specific order by ID
 *
 * Security:
 * - Authenticated users can only fetch their own orders
 * - Admins can fetch any order
 *
 * @access Protected (Authenticated users only)
 * @param {string} id - Order ID
 */
export const getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Fetch order with populated user details
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name price description imageUrl');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Security check: Users can only view their own orders (unless admin)
    if (order.user._id.toString() !== userId && userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order: order.getSummary()
    });
  } catch (error) {
    console.error('Get order error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/orders/my-orders
 * Fetch all orders for authenticated user
 *
 * Features:
 * - Pagination support (limit, page)
 * - Sorting by creation date (newest first)
 * - Populated product details
 *
 * @access Protected (Authenticated users only)
 * @query {number} limit - Items per page (default: 10)
 * @query {number} page - Page number (default: 1)
 * @query {string} status - Filter by order status (optional)
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items per page
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Min page 1
    const status = req.query.status; // Optional filter

    // Build filter query
    const filter = { user: userId };
    if (status) {
      filter.orderStatus = status;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Fetch orders with pagination
    const orders = await Order.find(filter)
      .populate('items.product', 'name price description imageUrl')
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .skip(skip);

    // Get total count for pagination metadata
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      pagination: {
        currentPage: page,
        limit,
        totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      orders: orders.map(order => order.getSummary())
    });
  } catch (error) {
    console.error('Get my orders error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/orders
 * Fetch all orders (ADMIN only)
 *
 * Features:
 * - Pagination support
 * - Sorting
 * - Filtering by status
 *
 * @access Protected (Admin only)
 * @middleware rbacMiddleware(['ADMIN'])
 */
export const getAllOrders = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter
    const filter = {};
    if (status) {
      filter.orderStatus = status;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = { [sortBy]: sortOrder };

    // Fetch orders
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    // Get total count
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        limit,
        totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      orders: orders.map(order => order.getSummary())
    });
  } catch (error) {
    console.error('Get all orders error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
