#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    return callback(null, true);
  },
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug route
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('Auth test server is running. Use /api/auth/login to test authentication.');
});

// Simple login endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Fixed test credentials
  if (email === 'admin@quantumtrade.ai' && password === 'admin123') {
    return res.json({
      token: 'test-token-for-debugging',
      user: {
        id: '1',
        email: 'admin@quantumtrade.ai',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      }
    });
  }
  
  if (email === 'user@quantumtrade.ai' && password === 'user123') {
    return res.json({
      token: 'test-token-for-debugging',
      user: {
        id: '2',
        email: 'user@quantumtrade.ai',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        isActive: true
      }
    });
  }
  
  // Invalid credentials
  return res.status(401).json({ message: 'Invalid email or password' });
});

// Start the server
const port = process.env.PORT || 3000; // Use default port 3000
console.log('Starting server on port', port);
const server = createServer(app);

// Log when server is listening
server.on('listening', () => {
  const addr = server.address();
  console.log(`Testing auth server running on ${typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`}`);
  console.log(`Try accessing: http://localhost:${port}/api/health`);
  console.log(`Try accessing with WSL IP: http://$(ip addr show eth0 | grep -oP '(?<=inet\\s)\\d+(\.\\d+){3}'):${port}/api/health`);
});

// Error handler
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Listen on all interfaces for WSL compatibility
server.listen(port, '0.0.0.0');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});