# Order/Checkout System - Implementation Guide

## Overview

A complete backend-only order and checkout system has been implemented for the e-commerce platform. The system uses **MongoDB transactions** to ensure data consistency and prevent partial failures.

## Architecture

### New Files Created

1. **`models/Order.js`** - Order data model with snapshots
2. **`controllers/orderController.js`** - Checkout and order retrieval logic
3. **`routes/orderRoutes.js`** - API route definitions
4. **`app.js`** - Updated to register order routes

### Technology Stack

- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose
- **Transactions**: MongoDB sessions for ACID compliance
- **Authentication**: JWT-based auth middleware
- **Authorization**: Role-based access control (RBAC)

## Data Models

### Order Schema Structure

```
Order {
  user: ObjectId (ref: User)           // User who placed order
  items: [{                            // Product snapshots at order time
    product: ObjectId (ref: Product)
    productName: String
    quantity: Number
    priceSnapshot: Number              // Price at time of order
  }]
  customerContact: {
    fullName: String
    email: String
    phone: String
  }
  shippingAddress: {
    addressLine1: String
    city: String
    state: String
    postalCode: String
    country: String
  }
  paymentMethod: String                // CARD|UPI|WALLET|BANK_TRANSFER|COD
  paymentStatus: String                // Pending|Paid|Failed
  orderStatus: String                  // Pending|Confirmed|Processing|Shipped|Delivered|Cancelled
  totalAmount: Number                  // Calculated on backend
  notes: String (optional)
  cancellationReason: String (optional)
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### 1. Create Order / Checkout

**Endpoint**: `POST /api/orders/checkout`

**Authentication**: Required (Bearer token)

**Description**: Creates an order from the user's cart. Uses MongoDB transaction to ensure atomicity.

**Request Body**:
```json
{
  "customerContact": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  },
  "shippingAddress": {
    "addressLine1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentMethod": "CARD"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "99439011",
    "user": "507f1f77bcf86cd799439010",
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "productName": "Product Name",
        "quantity": 2,
        "priceSnapshot": 1500
      }
    ],
    "customerContact": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210"
    },
    "shippingAddress": {
      "addressLine1": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India"
    },
    "paymentMethod": "CARD",
    "paymentStatus": "Paid",
    "orderStatus": "Pending",
    "totalAmount": 3000,
    "itemCount": 2,
    "createdAt": "2025-05-09T10:00:00Z",
    "updatedAt": "2025-05-09T10:00:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request** - Empty cart:
```json
{
  "success": false,
  "message": "Your cart is empty. Cannot proceed with checkout."
}
```

**400 Bad Request** - Product not available:
```json
{
  "success": false,
  "message": "One or more items in your cart are no longer available. Please update your cart."
}
```

**400 Bad Request** - Insufficient stock:
```json
{
  "success": false,
  "message": "Insufficient stock for the following items: \"Product Name\" (Available: 2, Requested: 5)",
  "insufficientStockItems": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Product Name",
      "availableStock": 2,
      "requestedQuantity": 5
    }
  ]
}
```

**400 Bad Request** - Missing required fields:
```json
{
  "success": false,
  "message": "Customer contact information (fullName, email, phone) is required"
}
```

**Checkout Process Flow**:
1. ✅ Validate request body (required fields)
2. ✅ Start MongoDB transaction
3. ✅ Fetch user's cart with product details
4. ✅ Validate cart is not empty
5. ✅ Validate all products exist
6. ✅ Validate stock availability for all items
7. ✅ Calculate total amount on backend
8. ✅ Create order document
9. ✅ Reduce product stock quantities
10. ✅ Clear user's cart
11. ✅ Commit transaction
12. ✅ Return success response

**Transaction Guarantee**: If ANY step fails, the entire transaction is rolled back:
- Order is NOT created
- Stock is NOT reduced
- Cart is NOT cleared

### 2. Get Single Order

**Endpoint**: `GET /api/orders/:id`

**Authentication**: Required (Bearer token)

**Description**: Fetch a specific order by ID. Users can only view their own orders (unless admin).

**Path Parameters**:
- `id` (string, required): MongoDB ObjectId of the order

