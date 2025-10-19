
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

export async function seedDefaultUsers() {
  try {
    console.log('Seeding default users...');

    // Create admin user manually with explicit ID
    const existingAdmin = await storage.getUserByEmail('admin@quantumtrade.ai');
    if (!existingAdmin) {
      // Use direct DB insertion to ensure admin creation works
      const adminId = uuidv4();
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      
      console.log(`Creating admin user with ID: ${adminId}`);
      await storage.upsertUser({
        id: adminId,
        email: 'admin@quantumtrade.ai',
        firstName: 'System',
        lastName: 'Administrator',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created: admin@quantumtrade.ai / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create standard user account
    const existingUser = await storage.getUserByEmail('user@quantumtrade.ai');
    if (!existingUser) {
      const userId = uuidv4();
      const userPasswordHash = await bcrypt.hash('user123', 10);
      
      console.log(`Creating standard user with ID: ${userId}`);
      await storage.upsertUser({
        id: userId,
        email: 'user@quantumtrade.ai',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: userPasswordHash,
        role: 'user',
        isActive: true
      });
      console.log('✅ Regular user created: user@quantumtrade.ai / user123');
    } else {
      console.log('ℹ️ Regular user already exists');
    }
    
    // Create demo user account
    const existingDemo = await storage.getUserByEmail('demo@quantumtrade.ai');
    if (!existingDemo) {
      const demoId = uuidv4();
      const demoPasswordHash = await bcrypt.hash('demo123', 10);
      
      console.log(`Creating demo user with ID: ${demoId}`);
      await storage.upsertUser({
        id: demoId,
        email: 'demo@quantumtrade.ai',
        firstName: 'Demo',
        lastName: 'User',
        passwordHash: demoPasswordHash,
        role: 'user',
        isActive: true
      });
      console.log('✅ Demo user created: demo@quantumtrade.ai / demo123');
    } else {
      console.log('ℹ️ Demo user already exists');
    }

    console.log('Default users seeding completed!');
  } catch (error) {
    console.error('Error seeding default users:', error);
    console.error(error);
    // Don't throw error, just log it
  }
}
