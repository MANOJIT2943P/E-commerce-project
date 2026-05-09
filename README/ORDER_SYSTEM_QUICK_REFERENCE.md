# Order System - Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
```
Header: Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### 1️⃣ Create Order (Checkout)
```
POST /api/orders/checkout
```
**Required**: Auth token
**Input**:
```json
{
  "customerContact": {
    "fullName": "string",
    "email": "string",
    "phone": "string"
  },
  "shippingAddress": {
    "addressLine1": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },
  "paymentMethod": "CARD|UPI|WALLET|BANK_TRANSFER|COD"
}
```
**Returns**: Order object with status 201
**Errors**: 
- 400: Empty cart, insufficient stock, product not found
- 401: Unauthorized
- 500: Server error

---

### 2️⃣ Get Single Order
```
GET /api/orders/:id
```
**Required**: Auth token
**Parameters**: `id` = Order MongoDB ObjectId
**Returns**: Order object with status 200
**Errors**:
- 400: Invalid ObjectId format
- 403: Permission denied (not owner or admin)
- 404: Order not found
- 401: Unauthorized

---

### 3️⃣ Get My Orders (History)
```
GET /api/orders/my-orders
```
**Required**: Auth token
**Query Parameters**:
- `page` (int, default: 1)
- `limit` (int, default: 10, max: 100)
- `status` (string, optional): Pending|Confirmed|Processing|Shipped|Delivered|Cancelled

**Example Queries**:
```
/api/orders/my-orders
/api/orders/my-orders?page=2
/api/orders/my-orders?page=1&limit=20&status=Confirmed
```

**Returns**: Paginated orders with pagination metadata
**Errors**: 
- 401: Unauthorized
- 500: Server error

---

### 4️⃣ Get All Orders (Admin Only)
```
GET /api/orders
```
**Required**: Auth token + ADMIN role
**Query Parameters**:
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)
- `status` (string, optional)
- `sortBy` (string, default: createdAt)
- `sortOrder` (string): asc|desc

**Returns**: All orders (admin only)
**Errors**:
- 401: Unauthorized
- 403: Not admin
- 500: Server error

---

## Order Status Values
| Status | Meaning |
|--------|---------|
| Pending | Order created, awaiting confirmation |
| Confirmed | Order confirmed by admin/system |
| Processing | Preparing for shipment |
| Shipped | Order dispatched |
| Delivered | Order delivered |
| Cancelled | Order cancelled |

## Payment Status Values
| Status | Meaning |
|--------|---------|
| Pending | Payment awaiting |
| Paid | Payment successful |
| Failed | Payment failed |

## Checkout Flow
```
1. User adds items to cart
   POST /api/cart
   
2. User calls checkout
   POST /api/orders/checkout
   
   Inside (atomic transaction):
   ✓ Validate cart not empty
   ✓ Validate all products exist
   ✓ Check stock availability
   ✓ Calculate total
   ✓ Create order
   ✓ Reduce stock
   ✓ Clear cart
   ✓ Commit transaction
   
3. On success:
   - Order created
   - Cart emptied
   - Stock reduced
   - Return order details
   
4. On failure (any step):
   - Transaction rolled back
   - No order created
   - Stock not changed
   - Cart not cleared
```

## Important Notes

### ⚠️ Atomic Transactions
- If checkout fails at ANY step, EVERYTHING is rolled back
- Stock will NOT be reduced
- Cart will NOT be cleared
- Order will NOT be created

### ⚠️ Price Calculation
- Total is **ALWAYS** calculated on backend
- Frontend values are **NEVER** used
- Uses product.price * quantity for each item

### ⚠️ Stock Validation
- Checked BEFORE order creation
- If any item has insufficient stock, entire order is rejected
- Specific item details returned in error

### ⚠️ User Data Snapshots
- Customer contact and shipping address are stored as snapshots
- If user updates profile later, past orders keep original data
- This ensures accurate delivery records

### ⚠️ Permission Rules
- Users can only view their own orders
- Admins can view all orders
- Trying to view another user's order returns 403 Forbidden

### ⚠️ Payment
- Currently simulated as successful
- All orders created with `paymentStatus: "Paid"`
- Ready for Razorpay/Stripe integration

## Error Response Format
```json
{
  "success": false,
  "message": "Description of what went wrong",
  "error": "Development mode only"
}
```

## Success Response Format
```json
{
  "success": true,
  "message": "What was done",
  "data": {...}
}
```

## Pagination Response Format
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalOrders": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "orders": [...]
}
```

