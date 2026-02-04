#!/usr/bin/env node
/**
 * Security Scan Script
 * 
 * Runs various security checks:
 * 1. Dependency vulnerability scanning (npm audit)
 * 2. Secret detection in code
 * 3. Security configuration validation
 * 4. Environment variable checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXIT_CODES = {
  SUCCESS: 0,
  VULNERABILITIES_FOUND: 1,
  SECRETS_FOUND: 2,
  CONFIG_ERROR: 3,
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// 1. Dependency Vulnerability Scan
// ============================================================================

function runDependencyScan() {
  log('\n🔍 Running dependency vulnerability scan...', 'blue');
  
  try {
    // Run npm audit
    const auditOutput = execSync('npm audit --json', { 
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..'),
    });
    
    const audit = JSON.parse(auditOutput);
    const { vulnerabilities, metadata } = audit;
    
    const counts = {
      critical: metadata.vulnerabilities.critical || 0,
      high: metadata.vulnerabilities.high || 0,
      moderate: metadata.vulnerabilities.moderate || 0,
      low: metadata.vulnerabilities.low || 0,
      info: metadata.vulnerabilities.info || 0,
    };
    
    log(`  Critical: ${counts.critical}`, counts.critical > 0 ? 'red' : 'green');
    log(`  High: ${counts.high}`, counts.high > 0 ? 'red' : 'green');
    log(`  Moderate: ${counts.moderate}`, counts.moderate > 0 ? 'yellow' : 'green');
    log(`  Low: ${counts.low}`, 'green');
    
    // List critical and high vulnerabilities
    if (counts.critical > 0 || counts.high > 0) {
      log('\n⚠️  Critical/High vulnerabilities found:', 'red');
      
      Object.entries(vulnerabilities).forEach(([pkg, info]) => {
        if (info.severity === 'critical' || info.severity === 'high') {
          log(`  - ${pkg}: ${info.via[0]?.title || 'Unknown issue'}`, 'red');
          log(`    Severity: ${info.severity}`, 'red');
          log(`    Range: ${info.range}`, 'yellow');
          if (info.fixAvailable) {
            log(`    Fix available: Run 'npm audit fix'`, 'green');
          }
        }
      });
      
      return false;
    }
    
    log('✅ No critical or high vulnerabilities found', 'green');
    return true;
    
  } catch (error) {
    // npm audit exits with non-zero code if vulnerabilities found
    if (error.status === 1) {
      try {
        const audit = JSON.parse(error.stdout);
        log(`\n⚠️  Vulnerabilities found:`, 'yellow');
        log(`  Critical: ${audit.metadata.vulnerabilities.critical}`, 'red');
        log(`  High: ${audit.metadata.vulnerabilities.high}`, 'red');
        return false;
      } catch {
        log('❌ Failed to parse audit output', 'red');
        return false;
      }
    }
    log('❌ Failed to run npm audit:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// ============================================================================
// 2. Secret Detection
// ============================================================================

function runSecretDetection() {
  log('\n🔍 Scanning for secrets in code...', 'blue');
  
  const secretPatterns = [
    { pattern: /['"]AKIA[0-9A-Z]{16}['"]/, name: 'AWS Access Key' },
    { pattern: /['"][0-9a-zA-Z/+]{40}['"].*secret/i, name: 'Potential Secret' },
    { pattern: /private[_-]?key['"]?\s*[:=]\s*['"][^'"]{20,}/i, name: 'Private Key' },
    { pattern: /password['"]?\s*[:=]\s*['"][^'"]{8,}/i, name: 'Hardcoded Password' },
    { pattern: /api[_-]?key['"]?\s*[:=]\s*['"][^'"]{10,}/i, name: 'API Key' },
    { pattern: /token['"]?\s*[:=]\s*['"][^'"]{20,}/i, name: 'Token' },
  ];
  
  const sourceDirs = ['app', 'scripts'];
  let secretsFound = 0;
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        return;
      }
      
      secretPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(line)) {
          log(`  ⚠️  ${name} pattern found in ${filePath}:${index + 1}`, 'yellow');
          log(`     ${line.trim().substring(0, 80)}...`, 'red');
          secretsFound++;
        }
      });
    });
  }
  
  function scanDirectory(dir) {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) return;
    
    const files = fs.readdirSync(fullPath, { recursive: true });
    
    files.forEach(file => {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
        scanFile(filePath);
      }
    });
  }
  
  sourceDirs.forEach(scanDirectory);
  
  if (secretsFound === 0) {
    log('✅ No obvious secrets found in code', 'green');
    return true;
  }
  
  log(`\n⚠️  ${secretsFound} potential secrets found - review manually`, 'yellow');
  return false;
}

// ============================================================================
// 3. Security Configuration Validation
// ============================================================================

function validateSecurityConfig() {
  log('\n🔍 Validating security configuration...', 'blue');
  
  const issues = [];
  
  // Check environment variables
  const requiredEnvVars = [
    'ENCRYPTION_MASTER_KEY',
    'SESSION_SECRET',
  ];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      issues.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  // Check for secure values
  if (process.env.ENCRYPTION_MASTER_KEY) {
    if (process.env.ENCRYPTION_MASTER_KEY.length < 32) {
      issues.push('ENCRYPTION_MASTER_KEY should be at least 32 characters');
    }
    if (process.env.ENCRYPTION_MASTER_KEY === 'change-this-in-production') {
      issues.push('ENCRYPTION_MASTER_KEY is using default value');
    }
  }
  
  if (process.env.SESSION_SECRET) {
    if (process.env.SESSION_SECRET.length < 32) {
      issues.push('SESSION_SECRET should be at least 32 characters');
    }
  }
  
  // Check for production settings
  if (process.env.NODE_ENV === 'production') {
    if (process.env.HTTPS !== 'true' && !process.env.SECURE_COOKIE) {
      issues.push('HTTPS not enabled in production');
    }
  }
  
  // Check security-related files exist
  const securityFiles = [
    'app/utils/encryption.ts',
    'app/utils/csrf.ts',
    'app/utils/rateLimit.ts',
  ];
  
  securityFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing security file: ${file}`);
    }
  });
  
  if (issues.length === 0) {
    log('✅ Security configuration valid', 'green');
    return true;
  }
  
  log('\n⚠️  Configuration issues found:', 'yellow');
  issues.forEach(issue => log(`  - ${issue}`, 'yellow'));
  return false;
}

// ============================================================================
// 4. Check for known vulnerable dependencies
// ============================================================================

function checkKnownVulnerabilities() {
  log('\n🔍 Checking for known vulnerable dependencies...', 'blue');
  
  // List of packages with known vulnerabilities to avoid
  const vulnerablePackages = [
    { name: 'lodash', version: '<4.17.21', reason: 'Prototype pollution vulnerability' },
    { name: 'express', version: '<4.17.3', reason: 'qs vulnerability' },
    { name: 'jsonwebtoken', version: '<9.0.0', reason: 'Algorithm confusion' },
  ];
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
  );
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  let issues = 0;
  
  vulnerablePackages.forEach(({ name, version, reason }) => {
    if (allDeps[name]) {
      log(`  ⚠️  Found ${name}@${allDeps[name]}`, 'yellow');
      log(`     Potential vulnerability: ${reason}`, 'yellow');
      log(`     Recommended: Update to ${version}`, 'green');
      issues++;
    }
  });
  
  if (issues === 0) {
    log('✅ No known vulnerable dependencies found', 'green');
  }
  
  return issues === 0;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔒 GENETIC EXPLORER SECURITY SCAN', 'blue');
  log('='.repeat(60), 'blue');
  
  const results = {
    dependencies: runDependencyScan(),
    secrets: runSecretDetection(),
    config: validateSecurityConfig(),
    knownVulns: checkKnownVulnerabilities(),
  };
  
  log('\n' + '='.repeat(60), 'blue');
  log('SCAN SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${check}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n✅ All security checks passed!', 'green');
    process.exit(EXIT_CODES.SUCCESS);
  } else {
    log('\n❌ Some security checks failed', 'red');
    process.exit(EXIT_CODES.VULNERABILITIES_FOUND);
  }
}

main();
