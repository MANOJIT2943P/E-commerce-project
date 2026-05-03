# Admin Panel Documentation

## Overview

A comprehensive admin panel has been integrated into the frontend application, providing administrators with powerful tools to manage products, inventory, and view analytics.

## Features

### 1. Dashboard (`/admin`)
The main hub for admin operations with:
- **Quick Statistics**
  - Total products
  - Total stock units
  - Low stock items count
  - Average product price
  - Active products count

- **Category Breakdown**
  - Visual breakdown of products by category
  - Percentage distribution with progress bars

- **Quick Action Buttons**
  - Direct access to product management
  - Direct access to inventory statistics

### 2. Product Management (`/admin/products`)
Complete product management interface featuring:

#### Product Listing
- Paginated product table (20 items per page)
- Shows: Name, Price, Stock, Category, Status, Actions
- Product image thumbnails
- Color-coded stock status indicators

#### Advanced Filtering
- **Search**: Search products by name or keyword
- **Category**: Filter by product category
- **Low Stock Threshold**: Find products below specific stock levels
- **Status**: Filter active or inactive products

#### Product Operations
- **Create**: Add new products with full details
- **Edit**: Modify existing product information
- **Delete**: Deactivate products
- **Image Management**: Upload, replace, or remove product images

#### Product Form Modal
The product form includes:
- Product name, description, price
- Stock quantity
- Category and brand
- Image upload with preview
- Active status toggle
- Form validation

### 3. Inventory Statistics (`/admin/stats`)
Comprehensive inventory analytics including:

#### Overview Statistics
- Total products
- Total stock units
- Low stock items
- Average product price

#### Category Analysis
- Products per category
- Percentage distribution
- Visual progress indicators

#### Brand Analysis
- Top 10 brands
- Product count per brand
- Visual comparisons

#### Stock Status Distribution
- **Good Stock**: > 20 units (green)
- **Medium Stock**: 5-20 units (yellow)
- **Low Stock**: < 5 units (red)
- Item counts and visual indicators

#### Price Statistics
- Minimum price
- Average price
- Median price
- Maximum price

## How to Access

### For Admin Users

1. **Login**: Sign in with your admin account
2. **Access Menu**: Click your name in the header
3. **Select Admin Panel**: Choose "Admin Panel" from dropdown
4. **Navigate**: Use the sidebar to access different sections

### Direct URLs
- Admin Dashboard: `/admin`
- Product Management: `/admin/products`
- Statistics: `/admin/stats`

## User Interface

### Admin Layout
- **Sidebar Navigation**: Collapsible sidebar with quick access to all sections
- **User Profile Section**: Shows logged-in user info and logout button
- **Responsive Design**: Works on desktop and tablet devices
- **Dark Mode Support**: Full dark mode compatibility

### Icons Used
- Home: Dashboard
- Box: Products
- Bar Chart: Statistics
- Log Out: Logout button

## API Integration

The admin panel integrates with these backend endpoints:

### Products
```
GET    /api/admin/products           - List products with pagination
GET    /api/admin/products/:id/stock - Get stock details
POST   /api/admin/products           - Create product
PUT    /api/admin/products/:id       - Update product
DELETE /api/admin/products/:id       - Delete/deactivate product
PATCH  /api/admin/products/:id/restock - Restock product
```

### Analytics
```
GET    /api/admin/stats/inventory    - Get inventory statistics
```

## Query Parameters

### Product Listing
```
page       - Page number (default: 1)
pageSize   - Items per page (default: 20)
search     - Search keyword
category   - Filter by category
brand      - Filter by brand
lowStock   - Low stock threshold
active     - Filter by status (true/false)
```

## Security

### Access Control
- Only users with `ADMIN` role can access admin pages
- All requests require valid JWT authentication
- Non-admin users see an "Access Denied" message
- Unauthenticated users are redirected to login

### Authentication
- Token stored in Redux state
- Automatically added to all admin API requests
- Token refresh handled automatically on expiration

## Creating Products

### Step-by-Step
1. Navigate to Product Management
2. Click "Add Product" button
3. Fill in required fields:
   - Product Name *
   - Price *
   - Category *
   - Brand *
4. Optional fields:
   - Description
   - Stock quantity
   - Product image
5. Toggle "Active Product" if needed
6. Click "Save Product"

