# Admin Panel Quick Reference

## Quick Start

### Access Admin Panel
1. Login → Click your name → "Admin Panel" → Navigate

### Main Routes
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin` | Overview & statistics |
| Products | `/admin/products` | Manage products |
| Statistics | `/admin/stats` | Detailed analytics |

## Common Tasks

### Add a New Product

```
1. Click "Add Product" button
2. Fill required fields:
   - Name: Product name
   - Price: Set price
   - Category: e.g., "Electronics"
   - Brand: e.g., "Apple"
3. Optional:
   - Description: Product details
   - Stock: Initial quantity
   - Image: Upload product photo
4. Click "Save Product"
```

### Edit a Product

```
1. Find product in list
2. Click pencil icon (Edit)
3. Modify fields as needed
4. Upload new image (optional)
5. Click "Save Product"
```

### Delete a Product

```
1. Find product in list
2. Click trash icon (Delete)
3. Confirm deletion
4. Product will be deactivated
```

### Search Products

```
1. Use search box at top
2. Type product name or keyword
3. Results filter automatically
4. Clear box to show all
```

### Filter Products

| Filter | How to Use |
|--------|-----------|
| Category | Type category name (e.g., "Electronics") |
| Brand | Select brand from dropdown |
| Low Stock | Enter threshold (e.g., "10") |
| Status | Choose "Active" or "Inactive" |

### View Statistics

```
1. Click "Inventory Stats" in sidebar
2. See overview cards (top)
3. Scroll for category breakdown
4. Check brand analysis
5. View stock status distribution
6. Review price statistics
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Close product form modal |
| `Ctrl+K` | Focus search box (if implemented) |
| `Tab` | Navigate form fields |
| `Enter` | Submit form |

## Status Indicators

### Stock Colors
- 🟢 **Green**: > 20 units (Good stock)
- 🟡 **Yellow**: 1-20 units (Low stock)
- 🔴 **Red**: 0 units (Out of stock)

### Product Status
- 🔵 **Blue**: Active (Available for sale)
- ⚫ **Gray**: Inactive (Not available)

## Pagination

- **Default**: 20 items per page
- **Navigate**: Click "Previous" / "Next" buttons
- **Current**: Shows "Page X of Y"

## Dark Mode

- Click sun/moon icon in header
- Preference saved automatically
- Works across all pages

## Form Validation

| Field | Rules |
|-------|-------|
| Name | Required, min 2 chars |
| Price | Required, min 0 |
| Category | Required |
| Brand | Required |
| Stock | Optional, min 0 |
| Image | JPG/PNG/WebP, max 5MB |

## Image Upload

### Supported Formats
- JPG/JPEG
- PNG
- WebP

### Size Limits
- Maximum: 5MB
- Recommended: 1-2MB for faster upload

### Best Practices
- Use high-quality images
- Optimal size: 500x500px
- Ensure product is centered
- Clean white background preferred

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't login | Check admin role in database |
| Image won't upload | Check file size & format |
| Product not saving | Verify all required fields |
| Stats are blank | Check if products exist |
| Sidebar icons missing | Run `npm install react-icons` |
| Token expired | Logout and login again |
| 404 on admin pages | Verify backend API is running |

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request - check input |
| 401 | Not authenticated - login |
| 403 | Not authorized - not admin |
| 404 | Not found - resource doesn't exist |
| 500 | Server error - check logs |

## Performance Tips

- Use pagination for large product lists
- Apply filters to reduce data
- Close modals when not in use
- Refresh page if UI seems stuck
- Clear browser cache if having issues

## CSV Export (Future)

When available:
```
1. Click "Export" button
2. Choose format (CSV/Excel)
3. Select date range
4. Download file
```

## Bulk Operations (Future)

When available:
```
1. Select multiple products
2. Choose action (Edit/Delete)
3. Apply bulk operation
4. Confirm changes
```

## Account Management

### Change Password
- Profile → Account Settings → Change Password

### Update Profile
- Click username → Profile → Edit info

### Logout
- Click username → Sign Out

## Data Backup

### Manual Backup
1. Login to MongoDB Atlas
2. Create database backup
3. Export as JSON

### Automated Backup
- Set up MongoDB backup schedule
- Configure retention policies

## Monitoring Health

### What to Check Daily
- ✅ Low stock items
- ✅ Product count
- ✅ Category distribution
- ✅ System stats

### Weekly Tasks
- Review sales analytics
- Audit product information
- Check image quality
- Update pricing

## Security Notes

- 🔒 Never share admin login
- 🔒 Use strong password
- 🔒 Logout when done
- 🔒 Don't leave admin logged in
- 🔒 Report suspicious activity

## Useful Stats Fields

| Field | Shows |
|-------|-------|
| Total Products | All products (active + inactive) |
| Total Stock | Sum of all product quantities |
| Low Stock | Items below threshold |
| Average Price | Mean product price |
| Category Breakdown | Distribution by category |
| Price Stats | Min, Max, Avg, Median prices |

## Browser Compatibility

Tested & working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Device Support

- ✅ Desktop (1024px+)
- ✅ Tablet (768px+)
- ⚠️ Mobile (Limited UI)

## Help & Support

- **Docs**: See ADMIN_PANEL_GUIDE.md
- **Setup**: See ADMIN_PANEL_SETUP.md
- **Issues**: Check browser console (F12)
- **Backend Logs**: Check unified-backend logs/

---

**Pro Tip**: Bookmark `/admin` for quick access! 🚀

**Last Updated**: May 2026 | **Version**: 1.0
