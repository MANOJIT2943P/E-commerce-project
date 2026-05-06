# Testing Guide - Unified Backend (Current State)

**Last Updated:** 2026-05-05  
**Backend Version:** 1.1.0  
**Status:** ✅ MongoDB Connected | ✅ JWT Auth Active | ✅ Cart System Implemented | ⚠️ Cloudinary Configured (see setup)

---

## 📋 Manual API Testing Guide

Complete testing guide for the unified e-commerce backend API. Use `curl`, Postman, or VS Code REST Client.

### Prerequisites
- Backend running on `http://localhost:5000`
- MongoDB connected and operational
- Cloudinary environment variables configured (optional for image uploads)
- Always include `Authorization: Bearer $TOKEN` header for protected routes

---

## �️ Public Product Endpoints (NO AUTH REQUIRED)

All users can browse products without authentication. Perfect for product listings, search, and filtering.

### 1. Get All Products

```bash
curl -X GET http://localhost:5000/api/products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field with optional `-` prefix (e.g., `price`, `-createdAt`, `name`)
- `category` - Filter by category
- `brand` - Filter by brand
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Full-text search in name and description

**Examples:**
```bash
# Get first page
curl http://localhost:5000/api/products

# Get page 2 with 20 items per page
curl "http://localhost:5000/api/products?page=2&limit=20"

# Sort by price (low to high)
curl "http://localhost:5000/api/products?sort=price"

# Sort by price (high to low)
curl "http://localhost:5000/api/products?sort=-price"

# Filter by category
curl "http://localhost:5000/api/products?category=Electronics"

# Price range filter
curl "http://localhost:5000/api/products?minPrice=100&maxPrice=1000"

# Search products
curl "http://localhost:5000/api/products?search=iphone"

# Combined filters
curl "http://localhost:5000/api/products?search=phone&category=Electronics&sort=-price&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "description": "Latest Apple flagship",
      "price": 999.99,
      "category": "Electronics",
      "brand": "Apple",
      "stock": 50,
      "imageUrl": "/images/product_12345.jpg",
      "hasStock": true,
      "createdAt": "2026-02-25T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Single Product Details

```bash
curl -X GET http://localhost:5000/api/products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone with advanced features",
    "price": 999.99,
    "category": "Electronics",
    "brand": "Apple",
    "stock": 50,
    "imageUrl": "/images/product_12345.jpg",
    "images": [
      "/images/product_12345.jpg",
      "/images/product_12345_alt.jpg"
    ],
    "hasStock": true,
    "metadata": {
      "color": "Space Gray",
      "storage": "256GB"
    },
    "createdAt": "2026-02-25T10:00:00Z",
    "updatedAt": "2026-02-25T11:00:00Z"
  }
}
```

**Error Response (Product Not Found):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### 3. Get Search Suggestions (Autocomplete)

```bash
curl "http://localhost:5000/api/products/search/suggestions?q=iph&limit=5"
```

**Query Parameters:**
- `q` - Search query (required)
- `limit` - Max suggestions (default: 5, max: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "iPhone 15 Pro Max"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "iPhone 15"
    }
  ]
}
```

---

### 4. Get All Categories

```bash
curl http://localhost:5000/api/products/categories/list
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports"
  ]
}
```

---

### 5. Get All Brands

```bash
curl http://localhost:5000/api/products/brands/list
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Apple",
    "Samsung",
    "Sony",
    "LG",
    "Dell"
  ]
}
```

---

## �🔐 Authentication Endpoints

### 1. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Password Requirements:**
- At least 8 characters
- Contains uppercase letter
- Contains lowercase letter
- Contains number

---

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ecommerce.com",
    "password": "AdminPass123"
  }'
```

**Save token for subsequent requests:**
```bash
# PowerShell
$TOKEN = "eyJhbGc..."

# Bash
export TOKEN="eyJhbGc..."

# Then use in headers: -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get Current User Profile

**Using `/me` endpoint:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Using `/profile` endpoint (alias):**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "isEmailVerified": false,
    "lastLoginAt": "2026-02-25T10:30:00Z",
    "createdAt": "2026-02-25T09:00:00Z"
  }
}
```

---

### 4. Refresh Access Token (Session Persistence)

