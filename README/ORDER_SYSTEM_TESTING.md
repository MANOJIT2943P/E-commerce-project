# Order System - Testing Guide

## API Testing with cURL / Postman

### Prerequisites
- Backend server running on `http://localhost:5000`
- Valid JWT token (obtained from login)
- Products exist in database
- User has items in cart

## Setup Variables

```bash
# Set these values based on your environment
TOKEN="your-jwt-token-here"
BASE_URL="http://localhost:5000/api/orders"
CART_URL="http://localhost:5000/api/cart"
USER_ID="user-id-from-token"
PRODUCT_ID="product-id-from-database"
ORDER_ID="order-id-from-checkout"
```

## 1. Create/Add Items to Cart

**Command**:
```bash
curl -X POST "$CART_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 2
  }'
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "id": "...",
    "items": [
      {
        "_id": "...",
        "product": {
          "_id": "'$PRODUCT_ID'",
          "name": "Product Name",
          "price": 1500,
          "stock": 100
        },
        "quantity": 2,
        "addedAt": "2025-05-09T10:00:00Z"
      }
    ],
    "totalPrice": 3000,
    "itemCount": 2
  }
}
```

## 2. View Cart

**Command**:
```bash
curl -X GET "$CART_URL" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "cart": {
    "id": "...",
    "items": [...],
    "totalPrice": 3000,
    "itemCount": 2
  }
}
```

## 3. Checkout (Create Order)

### Test Case 1: Successful Checkout

**Command**:
```bash
curl -X POST "http://localhost:5000/api/orders/checkout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjJlYjc0NjU3YjRiZDNlM2I5OTk0ZCIsImVtYWlsIjoidGVzdEBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IkFkbWluaXN0cmF0b3IiLCJpYXQiOjE3NzgzMzgxMTgsImV4cCI6MTc3ODk0MjkxOCwiYXVkIjoiZWNvbW1lcmNlLXVzZXJzIiwiaXNzIjoiZWNvbW1lcmNlLWFwaSIsInN1YiI6IjY5ZjJlYjc0NjU3YjRiZDNlM2I5OTk0ZCJ9.mqcrxqAa9PHAM_JI2_88dL93SYwPBe0jnRv6OI3XRO4" \
  -H "Content-Type: application/json" \
  -d '{
    "customerContact": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210"
    },
    "shippingAddress": {
      "addressLine1": "123 Main Street, Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India"
    },
    "paymentMethod": "CARD"
  }'
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "99439011",
    "user": "'$USER_ID'",
    "items": [
      {
        "product": "'$PRODUCT_ID'",
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
      "addressLine1": "123 Main Street, Apartment 4B",
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
    "createdAt": "2025-05-09T10:00:00.000Z",
    "updatedAt": "2025-05-09T10:00:00.000Z"
  }
}
```

### Test Case 2: Empty Cart

**Steps**:
1. Clear cart first: `DELETE $CART_URL/items/{productId}`
2. Try checkout

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Your cart is empty. Cannot proceed with checkout."
}
```

### Test Case 3: Insufficient Stock

**Command** (with quantity > available stock):
```bash
curl -X POST "$CART_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 10000
  }'

# Then checkout
curl -X POST "$BASE_URL/checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Insufficient stock for the following items: \"Product Name\" (Available: 100, Requested: 10000)",
  "insufficientStockItems": [
    {
      "productId": "'$PRODUCT_ID'",
      "productName": "Product Name",
      "availableStock": 100,
      "requestedQuantity": 10000
    }
  ]
}
```

### Test Case 4: Missing Required Fields

**Command** (without customerContact):
```bash
curl -X POST "$BASE_URL/checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {...},
    "paymentMethod": "CARD"
  }'
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Customer contact information (fullName, email, phone) is required"
}
```

## 4. Get Single Order

**Command**:
```bash
curl -X GET "$BASE_URL/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "99439011",
    "user": "'$USER_ID'",
    "items": [...],
    "customerContact": {...},
    "shippingAddress": {...},
    "paymentMethod": "CARD",
    "paymentStatus": "Paid",
    "orderStatus": "Pending",
    "totalAmount": 3000,
    "itemCount": 2,
    "createdAt": "2025-05-09T10:00:00.000Z",
    "updatedAt": "2025-05-09T10:00:00.000Z"
  }
}
```

### Test Case: Unauthorized Access (User viewing another user's order)

**Setup**: Get another user's order ID

**Command**:
```bash
curl -X GET "$BASE_URL/OTHER_USER_ORDER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "message": "You do not have permission to view this order"
}
```

### Test Case: Invalid Order ID

**Command**:
```bash
curl -X GET "$BASE_URL/invalid-id-format" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid order ID format"
}
```

## 5. Get User's Order History

**Command - Default Pagination**:
```bash
curl -X GET "$BASE_URL/my-orders" \
  -H "Authorization: Bearer $TOKEN"
