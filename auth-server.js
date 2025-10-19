// ESM Auth Server
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize environment variables
dotenv.config();

const app = express();
const { Pool } = pg;

// Debug: Display loaded environment variables
console.log('Environment loaded:');
console.log('- Database URL format:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('- PORT:', process.env.PORT || '3000 (default)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Middleware
app.use(express.json());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  ['http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://127.0.0.1:5000'];

console.log('CORS enabled for origins:', corsOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true
}));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Database connection successful:', res.rows[0].now);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.error('Please check your DATABASE_URL environment variable.');
  });

// Auth token verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'Auth server is running',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ 
        message: 'Email and password are required',
      });
    }

    // Get user from database
    console.log('Looking up user by email:', email);
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const user = userResult.rows[0];
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Check if user is active
    if (user.hasOwnProperty('isActive') && !user.isActive) {
      console.log('Login failed: Account is deactivated:', email);
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Verify password
    console.log('Verifying password');
    const passwordField = user.password_hash || user.password;
    const isValidPassword = await bcrypt.compare(password, passwordField);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password verification successful for:', email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role || 'user'
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    // Return user response
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'user',
        isActive: user.hasOwnProperty('isActive') ? user.isActive : true
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get current user endpoint
app.get('/api/auth/user', async (req, res) => {
  try {
    console.log('Get current user request received');
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization header missing or invalid');
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      console.log('Invalid token payload');
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Get user from database
    console.log('Looking up user by ID:', decoded.userId);
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    const user = userResult.rows[0];
    if (!user) {
      console.log('User not found with ID:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is active
    if (user.hasOwnProperty('isActive') && !user.isActive) {
      console.log('Account is deactivated for user:', user.email);
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    
    console.log('User found:', { id: user.id, email: user.email });
    
    // Return user data (excluding sensitive fields)
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'user',
      isActive: user.hasOwnProperty('isActive') ? user.isActive : true
    });
  } catch (err) {
    console.error('Get user error:', err);
    
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    console.log('Logout request received');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Auth server running on port ${PORT}`);
  console.log(`📝 API Routes:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/user`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`\n💡 Test with: curl http://localhost:${PORT}/api/health`);
});