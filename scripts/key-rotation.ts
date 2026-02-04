#!/usr/bin/env tsx
/**
 * Key Rotation Script
 * 
 * Manages encryption key rotation for all users or specific users.
 * 
 * Usage:
 *   npm run key:rotate              # Rotate keys for all users needing rotation
 *   npm run key:rotate -- --user=<userId>  # Rotate for specific user
 *   npm run key:rotate -- --status  # Check rotation status
 */

import { 
  runAutomaticKeyRotation, 
  startKeyRotation, 
  getRotationStatus,
  needsKeyRotation,
  initKeyRotationTables 
} from '../app/utils/keyRotation';
import { getDb } from '../app/utils/database';

// Initialize tables
initKeyRotationTables();

const args = process.argv.slice(2);
const flags = {
  user: args.find(a => a.startsWith('--user='))?.split('=')[1],
  status: args.includes('--status'),
  force: args.includes('--force'),
  help: args.includes('--help') || args.includes('-h'),
};

function printHelp() {
  console.log(`
🔐 Genetic Explorer Key Rotation Utility

Usage:
  npm run key:rotate [options]

Options:
  --user=<id>     Rotate keys for specific user
  --status        Show rotation status for all users
  --force         Force rotation even if not needed
  --help, -h      Show this help message

Examples:
  npm run key:rotate                    # Rotate keys for all users needing rotation
  npm run key:rotate -- --user=abc123   # Rotate keys for specific user
  npm run key:rotate -- --status        # Check rotation status
`);
}

async function showStatus() {
  const db = getDb();
  
  console.log('\n📊 Key Rotation Status\n');
  
  // Get all users and their key versions
  const users = db.prepare(`
    SELECT u.id, u.email, ukv.key_version, ukv.rotated_at,
           COUNT(DISTINCT g.id) as genome_count,
           COUNT(DISTINCT s.id) as snp_count
    FROM users u
    LEFT JOIN user_key_versions ukv ON u.id = ukv.user_id
    LEFT JOIN genomes g ON u.id = g.user_id
    LEFT JOIN snps s ON g.id = s.genome_id
    GROUP BY u.id
  `).all() as Array<{
    id: string;
    email: string;
    key_version: number;
    rotated_at: string;
    genome_count: number;
    snp_count: number;
  }>;
  
  console.log('User                          | Version | Last Rotated        | Genomes | SNPs');
  console.log('-'.repeat(90));
  
  for (const user of users) {
    const needsRotation = needsKeyRotation(user.id);
    const status = needsRotation ? '⚠️ NEEDS ROTATION' : '✅ OK';
    const lastRotated = user.rotated_at 
      ? new Date(user.rotated_at).toLocaleDateString()
      : 'Never';
    
    console.log(
      `${user.email.padEnd(30)} | ${(user.key_version || 1).toString().padStart(7)} | ` +
      `${lastRotated.padEnd(19)} | ${user.genome_count.toString().padStart(7)} | ${user.snp_count}`
    );
    if (needsRotation) {
      console.log(`  ${status}`);
    }
  }
  
  // Get in-progress jobs
  const jobs = db.prepare(`
    SELECT j.*, u.email 
    FROM key_rotation_jobs j
    JOIN users u ON j.user_id = u.id
    WHERE j.status IN ('pending', 'in_progress')
  `).all() as Array<{
    id: string;
    email: string;
    status: string;
    started_at: string;
    processed_items: number;
    total_items: number;
  }>;
  
  if (jobs.length > 0) {
    console.log('\n🔄 In-Progress Jobs:\n');
    for (const job of jobs) {
      const progress = Math.round((job.processed_items / job.total_items) * 100);
      console.log(`  ${job.id}: ${job.email} - ${job.status} (${progress}%)`);
    }
  }
  
  console.log('');
}

async function rotateSpecificUser(userId: string, force: boolean) {
  console.log(`\n🔐 Rotating keys for user: ${userId}\n`);
  
  if (!force && !needsKeyRotation(userId)) {
    console.log('✅ User does not need key rotation. Use --force to rotate anyway.');
    return;
  }
  
  const result = await startKeyRotation(userId);
  
  if (result.success) {
    console.log(`✅ Key rotation completed successfully`);
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Items re-encrypted: ${result.reencryptedItems}`);
    console.log(`   Failed items: ${result.failedItems}`);
  } else {
    console.log(`❌ Key rotation failed`);
    console.log(`   Error: ${result.error}`);
    process.exit(1);
  }
}

async function main() {
  if (flags.help) {
    printHelp();
    return;
  }
  
  if (flags.status) {
    await showStatus();
    return;
  }
  
  if (flags.user) {
    await rotateSpecificUser(flags.user, flags.force);
    return;
  }
  
  // Default: run automatic rotation
  console.log('\n🔐 Starting automatic key rotation...\n');
  await runAutomaticKeyRotation();
  console.log('\n✅ Automatic key rotation completed\n');
}

main().catch(error => {
  console.error('Key rotation failed:', error);
  process.exit(1);
});
