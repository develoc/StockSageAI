// Minimal Auth Server - CommonJS version
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Simple in-memory user data for testing
const users = [
  {
    id: 1,
    email: 'admin@quantumtrade.ai',
    password_hash: '$2a$10$KhH.wXXA0HZUrnpPu84Stebv13zXKBcACx45H2zXpDFUr3YBlgmDG', // admin123
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    isActive: true
  }
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Route matching:', req.route);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'Minimal auth server is running',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // For demo purposes, just check if email is admin@quantumtrade.ai and password is admin123
  if (email === 'admin@quantumtrade.ai' && password === 'admin123') {
    const user = users[0];
    
    // Generate a simple token (in a real app, you'd use JWT)
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })).toString('base64');
    
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.isActive
      }
    });
  }
  
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Get current user endpoint
app.get('/api/auth/user', (req, res) => {
  console.log('Get current user request received');
  
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  
  try {
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Decode token (in a real app, you'd verify a JWT)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Find user by ID
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data
    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Token decode error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  console.log('Logout request received');
  res.json({ message: 'Logged out successfully' });
});

// Catch-all route for any other API endpoints
app.use('/api/*', (req, res) => {
  console.log(`Unhandled API request: ${req.method} ${req.url}`);
  console.log('Available routes:');
  console.log('- GET /api/health');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/user');
  console.log('- POST /api/auth/logout');
  
  // Send detailed error
  res.status(404).json({
    detail: "Not Found",
    message: `API endpoint not found: ${req.url}`,
    method: req.method,
    requestedUrl: req.url,
    availableEndpoints: [
      { method: 'GET', path: '/api/health' },
      { method: 'POST', path: '/api/auth/login' },
      { method: 'GET', path: '/api/auth/user' },
      { method: 'POST', path: '/api/auth/logout' }
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal Auth Server running on port ${PORT}`);
  console.log(`📝 API Routes:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/user`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`\n💡 Test with: curl http://localhost:${PORT}/api/health`);
});