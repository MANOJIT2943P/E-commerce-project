# Public Product API Documentation

**Status:** ✅ New feature  
**Last Updated:** 2026-02-25  
**Base URL:** `http://localhost:5000/api/products`  
**Authentication:** None (Public Access)

---

## Overview

The Public Product API allows anyone to browse and search products **without authentication**. This is ideal for:
- Product browsing interfaces
- Search autocomplete features
- Category/brand filtering UI
- Mobile app product catalogs

### Key Features

✅ **Pagination** - Browse products page by page  
✅ **Sorting** - Sort by price, name, date, etc.  
✅ **Filtering** - Filter by category, brand, price range  
✅ **Search** - Full-text search across product names and descriptions  
✅ **Performance** - Optimized MongoDB queries with `.lean()` for speed  
✅ **Security** - Only returns active products, hides admin-only fields  

---

## Endpoints

### 1. Get All Products (with pagination, sorting, filtering)

```
GET /api/products
```

**No authentication required**

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number (starts at 1) |
| `limit` | Number | 10 | Items per page (max: 100) |
| `sort` | String | `-createdAt` | Sort field. Prefix with `-` for descending |
| `category` | String | - | Filter by exact category match |
| `brand` | String | - | Filter by exact brand match |
| `minPrice` | Number | - | Minimum price (inclusive) |
| `maxPrice` | Number | - | Maximum price (inclusive) |
| `search` | String | - | Full-text search in name and description |

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

**Examples:**

```bash
# Get first page (default 10 items)
curl http://localhost:5000/api/products

# Get second page with 20 items per page
curl http://localhost:5000/api/products?page=2&limit=20

# Sort by price ascending
curl http://localhost:5000/api/products?sort=price

# Sort by price descending
curl http://localhost:5000/api/products?sort=-price

# Sort by newest products first (default)
curl http://localhost:5000/api/products?sort=-createdAt

# Filter by category
curl http://localhost:5000/api/products?category=Electronics

# Filter by brand
curl http://localhost:5000/api/products?brand=Apple

# Price range filter
curl http://localhost:5000/api/products?minPrice=100&maxPrice=1000

# Search products
curl http://localhost:5000/api/products?search=iphone

# Combine filters (category + price range + sort)
curl "http://localhost:5000/api/products?category=Electronics&minPrice=500&maxPrice=1500&sort=-price"

# Search + category filter
curl "http://localhost:5000/api/products?search=phone&category=Electronics"

# Complex query
curl "http://localhost:5000/api/products?page=1&limit=20&sort=price&category=Electronics&brand=Apple&minPrice=100"
```

**Sort Field Options:**
- `name` - Sort by product name (A-Z)
- `-name` - Sort by product name (Z-A)
- `price` - Sort by price (low to high)
- `-price` - Sort by price (high to low)
- `stock` - Sort by stock quantity (ascending)
- `-stock` - Sort by stock quantity (descending)
- `createdAt` - Sort by oldest first
- `-createdAt` - Sort by newest first (default)

---

### 2. Get Single Product Details

```
GET /api/products/:id
```

**No authentication required**

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | ✅ Yes | Product ID (MongoDB ObjectId) |

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

**Example:**
```bash
curl http://localhost:5000/api/products/507f1f77bcf86cd799439011
```

**Error Response (Product Not Found):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

Status Code: `404`

---

### 3. Get Search Suggestions (Autocomplete)

```
GET /api/products/search/suggestions
```

**No authentication required**

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | String | ✅ Yes | - | Search query (min 1 character) |
| `limit` | Number | No | 5 | Max suggestions to return (max 10) |

**Use Case:** Autocomplete/search suggestions UI

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

**Examples:**
```bash
# Get suggestions for "iph"
curl http://localhost:5000/api/products/search/suggestions?q=iph

# Get more suggestions (up to 10)
curl http://localhost:5000/api/products/search/suggestions?q=iph&limit=10

# Search for "pro"
curl http://localhost:5000/api/products/search/suggestions?q=pro&limit=5
```

---

### 4. Get All Categories

```
GET /api/products/categories/list
```

**No authentication required**

**Query Parameters:** None

**Use Case:** Populate category filter dropdown in UI

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

**Example:**
```bash
curl http://localhost:5000/api/products/categories/list
```

---

### 5. Get All Brands

```
GET /api/products/brands/list
```

**No authentication required**

**Query Parameters:** None

**Use Case:** Populate brand filter dropdown in UI

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

**Example:**
```bash
curl http://localhost:5000/api/products/brands/list
```

---

## Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "data": {...},
  "pagination": {...}  // Only for list endpoints
}
```

All error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created (admin only) |
| 400 | Bad Request | Invalid query parameters or ID format |
| 404 | Not Found | Product doesn't exist or is inactive |
| 500 | Internal Error | Server error |

---

## Security & Data Privacy

✅ **Only active products returned** - Products with `isActive: false` are hidden  
✅ **Sensitive fields hidden** - Admin-only fields excluded (createdBy, updatedBy, minStockLevel)  
✅ **No authentication required** - Public access for browsing  
✅ **Read-only operations** - No data modification possible (POST/PUT/DELETE not allowed)  
✅ **Performance optimized** - Uses `.lean()` for faster queries  

---

## Usage Examples

### Example 1: Product Listing Page

```bash
# Get first page of active products
curl "http://localhost:5000/api/products?page=1&limit=12&sort=-createdAt"
```

### Example 2: Category Filter

```bash
# Get Electronics category, sorted by price low to high
curl "http://localhost:5000/api/products?category=Electronics&sort=price&limit=20"
```

### Example 3: Price Range Filter

```bash
# Products between $100-$500, sorted by newest
curl "http://localhost:5000/api/products?minPrice=100&maxPrice=500&sort=-createdAt"
```

### Example 4: Search with Filters

```bash
# Search "laptop", brand "Dell", price $500-$1500
curl "http://localhost:5000/api/products?search=laptop&brand=Dell&minPrice=500&maxPrice=1500"
```

### Example 5: Autocomplete Dropdown

```bash
# Get suggestions for user typing "ip" in search box
curl "http://localhost:5000/api/products/search/suggestions?q=ip&limit=5"
```

### Example 6: Category Dropdown

```bash
# Get all categories for filter UI
curl "http://localhost:5000/api/products/categories/list"
```

### Example 7: Single Product Page

```bash
# Get full details of product
curl "http://localhost:5000/api/products/507f1f77bcf86cd799439011"
```

---

## Frontend Integration Examples

### React - Fetch All Products

```javascript
// components/ProductList.jsx
import { useEffect, useState } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/products?page=${page}&limit=12`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.data);
        setTotal(data.pagination.total);
      });
  }, [page]);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          {product.hasStock && <span>In Stock</span>}
        </div>
      ))}
      <p>Page {page} of {Math.ceil(total / 12)}</p>
    </div>
  );
}
```

### React - Search with Autocomplete

```javascript
// components/SearchBox.jsx
import { useEffect, useState } from 'react';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    fetch(`/api/products/search/suggestions?q=${query}&limit=5`)
      .then(res => res.json())
      .then(data => setSuggestions(data.data));
  }, [query]);

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <ul>
        {suggestions.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### JavaScript - Filter Products

```javascript
// products.js
async function getProductsByPrice(minPrice, maxPrice) {
  const res = await fetch(
    `/api/products?minPrice=${minPrice}&maxPrice=${maxPrice}&sort=price`
  );
  return res.json();
}

async function getProductsByCategory(category, page = 1) {
  const res = await fetch(
    `/api/products?category=${category}&page=${page}&limit=20`
  );
  return res.json();
}
```

---

## Performance Tips

1. **Paginate results** - Use `limit` to control page size (default: 10, max: 100)
2. **Sort efficiently** - Use database fields for sorting (name, price, createdAt)
3. **Avoid huge datasets** - Keep `limit` reasonable (10-50 recommended)
4. **Use caching** - Frontend can cache category/brand lists
5. **Combine filters** - More specific queries are faster

---

## Comparison: Admin vs Public Routes

| Feature | Admin Routes `/api/admin/products` | Public Routes `/api/products` |
|---------|------|------|
| Authentication | Required (ADMIN role) | None |
| Create Product | ✅ Yes | ❌ No |
| Update Product | ✅ Yes | ❌ No |
| Delete Product | ✅ Yes | ❌ No |
| View Stock Details | ✅ Yes (detailed) | ✅ Basic (hasStock) |
| Search/Filter | ✅ Yes | ✅ Yes |
| Pagination | ✅ Yes | ✅ Yes |
| Sort | Limited | ✅ Full support |
| Admin Fields Hidden | ❌ No | ✅ Yes |
| Only Active Products | ❌ No | ✅ Yes |

---

## Error Handling

### Invalid Query Parameters

```bash
curl "http://localhost:5000/api/products?minPrice=abc"
```

Response: Still returns results, invalid price ignored.

### Invalid Product ID Format

```bash
curl "http://localhost:5000/api/products/invalid123"
```

Response (400):
```json
{
  "success": false,
  "message": "Invalid product ID format"
}
```

### Product Not Found or Inactive

```bash
curl "http://localhost:5000/api/products/507f1f77bcf86cd799439999"
```

Response (404):
```json
{
  "success": false,
  "message": "Product not found"
}
```

### Missing Required Parameter

```bash
curl "http://localhost:5000/api/products/search/suggestions"
```

Response (400):
```json
{
  "success": false,
  "message": "Search query is required"
}
```

---

## Testing Checklist

- [ ] Get all products without auth
- [ ] Pagination works (page 1, page 2, etc.)
- [ ] Sorting by price, name, date works
- [ ] Category filter returns correct products
- [ ] Brand filter returns correct products
- [ ] Price range filter works
- [ ] Search functionality works
- [ ] Get single product returns full details
- [ ] Search suggestions work (autocomplete)
- [ ] Get categories list works
- [ ] Get brands list works
- [ ] Inactive products are not returned
- [ ] Admin fields (createdBy, updatedBy) are hidden
- [ ] Invalid ID format returns 400 error
- [ ] Non-existent product returns 404 error

---

## Admin Routes (Protected - Unchanged)

These routes REMAIN EXACTLY as before and still require authentication + ADMIN role:

- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/products` - Admin view (with stock details)
- `PATCH /api/admin/products/:id/restock` - Restock product

See [Test_guide.md](./Test_guide.md) for admin API documentation.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-25 | Initial release - public product browsing |

---

## Support

- Backend Status: `GET /health`
- Database: MongoDB Atlas
- Images: Served from `/images` directory
- All endpoints are rate-limited by default Express settings
