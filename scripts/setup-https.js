const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up HTTPS certificates for local development...');

try {
  // Install mkcert if not already installed
  console.log('Installing mkcert...');
  execSync('npx mkcert -install', { stdio: 'inherit' });
  
  // Create certificates for localhost
  console.log('Creating certificates for localhost...');
  execSync('npx mkcert localhost 127.0.0.1 ::1', { stdio: 'inherit' });
  
  console.log('HTTPS certificates created successfully!');
  console.log('You can now run: npm run dev:https');
} catch (error) {
  console.error('Error setting up HTTPS:', error.message);
  console.log('You can still run the app with: npm run dev');
} 