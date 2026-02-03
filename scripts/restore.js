#!/usr/bin/env node
/**
 * Database Restore Script
 * 
 * Usage: node scripts/restore.js <backup-file.tar.gz>
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const backupFile = process.argv[2];
const DB_PATH = process.env.DATABASE_URL || './data/genetic_explorer.db';
const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

if (!backupFile) {
  console.error('Usage: node scripts/restore.js <backup-file.tar.gz>');
  process.exit(1);
}

if (!fs.existsSync(backupFile)) {
  console.error(`❌ Backup file not found: ${backupFile}`);
  process.exit(1);
}

const tempDir = `./temp-restore-${Date.now()}`;

console.log(`Restoring from: ${backupFile}`);

try {
  // Extract backup
  console.log('Extracting backup...');
  fs.mkdirSync(tempDir, { recursive: true });
  execSync(`tar -xzf "${backupFile}" -C "${tempDir}"`);

  // Find extracted directory
  const extractedDirs = fs.readdirSync(tempDir)
    .filter(d => d.startsWith('genetic-explorer-backup'));
  
  if (extractedDirs.length === 0) {
    throw new Error('No backup directory found in archive');
  }

  const backupDir = path.join(tempDir, extractedDirs[0]);
  const backupInfoPath = path.join(backupDir, 'backup-info.json');

  // Read backup info
  if (fs.existsSync(backupInfoPath)) {
    const backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf-8'));
    console.log('\nBackup info:');
    console.log(`  Created: ${backupInfo.timestamp}`);
    console.log(`  Version: ${backupInfo.version}`);
  }

  // Confirm restore
  console.log('\n⚠️  This will OVERWRITE your current data!');
  console.log('Current database will be backed up to: ' + DB_PATH + '.pre-restore');
  
  // Backup current database
  if (fs.existsSync(DB_PATH)) {
    console.log('Creating safety backup of current database...');
    fs.copyFileSync(DB_PATH, DB_PATH + '.pre-restore');
  }

  // Restore database
  const dbBackupPath = path.join(backupDir, 'database.db');
  if (fs.existsSync(dbBackupPath)) {
    console.log('Restoring database...');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.copyFileSync(dbBackupPath, DB_PATH);
  }

  // Restore uploads
  const uploadsBackupPath = path.join(backupDir, 'uploads');
  if (fs.existsSync(uploadsBackupPath)) {
    console.log('Restoring uploads...');
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.rmSync(UPLOADS_DIR, { recursive: true });
    }
    fs.mkdirSync(path.dirname(UPLOADS_DIR), { recursive: true });
    execSync(`cp -r "${uploadsBackupPath}" "${UPLOADS_DIR}"`);
  }

  // Cleanup
  fs.rmSync(tempDir, { recursive: true });

  console.log('✅ Restore completed successfully!');
  console.log('\nPlease restart the application for changes to take effect.');

} catch (error) {
  console.error('❌ Restore failed:', error.message);
  
  // Cleanup on error
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  
  process.exit(1);
}
