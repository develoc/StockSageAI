// Temporary script to seed the database
import { seedDatabase } from './server/seedData.js';
import { seedDefaultUsers } from './server/seedUsers.js';

async function runSeed() {
  try {
    console.log('Starting database seeding process...');
    
    console.log('Seeding default users...');
    await seedDefaultUsers();
    
    console.log('Seeding market data and strategies...');
    const results = await seedDatabase();
    
    console.log('Database seeding completed successfully!', results);
  } catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
  }
}

runSeed();
