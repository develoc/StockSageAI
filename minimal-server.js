// minimal-server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Server information
console.log('Minimal server starting with:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- PORT:', process.env.PORT || 3000);

// Health check endpoint - Test route
app.get('/health', (req, res) => {
  console.log('GET /health requested');
  res.json({
    status: 'ok',
    message: 'Minimal server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  console.log('GET /api/health requested');
  res.json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Debug route to echo request information
app.all('*', (req, res) => {
  console.log(`${req.method} ${req.path} requested`);
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.path}`,
    request: {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`📝 Test endpoints:`);
  console.log(`   GET http://localhost:${PORT}/health`);
  console.log(`   GET http://localhost:${PORT}/api/health`);
});