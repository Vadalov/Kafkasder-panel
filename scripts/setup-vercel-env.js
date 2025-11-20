#!/usr/bin/env node

/**
 * Vercel Environment Variable Setup Script
 * 
 * This script helps automate the setup of environment variables in Vercel
 * for the Kafkasder Panel application.
 * 
 * Usage:
 *   node scripts/setup-vercel-env.js
 *   npm run setup:vercel
 * 
 * Prerequisites:
 *   - Vercel CLI installed: npm i -g vercel
 *   - Logged in to Vercel: vercel login
 *   - Project linked: vercel link
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Required environment variables for production
const REQUIRED_VARS = [
  {
    key: 'NEXT_PUBLIC_CONVEX_URL',
    description: 'Convex deployment URL (from Convex dashboard)',
    required: true,
    example: 'https://your-project.convex.cloud',
    target: 'production,preview,development'
  },
  {
    key: 'CSRF_SECRET',
    description: 'CSRF protection secret (min 32 characters)',
    required: true,
    example: 'Generate with: openssl rand -base64 32',
    target: 'production,preview',
    generate: true
  },
  {
    key: 'SESSION_SECRET',
    description: 'Session management secret (min 32 characters)',
    required: true,
    example: 'Generate with: openssl rand -base64 32',
    target: 'production,preview',
    generate: true
  },
  {
    key: 'FIRST_ADMIN_EMAIL',
    description: 'Initial admin email for first setup',
    required: true,
    example: 'baskan@dernek.org',
    target: 'production'
  },
  {
    key: 'FIRST_ADMIN_PASSWORD',
    description: 'Initial admin password (will be used on first seed)',
    required: true,
    example: 'YourSecurePassword123!',
    target: 'production'
  }
];

// Optional environment variables
const OPTIONAL_VARS = [
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    description: 'Sentry error tracking DSN',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SENTRY_DSN',
    description: 'Sentry server-side DSN',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SENTRY_ORG',
    description: 'Sentry organization name',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SENTRY_PROJECT',
    description: 'Sentry project name',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SMTP_HOST',
    description: 'SMTP server hostname',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SMTP_PORT',
    description: 'SMTP server port',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SMTP_USER',
    description: 'SMTP username',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SMTP_PASSWORD',
    description: 'SMTP password',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'SMTP_FROM',
    description: 'SMTP from address',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'TWILIO_ACCOUNT_SID',
    description: 'Twilio account SID for SMS',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'TWILIO_AUTH_TOKEN',
    description: 'Twilio auth token',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'TWILIO_PHONE_NUMBER',
    description: 'Twilio phone number',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI API key for AI features',
    required: false,
    target: 'production,preview'
  },
  {
    key: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    description: 'Google Maps API key',
    required: false,
    target: 'production,preview,development'
  }
];

function generateSecret() {
  try {
    return execSync('openssl rand -base64 32', { encoding: 'utf8' }).trim();
  } catch (error) {
    // Fallback if openssl is not available
    return require('crypto').randomBytes(32).toString('base64');
  }
}

function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function isLoggedIn() {
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function isProjectLinked() {
  return fs.existsSync(path.join(process.cwd(), '.vercel'));
}

async function setVercelEnv(key, value, target = 'production,preview,development') {
  const targets = target.split(',');
  
  for (const t of targets) {
    try {
      log(`  Setting ${key} for ${t}...`, 'cyan');
      execSync(`vercel env add ${key} ${t} <<< "${value}"`, { 
        stdio: 'ignore',
        cwd: process.cwd()
      });
    } catch (error) {
      // Variable might already exist, try to update
      try {
        execSync(`vercel env rm ${key} ${t} -y`, { stdio: 'ignore' });
        execSync(`vercel env add ${key} ${t} <<< "${value}"`, { stdio: 'ignore' });
      } catch (updateError) {
        log(`  ⚠ Failed to set ${key} for ${t}`, 'yellow');
      }
    }
  }
}

async function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const envVars = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

async function main() {
  log('\n═══════════════════════════════════════════════════════', 'bright');
  log('    Kafkasder Panel - Vercel Environment Setup', 'bright');
  log('═══════════════════════════════════════════════════════\n', 'bright');

  // Check prerequisites
  log('Checking prerequisites...', 'blue');
  
  if (!checkVercelCLI()) {
    log('✗ Vercel CLI is not installed', 'red');
    log('  Install with: npm i -g vercel', 'yellow');
    process.exit(1);
  }
  log('✓ Vercel CLI is installed', 'green');

  if (!isLoggedIn()) {
    log('✗ Not logged in to Vercel', 'red');
    log('  Login with: vercel login', 'yellow');
    process.exit(1);
  }
  log('✓ Logged in to Vercel', 'green');

  if (!isProjectLinked()) {
    log('✗ Project is not linked to Vercel', 'red');
    log('  Link with: vercel link', 'yellow');
    process.exit(1);
  }
  log('✓ Project is linked to Vercel\n', 'green');

  // Ask for setup mode
  log('Setup mode:', 'blue');
  log('1. Interactive (recommended) - Set each variable manually', 'yellow');
  log('2. From .env.local - Load from existing .env.local file', 'yellow');
  log('3. Required only - Set only required variables', 'yellow');
  const mode = await question('\nSelect mode (1/2/3): ');

  const envVars = {};

  if (mode === '2') {
    log('\nLoading from .env.local...', 'blue');
    const loadedVars = await loadEnvFromFile('.env.local');
    Object.assign(envVars, loadedVars);
    log(`✓ Loaded ${Object.keys(loadedVars).length} variables`, 'green');
  } else {
    // Interactive mode
    const varsToSet = mode === '3' ? REQUIRED_VARS : [...REQUIRED_VARS, ...OPTIONAL_VARS];

    log('\n' + '─'.repeat(55), 'cyan');
    log('Setting up environment variables', 'bright');
    log('─'.repeat(55) + '\n', 'cyan');

    for (const varDef of varsToSet) {
      log(`\n${varDef.key}`, 'bright');
      log(`  ${varDef.description}`, 'cyan');
      if (varDef.example) {
        log(`  Example: ${varDef.example}`, 'yellow');
      }

      let value;
      
      if (varDef.generate) {
        const useGenerated = await question('  Generate automatically? (y/n): ');
        if (useGenerated.toLowerCase() === 'y') {
          value = generateSecret();
          log(`  ✓ Generated secret`, 'green');
        }
      }

      if (!value) {
        if (!varDef.required) {
          const shouldSet = await question('  Set this variable? (y/n): ');
          if (shouldSet.toLowerCase() !== 'y') {
            continue;
          }
        }

        value = await question('  Enter value: ');
        
        if (varDef.required && !value) {
          log('  ✗ This variable is required!', 'red');
          value = await question('  Enter value: ');
        }
      }

      if (value) {
        envVars[varDef.key] = {
          value: value,
          target: varDef.target || 'production,preview,development'
        };
      }
    }
  }

  // Confirm before setting
  log('\n' + '═'.repeat(55), 'blue');
  log('Summary - Variables to set:', 'bright');
  log('═'.repeat(55), 'blue');
  
  Object.entries(envVars).forEach(([key, data]) => {
    const val = typeof data === 'object' ? data.value : data;
    const displayVal = val.length > 50 ? val.substring(0, 50) + '...' : val;
    log(`  ${key}: ${displayVal}`, 'cyan');
  });

  const confirm = await question('\nProceed with setting these variables? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    log('\n✗ Setup cancelled', 'yellow');
    rl.close();
    process.exit(0);
  }

  // Set variables in Vercel
  log('\n' + '─'.repeat(55), 'blue');
  log('Setting variables in Vercel...', 'bright');
  log('─'.repeat(55) + '\n', 'blue');

  for (const [key, data] of Object.entries(envVars)) {
    const value = typeof data === 'object' ? data.value : data;
    const target = typeof data === 'object' ? data.target : 'production,preview,development';
    
    await setVercelEnv(key, value, target);
    log(`✓ ${key} set successfully`, 'green');
  }

  log('\n' + '═'.repeat(55), 'green');
  log('✓ Environment variables setup completed!', 'bright');
  log('═'.repeat(55), 'green');
  
  log('\nNext steps:', 'blue');
  log('1. Deploy your application: vercel --prod', 'yellow');
  log('2. Deploy Convex backend: npm run convex:deploy', 'yellow');
  log('3. Verify deployment: check your Vercel dashboard', 'yellow');
  log('\nFor more information, see VERCEL_DEPLOYMENT.md', 'cyan');

  rl.close();
}

// Run the script
main().catch(error => {
  log(`\n✗ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
