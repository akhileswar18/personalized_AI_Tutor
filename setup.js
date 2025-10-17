#!/usr/bin/env node

/**
 * Setup script for Personalized AI Tutor with Knowledge Graph
 * This script helps users set up the project quickly
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log('❌ Node.js 18+ is required. Current version: ' + nodeVersion, 'red');
    log('Please update Node.js from https://nodejs.org/', 'yellow');
    process.exit(1);
  }
  
  log(`✅ Node.js version: ${nodeVersion}`, 'green');
}

function checkPackageManager() {
  try {
    execSync('npm --version', { stdio: 'ignore' });
    log('✅ npm is available', 'green');
    return 'npm';
  } catch (error) {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      log('✅ yarn is available', 'green');
      return 'yarn';
    } catch (error) {
      log('❌ Neither npm nor yarn is available', 'red');
      process.exit(1);
    }
  }
}

function createEnvFile() {
  const envPath = '.env';
  
  if (fs.existsSync(envPath)) {
    log('✅ .env file already exists', 'green');
    return;
  }
  
  const envContent = `# Personalized AI Tutor Environment Variables
# Copy this file and add your actual API keys

# Required: Groq API key for AI tutoring
GROQ_API_KEY=your_groq_api_key_here

# Optional: Google Gemini API key for enhanced features
GEMINI_API_KEY=your_gemini_api_key_here

# Backend server configuration
PORT=8787
VITE_API_BASE=http://localhost:8787

# Development settings
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envContent);
  log('✅ Created .env file template', 'green');
  log('⚠️  Please edit .env file and add your API keys', 'yellow');
}

function installDependencies(packageManager) {
  log('📦 Installing dependencies...', 'blue');
  
  try {
    if (packageManager === 'yarn') {
      execSync('yarn install', { stdio: 'inherit' });
    } else {
      execSync('npm install', { stdio: 'inherit' });
    }
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    log('Please run: npm install', 'yellow');
    process.exit(1);
  }
}

function createDirectories() {
  const directories = [
    'server/tmp',
    'server/tmp/videos',
    'server/tmp/audio',
    'server/tmp/images'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    }
  });
}

function displayNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'bright');
  log('1. Edit .env file and add your API keys:', 'cyan');
  log('   - Get Groq API key: https://console.groq.com/', 'cyan');
  log('   - Get Gemini API key: https://makersuite.google.com/app/apikey', 'cyan');
  log('\n2. Start the development servers:', 'cyan');
  log('   Terminal 1: npm run server:dev', 'cyan');
  log('   Terminal 2: npm run dev', 'cyan');
  log('\n3. Open your browser to: http://localhost:5173', 'cyan');
  log('\n📚 For more information, see README.md', 'blue');
  log('\n🐛 Need help? Create an issue on GitHub', 'blue');
}

function main() {
  log('🚀 Personalized AI Tutor Setup', 'bright');
  log('===============================', 'bright');
  
  checkNodeVersion();
  const packageManager = checkPackageManager();
  createEnvFile();
  installDependencies(packageManager);
  createDirectories();
  displayNextSteps();
}

// Run setup
main();
