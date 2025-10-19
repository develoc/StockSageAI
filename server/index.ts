import cors from "cors";
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

  // Configure CORS with broader allowances for development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // In development, be more permissive with CORS
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000'];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Log CORS headers in debug mode
  if (process.env.DEBUG === 'true') {
    console.log('[CORS] Headers set for request:', {
      origin: req.headers.origin,
      method: req.method,
      path: req.path,
      headers: {
        'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
      }
    });
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed default users on startup
  try {
    const { seedDefaultUsers } = await import('./seedUsers');
    await seedDefaultUsers();
  } catch (error) {
    console.error('Failed to seed default users:', error);
  }

  // Start data update service for real-time market data
  try {
    // Initialize legacy data service for backward compatibility
    const { dataUpdateService } = await import('./dataUpdateService');
    await dataUpdateService.generateTodaysData(); // Generate current day data for missing historical points
    
    // Initialize the new real-time market data service with external API integrations
    const { marketDataService } = await import('./marketDataService');
    marketDataService.initialize(); // This will fetch real market data from external sources
    
    console.log('✅ Real-time market data services initialized');
    
    // Initialize the strategy analysis service for daily updates of strategies and insights
    setTimeout(async () => {
      try {
        const { strategyAnalysisService } = await import('./strategyAnalysisService');
        strategyAnalysisService.initialize(); // This will analyze market data and generate insights
        console.log('✅ Strategy Analysis Service initialized');
      } catch (error) {
        console.error('Failed to start strategy analysis service:', error);
      }
    }, 10000); // Start after market data service has had time to initialize
  } catch (error) {
    console.error('Failed to start market data services:', error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server runs on port 3000 (backend)
  // Frontend runs on port 5000 and proxies API requests here
  const port = process.env.PORT || 3000;
  const host = "0.0.0.0"; // Listen on all interfaces to ensure WSL connectivity
  
  server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    log(`serving on ${host}:${port}`);
    log(`WSL users: Backend available at http://localhost:${port} or http://<WSL-IP>:${port}`);
  });
})();
