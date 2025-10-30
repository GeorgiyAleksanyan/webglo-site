#!/usr/bin/env node

// WebGlo Comment System Setup Script
// This script helps configure the comment system for deployment

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupCommentSystem() {
  console.log('🚀 WebGlo Comment System Setup');
  console.log('=====================================\n');

  try {
    // Get configuration from user
    const googleSheetId = await question('Enter your Google Sheets ID: ');
    const appsScriptUrl = await question('Enter your Google Apps Script URL: ');
    const adminEmail = await question('Enter admin email for notifications: ');
    const allowedOrigins = await question('Enter allowed origins (comma-separated): ');
    
    // Generate admin key
    const adminKey = generateSecureKey();
    console.log(`\n🔑 Generated admin key: ${adminKey}`);
    console.log('⚠️  SAVE THIS KEY SECURELY - You\'ll need it for moderation!\n');

    // Update frontend files
    await updateCommentsSystem(appsScriptUrl);
    await updateModerationDashboard(appsScriptUrl);
    
    // Generate Google Apps Script configuration
    await generateAppsScriptConfig(googleSheetId, adminEmail, allowedOrigins, adminKey);

    console.log('✅ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Copy the generated Apps Script configuration to your Google Apps Script project');
    console.log('2. Deploy your Google Apps Script as a web app');
    console.log('3. Test the comment system');
    console.log('4. Configure your admin dashboard with the admin key');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

function generateSecureKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function updateCommentsSystem(apiUrl) {
  const filePath = path.join(__dirname, '..', 'js', 'comments-system.js');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /this\.apiUrl = '[^']*';/,
      `this.apiUrl = '${apiUrl}';`
    );
    fs.writeFileSync(filePath, content);
    console.log('✅ Updated js/comments-system.js');
  }
}

async function updateModerationDashboard(apiUrl) {
  const filePath = path.join(__dirname, '..', 'admin', 'comments-moderation.html');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /this\.apiUrl = '[^']*';/,
      `this.apiUrl = '${apiUrl}';`
    );
    fs.writeFileSync(filePath, content);
    console.log('✅ Updated admin/comments-moderation.html');
  }
}

async function generateAppsScriptConfig(sheetId, adminEmail, origins, adminKey) {
  const config = `
// WebGlo Comment System Configuration
// Copy this to your Google Apps Script project

const CONFIG = {
  SHEET_ID: '${sheetId}',
  ALLOWED_ORIGINS: '${origins}',
  ADMIN_EMAIL: '${adminEmail}',
  ADMIN_KEY: '${adminKey}',
  MAX_COMMENT_LENGTH: 2000,
  MAX_COMMENTS_PER_IP_PER_HOUR: 5,
  MODERATION_ENABLED: true,
  PROFANITY_FILTER: true
};

// Also set these as Script Properties in Google Apps Script:
// COMMENTS_SHEET_ID: ${sheetId}
// ALLOWED_ORIGINS: ${origins}
// ADMIN_EMAIL: ${adminEmail}
// ADMIN_KEY: ${adminKey}
`;

  const configPath = path.join(__dirname, 'apps-script-config.js');
  fs.writeFileSync(configPath, config);
  console.log('✅ Generated backend/apps-script-config.js');
}

// Run the setup
setupCommentSystem();
