import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupCustomAuth, authenticateToken, requireAdmin } from "./auth";

// Role-based access control middleware
const requireRole = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.role !== requiredRole && requiredRole !== 'user') {
        return res.status(403).json({ message: `${requiredRole} access required` });
      }
      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};
import { z } from "zod";
import jwt from 'jsonwebtoken';
import { insertMarketDataSchema, insertStrategySchema, insertAIInsightSchema } from "@shared/schema";
import { seedDatabase } from "./seedData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupCustomAuth(app);

  // User registration endpoint
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const { firstName, lastName, email, password, walletAddress } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email,
        password,
        walletAddress,
        role: 'user'
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email, 
          role: newUser.role 
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin endpoints for user management
  app.post('/api/admin/users', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { firstName, lastName, email, password, role, walletAddress } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email,
        password,
        walletAddress,
        role: role || 'user'
      });

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        walletAddress: newUser.walletAddress,
        createdAt: newUser.createdAt
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/admin/users/:id/toggle-status', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      await storage.updateUserStatus(id, isActive);
      res.json({ message: 'User status updated successfully' });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Auth routes are now handled in setupCustomAuth

  // Market data routes
  app.get('/api/market-data/:symbol', authenticateToken, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe = '1D', startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const data = await storage.getMarketData(symbol.toUpperCase(), timeframe as string, start, end);
      res.json(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.get('/api/market-data/:symbol/latest', authenticateToken, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const data = await storage.getLatestPrice(symbol.toUpperCase());
      res.json(data);
    } catch (error) {
      console.error("Error fetching latest price:", error);
      res.status(500).json({ message: "Failed to fetch latest price" });
    }
  });

  // Admin only: Add market data
  app.post('/api/market-data', authenticateToken, requireAdmin, async (req: any, res) => {
    try {

      const validatedData = insertMarketDataSchema.parse(req.body);
      const result = await storage.insertMarketData(validatedData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error adding market data:", error);
      res.status(500).json({ message: "Failed to add market data" });
    }
  });

  // Strategy routes
  app.get('/api/strategies', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      const strategies = user?.role === 'admin' 
        ? await storage.getStrategies()
        : await storage.getStrategies(req.user.userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Failed to fetch strategies" });
    }
  });

  app.get('/api/strategies/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const strategy = await storage.getStrategy(id);
      
      if (!strategy) {
        return res.status(404).json({ message: "Strategy not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (user?.role !== 'admin' && strategy.createdBy !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(strategy);
    } catch (error) {
      console.error("Error fetching strategy:", error);
      res.status(500).json({ message: "Failed to fetch strategy" });
    }
  });

  app.post('/api/strategies', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const validatedData = insertStrategySchema.parse({
        ...req.body,
        createdBy: req.user.userId,
      });
      
      const result = await storage.createStrategy(validatedData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating strategy:", error);
      res.status(500).json({ message: "Failed to create strategy" });
    }
  });

  // AI insights routes
  app.get('/api/ai-insights', authenticateToken, async (req: any, res) => {
    try {
      const { symbol, limit } = req.query;
      const insights = await storage.getAIInsights(
        symbol as string,
        limit ? parseInt(limit as string) : 10
      );
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  // Admin only: Create AI insights
  app.post('/api/ai-insights', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const validatedData = insertAIInsightSchema.parse(req.body);
      const result = await storage.createAIInsight(validatedData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating AI insight:", error);
      res.status(500).json({ message: "Failed to create AI insight" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolios', authenticateToken, async (req: any, res) => {
    try {
      const portfolios = await storage.getUserPortfolios(req.user.userId);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get('/api/portfolios/:id/positions', authenticateToken, async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(portfolioId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      const user = await storage.getUser(req.user.userId);
      if (user?.role !== 'admin' && portfolio.userId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const positions = await storage.getPortfolioPositions(portfolioId);
      res.json(positions);
    } catch (error) {
      console.error("Error fetching portfolio positions:", error);
      res.status(500).json({ message: "Failed to fetch portfolio positions" });
    }
  });

  // Export routes
  app.get('/api/export/historical-data', authenticateToken, async (req: any, res) => {
    try {
      const { symbol, timeframe, startDate, endDate } = req.query;
      
      if (!symbol || !timeframe) {
        return res.status(400).json({ message: "Symbol and timeframe are required" });
      }

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const data = await storage.getMarketData(symbol as string, timeframe as string, start, end);
      
      // Convert to CSV format
      const csvHeader = 'Timestamp,Symbol,Open,High,Low,Close,Volume,Timeframe\n';
      const csvData = data.map(row => 
        `${row.timestamp},${row.symbol},${row.open},${row.high},${row.low},${row.close},${row.volume},${row.timeframe}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${symbol}_${timeframe}_historical_data.csv"`);
      res.send(csvHeader + csvData);
    } catch (error) {
      console.error("Error exporting historical data:", error);
      res.status(500).json({ message: "Failed to export historical data" });
    }
  });

  app.get('/api/export/strategies', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      const strategies = user?.role === 'admin' 
        ? await storage.getStrategies()
        : await storage.getStrategies(req.user.userId);
      
      // Convert to CSV format
      const csvHeader = 'Name,Description,Status,Return Rate,Risk Level,Win Rate,Symbols\n';
      const csvData = strategies.map(strategy => 
        `"${strategy.name}","${strategy.description}",${strategy.status},${strategy.returnRate},${strategy.riskLevel},${strategy.winRate},"${JSON.stringify(strategy.symbols)}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="strategies_export.csv"');
      res.send(csvHeader + csvData);
    } catch (error) {
      console.error("Error exporting strategies:", error);
      res.status(500).json({ message: "Failed to export strategies" });
    }
  });

  // Admin only: Get all users
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin only: Seed database with sample data
  app.post('/api/admin/seed-database', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const result = await seedDatabase();
      res.status(200).json({
        message: "Database seeded successfully",
        data: result
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
