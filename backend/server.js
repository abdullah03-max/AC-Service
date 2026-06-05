const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Route imports
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const technicianRoutes = require('./routes/technicians');
const inventoryRoutes = require('./routes/inventory');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true, 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Ensure MongoDB is connected before API routes (required for Vercel serverless)
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({
      success: false,
      message: error.message.includes('MONGODB_URI')
        ? error.message
        : 'Database connection failed. Check MONGODB_URI and MongoDB Atlas network access.',
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'OK', message: 'Full Care AC API Running', database: 'connected' });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'API running but database unavailable',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const PORT = process.env.PORT || 5000;

// Only listen locally, Vercel will handle the app export
if (process.env.NODE_ENV !== 'production') {
  connectDB()
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
