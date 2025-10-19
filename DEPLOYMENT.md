
# QuantumTrade AI - Production Deployment Guide

This guide covers deploying QuantumTrade AI to production environments, with specific focus on Replit deployment.

## 🚀 Replit Deployment (Recommended)

### Prerequisites
- Replit account with sufficient compute credits
- Neon PostgreSQL database (free tier available)
- Environment variables configured

### Step 1: Environment Setup

1. **Configure Secrets in Replit**
   - Open the "Secrets" tab in your Replit workspace
   - Add the following secrets:

   ```env
   DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   NODE_ENV=production
   ```

2. **Database Connection String Format**
   ```
   postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
   ```

### Step 2: Database Setup

1. **Create Neon Database**
   - Sign up at https://neon.tech
   - Create a new project
   - Copy the connection string

2. **Initialize Database Schema**
   ```bash
   npm run db:push
   ```

3. **Verify Tables Created**
   - Check Neon dashboard for created tables
   - Ensure migrations ran successfully

### Step 3: Deployment Configuration

1. **Update .replit Configuration**
   The `.replit` file is already configured for production:
   ```toml
   [deployment]
   deploymentTarget = "autoscale"
   build = ["npm", "run", "build"]
   run = ["npm", "run", "start"]
   ```

2. **Configure Ports**
   - Production uses port 5000 (mapped to 80/443)
   - No changes needed - already configured

### Step 4: Deploy

1. **Click Deploy Button**
   - Use the "Deploy" button in Replit workspace
   - Select "Autoscale" deployment type
   - Configure machine resources (0.5 vCPU, 1GB RAM recommended)

2. **Monitor Deployment**
   - Watch build logs for any errors
   - Verify all dependencies install correctly
   - Check for successful database connection

3. **Test Deployment**
   - Access your deployed URL
   - Test login with default credentials
   - Verify all features work correctly

### Step 5: Post-Deployment

1. **Performance Monitoring**
   - Monitor CPU and memory usage
   - Track response times
   - Set up alerts for downtime

2. **Security Hardening**
   - Change default user passwords
   - Review and rotate JWT secrets
   - Enable additional security headers

## 🏗️ Alternative Deployment Options

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t quantumtrade-ai .
   docker run -p 5000:5000 --env-file .env quantumtrade-ai
   ```

### VPS/Cloud Server Deployment

1. **Server Requirements**
   - Ubuntu 20.04+ or similar
   - Node.js 18+
   - 2GB RAM minimum
   - 20GB storage
   - SSL certificate

2. **Installation Steps**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd quantumtrade-ai
   
   # Install dependencies
   npm ci
   
   # Build application
   npm run build
   
   # Set up environment
   cp .env.example .env
   # Edit .env with production values
   
   # Set up database
   npm run db:push
   
   # Start with PM2
   npm install -g pm2
   pm2 start npm --name "quantumtrade" -- start
   pm2 startup
   pm2 save
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Security
JWT_SECRET=your-256-bit-secret
SESSION_SECRET=your-session-secret

# Application
NODE_ENV=production
PORT=5000

# Optional: External APIs
ALPHA_VANTAGE_API_KEY=your-api-key
POLYGON_API_KEY=your-polygon-key
```

### Security Headers

Add these headers in production:

```javascript
// server/index.ts
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Database Optimization

1. **Connection Pooling**
   ```javascript
   // server/db.ts
   export const db = drizzle(sql, {
     logger: process.env.NODE_ENV === 'development',
   });
   ```

2. **Query Optimization**
   - Add database indexes for frequently queried columns
   - Use prepared statements for repeated queries
   - Implement query result caching

### Performance Optimization

1. **Client-Side Optimizations**
   - Enable Vite production build optimizations
   - Implement code splitting
   - Add service worker for caching
   - Optimize images and assets

2. **Server-Side Optimizations**
   - Enable gzip compression
   - Implement response caching
   - Use CDN for static assets
   - Monitor and optimize database queries

## 📊 Monitoring & Maintenance

### Health Checks

1. **Application Health Endpoint**
   ```javascript
   // Add to server/routes.ts
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version,
     });
   });
   ```

2. **Database Health Check**
   ```javascript
   app.get('/health/db', async (req, res) => {
     try {
       await storage.healthCheck();
       res.json({ status: 'healthy', database: 'connected' });
     } catch (error) {
       res.status(500).json({ status: 'unhealthy', error: error.message });
     }
   });
   ```

### Logging

1. **Application Logging**
   ```javascript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });
   ```

2. **Request Logging**
   ```javascript
   import morgan from 'morgan';
   
   app.use(morgan('combined', {
     stream: { write: (message) => logger.info(message.trim()) }
   }));
   ```

### Backup Strategy

1. **Database Backups**
   - Neon provides automatic backups
   - Set up additional manual backup schedule
   - Store backups in multiple locations

2. **Application Backups**
   - Regular code repository backups
   - Environment configuration backups
   - User-uploaded content backups

### Scaling Considerations

1. **Horizontal Scaling**
   - Use Replit's autoscale features
   - Configure load balancing
   - Implement stateless architecture

2. **Database Scaling**
   - Monitor database performance
   - Implement read replicas if needed
   - Consider database sharding for high traffic

## 🚨 Troubleshooting Production Issues

### Common Production Issues

1. **Memory Leaks**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Restart if memory usage too high
   pm2 restart quantumtrade
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connectivity
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Verify connection pooling
   # Check for connection leaks in application code
   ```

3. **High CPU Usage**
   ```bash
   # Profile application
   npm install -g clinic
   clinic doctor -- node dist/server/index.js
   
   # Analyze performance bottlenecks
   ```

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Revert to previous version
   git checkout <previous-commit>
   npm run build
   pm2 restart quantumtrade
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup.sql
   
   # Verify data integrity
   npm run db:push
   ```

3. **Service Recovery**
   ```bash
   # Full application restart
   pm2 stop quantumtrade
   pm2 start quantumtrade
   
   # Clear caches
   redis-cli FLUSHALL
   ```

## 📈 Performance Metrics

### Key Metrics to Monitor

1. **Application Metrics**
   - Response time (target: <200ms)
   - Throughput (requests/second)
   - Error rate (target: <1%)
   - CPU usage (target: <70%)
   - Memory usage (target: <80%)

2. **Database Metrics**
   - Query response time
   - Connection count
   - Cache hit ratio
   - Database size growth

3. **Business Metrics**
   - User login rate
   - Trading volume
   - Strategy performance
   - Portfolio value changes

### Alerting Thresholds

```yaml
alerts:
  high_error_rate:
    threshold: 5%
    duration: 5m
  
  high_response_time:
    threshold: 500ms
    duration: 2m
  
  database_connections:
    threshold: 80%
    duration: 1m
  
  memory_usage:
    threshold: 85%
    duration: 5m
```

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] Default passwords changed
- [ ] JWT secrets rotated
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Audit logging implemented

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review error logs
   - Check performance metrics
   - Update dependencies (security patches)
   - Verify backup integrity

2. **Monthly**
   - Database maintenance (VACUUM, ANALYZE)
   - Security audit
   - Performance optimization review
   - User access review

3. **Quarterly**
   - Dependency updates (major versions)
   - Security penetration testing
   - Disaster recovery testing
   - Architecture review

### Getting Help

- **Documentation**: Check README.md and code comments
- **Community**: GitHub issues and discussions
- **Professional Support**: Available for enterprise customers

---

Successfully deploying QuantumTrade AI requires careful attention to security, performance, and monitoring. Follow this guide step-by-step for a robust production deployment.
