import { seedDatabase } from './server/seedData.js';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    const result = await seedDatabase();
    console.log('✅ Database seeded successfully!');
    console.log(`📊 Market data points: ${result.marketDataPoints}`);
    console.log(`📈 Strategies: ${result.strategies}`);
    console.log(`🤖 AI Insights: ${result.insights}`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

main();