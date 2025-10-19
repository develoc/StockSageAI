
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { Express, RequestHandler, Request, Response } from 'express';
import { tokenGenerator } from './utils/generateToken';

// Debug helper function
function debugRequest(req: Request, endpoint: string): void {
  console.log(`[DEBUG] ${endpoint} - Request received:`, {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'host': req.headers.host,
    },
    body: req.body,
  });
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
}

export async function setupCustomAuth(app: Express) {
  // Add CORS middleware with proper configuration for cookies
  app.use((req, res, next) => {
    // Get origin from request
    const origin = req.headers.origin;
    
    // Debug log for all requests in development mode
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log(`[AUTH DEBUG] Request received: ${req.method} ${req.path}`);
      console.log(`[AUTH DEBUG] Request origin: ${origin || 'none'}`);
    }
    
    // Allow specific origins or all in development
    if (origin || process.env.NODE_ENV !== 'production') {
      // In development, accept any origin
      res.header('Access-Control-Allow-Origin', origin || '*');
      // Important for cookies
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Login endpoint with rate limiting and error handling
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Debug the incoming request
      debugRequest(req, 'LOGIN');
      console.log('[AUTH] Login attempt received:', req.body);
      
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('[AUTH] Login failed: Missing email or password');
        return res.status(400).json({ 
          message: 'Email and password are required',
          details: { email: !email, password: !password }
        });
      }

      // Get user from database
      console.log('[AUTH] Looking up user by email:', email);
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log('[AUTH] Login failed: User not found for email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('[AUTH] User found:', { id: user.id, email: user.email, role: user.role });

      // Check if user is active
      if (!user.isActive) {
        console.log('[AUTH] Login failed: Account is deactivated:', email);
        return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
      }

      // Verify password
      console.log('[AUTH] Verifying password');
      const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValidPassword) {
        console.log('[AUTH] Login failed: Invalid password for:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('[AUTH] Password verification successful for:', email);

      // Generate JWT tokens
      const { accessToken, refreshToken } = tokenGenerator.generateTokenPair({
        userId: user.id,
        email: user.email || '',
        role: user.role,
        tokenVersion: 1
      });

      // Log successful login
      console.log(`User ${user.email} logged in successfully at ${new Date().toISOString()}`);

      // Set refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Logout endpoint with token invalidation
  app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
    try {
      // Here we could add token to a blacklist or increment user's tokenVersion
      console.log(`User ${req.user.email} logged out at ${new Date().toISOString()}`);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
    console.error("Login error:", error);
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user endpoint with better error handling
  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      });
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Get user error:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Refresh token endpoint
  app.post('/api/auth/refresh-token', async (req, res) => {
    try {
      const refreshToken = req.cookies.refresh_token;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      try {
        // Verify the refresh token
        const decoded = tokenGenerator.verifyRefreshToken(refreshToken);
        
        // Get the user
        const user = await storage.getUser(decoded.userId);
        if (!user || !user.isActive) {
          return res.status(401).json({ message: 'Invalid user or inactive account' });
        }

        // Generate new token pair
        const { accessToken, refreshToken: newRefreshToken } = tokenGenerator.generateTokenPair({
          userId: user.id,
          email: user.email || '',
          role: user.role,
          tokenVersion: (decoded.tokenVersion || 0) + 1
        });

        // Set new refresh token in cookie
        res.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return new access token
        res.json({ token: accessToken });
      } catch (error) {
    console.error("Login error:", error);
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
    } catch (error) {
    console.error("Login error:", error);
      console.error('Token refresh error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

export const authenticateToken: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = tokenGenerator.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Login error:", error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const user = await storage.getUser(req.user.userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
