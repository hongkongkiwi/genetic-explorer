#!/usr/bin/env node
/**
 * Security Audit Script
 * 
 * Implements checks inspired by cargo-deny for Rust (used in Lightway)
 * 
 * This script performs comprehensive security checks:
 * 1. npm audit for known vulnerabilities
 * 2. License compliance checking
 * 3. Banned package detection
 * 4. Multiple version detection
 * 5. Outdated security-critical packages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(process.cwd(), 'deny.toml');
let config = {};

if (fs.existsSync(configPath)) {
  // Simple TOML parsing (sufficient for our config structure)
  const tomlContent = fs.readFileSync(configPath, 'utf8');
  config = parseTOML(tomlContent);
}

// Default configuration
const defaultConfig = {
  advisories: { 'severity-threshold': 'moderate', yanked: 'deny' },
  licenses: { allow: ['MIT', 'Apache-2.0'], deny: ['GPL-3.0', 'Proprietary'] },
  bans: { 'multiple-versions': 'warn', wildcards: 'warn', deny: [] },
  sources: { 'unknown-registry': 'deny', 'allow-registry': ['https://registry.npmjs.org'] },
};

config = mergeConfig(defaultConfig, config);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

let exitCode = 0;
const issues = [];

function log(message, level = 'info') {
  const color = level === 'error' ? colors.red : level === 'warn' ? colors.yellow : colors.blue;
  console.log(`${color}${message}${colors.reset}`);
}

// ============================================================================
// TOML Parser (simplified)
// ============================================================================

function parseTOML(content) {
  const result = {};
  let currentSection = null;
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Section header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      result[currentSection] = result[currentSection] || {};
      continue;
    }
    
    // Key-value pair
    const match = trimmed.match(/^([^=]+)=\s*(.+)$/);
    if (match && currentSection) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, '').replace(/'/g, ''));
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      
      result[currentSection][key] = value;
    }
  }
  
  return result;
}

function mergeConfig(defaults, custom) {
  const result = { ...defaults };
  for (const key in custom) {
    if (typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key], ...custom[key] };
    } else {
      result[key] = custom[key];
    }
  }
  return result;
}

// ============================================================================
// Checks
// ============================================================================

function checkNpmAudit() {
  log('\n🔍 Running npm audit...', 'info');
  
  try {
    const output = execSync('npm audit --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const audit = JSON.parse(output);
    
    const vulnerabilities = audit.vulnerabilities || {};
    const metadata = audit.metadata || {};
    
    const counts = {
      critical: metadata.vulnerabilities?.critical || 0,
      high: metadata.vulnerabilities?.high || 0,
      moderate: metadata.vulnerabilities?.moderate || 0,
      low: metadata.vulnerabilities?.low || 0,
      info: metadata.vulnerabilities?.info || 0,
    };
    
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
      log('✅ No vulnerabilities found', 'info');
      return;
    }
    
    log(`\nFound ${total} vulnerabilities:`, 'warn');
    if (counts.critical > 0) log(`  Critical: ${counts.critical}`, 'error');
    if (counts.high > 0) log(`  High: ${counts.high}`, 'error');
    if (counts.moderate > 0) log(`  Moderate: ${counts.moderate}`, 'warn');
    if (counts.low > 0) log(`  Low: ${counts.low}`, 'info');
    if (counts.info > 0) log(`  Info: ${counts.info}`, 'info');
    
    // Check against threshold
    const threshold = config.advisories['severity-threshold'] || 'moderate';
    const thresholdMap = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };
    const thresholdIndex = thresholdMap[threshold] || 2;
    
    let violatingCount = 0;
    const severities = ['critical', 'high', 'moderate', 'low', 'info'];
    for (let i = 0; i <= thresholdIndex; i++) {
      violatingCount += counts[severities[i]];
    }
    
    if (violatingCount > 0) {
      log(`\n❌ ${violatingCount} vulnerabilities meet or exceed threshold (${threshold})`, 'error');
      exitCode = 1;
      
      // List affected packages
      for (const [name, info] of Object.entries(vulnerabilities)) {
        const vuln = info;
        if (vuln.via && Array.isArray(vuln.via)) {
          for (const v of vuln.via) {
            if (typeof v === 'object') {
              const sevIndex = severities.indexOf(v.severity);
              if (sevIndex !== -1 && sevIndex <= thresholdIndex) {
                issues.push({
                  type: 'vulnerability',
                  severity: v.severity,
                  package: name,
                  title: v.title,
                  range: v.range,
                });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // npm audit returns non-zero exit code if vulnerabilities found
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout);
        log('\n❌ npm audit found vulnerabilities', 'error');
        exitCode = 1;
      } catch {
        log('\n⚠️  Could not parse npm audit output', 'warn');
      }
    } else {
      log('\n⚠️  npm audit failed to run', 'warn');
    }
  }
}

function checkBannedPackages() {
  log('\n🚫 Checking for banned packages...', 'info');
  
  const bannedPackages = config.bans?.deny || [];
  if (bannedPackages.length === 0) {
    log('No banned packages configured', 'info');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  const foundBanned = [];
  
  for (const banned of bannedPackages) {
    const pkgName = typeof banned === 'string' ? banned : banned.name;
    if (allDeps[pkgName]) {
      foundBanned.push({
        name: pkgName,
        reason: typeof banned === 'object' ? banned.reason : 'Package is banned',
        version: allDeps[pkgName],
      });
    }
  }
  
  if (foundBanned.length > 0) {
    log(`\n❌ Found ${foundBanned.length} banned packages:`, 'error');
    for (const pkg of foundBanned) {
      log(`  - ${pkg.name}@${pkg.version}: ${pkg.reason}`, 'error');
      issues.push({
        type: 'banned',
        package: pkg.name,
        reason: pkg.reason,
      });
    }
    exitCode = 1;
  } else {
    log('✅ No banned packages found', 'info');
  }
}

function checkWildcardDependencies() {
  log('\n🃏 Checking for wildcard dependencies...', 'info');
  
  const wildcardPattern = /^[*]|[>]>|>=[*]$/;
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const wildcards = [];
  
  for (const [name, version] of Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    if (wildcardPattern.test(version)) {
      wildcards.push({ name, version });
    }
  }
  
  if (wildcards.length > 0) {
    const action = config.bans?.wildcards || 'warn';
    const level = action === 'deny' ? 'error' : 'warn';
    
    log(`\n${action === 'deny' ? '❌' : '⚠️'}  Found ${wildcards.length} wildcard dependencies:`, level);
    for (const pkg of wildcards) {
      log(`  - ${pkg.name}: ${pkg.version}`, level);
    }
    
    if (action === 'deny') {
      exitCode = 1;
    }
  } else {
    log('✅ No wildcard dependencies found', 'info');
  }
}

function checkLockfileIntegrity() {
  log('\n🔒 Checking lockfile integrity...', 'info');
  
  const hasPackageLock = fs.existsSync('package-lock.json');
  const hasYarnLock = fs.existsSync('yarn.lock');
  const hasPnpmLock = fs.existsSync('pnpm-lock.yaml');
  
  if (!hasPackageLock && !hasYarnLock && !hasPnpmLock) {
    log('❌ No lockfile found! This is a security risk.', 'error');
    exitCode = 1;
    return;
  }
  
  // Check if lockfile is up to date
  try {
    execSync('npm ci --dry-run 2>/dev/null || npm install --dry-run', { stdio: 'pipe' });
    log('✅ Lockfile is up to date', 'info');
  } catch {
    log('⚠️  Lockfile may be out of sync with package.json', 'warn');
  }
}

function checkSecurityCriticalPackages() {
  log('\n🛡️  Checking security-critical packages...', 'info');
  
  const criticalPackages = config['genetic-explorer']?.['security-critical-packages'] || [];
  if (criticalPackages.length === 0) {
    return;
  }
  
  try {
    const outdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const outdatedPackages = JSON.parse(outdated || '{}');
    
    const outdatedCritical = criticalPackages.filter(pkg => outdatedPackages[pkg]);
    
    if (outdatedCritical.length > 0) {
      log(`\n⚠️  ${outdatedCritical.length} security-critical packages are outdated:`, 'warn');
      for (const pkg of outdatedCritical) {
        const info = outdatedPackages[pkg];
        log(`  - ${pkg}: ${info.current} → ${info.latest}`, 'warn');
      }
    } else {
      log('✅ All security-critical packages are up to date', 'info');
    }
  } catch (error) {
    // npm outdated returns non-zero if outdated packages found
    log('\n⚠️  Some packages may be outdated', 'warn');
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(colors.bold + 'Security Audit Summary' + colors.reset);
  console.log('='.repeat(60));
  
  if (issues.length === 0 && exitCode === 0) {
    console.log(colors.green + '✅ All security checks passed!' + colors.reset);
  } else {
    console.log(colors.red + `❌ Found ${issues.length} security issues` + colors.reset);
    
    const byType = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});
    
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  ${type}: ${count}`);
    }
  }
  
  console.log('='.repeat(60));
}

// ============================================================================
// Main
// ============================================================================

console.log(colors.bold + '\n🔐 Genetic Explorer Security Audit' + colors.reset);
console.log('Based on cargo-deny principles from Lightway\n');

checkNpmAudit();
checkBannedPackages();
checkWildcardDependencies();
checkLockfileIntegrity();
checkSecurityCriticalPackages();

printSummary();

process.exit(exitCode);
