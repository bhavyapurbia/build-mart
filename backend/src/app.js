import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import { getDBMode } from './config/db.js';
import { ApiError } from './utils/ApiError.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import materialRequestRoutes from './routes/materialRequestRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import labourRoutes from './routes/labourRoutes.js';
import bulkEnquiryRoutes from './routes/bulkEnquiryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import serviceAreaRoutes from './routes/serviceAreaRoutes.js';
import pageRoutes from './routes/pageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Trust proxy (for real IPs behind nginx/load balancer) ───────────────────
const trustProxy = process.env.TRUST_PROXY || '0';
app.set('trust proxy', trustProxy === '0' ? false : Number(trustProxy) || trustProxy);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CDN images
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"]
    }
  } : false,
}));

// ─── CORS — allowlist from CLIENT_URL env var ────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Webhook routes — mounted BEFORE json parser (needs raw Buffer) ───────────
app.use('/api/webhooks', webhookRoutes);

// ─── Body parsing — 1 MB limit ────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Observability: Structured HTTP logging with redaction & Request IDs ──
import { httpLogger } from './utils/logger.js';
import mongoose from 'mongoose';
import { cache } from './utils/cache.js';
import seoController from './controllers/seo.controller.js';

app.use(httpLogger);

// SEO: Root sitemap and robots.txt
app.get('/robots.txt', seoController.getRobotsTxt);
app.get('/sitemap.xml', seoController.getSitemapXml);

// ─── Mongo query injection sanitisation ──────────────────────────────────────
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Sanitized key "${key}" on ${req.method} ${req.path}`);
  }
}));

// ─── HTTP parameter pollution protection ─────────────────────────────────────
app.use(hpp());

// ─── Rate limiters ────────────────────────────────────────────────────────────
// Global: 300 requests per 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
}));

// Auth routes: 10 per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

// Upload: 20 per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Upload limit reached, please try again later.' }
});

// Coupon validate: 30 per 15 min
const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many coupon requests.' }
});

// ─── Static uploads folder ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health & Readiness Checks ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    platform: 'BuildMart Construction Materials E-Commerce',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ready', async (req, res) => {
  const isDbReady = mongoose.connection && mongoose.connection.readyState === 1;
  let isCacheReady = false;
  try {
    await cache.get('__probe__');
    isCacheReady = true;
  } catch (e) {
    isCacheReady = false;
  }

  if (isDbReady && isCacheReady) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      cache: 'ready',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    status: 'unready',
    database: isDbReady ? 'connected' : 'disconnected',
    cache: isCacheReady ? 'ready' : 'error',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── Interactive OpenAPI 3 Docs (non-production) ───────────────────────────
app.get('/api/docs/openapi.json', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'API documentation is disabled in production.' });
  }
  res.sendFile(path.join(__dirname, '../../docs/openapi.json'));
});

app.get('/api/docs', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'API documentation is disabled in production.' });
  }
  res.setHeader('Content-Type', 'text/html');
  return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BuildMart API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
    };
  </script>
</body>
</html>`);
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/material-requests', materialRequestRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/labour-requests', labourRoutes);
app.use('/api/bulk-enquiries', bulkEnquiryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/serviceability', serviceAreaRoutes);
app.use('/api', pageRoutes);

// Export limiters for use in specific routes
export { couponLimiter, uploadLimiter };

// ─── Centralised error handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // CORS errors
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || (err instanceof ApiError ? err.statusCode : (err.status || 500));
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error('Unhandled Server Error:', err);
  }

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors: err.errors || [],
    data: null,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;
export { app };
