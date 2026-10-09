const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file storage for uploads
const uploadsDir = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Wedding Planner and Vendor Coordination Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/requirements', require('./routes/requirementRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/vendor-requests', require('./routes/vendorRequestRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlists', require('./routes/wishlistRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handling
app.use(errorHandler);

// Start server and check database
app.listen(PORT, async () => {
  console.log(`=====================================================================`);
  console.log(` WPVCP Backend Server running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=====================================================================`);
  await testConnection();
});

module.exports = app;
