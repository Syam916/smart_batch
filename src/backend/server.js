const express = require('express');
const bodyParser = require('body-parser');
const { db } = require('./db_config');

const app = express();

// VERY SIMPLE CORS - ALLOW ALL ORIGINS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parser middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Simple test route to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Import routes
const hodRoutes = require('./routes/hod');
const studentRoutes = require('./routes/student');

// Use routes
app.use('/api/hod', hodRoutes);
app.use('/api/student', studentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.originalUrl} (${req.method})`);
  res.status(404).json({ message: 'Route not found', path: req.originalUrl, method: req.method });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available routes:`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/hod/saved-batches`);
  console.log(`  POST /api/hod/save-batches`);
  console.log(`  GET  /api/hod/students`);
}); 