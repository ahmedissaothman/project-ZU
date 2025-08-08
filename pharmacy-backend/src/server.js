 
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Pharmacy Backend Server running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 API Documentation: http://localhost:${PORT}/api/health`);
  });
};

startServer();