When your access token expires, use the refresh token (stored in HTTP-only cookie) to get a new one without re-logging in.

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -b "refreshToken=YOUR_REFRESH_TOKEN"
```

**Note:** The refresh token is automatically sent in cookies. Frontend handles this automatically via axios interceptor.

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**When to use:** Automatically called by frontend when access token expires (401 status).

---

### 5. Logout (Single Device)

Log out from current device. Other devices remain logged in.

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -b "refreshToken=YOUR_REFRESH_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**What happens:**
- Refresh token is removed from database
- Refresh token cookie is cleared
- User cannot use refresh token anymore
- Must log in again to access protected routes

---

### 6. Logout All Devices

Log out from all devices at once. All refresh tokens are invalidated.

```bash
curl -X POST http://localhost:5000/api/auth/logout-all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**What happens:**
- All refresh tokens are deleted from database
- All devices are immediately logged out
- All refresh token cookies are cleared
- Must log in again to access protected routes
- Useful for security when password is compromised

---

## 🔄 Session Management Flow

### Complete Session Lifecycle

1. **User Registration/Login**
   - Access Token generated (short-lived: 7 days)
   - Refresh Token generated (long-lived: 7 days)
   - Access Token → stored in frontend localStorage
   - Refresh Token → stored in HTTP-only cookie automatically

2. **Page Refresh (Before Expiration)**
   - Frontend reads access token from localStorage
   - Access token is still valid, no refresh needed
   - User stays logged in

3. **After Access Token Expires**
   - Admin/protected endpoint returns 401
   - Frontend axios interceptor detects 401
   - Automatically calls `/api/auth/refresh-token`
   - New access token is received
   - Original request is retried with new token

4. **User Logout (Single Device)**
   - Call `POST /api/auth/logout`
   - Refresh token removed from database
   - Frontend clears localStorage and redirects to login
   - Other devices can still use their refresh tokens

5. **User Logout All Devices**
   - Call `POST /api/auth/logout-all`
   - All refresh tokens deleted from database
   - All devices are logged out immediately
   - Everyone must re-login

---

## 👨‍💼 Admin Endpoints (Product Management)

### Prerequisites
- **ADMIN role required** - Ensure user has admin privileges
- **Authentication required** - All requests must include valid JWT token
- Admin user seed: `email: admin@ecommerce.com | password: AdminPass123`

---

### 1. Get All Products (Admin View)
```bash
curl -X GET "http://localhost:5000/api/admin/products?page=1&pageSize=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 100)
- `category` - Filter by category
- `brand` - Filter by brand
- `lowStock` - Show items with stock below threshold
- `search` - Search by name/description
- `active` - Filter by status (true/false)

**Response includes:**
- Product details with stock information
- Pagination metadata
- Total product count

---

### 2. Get Product Stock Details
```bash
curl -X GET http://localhost:5000/api/admin/products/PRODUCT_ID/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "stock": 50,
    "minStockLevel": 5,
    "stockStatus": "IN_STOCK"
  }
}
```

---

### 3. Create Product (JSON - No File Upload)
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone with advanced features",
    "price": 999.99,
    "category": "Electronics",
    "brand": "Apple",
    "stock": 50,
    "minStockLevel": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "stock": 50,
    "isActive": true,
    "createdAt": "2026-02-25T10:30:00Z"
  }
}
```

---

### 4. Create Product (Multipart - With Image Upload)
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjJlYjc0NjU3YjRiZDNlM2I5OTk0ZCIsImVtYWlsIjoidGVzdEBlY29tbWVyY2UuY29tIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IkFkbWluaXN0cmF0b3IiLCJpYXQiOjE3Nzc5NTk3MDksImV4cCI6MTc3ODU2NDUwOSwiYXVkIjoiZWNvbW1lcmNlLXVzZXJzIiwiaXNzIjoiZWNvbW1lcmNlLWFwaSIsInN1YiI6IjY5ZjJlYjc0NjU3YjRiZDNlM2I5OTk0ZCJ9.U55ZofvnSrtRMRTMhuuJx2ceiEsNOHZIdtkmcpfajLQ" \
  -F "name=iPhone 15 Pro" \
  -F "description=Latest Apple flagship smartphone" \
  -F "price=999.99" \
  -F "category=Electronics" \
  -F "brand=Apple" \
  -F "stock=50" \
  -F "minStockLevel=5" \
  -F "image="C:\Users\SAGAR\Downloads\new signature ssc.jpeg"