```

**Command - Custom Pagination**:
```bash
curl -X GET "$BASE_URL/my-orders?page=2&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Command - Filter by Status**:
```bash
curl -X GET "$BASE_URL/my-orders?status=Pending" \
  -H "Authorization: Bearer $TOKEN"

curl -X GET "$BASE_URL/my-orders?status=Delivered&limit=10&page=1" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
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
      "user": "'$USER_ID'",
      "items": [...],
      "customerContact": {...},
      "shippingAddress": {...},
      "paymentMethod": "CARD",
      "paymentStatus": "Paid",
      "orderStatus": "Pending",
      "totalAmount": 3000,
      "itemCount": 2,
      "createdAt": "2025-05-09T10:00:00.000Z",
      "updatedAt": "2025-05-09T10:00:00.000Z"
    },
    // ... more orders
  ]
}
```

## 6. Get All Orders (Admin Only)

**Command - Default**:
```bash
curl -X GET "http://localhost:5000/api/orders" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Command - With Filters and Sorting**:
```bash
curl -X GET "http://localhost:5000/api/orders?page=1&limit=20&status=Confirmed&sortBy=totalAmount&sortOrder=desc" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response** (200 OK):
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

### Test Case: Non-Admin Access

**Command**:
```bash
curl -X GET "http://localhost:5000/api/orders" \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "message": "You do not have the required role to access this resource"
}
```

## Verification Checklist

After checkout, verify:

✅ **Cart was cleared**:
```bash
curl -X GET "$CART_URL" \
  -H "Authorization: Bearer $TOKEN"
# Should show items: []
```

✅ **Product stock was reduced**:
```bash
curl -X GET "http://localhost:5000/api/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"
# stock should be reduced by order quantity
```

✅ **Order exists in database**:
```bash
curl -X GET "$BASE_URL/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Order appears in history**:
```bash
curl -X GET "$BASE_URL/my-orders" \
  -H "Authorization: Bearer $TOKEN"
# Should contain the new order
```

## MongoDB Transaction Verification

To verify transaction behavior in case of failure:

1. **Intentional Stock Failure Test**:
   - Set a product stock to 0
   - Try to checkout with that product
   - Verify: Order NOT created, Cart NOT cleared, Stock NOT reduced

2. **Intentional Cart Mismatch**:
   - Add item to cart
   - Delete the product from database
   - Try to checkout
   - Verify: Order NOT created, Cart NOT cleared

## Performance Testing

**Test concurrent checkouts**:
```bash
# This simulates 10 concurrent checkout requests
for i in {1..10}; do
  curl -X POST "$BASE_URL/checkout" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{...}' &
done
wait
```

All should succeed with no race conditions due to transactions.

## Frontend Integration (Reference Only)

When integrating with frontend, the checkout endpoint URL should be:
```
POST http://localhost:5000/api/orders/checkout
```

Example frontend code (for reference - NOT part of this backend implementation):
```javascript
async function checkout(orderData) {
  const response = await fetch('http://localhost:5000/api/orders/checkout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
}
```

## Troubleshooting Common Issues

### "Missing token" error
- Ensure `Authorization: Bearer TOKEN` header is included
- Token format must be exactly: `Bearer <space> token`

### "Product not found" during checkout
- Product was deleted after adding to cart
- Verify product exists: `curl -X GET "http://localhost:5000/api/products/{id}" -H "Authorization: Bearer $TOKEN"`

### "Insufficient stock" when stock looks available
- Another order was placed simultaneously (race condition)
- MongoDB transactions should prevent this, verify MongoDB version supports transactions

### Cart not clearing after checkout
- Check transaction commit succeeded (no error response)
- Verify cart clearing logic in controller
- Check MongoDB session is valid

### Order total incorrect
- Check backend is calculating total, not using frontend value
- Verify product prices haven't changed since cart was created

