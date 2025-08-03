
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { nanoid } from 'nanoid';

export async function seedDefaultUsers() {
  try {
    console.log('Seeding default users...');

    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail('admin@quantumtrade.ai');
    if (!existingAdmin) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await storage.upsertUser({
        id: nanoid(),
        email: 'admin@quantumtrade.ai',
        firstName: 'System',
        lastName: 'Administrator',
        passwordHash: adminPasswordHash,
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@quantumtrade.ai / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check if regular user already exists
    const existingUser = await storage.getUserByEmail('user@quantumtrade.ai');
    if (!existingUser) {
      const userPasswordHash = await bcrypt.hash('user123', 10);
      await storage.upsertUser({
        id: nanoid(),
        email: 'user@quantumtrade.ai',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: userPasswordHash,
        role: 'user'
      });
      console.log('✅ Regular user created: user@quantumtrade.ai / user123');
    } else {
      console.log('ℹ️ Regular user already exists');
    }

    console.log('Default users seeding completed!');
  } catch (error) {
    console.error('Error seeding default users:', error);
    throw error;
  }
}