```

**Image Upload Details:**
- Accepts: JPG, PNG, WebP, GIF
- Max size: 5MB (configurable)
- Automatically uploaded to Cloudinary
- Generates `imageUrl` and `imagePublicId` for management

**Response includes:**
```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/...",
    "imagePublicId": "ecommerce/products/abc123",
    "price": 999.99,
    "stock": 50
  }
}
```

---

### 5. Update Product
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Updated description",
    "price": 949.99,
    "stock": 45,
    "isActive": true
  }'
```

**Update with new image:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=iPhone 15 Pro" \
  -F "price=949.99" \
  -F "image=@/path/to/new-image.jpg"
```

**Remove image:**
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deleteImage": true
  }'
```

---

### 6. Restock Product
Increment stock with reason tracking.

```bash
curl -X PATCH http://localhost:5000/api/admin/products/PRODUCT_ID/restock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "reason": "New shipment received from supplier"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product restocked successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "stock": 75,
    "previousStock": 50,
    "restockQuantity": 25
  }
}
```

---

### 7. Delete Product
Soft delete - deactivates product instead of removing.

```bash
curl -X DELETE http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "isActive": false
  }
}
```

---

### 8. Get Inventory Statistics
```bash
curl -X GET http://localhost:5000/api/admin/stats/inventory \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 150,
    "activeProducts": 145,
    "totalInventoryValue": 245789.50,
    "outOfStock": 5,
    "lowStock": 12,
    "averageStockLevel": 42.5
  }
}
```

---

## 📦 Product Schema Reference

The current product model stores the following fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | ✅ | 2-200 characters, indexed for search |
| `description` | String | ❌ | Max 3000 characters |
| `price` | Number | ✅ | Must be ≥ 0 |
| `category` | String | ❌ | Indexed for filtering |
| `brand` | String | ❌ | Indexed for filtering |
| `stock` | Number | ❌ | Default: 0, min: 0 |
| `minStockLevel` | Number | ❌ | Default: 5 (low stock threshold) |
| `images` | Array | ❌ | Array of image URLs |
| `imageUrl` | String | ❌ | Primary image from Cloudinary |
| `imagePublicId` | String | ❌ | Cloudinary ID for deletion |
| `metadata` | Mixed | ❌ | Flexible JSON metadata |
| `createdBy` | ObjectId | ❌ | Admin user who created |
| `updatedBy` | ObjectId | ❌ | Admin user who updated |
| `isActive` | Boolean | ❌ | Default: true |
| `createdAt` | DateTime | ⏱️ | Auto-generated |
| `updatedAt` | DateTime | ⏱️ | Auto-generated |

**Stock Status Methods:**
- `getStockStatus()` - Returns: `OUT_OF_STOCK`, `LOW_STOCK`, or `IN_STOCK`
- `hasStock()` - Returns: `true` if stock > 0
- `isLowStock()` - Returns: `true` if stock < minStockLevel

---

## ✅ Complete Test Scenarios

### Scenario 1: Public Product Browsing (NO AUTH REQUIRED)
Browse products like a regular customer.

```bash
# 1. Get first page of products
curl http://localhost:5000/api/products

# 2. Filter by category
curl "http://localhost:5000/api/products?category=Electronics"

# 3. Apply price range
curl "http://localhost:5000/api/products?category=Electronics&minPrice=100&maxPrice=1000"

# 4. Sort by price (low to high)
curl "http://localhost:5000/api/products?sort=price&minPrice=100&maxPrice=1000"

# 5. Get to next page
curl "http://localhost:5000/api/products?page=2&limit=12"

# 6. Search for specific product
curl "http://localhost:5000/api/products?search=iphone"

# 7. View product details
curl http://localhost:5000/api/products/[PRODUCT_ID]

# 8. Get categories for filter
curl http://localhost:5000/api/products/categories/list

# 9. Get brands for filter
curl http://localhost:5000/api/products/brands/list

# 10. Get autocomplete suggestions
curl "http://localhost:5000/api/products/search/suggestions?q=ip"
```

---

### Scenario 1: Full Product Lifecycle
Create, update, and restock a product.

