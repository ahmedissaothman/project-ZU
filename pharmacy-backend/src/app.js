const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middlewares/error.middleware');
const { checkStockAlerts } = require('./controllers/notification.controller');

// Import routes
const authRoutes = require('./routes/auth.routes');
const medicineRoutes = require('./routes/medicine.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);

// Additional routes (uncomment when files are created)
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Add these imports
const categoriesRoutes = require('./routes/categories');
const companiesRoutes = require('./routes/companies');

// Add these route middlewares
app.use('/api/categories', categoriesRoutes);
app.use('/api/companies', companiesRoutes);


// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Run stock alerts check every hour
setInterval(checkStockAlerts, 60 * 60 * 1000);

module.exports = app;