### Supported Image Formats
- JPG/JPEG
- PNG
- WebP
- Maximum size: 5MB

### Image Handling
- Images are uploaded to Cloudinary
- Preview shows before upload
- Can replace existing images
- Can remove images

## Editing Products

### Step-by-Step
1. Navigate to Product Management
2. Find the product in the list
3. Click the edit icon (pencil)
4. Modify desired fields
5. To change image: Select new image or click "Remove Image"
6. Click "Save Product"

## Deleting Products

### Step-by-Step
1. Navigate to Product Management
2. Find the product in the list
3. Click the delete icon (trash)
4. Confirm deletion in the confirmation dialog
5. Product will be deactivated

## Stock Management

### Viewing Stock Details
1. Go to Product Management
2. Stock is displayed in the table with color coding:
   - Green: > 20 units (Good)
   - Yellow: 1-20 units (Low)
   - Red: Out of stock

### Restocking Products
1. Use the admin dashboard or products page
2. The restock feature is available via the API
3. To restock, include quantity and optional reason

## Filtering & Searching

### Search
- Type in search box to find products by name
- Results update automatically

### Category Filter
- Select category to filter products
- Leave empty to show all categories

### Low Stock Filter
- Enter a number to find products below that threshold
- Useful for finding items needing restocking

### Status Filter
- Select "Active" to show active products
- Select "Inactive" to show inactive products
- Leave empty for all products

## Pagination

- 20 products displayed per page
- Use "Previous" and "Next" buttons to navigate
- Current page and total pages shown
- Filters persist when navigating pages

## Dark Mode

- Admin panel supports dark mode
- Toggle in header with sun/moon icon
- Preferences saved in Redux state

## Responsive Design

- **Desktop**: Full sidebar with all features
- **Tablet**: Optimized layout
- **Mobile**: Sidebar collapses to icon mode

### Sidebar Toggle
- Click hamburger icon to collapse/expand sidebar
- Icons remain visible when collapsed
- Hover shows tooltips on collapsed items

## Error Handling

- Error messages displayed at top of pages
- Failed operations show user-friendly messages
- Network errors handled gracefully
- Form validation prevents invalid submissions

## Performance

### Optimization
- Pagination reduces data load
- Lazy loading of product images
- Efficient API calls
- Memoized components where applicable

### Caching
- Search history managed by searchHistoryService
- Product data fetched on demand
- Stats cached until manually refreshed

## Best Practices

### When Managing Products
1. Always fill required fields
2. Use descriptive product names
3. Keep descriptions clear and informative
4. Upload quality product images
5. Set accurate stock quantities
6. Regularly review low stock items

### Inventory Management
1. Monitor stock status regularly
2. Use the stats page for insights
3. Set appropriate low-stock thresholds
4. Keep category data consistent
5. Archive old/discontinued products

## Troubleshooting

### Can't Access Admin Panel
- Verify your role is set to "ADMIN"
- Ensure you're logged in
- Check if session has expired
- Clear browser cache and login again

### Product Not Saving
- Check all required fields are filled
- Verify product image size < 5MB
- Check internet connection
- Try submitting again

### Images Not Uploading
- Ensure file format is supported (JPG, PNG, WebP)
- Check file size (max 5MB)
- Verify Cloudinary configuration in backend

### Stats Not Loading
- Refresh the page
- Check internet connection
- Verify backend is running
- Check browser console for errors

## Future Enhancements

Potential additions:
- User management interface
- Order management system
- Sales analytics
- Customer reviews management
- Bulk product operations
- CSV import/export
- Discount/promotion management
- Advanced reporting

## Support

For issues or questions:
1. Check backend logs
2. Review error messages
3. Check browser console (F12)
4. Verify network requests in Network tab
5. Ensure backend API is accessible

## Related Files

- **Service**: `frontend/src/services/adminService.js`
- **Layout**: `frontend/src/components/admin/AdminLayout.jsx`
- **Protection**: `frontend/src/components/common/ProtectedAdminRoute.jsx`
- **App Routes**: `frontend/src/App.jsx`
- **Backend Routes**: `unified-backend/routes/adminRoutes.js`
- **Backend Controller**: `unified-backend/controllers/adminController/adminProductController.js`

---

**Last Updated**: May 2026
**Version**: 1.0
