// test-auth.js - Client-side authentication test script
// Run with Node.js: node test-auth.js

const axios = require('axios');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Default server URL
let serverUrl = 'http://localhost:3000';

console.log(`${colors.cyan}============================================${colors.reset}`);
console.log(`${colors.cyan}      StockSageAI Auth Server Test Tool     ${colors.reset}`);
console.log(`${colors.cyan}============================================${colors.reset}`);

// Ask for the server URL
rl.question(`\n${colors.yellow}Enter the auth server URL ${colors.reset}[${colors.blue}${serverUrl}${colors.reset}]: `, (answer) => {
  if (answer.trim()) {
    serverUrl = answer.trim();
  }
  
  console.log(`\n${colors.yellow}Testing server connection to: ${colors.blue}${serverUrl}${colors.reset}`);
  
  // Test the health endpoint first
  axios.get(`${serverUrl}/api/health`)
    .then(response => {
      console.log(`${colors.green}✓ Server connection successful!${colors.reset}`);
      console.log(`${colors.yellow}Server status:${colors.reset}`, response.data);
      
      // Proceed to test login
      testLogin();
    })
    .catch(error => {
      console.log(`${colors.red}✖ Server connection failed:${colors.reset}`, error.message);
      console.log(`\n${colors.yellow}Make sure:${colors.reset}`);
      console.log(`  1. The auth server is running at ${serverUrl}`);
      console.log(`  2. There are no network issues or firewalls blocking the connection`);
      console.log(`  3. If using WSL, check that the Windows host can reach the WSL instance`);
      
      rl.close();
    });
});

// Test login functionality
function testLogin() {
  console.log(`\n${colors.yellow}Testing login functionality...${colors.reset}`);
  
  // Default test credentials
  const defaultEmail = 'admin@quantumtrade.ai';
  const defaultPassword = 'admin123';
  
  rl.question(`\n${colors.yellow}Enter test email ${colors.reset}[${colors.blue}${defaultEmail}${colors.reset}]: `, (email) => {
    const testEmail = email.trim() || defaultEmail;
    
    rl.question(`${colors.yellow}Enter test password ${colors.reset}[${colors.blue}${defaultPassword}${colors.reset}]: `, (password) => {
      const testPassword = password.trim() || defaultPassword;
      
      console.log(`\n${colors.yellow}Attempting login with email:${colors.reset} ${testEmail}`);
      
      // Attempt login
      axios.post(`${serverUrl}/api/auth/login`, { 
        email: testEmail, 
        password: testPassword 
      })
        .then(response => {
          console.log(`\n${colors.green}✓ Login successful!${colors.reset}`);
          
          // Display token (partially masked)
          const token = response.data.token;
          const maskedToken = token.substring(0, 15) + '...' + token.substring(token.length - 10);
          console.log(`${colors.yellow}JWT Token:${colors.reset} ${maskedToken}`);
          
          // Display user info
          console.log(`\n${colors.yellow}User Information:${colors.reset}`);
          console.log(`  ID: ${response.data.user.id}`);
          console.log(`  Email: ${response.data.user.email}`);
          console.log(`  Name: ${response.data.user.firstName} ${response.data.user.lastName}`);
          console.log(`  Role: ${response.data.user.role}`);
          
          // Test getting current user
          testGetUser(token);
        })
        .catch(error => {
          console.log(`\n${colors.red}✖ Login failed:${colors.reset}`, 
            error.response?.data?.message || error.message);
          rl.close();
        });
    });
  });
}

// Test getting current user with token
function testGetUser(token) {
  console.log(`\n${colors.yellow}Testing 'Get Current User' endpoint...${colors.reset}`);
  
  axios.get(`${serverUrl}/api/auth/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      console.log(`\n${colors.green}✓ Successfully retrieved user data!${colors.reset}`);
      console.log(`${colors.yellow}Verified User:${colors.reset}`, response.data);
      
      // Test logout
      testLogout(token);
    })
    .catch(error => {
      console.log(`\n${colors.red}✖ Failed to get user data:${colors.reset}`,
        error.response?.data?.message || error.message);
      rl.close();
    });
}

// Test logout functionality
function testLogout(token) {
  console.log(`\n${colors.yellow}Testing logout endpoint...${colors.reset}`);
  
  axios.post(`${serverUrl}/api/auth/logout`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      console.log(`\n${colors.green}✓ Logout successful!${colors.reset}`);
      console.log(`${colors.yellow}Response:${colors.reset}`, response.data);
      
      console.log(`\n${colors.green}Authentication flow test completed successfully!${colors.reset}`);
      rl.close();
    })
    .catch(error => {
      console.log(`\n${colors.red}✖ Logout failed:${colors.reset}`,
        error.response?.data?.message || error.message);
      rl.close();
    });
}