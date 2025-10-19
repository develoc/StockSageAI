import { createServer } from "http";
import { storage } from "./storage";
import { setupCustomAuth, authenticateToken, requireAdmin } from "./auth";
import docsRoutes from "./docsRoutes";
// Role-based access control middleware
const requireRole = (requiredRole) => {
    return async (req, res, next) => {
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
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};
import jwt from 'jsonwebtoken';
import { insertMarketDataSchema, insertStrategySchema, insertAIInsightSchema } from "@shared/schema";
import { seedDatabase } from "./seedData";
export async function registerRoutes(app) {
    // Documentation endpoints
    app.use('/api/docs', docsRoutes);
    // Health check endpoint - accessible without auth
    app.get('/api/health', async (req, res) => {
        try {
            // Check API key status
            let alphaVantageStatus = 'unknown';
            let coinGeckoStatus = 'unknown';
            try {
                // Try to make a simple API call to check if Alpha Vantage is accessible
                const axios = require('axios');
                const avResponse = await axios.get('https://www.alphavantage.co/query', {
                    params: {
                        function: 'TIME_SERIES_INTRADAY',
                        symbol: 'IBM',
                        interval: '5min',
                        apikey: process.env.ALPHA_VANTAGE_API_KEY || 'RZ1QB6NQJ5P85SPN',
                        outputsize: 'compact'
                    },
                    timeout: 3000 // Short timeout for health check
                });
                if (avResponse.data && avResponse.data.Note && avResponse.data.Note.includes('call frequency')) {
                    alphaVantageStatus = 'rate-limited';
                }
                else if (avResponse.data && (avResponse.data['Time Series (5min)'] || avResponse.data['Meta Data'])) {
                    alphaVantageStatus = 'ok';
                }
                else {
                    alphaVantageStatus = 'error';
                }
            }
            catch (error) {
                alphaVantageStatus = 'error';
            }
            // Check database connection status by making a simple storage call
            let dbStatus = 'ok';
            try {
                await storage.getAllUsers();
            }
            catch (error) {
                dbStatus = 'error';
                console.error('Database connection error in health check');
            }
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 3000,
                api: {
                    alphaVantage: alphaVantageStatus,
                    coinGecko: coinGeckoStatus
                },
                database: dbStatus,
                uptime: process.uptime()
            });
        }
        catch (error) {
            console.error('Health check error');
            res.status(500).json({
                status: 'error',
                message: 'Health check failed',
                timestamp: new Date().toISOString()
            });
        }
    });
    // Auth middleware
    await setupCustomAuth(app);
    // User registration endpoint
    app.post('/api/auth/register', async (req, res) => {
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
            const token = jwt.sign({
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role
            }, process.env.JWT_SECRET || 'your-super-secret-jwt-key', { expiresIn: '7d' });
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
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    // Admin endpoints for user management
    app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
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
        }
        catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    app.put('/api/admin/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            await storage.updateUserStatus(id, isActive);
            res.json({ message: 'User status updated successfully' });
        }
        catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    // Auth routes are now handled in setupCustomAuth
    // Market data routes
    app.get('/api/market-data/:symbol', authenticateToken, async (req, res) => {
        try {
            const { symbol } = req.params;
            const { timeframe = '1D', startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            const data = await storage.getMarketData(symbol.toUpperCase(), timeframe, start, end);
            res.json(data);
        }
        catch (error) {
            console.error("Error fetching market data:", error);
            res.status(500).json({ message: "Failed to fetch market data" });
        }
    });
    app.get('/api/market-data/:symbol/latest', authenticateToken, async (req, res) => {
        try {
            const { symbol } = req.params;
            const data = await storage.getLatestPrice(symbol.toUpperCase());
            res.json(data);
        }
        catch (error) {
            console.error("Error fetching latest price:", error);
            res.status(500).json({ message: "Failed to fetch latest price" });
        }
    });
    // Admin only: Add market data
    app.post('/api/market-data', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const validatedData = insertMarketDataSchema.parse(req.body);
            const result = await storage.insertMarketData(validatedData);
            res.status(201).json(result);
        }
        catch (error) {
            console.error("Error adding market data:", error);
            res.status(500).json({ message: "Failed to add market data" });
        }
    });
    // Strategy routes
    app.get('/api/strategies', authenticateToken, async (req, res) => {
        try {
            const user = await storage.getUser(req.user.userId);
            const strategies = user?.role === 'admin'
                ? await storage.getStrategies()
                : await storage.getStrategies(req.user.userId);
            res.json(strategies);
        }
        catch (error) {
            console.error("Error fetching strategies:", error);
            res.status(500).json({ message: "Failed to fetch strategies" });
        }
    });
    app.get('/api/strategies/:id', authenticateToken, async (req, res) => {
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
        }
        catch (error) {
            console.error("Error fetching strategy:", error);
            res.status(500).json({ message: "Failed to fetch strategy" });
        }
    });
    app.post('/api/strategies', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const validatedData = insertStrategySchema.parse({
                ...req.body,
                createdBy: req.user.userId,
            });
            const result = await storage.createStrategy(validatedData);
            res.status(201).json(result);
        }
        catch (error) {
            console.error("Error creating strategy:", error);
            res.status(500).json({ message: "Failed to create strategy" });
        }
    });
    // AI insights routes
    app.get('/api/ai-insights', authenticateToken, async (req, res) => {
        try {
            const { symbol, limit } = req.query;
            const insights = await storage.getAIInsights(symbol, limit ? parseInt(limit) : 10);
            res.json(insights);
        }
        catch (error) {
            console.error("Error fetching AI insights:", error);
            res.status(500).json({ message: "Failed to fetch AI insights" });
        }
    });
    // Admin only: Create AI insights
    app.post('/api/ai-insights', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const validatedData = insertAIInsightSchema.parse(req.body);
            const result = await storage.createAIInsight(validatedData);
            res.status(201).json(result);
        }
        catch (error) {
            console.error("Error creating AI insight:", error);
            res.status(500).json({ message: "Failed to create AI insight" });
        }
    });
    // Portfolio routes
    app.get('/api/portfolios', authenticateToken, async (req, res) => {
        try {
            const portfolios = await storage.getUserPortfolios(req.user.userId);
            res.json(portfolios);
        }
        catch (error) {
            console.error("Error fetching portfolios:", error);
            res.status(500).json({ message: "Failed to fetch portfolios" });
        }
    });
    app.get('/api/portfolios/:id/positions', authenticateToken, async (req, res) => {
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
        }
        catch (error) {
            console.error("Error fetching portfolio positions:", error);
            res.status(500).json({ message: "Failed to fetch portfolio positions" });
        }
    });
    // Export routes
    app.get('/api/export/historical-data', authenticateToken, async (req, res) => {
        try {
            const { symbol, timeframe, startDate, endDate } = req.query;
            if (!symbol || !timeframe) {
                return res.status(400).json({ message: "Symbol and timeframe are required" });
            }
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();
            const data = await storage.getMarketData(symbol, timeframe, start, end);
            // Convert to CSV format
            const csvHeader = 'Timestamp,Symbol,Open,High,Low,Close,Volume,Timeframe\n';
            const csvData = data.map(row => `${row.timestamp},${row.symbol},${row.open},${row.high},${row.low},${row.close},${row.volume},${row.timeframe}`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${symbol}_${timeframe}_historical_data.csv"`);
            res.send(csvHeader + csvData);
        }
        catch (error) {
            console.error("Error exporting historical data:", error);
            res.status(500).json({ message: "Failed to export historical data" });
        }
    });
    app.get('/api/export/strategies', authenticateToken, async (req, res) => {
        try {
            const user = await storage.getUser(req.user.userId);
            const strategies = user?.role === 'admin'
                ? await storage.getStrategies()
                : await storage.getStrategies(req.user.userId);
            // Convert to CSV format
            const csvHeader = 'Name,Description,Status,Return Rate,Risk Level,Win Rate,Symbols\n';
            const csvData = strategies.map(strategy => `"${strategy.name}","${strategy.description}",${strategy.status},${strategy.returnRate},${strategy.riskLevel},${strategy.winRate},"${JSON.stringify(strategy.symbols)}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="strategies_export.csv"');
            res.send(csvHeader + csvData);
        }
        catch (error) {
            console.error("Error exporting strategies:", error);
            res.status(500).json({ message: "Failed to export strategies" });
        }
    });
    // Admin only: Get all users
    app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const users = await storage.getAllUsers();
            res.json(users);
        }
        catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });
    // Alert routes
    app.get('/api/alerts', authenticateToken, async (req, res) => {
        try {
            const alerts = await storage.getUserAlerts(req.user.userId);
            res.json(alerts);
        }
        catch (error) {
            console.error("Error fetching alerts:", error);
            res.status(500).json({ message: "Failed to fetch alerts" });
        }
    });
    app.post('/api/alerts', authenticateToken, async (req, res) => {
        try {
            const { type, asset, condition, value } = req.body;
            const alert = await storage.createAlert({
                type,
                asset,
                condition,
                value,
                userId: req.user.userId,
                active: true
            });
            res.status(201).json(alert);
        }
        catch (error) {
            console.error("Error creating alert:", error);
            res.status(500).json({ message: "Failed to create alert" });
        }
    });
    app.put('/api/alerts/:id', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { active } = req.body;
            const alert = await storage.updateAlert(parseInt(id), { active });
            res.json(alert);
        }
        catch (error) {
            console.error("Error updating alert:", error);
            res.status(500).json({ message: "Failed to update alert" });
        }
    });
    app.delete('/api/alerts/:id', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;
            await storage.deleteAlert(parseInt(id));
            res.json({ message: "Alert deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting alert:", error);
            res.status(500).json({ message: "Failed to delete alert" });
        }
    });
    // User settings routes
    app.get('/api/user/settings', authenticateToken, async (req, res) => {
        try {
            const settings = await storage.getUserSettings(req.user.userId);
            res.json(settings);
        }
        catch (error) {
            console.error("Error fetching user settings:", error);
            res.status(500).json({ message: "Failed to fetch user settings" });
        }
    });
    app.put('/api/user/settings', authenticateToken, async (req, res) => {
        try {
            const settings = await storage.updateUserSettings(req.user.userId, req.body);
            res.json(settings);
        }
        catch (error) {
            console.error("Error updating user settings:", error);
            res.status(500).json({ message: "Failed to update user settings" });
        }
    });
    app.put('/api/user/security', authenticateToken, async (req, res) => {
        try {
            const { currentPassword, newPassword, twoFactorEnabled } = req.body;
            const security = await storage.updateUserSecurity(req.user.userId, {
                currentPassword,
                newPassword,
                twoFactorEnabled
            });
            res.json(security);
        }
        catch (error) {
            console.error("Error updating security settings:", error);
            res.status(500).json({ message: "Failed to update security settings" });
        }
    });
    // Admin only: Seed database with sample data
    app.post('/api/admin/seed-database', authenticateToken, requireAdmin, async (req, res) => {
        try {
            const result = await seedDatabase();
            res.status(200).json({
                message: "Database seeded successfully",
                data: result
            });
        }
        catch (error) {
            console.error("Error seeding database:", error);
            res.status(500).json({ message: "Failed to seed database" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