**Success Response** (200 OK):
```json
{
  "success": true,
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "99439011",
    "user": "507f1f77bcf86cd799439010",
    "items": [...],
    "customerContact": {...},
    "shippingAddress": {...},
    "paymentMethod": "CARD",
    "paymentStatus": "Paid",
    "orderStatus": "Pending",
    "totalAmount": 3000,
    "itemCount": 2,
    "createdAt": "2025-05-09T10:00:00Z",
    "updatedAt": "2025-05-09T10:00:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request** - Invalid order ID:
```json
{
  "success": false,
  "message": "Invalid order ID format"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Order not found"
}
```

**403 Forbidden** - Unauthorized access:
```json
{
  "success": false,
  "message": "You do not have permission to view this order"
}
```

### 3. Get User's Order History

**Endpoint**: `GET /api/orders/my-orders`

**Authentication**: Required (Bearer token)

**Description**: Fetch all orders for the authenticated user with pagination support.

**Query Parameters**:
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 10, max: 100): Items per page
- `status` (string, optional): Filter by order status (Pending|Confirmed|Processing|Shipped|Delivered|Cancelled)

**Example Requests**:
```
GET /api/orders/my-orders
GET /api/orders/my-orders?page=2&limit=20
GET /api/orders/my-orders?status=Confirmed&limit=10
GET /api/orders/my-orders?page=1&limit=5&status=Delivered
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalOrders": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "orders": [
    {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "99439011",
      "user": "507f1f77bcf86cd799439010",
      "items": [...],
      "customerContact": {...},
      "shippingAddress": {...},
      "paymentMethod": "CARD",
      "paymentStatus": "Paid",
      "orderStatus": "Pending",
      "totalAmount": 3000,
      "itemCount": 2,
      "createdAt": "2025-05-09T10:00:00Z",
      "updatedAt": "2025-05-09T10:00:00Z"
    },
    // ... more orders
  ]
}
```

### 4. Get All Orders (Admin Only)

**Endpoint**: `GET /api/orders`

**Authentication**: Required (Bearer token with ADMIN role)

**Description**: Fetch all orders in the system (admin only). Supports filtering and sorting.

**Query Parameters**:
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Items per page
- `status` (string, optional): Filter by order status
- `sortBy` (string, default: createdAt): Field to sort by
- `sortOrder` (string, default: desc): Sort order (asc|desc)

**Example Requests**:
```
GET /api/orders?page=1&limit=20
GET /api/orders?status=Confirmed&sortOrder=asc
GET /api/orders?sortBy=totalAmount&sortOrder=desc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "limit": 20,
    "totalOrders": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "orders": [...]
}
```

**Error Response** - Non-admin user:
```json
{
  "success": false,
  "message": "You do not have the required role to access this resource"
}
```

## Key Features

### 1. **Atomicity with MongoDB Transactions**

The checkout process uses MongoDB sessions to ensure all-or-nothing semantics:
```javascript
// Start transaction
session = await mongoose.startSession();
session.startTransaction();

try {
  // All operations use the session
  // If any operation fails, entire transaction is rolled back
  await order.save({ session });
  await Product.findByIdAndUpdate(..., { session });
  await Cart.findByIdAndUpdate(..., { session });
  
  // Commit only if all succeed
  await session.commitTransaction();
} catch (error) {
  // Rollback on any error
  await session.abortTransaction();
}
```

### 2. **Stock Validation Before Creating Order**

- Validates all products exist
- Checks stock availability for each item
- Returns detailed error messages if stock is insufficient
- Ensures stock is only reduced after all validations pass

### 3. **Price Snapshots**

Orders store price snapshots at the time of purchase:
- If product price changes later, order records the original price paid
- Enables accurate historical records and analytics
- Prevents disputes about pricing

### 4. **Address & Contact Snapshots**

User contact and shipping address are captured as snapshots:
- User can update their profile without affecting past orders
- Maintains accurate delivery records
- Supports multi-address shipping in future

### 5. **Cart Clearing After Order**

After successful order creation:
- User's cart is automatically cleared
- User can start adding items for next order immediately
- Cart clearing is part of transaction (never partially cleared)

### 6. **Backend-Only Total Calculation**

Total amount is **ALWAYS calculated on backend**:
```javascript
let totalAmount = 0;
for (const cartItem of cartItems) {
  const itemTotal = cartItem.product.price * cartItem.quantity;
  totalAmount += itemTotal;
}
totalAmount = parseFloat(totalAmount.toFixed(2));
```

Never trust frontend calculations - backend recalculates from scratch.

### 7. **Simulated Payment**

Payment is simulated as successful by default:
```javascript
paymentStatus: 'Paid'  // Automatically set to Paid
```

For real payment integration, replace with actual Razorpay/Stripe API calls.

### 8. **RBAC Integration**

- Regular users: Can create orders, view only their own orders, view order history
- Admins: Can view all orders, filter, sort, and manage all orders
- Uses existing RBAC middleware for authorization

## Integration with Existing Systems

### Cart System
- Fetches cart items using existing Cart model
- Validates cart items exist and have stock
- Clears cart after successful checkout

### Product System
- References existing Product model
- Validates product existence
- Checks stock availability (existing `stock` field)
- Reduces stock after order creation

### Auth System
- Uses existing JWT auth middleware
- Integrates with user authentication
- Admin access control via RBAC

## Error Handling

### Validation Errors (400)
- Empty cart
- Missing required fields
- Products not found
- Insufficient stock
- Invalid order ID format

### Authentication Errors (401)
- No token provided
- Invalid/expired token
- User account inactive

### Authorization Errors (403)
- User trying to view another user's order
- Non-admin trying to access admin endpoint

### Server Errors (500)
- Database connection issues
- Transaction failures
- Unexpected errors

## Testing the Checkout Flow

### Prerequisites
1. User is authenticated (has valid JWT token)
2. User has items in cart
3. Products exist in database with sufficient stock

### Test Steps

**Step 1**: Add items to cart
```bash
POST /api/cart
Headers: Authorization: Bearer $TOKEN
Body: {
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 2
}
```

**Step 2**: View cart
```bash
GET /api/cart
Headers: Authorization: Bearer $TOKEN
```

**Step 3**: Checkout
```bash
POST /api/orders/checkout
Headers: Authorization: Bearer $TOKEN
Body: {
  "customerContact": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  },
  "shippingAddress": {
    "addressLine1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentMethod": "CARD"
}
```

**Step 4**: View order
```bash
GET /api/orders/507f1f77bcf86cd799439011
Headers: Authorization: Bearer $TOKEN
```

**Step 5**: View order history
```bash
GET /api/orders/my-orders?page=1&limit=10
Headers: Authorization: Bearer $TOKEN
```

## Database Indexes

Orders are indexed for optimal query performance:
- User lookup: `{ user: 1, createdAt: -1 }`
- Status filtering: `{ orderStatus: 1 }`
- Payment status: `{ paymentStatus: 1 }`
- Recent orders: `{ createdAt: -1 }`
- Product in order: `{ 'items.product': 1 }`

## Payment Integration (Future)

To integrate with Razorpay or Stripe:

1. Modify `paymentStatus` initialization in checkout:
```javascript
// Call payment API
const paymentResponse = await razorpay.payments.create({...});