```bash
# 1. Create Product
PRODUCT_ID=$(curl -s -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "price": 1299.99,
    "stock": 10,
    "category": "Electronics"
  }' | jq -r '.product.id')

echo "Created product: $PRODUCT_ID"

# 2. Update Product
curl -X PUT http://localhost:5000/api/admin/products/$PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1199.99,
    "description": "High-performance laptop"
  }'

# 3. Check Stock
curl -X GET http://localhost:5000/api/admin/products/$PRODUCT_ID/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Restock
curl -X PATCH http://localhost:5000/api/admin/products/$PRODUCT_ID/restock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 20,
    "reason": "Stock arrived"
  }'
```

---

### Scenario 2: Image Upload and Management
Create product with image and update it.

```bash
# 1. Create with image
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Premium Headphones" \
  -F "price=299.99" \
  -F "category=Electronics" \
  -F "stock=30" \
  -F "image=@./headphones.jpg"

# 2. Replace image
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "image=@./new-headphones-image.jpg"

# 3. Remove image
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deleteImage": true
  }'
```

---

### Scenario 3: Search and Filter
Get products by category and search.

```bash
# Get Electronics category
curl -X GET "http://localhost:5000/api/admin/products?category=Electronics&pageSize=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Search by name
curl -X GET "http://localhost:5000/api/admin/products?search=iPhone" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Low stock items
curl -X GET "http://localhost:5000/api/admin/products?lowStock=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Combine filters
curl -X GET "http://localhost:5000/api/admin/products?category=Electronics&brand=Apple&lowStock=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Scenario 4: Role-Based Access Control
Test permission levels.

```bash
# ✅ ADMIN can create products
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99,"stock":10}'

# ❌ Regular user cannot create products
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99,"stock":10}'

# Response: 403 Forbidden - Access denied. Admin privileges required.
```

---

## � Cart Endpoints (User Cart Management)

### Prerequisites
- **AUTHENTICATION REQUIRED** - All cart endpoints require valid JWT token
- User can only access/modify their own cart
- Products must exist and have stock available
- One cart per authenticated user (automatically created on first access)

---

### 1. Get Current User's Cart
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

**Returns:**
- All items in user's cart
- Product details (name, price, image, etc.)
- Item subtotals
- Cart totals (itemCount, totalPrice)

**Response:**
```json
{
  "success": true,
  "cart": {
    "id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "items": [
      {
        "id": "cart-item-001",
        "product": {
          "id": "507f1f77bcf86cd799439013",
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "description": "Latest Apple flagship",
          "imageUrl": "/images/product_12345.jpg",
          "category": "Electronics",
          "brand": "Apple",
          "stock": 50
        },
        "quantity": 2,
        "subtotal": 1999.98,
        "addedAt": "2026-02-25T10:30:00Z"
      }
    ],
    "totals": {
      "itemCount": 2,
      "totalPrice": 1999.98
    }
  }
}
```

---

### 2. Add Item to Cart
Add a new item to cart or increment quantity if item already exists.

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2
  }'
```

**Request Body:**
- `productId` (required) - ObjectId of product
- `quantity` (required) - Quantity to add (must be > 0)

**Behavior:**
- If product already in cart → increase quantity
- If product not in cart → add new item
- Validates product exists and is in stock
- Prevents overselling (checks against stock)

**Response (Success):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "id": "507f1f77bcf86cd799439011",
    "items": [
      {
        "id": "cart-item-001",
        "product": {
          "id": "507f1f77bcf86cd799439011",
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "imageUrl": "/images/product_12345.jpg"
        },
        "quantity": 2,
        "subtotal": 1999.98
      }
    ],
    "totals": {
      "itemCount": 2,
      "totalPrice": 1999.98
    }
  }
}
```

**Error: Stock Not Available**
```json
{
  "success": false,
  "message": "Only 5 items available in stock",
  "availableStock": 5
}
```

**Error: Product Not Found**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### 3. Update Cart Item Quantity
Change quantity of existing cart item.

```bash
curl -X PATCH http://localhost:5000/api/cart/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

