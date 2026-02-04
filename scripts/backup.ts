#!/usr/bin/env tsx
/**
 * Database Backup Script
 * 
 * Usage: npx tsx scripts/backup.ts [output-directory]
 * Default output: ./backups/
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BackupInfo {
  timestamp: string;
  version: string;
  database: string;
  uploads: string;
  nodeVersion: string;
}

const BACKUP_DIR = process.argv[2] || './backups';
const DB_PATH = process.env.DATABASE_URL || './data/genetic_explorer.db';
const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupName = `genetic-explorer-backup-${timestamp}`;
const backupPath = path.join(BACKUP_DIR, backupName);

console.log(`Creating backup: ${backupName}`);

try {
  // Create backup directory
  fs.mkdirSync(backupPath, { recursive: true });

  // Backup database
  if (fs.existsSync(DB_PATH)) {
    console.log('Backing up database...');
    execSync(`cp "${DB_PATH}" "${path.join(backupPath, 'database.db')}"`);
    
    // Create SQLite dump as well
    execSync(`sqlite3 "${DB_PATH}" ".dump" > "${path.join(backupPath, 'database.sql')}"`);
  }

  // Backup uploads
  if (fs.existsSync(UPLOADS_DIR)) {
    console.log('Backing up uploads...');
    execSync(`cp -r "${UPLOADS_DIR}" "${path.join(backupPath, 'uploads')}"`);
  }

  // Create backup info
  const backupInfo: BackupInfo = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: DB_PATH,
    uploads: UPLOADS_DIR,
    nodeVersion: process.version,
  };

  fs.writeFileSync(
    path.join(backupPath, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );

  // Create tarball
  const tarPath = `${backupPath}.tar.gz`;
  console.log('Creating tarball...');
  execSync(`tar -czf "${tarPath}" -C "${BACKUP_DIR}" "${backupName}"`);

  // Remove uncompressed backup
  fs.rmSync(backupPath, { recursive: true });

  console.log(`✅ Backup created: ${tarPath}`);
  
  // List recent backups
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('genetic-explorer-backup') && f.endsWith('.tar.gz'))
    .sort()
    .reverse();

  console.log('\nRecent backups:');
  backups.slice(0, 5).forEach(b => {
    const stats = fs.statSync(path.join(BACKUP_DIR, b));
    console.log(`  - ${b} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });

} catch (error) {
  console.error('❌ Backup failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
