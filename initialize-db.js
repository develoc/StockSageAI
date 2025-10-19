#!/usr/bin/env node

import 'dotenv/config';
import               try {
              // Extract password from DATABASE_URL
              const dbUrl = new URL(process.env.DATABASE_URL);
              const password = dbUrl.password;
              
              // Use PGPASSWORD environment variable
              const env = { ...process.env, PGPASSWORD: password };
              
              execSync('psql -U dbadmin -d quantumtrade -f ./migrations/0000_naive_zuras.sql', { stdio: 'inherit', env });
              execSync('psql -U dbadmin -d quantumtrade -f ./migrations/0001_yummy_oracle.sql', { stdio: 'inherit', env });
              execSync('psql -U dbadmin -d quantumtrade -f ./migrations/0002_add_alerts_and_settings.sql', { stdio: 'inherit', env });
            } catch (sqlErr) {cSync } from 'child_process';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable not found. Make sure you have a .env file with DATABASE_URL set.');
  process.exit(1);
}

console.log('Running database migrations...');

try {
  // Check if the database is accessible
  console.log('Testing database connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1
  });

  pool.connect(async (err, client, done) => {
    if (err) {
      console.error('Failed to connect to database:', err.message);
      process.exit(1);
    }
    
    console.log('Database connection successful!');
    done();
    
    try {
      // First check if tables exist
      console.log('Checking if tables exist...');
      const res = await client.query(`
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'market_data'
      `);
      
      if (parseInt(res.rows[0].count) === 0) {
        console.log('Tables not found. Running migrations...');
        try {
          // First try the npm script way
          execSync('npm run db:push', { stdio: 'inherit' });
        } catch (err) {
          console.log('npm script failed, trying direct migrations...');
          // Try applying migrations directly
          try {
            execSync('npx drizzle-kit generate', { stdio: 'inherit' });
            execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
          } catch (migrationErr) {
            console.log('Direct migration failed, trying manual SQL...');
            // As a last resort, try executing migration files directly
            try {
              execSync('psql -U dbadmin -d quantumtrade -f ./migrations/0000_naive_zuras.sql', { stdio: 'inherit' });
              execSync('psql -U dbadmin -d quantumtrade -f ./migrations/0001_yummy_oracle.sql', { stdio: 'inherit' });
              execSync('psql -U dbadmin -d quantumtrade -f ./migrations/0002_add_alerts_and_settings.sql', { stdio: 'inherit' });
            } catch (sqlErr) {
              console.error('All migration attempts failed:', sqlErr);
              throw sqlErr;
            }
          }
        }
        console.log('Database schema migration completed!');
      } else {
        console.log('Tables already exist.');
      }

      console.log('Running seed data script...');
      execSync('npx tsx run-seed.ts', { stdio: 'inherit' });
      
      console.log('Database initialization complete!');
      process.exit(0);
    } catch (error) {
      console.error('Error during database initialization:', error);
      process.exit(1);
    }
  });
} catch (error) {
  console.error('Failed to run database migrations:', error);
  process.exit(1);
}