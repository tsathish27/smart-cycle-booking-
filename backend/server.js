const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Looking for .env file at:', path.join(process.cwd(), '.env'));

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env file content preview:');
  console.log(envContent.split('\n').map(line => {
    if (line.includes('JWT_SECRET')) {
      return 'JWT_SECRET=***hidden***';
    }
    return line;
  }).join('\n'));
} else {
  console.log('❌ .env file NOT found at:', envPath);
}

dotenv.config();

// Enhanced debugging
console.log('\n🔧 Environment variables after dotenv.config():');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `SET (length: ${process.env.JWT_SECRET.length})` : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'DEFAULT');
console.log('NODE_ENV:', process.env.NODE_ENV || 'DEFAULT');

// If JWT_SECRET is still not set, show all environment variables that don't contain sensitive system info
if (!process.env.JWT_SECRET) {
  console.log('\n🚨 JWT_SECRET not found. Available custom environment variables:');
  Object.keys(process.env)
    .filter(key => !key.includes('PATH') && !key.includes('SYSTEM') && !key.includes('PROCESSOR'))
    .forEach(key => {
      console.log(`${key}: ${process.env[key]}`);
    });
}

// Import routes
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const cycleRoutes = require('./routes/cycles');
const rideRoutes = require('./routes/rides');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8081', 
    'http://localhost:3000', 
    'http://localhost:19006', 
    'exp://10.205.22.175:8081',
    'http://10.205.22.175:8081',
    'http://10.205.22.175:3000',
    'http://10.205.22.175:19006'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcycle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is reachable!',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    env: {
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'DEFAULT'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartCycle API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartCycle API server running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Network URL: http://10.11.50.175:${PORT}/api`);
});

module.exports = app;