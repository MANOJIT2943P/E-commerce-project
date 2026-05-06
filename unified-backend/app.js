/**
 * Main app configuration and setup
 * Initializes express app with middleware and routes
 * ✅ REFACTORED: Added local image serving to replace Cloudinary
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

// ==========================================
// CORS Configuration
// ==========================================
const allowedOrigins = (
  process.env.FRONTEND_URLS || 
  process.env.FRONTEND_URL || 
  'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000'
)
  .split(',')
  .map((s) => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// ==========================================
// Body Parser Middleware
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==========================================
// Static File Serving (Local Images)
// ==========================================
// ✅ REFACTORED: Serve product images from local storage
const PRODUCT_IMAGES_DIR = 'D:\\col pro ep\\E-commerce-project\\Product_db';
app.use('/images', express.static(PRODUCT_IMAGES_DIR, {
  maxAge: '1d', // Cache images for 1 day in browser
  etag: false   // Disable ETags for simpler caching
}));

console.log(`📁 Image directory configured: ${PRODUCT_IMAGES_DIR}`);
console.log(`🖼️  Images accessible at: http://localhost:<port>/images/<filename>`);

// ==========================================
// Request Logging (Development)
// ==========================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// Health Check Endpoint
// ==========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================================
// API Routes
// ==========================================
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Public product routes (NO AUTH REQUIRED)
app.use('/api/cart', cartRoutes); // Protected cart routes (AUTHENTICATED USERS ONLY)
app.use('/api/admin', adminRoutes); // Protected admin routes (ADMIN ONLY)

// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
