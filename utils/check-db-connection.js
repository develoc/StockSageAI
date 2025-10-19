import * as pg from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg.default;

// Function to check connection and reset password if needed
async function checkDatabaseAndResetPasswords() {
  // Create a new connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test connection
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');

    // Check if users table exists
    const checkTableRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!checkTableRes.rows[0].exists) {
      console.error('❌ Users table does not exist! Database might not be initialized.');
      client.release();
      await pool.end();
      return;
    }
    
    // List all users
    console.log('\nExisting users:');
    const usersResult = await client.query('SELECT id, email, role, is_active FROM users');
    
    if (usersResult.rows.length === 0) {
      console.log('No users found in the database. Creating default users...');
      
      // Create default admin user
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (id, email, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, ['admin123', 'admin@quantumtrade.ai', 'System', 'Administrator', adminPasswordHash, 'admin', true]);
      
      // Create default regular user
      const userPasswordHash = await bcrypt.hash('user123', 10);
      await client.query(`
        INSERT INTO users (id, email, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, ['user123', 'user@quantumtrade.ai', 'Test', 'User', userPasswordHash, 'user', true]);
      
      console.log('✅ Default users created successfully!');
    } else {
      // Display users
      usersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ID: ${user.id} - Active: ${user.is_active ? 'Yes' : 'No'}`);
      });
      
      // Reset all user passwords to match their user type
      console.log('\nResetting user passwords...');
      
      for (const user of usersResult.rows) {
        // Generate a password based on the user's role
        let password = user.role === 'admin' ? 'admin123' : 'user123';
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Update user password
        await client.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [passwordHash, user.id]
        );
        
        // If user is not active, activate them
        if (!user.is_active) {
          await client.query('UPDATE users SET is_active = true WHERE id = $1', [user.id]);
        }
        
        console.log(`✅ Reset password for ${user.email} to "${password}"`);
      }
    }
    
    console.log('\n✅ Database check complete!');
    console.log('\nDefault login credentials:');
    console.log('- Admin: admin@quantumtrade.ai / admin123');
    console.log('- User:  user@quantumtrade.ai / user123');
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err);
  } finally {
    await pool.end();
  }
}

// Run the function
checkDatabaseAndResetPasswords().catch(console.error);