**Request Body:**
- `quantity` (required) - New quantity (must be > 0)

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "cart": {
    "id": "507f1f77bcf86cd799439011",
    "items": [
      {
        "id": "cart-item-001",
        "product": {
          "id": "507f1f77bcf86cd799439011",
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "imageUrl": "/images/product_12345.jpg"
        },
        "quantity": 5,
        "subtotal": 4999.95
      }
    ],
    "totals": {
      "itemCount": 5,
      "totalPrice": 4999.95
    }
  }
}
```

---

### 4. Remove Item from Cart
Remove specific product from cart.

```bash
curl -X DELETE http://localhost:5000/api/cart/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "cart": {
    "id": "507f1f77bcf86cd799439011",
    "items": [],
    "totals": {
      "itemCount": 0,
      "totalPrice": 0
    }
  }
}
```

**Error: Item Not in Cart**
```json
{
  "success": false,
  "message": "Item not found in cart"
}
```

---

### 5. Clear Entire Cart
Remove all items from cart at once.

```bash
curl -X DELETE http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "id": "507f1f77bcf86cd799439011",
    "items": [],
    "totals": {
      "itemCount": 0,
      "totalPrice": 0
    }
  }
}
```

---

### 6. Complete Cart Workflow
Full shopping workflow: add items, update quantity, remove item.

```bash
# Step 1: Login (get token)
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo "Logged in. Token: ${TOKEN:0:20}..."

# Step 2: Get initial cart
echo "=== Getting initial cart ==="
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" | jq

# Step 3: Add first product
echo "=== Adding iPhone to cart ==="
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 1
  }' | jq

# Step 4: Add another product
echo "=== Adding Headphones to cart ==="
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439014",
    "quantity": 2
  }' | jq

# Step 5: View cart
echo "=== Viewing updated cart ==="
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" | jq

# Step 6: Increase iPhone quantity
echo "=== Updating iPhone quantity to 3 ==="
curl -X PATCH http://localhost:5000/api/cart/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}' | jq

# Step 7: Remove headphones
echo "=== Removing headphones from cart ==="
curl -X DELETE http://localhost:5000/api/cart/items/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer $TOKEN" | jq

# Step 8: View final cart
echo "=== Final cart state ==="
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🔍 Cart Error Scenarios & Troubleshooting

### Authentication Errors

**Missing Token:**
```bash
curl -X GET http://localhost:5000/api/cart
# Response: 401 Unauthorized - No token provided
```

**Invalid Token:**
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer invalid-token"
# Response: 401 Unauthorized - Invalid token
```

---

### Validation Errors

**Invalid Product ID Format:**
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "invalid-id",
    "quantity": 1
  }'
# Response: 400 - Invalid product ID format
```

**Invalid Quantity:**
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": -5
  }'
# Response: 400 - Quantity must be a positive integer
```

**Missing Required Fields:**
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011"
  }'
# Response: 400 - Product ID and quantity are required
```

---

### Stock Errors

**Insufficient Stock:**
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 1000
  }'
# Response: 400 - Only 50 items available in stock
# availableStock: 50
```

**Cannot Add More Than Stock:**
```bash
# When item already in cart with quantity 45, and total stock is 50
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 10
  }'
# Response: 400 - Cannot add 10 more items. Only 5 additional items available
# currentQuantity: 45
# availableToAdd: 5
```

---

### Resource Not Found

**Product Doesn't Exist:**
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439099",
    "quantity": 1
  }'
# Response: 404 - Product not found
```

**Item Not in Cart:**
```bash
curl -X DELETE http://localhost:5000/api/cart/items/507f1f77bcf86cd799439099 \
  -H "Authorization: Bearer $TOKEN"
# Response: 404 - Item not found in cart
```

---

## 📊 Cart Performance Benchmarks

Typical response times (development environment):

| Endpoint | Method | Typical Time |
|----------|--------|--------------|
| Get Cart | GET | 100-200ms |
| Add to Cart | POST | 150-300ms |
| Update Item | PATCH | 100-200ms |
| Remove Item | DELETE | 100-150ms |
| Clear Cart | DELETE | 100-150ms |

---

## 🔄 Cart Error Scenarios & Troubleshooting


### Authentication Errors

**Missing Token:**
```bash
curl -X GET http://localhost:5000/api/admin/products
# Response: 401 Unauthorized - No token provided
```

**Invalid Token:**
```bash
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer invalid-token"
# Response: 401 Unauthorized - Invalid token
```

