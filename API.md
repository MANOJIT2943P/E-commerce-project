# E-Commerce API Documentation

**Base URL:** `http://localhost:5000/api`

**Version:** 1.0.0  
**Last Updated:** May 7, 2026

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Product Endpoints](#product-endpoints)
3. [Cart Endpoints](#cart-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)
7. [Authentication](#authentication)

---

## Authentication Endpoints

All authentication endpoints are **PUBLIC** unless otherwise specified.

### Register User

```
POST /api/auth/register
```

**Description:** Register a new user account

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already registered

---

### Login

```
POST /api/auth/login
```

**Description:** Login user and receive JWT token

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid email or password

---

### Get Current User Profile

```
GET /api/auth/me
```

**Alternative:** `GET /api/auth/profile`

**Description:** Get authenticated user's profile information

**Access:** Private (Requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2026-05-07T10:00:00Z",
    "updatedAt": "2026-05-07T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No token or invalid token
- `404 Not Found` - User not found

---

### Refresh Token

```
POST /api/auth/refresh-token
```

**Description:** Get a new access token using refresh token (stored in cookies)

**Access:** Public (but requires valid refresh token cookie)

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - No refresh token or invalid token
- `403 Forbidden` - Refresh token expired

---

### Logout

```
POST /api/auth/logout
```

**Description:** Logout user from current device

**Access:** Private (Requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Logout All Devices

```
POST /api/auth/logout-all
```

**Description:** Logout user from all devices/sessions

**Access:** Private (Requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## Product Endpoints

All product endpoints are **PUBLIC** and require NO authentication.

### Get All Products

```
GET /api/products
```

**Description:** Get all active products with pagination, sorting, and filtering

**Access:** Public (NO AUTH REQUIRED)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Items per page (max: 100) |
| sort | string | name | Sort field (prefix with `-` for descending, e.g., `-price`) |
| category | string | - | Filter by product category |
| brand | string | - | Filter by brand name |
| minPrice | number | - | Minimum price filter |
| maxPrice | number | - | Maximum price filter |
| search | string | - | Full-text search in name and description |

**Example Requests:**
```
GET /api/products
GET /api/products?page=2&limit=20
GET /api/products?sort=-price&category=electronics
GET /api/products?minPrice=100&maxPrice=1000&sort=name
GET /api/products?search=iphone&brand=Apple
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6934299b0dde4d85e84f3b5e",
      "name": "Smartwatch Pro X",
      "description": "Feature-rich smartwatch with fitness tracking",
      "price": 3999,
      "category": "electronics",
      "brand": "Moojlo",
      "stock": 100,
      "rating": 4.5,
      "imageUrl": "/images/product_123.jpg",
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get Product by ID

```
GET /api/products/:id
```

**Description:** Get detailed information for a single product

**Access:** Public (NO AUTH REQUIRED)

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the product |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6934299b0dde4d85e84f3b5e",
    "name": "Smartwatch Pro X",
    "description": "Feature-rich smartwatch with fitness tracking",
    "price": 3999,
    "category": "electronics",
    "brand": "Moojlo",
    "stock": 100,
    "minStockLevel": 5,
    "rating": 4.5,
    "totalRatings": 82,
    "totalReviews": 5,
    "images": ["/images/product_123.jpg"],
    "imageUrl": "/images/product_123.jpg",
    "metadata": {},
    "isActive": true,
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-05-07T10:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Product not found
- `400 Bad Request` - Invalid product ID format

---

### Get Product Categories

```
GET /api/products/categories/list
```

**Description:** Get all available product categories

**Access:** Public (NO AUTH REQUIRED)

**Response (200 OK):**
```json
{
  "success": true,
  "categories": ["electronics", "fashion", "home", "sports", "beauty"]
}
```

---

### Get Product Brands

```
GET /api/products/brands/list
```

**Description:** Get all available product brands

**Access:** Public (NO AUTH REQUIRED)

**Response (200 OK):**
```json
{
  "success": true,
  "brands": ["Apple", "Samsung", "Moojlo", "Sony", "LG"]
}
```

---

### Get Search Suggestions

```
GET /api/products/search/suggestions
```

**Description:** Get product name suggestions for search autocomplete

**Access:** Public (NO AUTH REQUIRED)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| q | string | - | Search query (required) |
| limit | number | 5 | Max number of suggestions (max: 10) |

**Example:**
```
GET /api/products/search/suggestions?q=iph&limit=5
```

**Response (200 OK):**
```json
{
  "success": true,
  "suggestions": ["iPhone 15", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone SE", "iPhone Charger"]
}
```

---

## Cart Endpoints

All cart endpoints are **PROTECTED** and require authentication.

### Get User's Cart

```
GET /api/cart
```

**Description:** Get authenticated user's cart with all items and totals

**Access:** Private (Authenticated users only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "cart": {
    "id": "69f9e423c87fa6b1d9967ec8",
    "user": "699b4bc8b4f862efef8d5cdc",
    "items": [
      {
        "id": "69fc09a06d69225c2cc93bee",
        "product": {
          "id": "6934299b0dde4d85e84f3b5e",
          "name": "Smartwatch Pro X",
          "price": 3999,
          "description": "Feature-rich smartwatch",
          "imageUrl": "/images/product_123.jpg",
          "category": "electronics",
          "brand": "Moojlo",
          "stock": 100
        },
        "quantity": 2,
        "subtotal": 7998,
        "addedAt": "2026-05-07T10:00:00Z"
      }
    ],
    "totals": {
      "itemCount": 2,
      "totalPrice": 7998
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No token or invalid token
- `500 Internal Server Error` - Server error

---

### Add Item to Cart

```
POST /api/cart
```

**Description:** Add new item to cart or update quantity if item already exists

**Access:** Private (Authenticated users only)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "6934299b0dde4d85e84f3b5e",
  "quantity": 1
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "id": "69f9e423c87fa6b1d9967ec8",
    "items": [
      {
        "id": "69fc09a06d69225c2cc93bee",
        "product": {
          "id": "6934299b0dde4d85e84f3b5e",
          "name": "Smartwatch Pro X",
          "price": 3999,
          "imageUrl": "/images/product_123.jpg"
        },
        "quantity": 1,
        "subtotal": 3999
      }
    ],
    "totals": {
      "itemCount": 1,
      "totalPrice": 3999
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid product ID or quantity
- `404 Not Found` - Product not found
- `400 Bad Request` - Insufficient stock
- `401 Unauthorized` - Not authenticated

---

### Update Cart Item Quantity

```
PATCH /api/cart/items/:productId
```

**Description:** Update quantity of specific item in cart

**Access:** Private (Authenticated users only)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ObjectId of the product |

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item quantity updated successfully",
  "cart": {
    "id": "69f9e423c87fa6b1d9967ec8",
    "items": [
      {
        "id": "69fc09a06d69225c2cc93bee",
        "product": {
          "id": "6934299b0dde4d85e84f3b5e",
          "name": "Smartwatch Pro X",
          "price": 3999,
          "imageUrl": "/images/product_123.jpg"
        },
        "quantity": 5,
        "subtotal": 19995
      }
    ],
    "totals": {
      "itemCount": 5,
      "totalPrice": 19995
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid quantity
- `400 Bad Request` - Insufficient stock
- `404 Not Found` - Item not found in cart

---

### Remove Item from Cart

```
DELETE /api/cart/items/:productId
```

**Description:** Remove specific item from cart

**Access:** Private (Authenticated users only)

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ObjectId of the product to remove |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "cart": {
    "id": "69f9e423c87fa6b1d9967ec8",
    "items": [],
    "totals": {
      "itemCount": 0,
      "totalPrice": 0
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Item not found in cart

---

### Clear Entire Cart

```
DELETE /api/cart
```

**Description:** Remove all items from cart

**Access:** Private (Authenticated users only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "id": "69f9e423c87fa6b1d9967ec8",
    "items": [],
    "totals": {
      "itemCount": 0,
      "totalPrice": 0
    }
  }
}
```

---

## Admin Endpoints

All admin endpoints are **PROTECTED** and require **ADMIN role**.

### Get All Products (Admin View)

```
GET /api/admin/products
```

**Description:** Get all products with detailed stock and admin information

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Items per page (default: 50) |
| category | string | Filter by category |
| brand | string | Filter by brand |
| lowStock | number | Filter products with stock below this level |
| search | string | Search by product name |
| active | boolean | Filter by active status |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6934299b0dde4d85e84f3b5e",
      "name": "Smartwatch Pro X",
      "price": 3999,
      "stock": 100,
      "category": "electronics",
      "brand": "Moojlo",
      "isActive": true,
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalProducts": 50
  }
}
```

---

### Get Product Stock Details

```
GET /api/admin/products/:id/stock
```

**Description:** Get detailed stock information for a product

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

**Response (200 OK):**
```json
{
  "success": true,
  "stock": {
    "productId": "6934299b0dde4d85e84f3b5e",
    "productName": "Smartwatch Pro X",
    "currentStock": 100,
    "minStockLevel": 5,
    "status": "adequate",
    "lastRestocked": "2026-04-20T10:00:00Z"
  }
}
```

---

### Create New Product

```
POST /api/admin/products
```

**Description:** Create a new product with optional image upload

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
name: Smartwatch Pro X
price: 3999
description: Feature-rich smartwatch with fitness tracking
category: electronics
brand: Moojlo
stock: 100
image: <file>  [optional]
```

Or **JSON** (without image):
```json
{
  "name": "Smartwatch Pro X",
  "price": 3999,
  "description": "Feature-rich smartwatch with fitness tracking",
  "category": "electronics",
  "brand": "Moojlo",
  "stock": 100
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "6934299b0dde4d85e84f3b5e",
    "name": "Smartwatch Pro X",
    "price": 3999,
    "description": "Feature-rich smartwatch with fitness tracking",
    "category": "electronics",
    "brand": "Moojlo",
    "stock": 100,
    "imageUrl": "/images/product_123.jpg",
    "isActive": true,
    "createdAt": "2026-05-07T10:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not admin

---

### Update Product

```
PUT /api/admin/products/:id
```

**Description:** Update product details with optional image replacement

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

**Request Body (Form Data):**
```
name: Updated Smartwatch Name [optional]
price: 4999 [optional]
description: Updated description [optional]
category: electronics [optional]
brand: Moojlo [optional]
isActive: true [optional]
image: <file> [optional]
deleteImage: true [query param to remove existing image]
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "6934299b0dde4d85e84f3b5e",
    "name": "Updated Smartwatch Name",
    "price": 4999,
    "category": "electronics",
    "brand": "Moojlo",
    "stock": 100,
    "isActive": true,
    "updatedAt": "2026-05-07T11:00:00Z"
  }
}
```

---

### Delete Product

```
DELETE /api/admin/products/:id
```

**Description:** Delete (deactivate) a product

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Restock Product

```
PATCH /api/admin/products/:id/restock
```

**Description:** Increment product stock (restock operation)

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

**Request Body:**
```json
{
  "quantity": 50,
  "reason": "Supplier shipment received"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product restocked successfully",
  "stock": {
    "previousStock": 100,
    "addedQuantity": 50,
    "newStock": 150,
    "timestamp": "2026-05-07T12:00:00Z"
  }
}
```

---

### Get Inventory Statistics

```
GET /api/admin/stats/inventory
```

**Description:** Get inventory statistics and metrics

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 150,
    "activeProducts": 145,
    "inactiveProducts": 5,
    "totalStock": 5000,
    "lowStockProducts": 12,
    "outOfStockProducts": 3,
    "categoryBreakdown": {
      "electronics": 45,
      "fashion": 50,
      "home": 30,
      "sports": 15,
      "beauty": 10
    }
  }
}
```

---

### Register Admin User

```
POST /api/admin/users/register
```

**Description:** Register a new admin user

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

## Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict (e.g., email already exists) |
| 500 | Internal Server Error - Server error |

### Common Error Messages

| Error | Status | Cause |
|-------|--------|-------|
| No token provided | 401 | Missing Authorization header |
| Invalid token | 401 | Expired or malformed token |
| Access denied. User account is inactive | 403 | User account is deactivated |
| Access denied. Admin role required | 403 | User is not an admin |
| Product not found | 404 | Product ID doesn't exist |
| Only X items available in stock | 400 | Requested quantity exceeds available stock |
| Email already exists | 409 | Email is already registered |

---

## Authentication

### JWT Token

The API uses JWT (JSON Web Tokens) for authentication. 

**Token Format:**
```
Authorization: Bearer <jwt_token>
```

**Token Claims:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "USER" or "ADMIN",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234654290,
  "aud": "ecommerce-users",
  "iss": "ecommerce-api",
  "sub": "user_id"
}
```

**Token Expiration:**
- Access Token: 7 days
- Refresh Token: 30 days (stored in HTTP-only cookies)

### How to Use Tokens

1. **Register** → Get initial token via `/api/auth/register`
2. **Login** → Get token via `/api/auth/login`
3. **Protected Requests** → Include token in Authorization header
4. **Token Expired** → Use refresh token to get new token via `/api/auth/refresh-token`
5. **Logout** → Clear token and session via `/api/auth/logout`

### Example Request with Token

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Future versions may include:
- Per-IP rate limiting
- Per-user rate limiting
- Endpoint-specific limits

---

## CORS Configuration

The API allows requests from the following origins:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`
- `http://localhost:3000`
- Any `localhost` origin (configurable in `.env`)

---

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Current page number (1-indexed, default: 1)
- `limit` or `pageSize`: Items per page (default: 10-50)

**Response Includes:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Sorting

Use the `sort` query parameter to sort results:
- `sort=name` - Ascending order
- `sort=-name` - Descending order (prefix with `-`)

**Supported Sort Fields:**
- `name`
- `price`
- `rating`
- `stock`
- `createdAt`
- `updatedAt`

---

## Filtering

### Product Filtering

- `category` - Filter by category
- `brand` - Filter by brand
- `minPrice` - Minimum price range
- `maxPrice` - Maximum price range
- `search` - Full-text search

### Example Filter Request

```
GET /api/products?category=electronics&minPrice=1000&maxPrice=5000&sort=-price&page=1&limit=20
```

---

## File Upload

### Image Upload (Admin Only)

Supported formats:
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

**Max File Size:** 10MB

**Upload Endpoints:**
- `POST /api/admin/products` - Upload product image
- `PUT /api/admin/products/:id` - Update product image

**Usage:**
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Product Name" \
  -F "price=1000" \
  -F "category=electronics" \
  -F "brand=Brand" \
  -F "stock=50" \
  -F "image=@/path/to/image.jpg"
```

---

## Changelog

### Version 1.0.0 (May 7, 2026)
- Initial API release
- Authentication endpoints
- Product management endpoints
- Cart management endpoints
- Admin management endpoints
- Image upload support (local storage)
- JWT token authentication
- RBAC (Role-Based Access Control)

---

## Support

For issues or questions about the API, please contact:
- Email: support@ecommerce.com
- GitHub: [E-commerce Project Repository]

---

**Last Updated:** May 7, 2026  
**API Version:** 1.0.0
