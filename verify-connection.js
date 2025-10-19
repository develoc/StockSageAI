const http = require('http');

// Function to check if a server is running on a specific port
function checkServerRunning(port, description) {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      host: 'localhost',
      port: port,
      path: '/',
      timeout: 3000
    }, (res) => {
      console.log(`✅ ${description} is running on port ${port}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.error(`❌ ${description} is not running on port ${port}: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error(`⚠️ ${description} check timed out on port ${port}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log("Verifying server connections...");
  
  // Check backend server (port 3000)
  await checkServerRunning(3000, "Backend server");
  
  // Check frontend server (port 5000)
  await checkServerRunning(5000, "Frontend server");
  
  console.log("\nIf any servers are not running, try these commands:");
  console.log("1. To start the backend: npm run dev:server");
  console.log("2. To start the frontend: npm run dev:client");
  console.log("3. To start both: npm run dev");
}

main();
