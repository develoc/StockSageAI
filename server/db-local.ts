import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/pg-pool';
import * as schema from "@shared/schema";

// Verify that the DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a PostgreSQL connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize drizzle with the pool and schema
export const db = drizzle(pool, { schema });