---

### Validation Errors

**Required Field Missing:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product"}'
# Response: 400 - Price is required
```

**Invalid Price:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":-10,"stock":5}'
# Response: 400 - Price cannot be negative
```

**Invalid Stock:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":99.99,"stock":-5}'
# Response: 400 - Stock cannot be negative
```

---

### Image Upload Errors

**File Too Large:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Product" \
  -F "price=99.99" \
  -F "image=@./large-file-10mb.jpg"
# Response: 413 - File too large (max 5MB)
```

**Invalid File Type:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "name=Product" \
  -F "price=99.99" \
  -F "image=@./document.pdf"
# Response: 400 - Invalid file type. Only images allowed
```

**Cloudinary Not Configured:**
```bash
# If CLOUDINARY_* env vars missing:
# Response: 400 - Image upload failed: Cloudinary not configured
# Solution: Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env
```

---

### Resource Not Found

**Invalid Product ID:**
```bash
curl -X GET http://localhost:5000/api/admin/products/invalid123/stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Response: 404 - Product not found
```

---

## 📊 Performance Benchmarks

Typical response times (development environment):

| Endpoint | Method | Typical Time |
|----------|--------|--------------|
| Register | POST | 100-200ms |
| Login | POST | 100-200ms |
| Get All Products | GET | 100-300ms |
| Get Product Stock | GET | 50-100ms |
| Create Product (JSON) | POST | 150-300ms |
| Create Product (With Image) | POST | 500-2000ms |
| Update Product | PUT | 150-300ms |
| Restock Product | PATCH | 100-200ms |
| Delete Product | DELETE | 100-200ms |
| Get Inventory Stats | GET | 200-500ms |

---

## 🛡️ Security Testing

### CORS Testing
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Origin: http://different-origin.com" \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Verify it's in CORS_ALLOWED_ORIGINS in .env
```

### Input Sanitization
```bash
# XSS attempt (should be stored safely)
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\");</script>",
    "price": 99.99
  }'

# Stored as literal string - safe
```

### SQL Injection (MongoDB)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com\" OR \"1\"=\"1",
    "password": "anything"
  }'

# Mongoose schema validation prevents injection
```

---

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Terminal where backend is running
# Look for errors in console output
```

### Enable Verbose Curl
```bash
curl -v http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Shows: Request headers, response headers, status code
```

### Decode JWT Token
```bash
# Online: https://jwt.io
# Or use jq (on Linux/Mac):
echo $TOKEN | cut -d '.' -f 2 | tr '_-' '/+' | fold -w 4 | paste -sd '' | base64 -d | jq
```

### Test MongoDB Connection
```bash
# Backend logs should show:
# ✅ MongoDB Connected: [connection-string]
```

### Verify Environment Variables
```bash
# Check .env file exists in unified-backend folder
cat unified-backend/.env

# Should contain:
# MONGODB_URI=...
# JWT_SECRET=...
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

---

## 🚀 Quick Setup Checklist

- [ ] MongoDB connection string in `.env`
- [ ] JWT secret configured in `.env`
- [ ] Admin user seeded (run seedAdminUser.js)
- [ ] Cloudinary credentials in `.env` (optional but recommended)
- [ ] CORS allowed origins configured in `.env`
- [ ] Backend running on port 5000
- [ ] Database indexed properly (fixed duplicate stock index)

---

## 📝 Common Tasks

### Create Test Admin User
```bash
# Run from backend directory
node scripts/seedAdminUser.js
# Credentials: admin@ecommerce.com / AdminPass123
```

### Migrate Roles
```bash
node scripts/migrateRoles.js
```

### List All Products
```bash
curl -X GET "http://localhost:5000/api/admin/products?pageSize=1000" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### Export Products to JSON
```bash
curl -s -X GET "http://localhost:5000/api/admin/products?pageSize=1000" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.products' > products.json
```

---

## 📞 Support

- **Backend Status:** `GET /health`
- **Database:** MongoDB Atlas (check connection in logs)
- **Images:** Cloudinary (configure env vars to enable)
- **Authentication:** JWT-based (7-day expiry)

---

**Version:** 1.1.0  
**Last Updated:** 2026-05-05  
**Tested & Working:** ✅ All endpoints functional with cart system integrated
