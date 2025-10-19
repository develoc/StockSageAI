#!/usr/bin/env node

import fetch from 'node-fetch';

// Test connection to the API
async function testAPI() {
  try {
    console.log('Testing API connection...');
    const response = await fetch('http://localhost:3000/api/health');
    
    if (!response.ok) {
      console.error(`API health check failed with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log('API health check response:', data);
    return true;
  } catch (error) {
    console.error('API connection error:', error);
    return false;
  }
}

// Test login endpoint
async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@quantumtrade.ai',
        password: 'admin123'
      })
    });
    
    console.log('Login response status:', response.status);
    const data = await response.json();
    console.log('Login response data:', data);
    return response.ok;
  } catch (error) {
    console.error('Login test error:', error);
    return false;
  }
}

async function run() {
  const apiRunning = await testAPI();
  
  if (apiRunning) {
    await testLogin();
  } else {
    console.error('API server is not running or not accessible.');
  }
}

run();