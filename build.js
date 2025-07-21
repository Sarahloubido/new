#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting custom build process...');

// Path to react-scripts
const reactScriptsPath = path.join(__dirname, 'node_modules', '.bin', 'react-scripts');

// Spawn the build process
const buildProcess = spawn('node', [reactScriptsPath, 'build'], {
  stdio: 'inherit',
  cwd: __dirname
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Build failed with code:', code);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});