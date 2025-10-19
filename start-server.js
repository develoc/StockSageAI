#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}============================================${colors.reset}`);
console.log(`${colors.cyan}      Quantum Trade Server Startup Tool      ${colors.reset}`);
console.log(`${colors.cyan}============================================${colors.reset}`);

// Check if required files exist
const requiredFiles = [
  'server/index.ts',
  'server/routes.ts',
  'server/marketDataService.ts',
  'server/strategyAnalysisService.ts'
];

console.log(`\n${colors.yellow}Checking for required server files...${colors.reset}`);
const missingFiles = [];
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.red}✖ Missing: ${file}${colors.reset}`);
    missingFiles.push(file);
  } else {
    console.log(`${colors.green}✓ Found: ${file}${colors.reset}`);
  }
}

if (missingFiles.length > 0) {
  console.log(`\n${colors.red}ERROR: Some required files are missing!${colors.reset}`);
  process.exit(1);
}

// Start the server
console.log(`\n${colors.blue}Starting Quantum Trade server on port 3000...${colors.reset}`);

const server = spawn('tsx', ['server/index.ts'], {
  env: { ...process.env, PORT: '3000', NODE_ENV: 'development' },
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error(`${colors.red}Failed to start server:${colors.reset}`, err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Stopping server...${colors.reset}`);
  server.kill();
  process.exit(0);
});

console.log(`\n${colors.green}Server startup command executed. Check logs above for status.${colors.reset}`);
console.log(`${colors.green}Press Ctrl+C to stop the server.${colors.reset}`);