// Set status based on response
order.paymentStatus = paymentResponse.status === 'captured' ? 'Paid' : 'Pending';
```

2. Add webhook handlers for payment confirmations

3. Add order status update endpoints for payment callbacks

## Environment Configuration

Ensure MongoDB connection string supports transactions:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ecommerce
```

## Performance Considerations

1. **Indexes**: All frequently queried fields are indexed
2. **Population**: Only necessary fields are populated
3. **Pagination**: Implements limit/offset for large datasets
4. **Transactions**: Kept minimal to reduce lock contention
5. **Snapshot Storage**: Prevents N+1 queries in future

## Security Considerations

1. **Authentication**: All endpoints require JWT token
2. **Authorization**: RBAC enforces role-based access
3. **Price Verification**: Total calculated on backend only
4. **SQL Injection**: Mongoose prevents injection attacks
5. **Data Validation**: All inputs validated before processing
6. **Transaction Safety**: Atomic operations prevent race conditions

## Troubleshooting

### "Cart is empty" error
- Ensure items are added to cart before checkout
- Check cart endpoint: `GET /api/cart`

### "Insufficient stock" error
- Check available product stock: `GET /api/products/:id`
- Reduce quantity in request or choose different product

### "User not found" error (400)
- Ensure valid JWT token is provided
- Token may have expired, login again

### "You do not have permission" error (403)
- Users can only view their own orders
- Only admins can view all orders

### Transaction failures
- Check MongoDB server is running
- Ensure MongoDB Atlas cluster supports transactions (M2+)
- Check network connectivity to database

## File Structure

```
unified-backend/
├── models/
│   ├── Order.js              ✅ NEW
│   ├── Cart.js
│   ├── Product.js
│   └── User.js
├── controllers/
│   ├── orderController.js    ✅ NEW
│   ├── cartController.js
│   ├── productController.js
│   └── authController.js
├── routes/
│   ├── orderRoutes.js        ✅ NEW
│   ├── cartRoutes.js
│   ├── productRoutes.js
│   └── authRoutes.js
├── middleware/
│   ├── auth.js
│   └── rbac.js
├── app.js                    ✅ UPDATED
└── server.js
```

## Success Criteria Checklist

✅ Order model with all required fields
✅ MongoDB transaction support in checkout
✅ Validation: cart not empty
✅ Validation: all products exist
✅ Validation: sufficient stock
✅ Backend-only total calculation
✅ Stock reduction after order creation
✅ Cart clearing after order creation
✅ Transaction rollback on failure
✅ GET single order endpoint
✅ GET user's order history endpoint
✅ GET all orders (admin) endpoint
✅ Auth middleware integration
✅ RBAC middleware integration
✅ Error handling and validation
✅ Comprehensive API documentation
✅ No frontend code (backend-only)

