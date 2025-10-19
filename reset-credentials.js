#!/usr/bin/env node

/**
 * QuickFix: Reset User Credentials Script
 * This script resets passwords for existing users in the database
 * and creates default users if none exist
 */

// Import required packages
import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

// Initialize dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const { Pool } = pg;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}============================================${colors.reset}`);
console.log(`${colors.bold}${colors.blue}     QuantumTrade AI Credential Reset      ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}============================================${colors.reset}`);

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(`${colors.red}ERROR: DATABASE_URL environment variable is not set.${colors.reset}`);
  console.log(`${colors.yellow}Please set DATABASE_URL in your .env file or environment variables.${colors.reset}`);
  console.log(`${colors.yellow}Example: DATABASE_URL=postgresql://dbadmin:dbadmin@localhost:5432/quantumtrade${colors.reset}`);
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl
});

/**
 * Reset user passwords in the database
 */
async function resetUserPasswords() {
  let client;
  
  try {
    // Connect to the database
    console.log(`\n${colors.yellow}Connecting to the database...${colors.reset}`);
    client = await pool.connect();
    console.log(`${colors.green}✓ Connected to the database${colors.reset}`);

    // Check if users table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const tableExistsResult = await client.query(tableExistsQuery);
    
    if (!tableExistsResult.rows[0].exists) {
      console.log(`${colors.red}✗ Users table does not exist${colors.reset}`);
      console.log(`${colors.yellow}Creating users table...${colors.reset}`);
      
      // Create users table if it doesn't exist
      await client.query(`
        CREATE TABLE users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          profile_image_url VARCHAR(255),
          password_hash VARCHAR(255),
          role VARCHAR(255) NOT NULL DEFAULT 'user',
          "walletAddress" VARCHAR(255),
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log(`${colors.green}✓ Users table created${colors.reset}`);
    }

    // Get existing users
    const usersResult = await client.query('SELECT * FROM users');
    
    if (usersResult.rows.length === 0) {
      // No users found, create default users
      console.log(`${colors.yellow}No users found. Creating default users...${colors.reset}`);
      
      // Create admin user
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (id, email, first_name, last_name, password_hash, role, "isActive", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, ['admin123', 'admin@quantumtrade.ai', 'System', 'Administrator', adminPasswordHash, 'admin', true]);
      
      // Create regular user
      const userPasswordHash = await bcrypt.hash('user123', 10);
      await client.query(`
        INSERT INTO users (id, email, first_name, last_name, password_hash, role, "isActive", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, ['user123', 'user@quantumtrade.ai', 'Test', 'User', userPasswordHash, 'user', true]);
      
      console.log(`${colors.green}✓ Default users created:${colors.reset}`);
      console.log(`  - Admin: admin@quantumtrade.ai / admin123`);
      console.log(`  - User: user@quantumtrade.ai / user123`);
    } else {
      // Reset passwords for existing users
      console.log(`\n${colors.yellow}Found ${usersResult.rows.length} existing users. Resetting passwords...${colors.reset}`);
      
      for (const user of usersResult.rows) {
        // Generate a password based on user role
        let password = user.role === 'admin' ? 'admin123' : 'user123';
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Update user
        await client.query(`
          UPDATE users 
          SET password_hash = $1, "isActive" = true, updated_at = NOW()
          WHERE id = $2
        `, [passwordHash, user.id]);
        
        console.log(`${colors.green}✓ Reset password for ${user.email} to "${password}"${colors.reset}`);
      }
    }
    
    // Display all users
    const updatedUsersResult = await client.query('SELECT id, email, role, "isActive" FROM users');
    
    console.log(`\n${colors.bold}${colors.blue}Current users in the database:${colors.reset}`);
    updatedUsersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Active: ${user.isActive ? 'Yes' : 'No'}`);
    });

    console.log(`\n${colors.bold}${colors.green}Credential reset completed successfully!${colors.reset}`);
    console.log(`\n${colors.yellow}You can now log in with:${colors.reset}`);
    console.log(`- Admin: admin@quantumtrade.ai / admin123`);
    console.log(`- User:  user@quantumtrade.ai / user123`);

  } catch (err) {
    console.error(`${colors.red}ERROR: ${err.message}${colors.reset}`);
    console.error(err.stack);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Execute the function
resetUserPasswords().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});