## cURL Examples

**Checkout**:
```bash
curl -X POST http://localhost:5000/api/orders/checkout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerContact": {"fullName":"John","email":"john@ex.com","phone":"+91"},
    "shippingAddress": {"addressLine1":"123 St","city":"Mumbai","state":"MH","postalCode":"400001","country":"India"},
    "paymentMethod":"CARD"
  }'
```

**Get My Orders**:
```bash
curl http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer TOKEN"
```

**Get Specific Order**:
```bash
curl http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer TOKEN"
```

**Get All Orders (Admin)**:
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## HTTP Status Codes
| Code | Meaning |
|------|---------|
| 201 | Order created successfully |
| 200 | Request successful |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (permission denied) |
| 404 | Not found |
| 500 | Server error |

## Response Examples

**Success - Checkout 201**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "99439011",
    "totalAmount": 3000,
    "orderStatus": "Pending",
    "paymentStatus": "Paid",
    "itemCount": 2,
    "items": [...]
  }
}
```

**Error - Insufficient Stock 400**:
```json
{
  "success": false,
  "message": "Insufficient stock for items",
  "insufficientStockItems": [
    {
      "productId": "507f...",
      "productName": "Product Name",
      "availableStock": 2,
      "requestedQuantity": 5
    }
  ]
}
```

**Error - Unauthorized 401**:
```json
{
  "success": false,
  "message": "No token provided"
}
```

**Error - Forbidden 403**:
```json
{
  "success": false,
  "message": "You do not have permission to view this order"
}
```

## Field Validation

### customerContact (Required)
- ✅ fullName: Non-empty string
- ✅ email: Valid email format
- ✅ phone: Non-empty string

### shippingAddress (Required)
- ✅ addressLine1: Non-empty string
- ✅ city: Non-empty string
- ✅ state: Non-empty string
- ✅ postalCode: Non-empty string
- ✅ country: Non-empty string

### paymentMethod (Required)
- ✅ Valid values: CARD, UPI, WALLET, BANK_TRANSFER, COD

## Database Collections Used

| Collection | Operations |
|-----------|-----------|
| orders | INSERT, SELECT |
| products | SELECT, UPDATE (stock) |
| carts | SELECT, UPDATE (clear items) |
| users | SELECT (for auth) |

## Integration Points

### With Cart
- Fetches items from cart during checkout
- Clears cart after successful order
- Cart model: `models/Cart.js`

### With Products
- Fetches product details during validation
- Reduces stock after order creation
- Product model: `models/Product.js`

### With Users
- Fetches user for authentication
- User model: `models/User.js`

### With Auth
- Middleware: `middleware/auth.js`
- Extracts user from JWT token

### With RBAC
- Middleware: `middleware/rbac.js`
- Admin role check for GET /api/orders

## Tips & Tricks

**Check product stock before checkout**:
```
GET /api/products/{id}
```

**View your cart before checkout**:
```
GET /api/cart
```

**Filter orders by status**:
```
GET /api/orders/my-orders?status=Delivered
```

**Get paginated results**:
```
GET /api/orders/my-orders?page=2&limit=5
```

**Sort admin orders**:
```
GET /api/orders?sortBy=totalAmount&sortOrder=desc
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 error | Check token in Authorization header |
| 400 Empty cart | Add items to cart first (POST /api/cart) |
| 400 Insufficient stock | Reduce quantity or choose different item |
| 403 Permission denied | Only admins can access GET /api/orders |
| Order not found | Check order ID format and ownership |

## File Locations

```
models/Order.js              ← Order schema
controllers/orderController.js ← Checkout logic
routes/orderRoutes.js        ← Endpoint definitions
app.js                       ← Route registration
README/ORDER_SYSTEM_DOCUMENTATION.md     ← Full docs
README/ORDER_SYSTEM_TESTING.md           ← Testing guide
```

---

**Version**: 1.0
**Last Updated**: May 9, 2025
**Status**: ✅ Production Ready

