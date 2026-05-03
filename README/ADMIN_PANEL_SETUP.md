# Admin Panel Setup & Installation Guide

## Prerequisites

Before setting up the admin panel, ensure you have:

1. **Backend Running**: The unified-backend API server must be running
2. **Database Connection**: MongoDB database configured and connected
3. **Admin User**: At least one user with `ADMIN` role created in the database
4. **Frontend Environment**: Frontend development server running or built

## Setup Instructions

### Step 1: Ensure Backend is Running

The admin panel depends on the unified-backend API endpoints.

```bash
cd unified-backend
npm install
npm start
# Backend should run on http://localhost:3001
```

Verify backend is accessible:
```bash
curl http://localhost:3001/api/auth/profile
# Should return 401 Unauthorized (which is expected without auth token)
```

### Step 2: Ensure Frontend is Running

```bash
cd frontend
npm install
npm run dev
# Frontend should run on http://localhost:5173 (Vite default)
```

### Step 3: Create Admin User (if not exists)

If you don't have an admin user, create one using the backend seed script:

```bash
cd unified-backend
npm run seed:admin
# Follow prompts to create admin account
```

Or manually via MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### Step 4: Configure Environment Variables

#### Frontend (.env.local or .env)

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

#### Backend (.env)

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 5: Verify API Endpoints

Test that the admin endpoints are accessible:

```bash
# After logging in as admin, test these endpoints:

# Get admin products
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/products

# Get inventory stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/stats/inventory
```

### Step 6: Login and Access Admin Panel

1. Navigate to frontend: `http://localhost:5173`
2. Click "Sign In"
3. Enter admin credentials
4. Click on username → "Admin Panel"
5. You should see the admin dashboard

## Features Checklist

After setup, verify these features work:

- [ ] Dashboard loads with statistics
- [ ] Can navigate between Dashboard, Products, and Stats
- [ ] Product list displays with pagination
- [ ] Can create a new product
- [ ] Can upload product image
- [ ] Can edit product details
- [ ] Can delete/deactivate product
- [ ] Filters work (search, category, etc.)
- [ ] Statistics page displays charts and data
- [ ] Sidebar collapses/expands
- [ ] Dark mode toggle works

## Common Issues & Solutions

### Issue: "Access Denied" message

**Solution**:
- Verify user role is "ADMIN" (uppercase) in database
- Check JWT token is valid
- Try logging out and logging back in

### Issue: Product image not uploading

**Solution**:
- Verify Cloudinary credentials in backend .env
- Check image file size (max 5MB)
- Check image format (JPG, PNG, WebP)
- Check backend logs for upload errors

### Issue: Admin endpoints return 404

**Solution**:
- Ensure backend is running on correct port (3001)
- Check VITE_API_BASE_URL is correct
- Verify backend routes are imported in app.js

### Issue: Can't login with admin account

**Solution**:
- Verify user exists in database with correct password hash
- Check backend is running and database connected
- Clear browser cookies/session storage
- Try creating new admin user with seed script

### Issue: Statistics page is blank

**Solution**:
- Check if there are products in database
- Verify backend stats endpoint returns data
- Check browser console for errors
- Try refreshing the page

### Issue: Sidebar icons not showing

**Solution**:
- Install react-icons package: `npm install react-icons`
- Clear node_modules cache: `npm cache clean --force`
- Rebuild: `npm install`

## Development

### Running with Hot Reload

Frontend with Vite hot reload:
```bash
cd frontend
npm run dev
```

Backend with nodemon:
```bash
cd unified-backend
npm run dev
```

### Testing Admin Routes

Use Postman or curl to test endpoints:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get token from response, then use in next request

# Get products
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/admin/products?page=1&pageSize=20

# Create product
curl -X POST http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer TOKEN" \
  -F "name=Test Product" \
  -F "price=99.99" \
  -F "category=Electronics" \
  -F "brand=TestBrand" \
  -F "stock=10" \
  -F "image=@/path/to/image.jpg"
```

## Deployment

### Production Build

```bash
cd frontend
npm run build
# Creates dist/ folder with optimized build
```

### Production Environment Variables

Before deployment, update:

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

### Deployment Platforms

The admin panel can be deployed to:
- **Vercel**: Recommended for Next.js/Vite
- **Netlify**: Good for static builds
- **Docker**: Containerize both frontend and backend
- **Traditional Server**: Deploy built files to web server

## Monitoring

### Key Metrics to Monitor

1. **Page Load Time**: Admin dashboard should load in < 2 seconds
2. **API Response Time**: Admin endpoints should respond in < 500ms
3. **Error Rate**: Track failed API requests
4. **User Activity**: Monitor who accessed admin panel and when

### Logging

Enable debug logging:

Frontend console:
```javascript
// In browser console
localStorage.setItem('debug', 'app:*');
```

Backend logging:
```javascript
// Check unified-backend logs
tail -f logs/app.log
```

## Security Checklist

Before going to production:

- [ ] Change JWT_SECRET to strong value
- [ ] Enable HTTPS for all connections
- [ ] Implement rate limiting on admin endpoints
- [ ] Add logging/audit trail for admin actions
- [ ] Use environment variables for all secrets
- [ ] Validate all user inputs on backend
- [ ] Implement CORS properly
- [ ] Enable CSRF protection
- [ ] Use secure HTTP headers
- [ ] Regular security audits

## Support & Troubleshooting

### Get Help

1. Check backend logs: `unified-backend/logs/`
2. Check browser console: F12 → Console tab
3. Check network requests: F12 → Network tab
4. Review error messages in UI

### Enable Debug Mode

Frontend:
```javascript
// Add to localStorage in browser console
localStorage.setItem('debug', 'app:*');
```

Backend:
```bash
# Set DEBUG environment variable
DEBUG=app:* npm start
```

## Next Steps

After successful setup:

1. **Populate Products**: Start adding products through the admin panel
2. **Configure Categories**: Set up product categories
3. **Manage Inventory**: Monitor and adjust stock levels
4. **Monitor Analytics**: Check statistics regularly
5. **Optimize Performance**: Fine-tune database indexes

## Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api)

---

**Setup Completed?** You're ready to use the admin panel! 🎉

For additional help, refer to the [Admin Panel User Guide](./ADMIN_PANEL_GUIDE.md)
