import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Test database connection
async function testConnection(retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            console.log('✅ Database connection successful');
            return;
        }
        catch (error) {
            console.error(`Database connection attempt ${i + 1}/${retries} failed:`, error);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                throw new Error('Failed to connect to database after multiple attempts');
            }
        }
    }
}
// Initialize connection
testConnection().catch(error => {
    console.error('Fatal: Database connection failed:', error);
    process.exit(1);
});
export const db = drizzle(pool, { schema });
