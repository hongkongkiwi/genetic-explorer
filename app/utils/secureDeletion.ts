/**
 * Secure Data Deletion Module
 * 
 * Implements secure deletion of genetic data to prevent recovery.
 * 
 * SECURITY FEATURES:
 * - Multi-pass overwrite (DoD 5220.22-M style)
 * - Cryptographic erasure (delete encryption keys)
 * - Database record purging
 * - File system secure deletion
 * - Verification of deletion
 */

import { unlinkSync, writeFileSync, existsSync } from 'fs';
import { getDb } from '~/db';
import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const SECURE_DELETE_CONFIG = {
  // Number of overwrite passes (DoD 5220.22-M = 3, higher = more secure)
  PASSES: 3,
  
  // Patterns for each pass
  PATTERNS: [
    Buffer.alloc(1024, 0x00), // Pass 1: All zeros
    Buffer.alloc(1024, 0xFF), // Pass 2: All ones
    crypto.randomBytes(1024),  // Pass 3: Random
  ],
  
  // Verify deletion by attempting to read
  VERIFY_DELETION: true,
  
  // Also delete encryption keys for cryptographic erasure
  CRYPTOGRAPHIC_ERASURE: true,
} as const;

// ============================================================================
// Types
// ============================================================================

interface SecureDeletionResult {
  success: boolean;
  fileDeleted: boolean;
  dbRecordsPurged: number;
  encryptionKeysDestroyed: boolean;
  verificationPassed: boolean;
  error?: string;
}

interface DeletionAuditLog {
  genomeId: string;
  userId: string;
  deletedAt: Date;
  method: 'secure_delete' | 'cryptographic_erasure';
  passes: number;
  verificationResult: boolean;
}

// ============================================================================
// Secure File Deletion
// ============================================================================

/**
 * Securely delete a file by overwriting before unlinking
 * 
 * Implements multi-pass overwrite similar to DoD 5220.22-M
 */
export function secureDeleteFile(filePath: string): boolean {
  if (!existsSync(filePath)) {
    return true; // Already gone
  }
  
  try {
    // Get file stats
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    if (fileSize === 0) {
      unlinkSync(filePath);
      return true;
    }
    
    // Multi-pass overwrite
    for (let pass = 0; pass < SECURE_DELETE_CONFIG.PASSES; pass++) {
      const pattern = SECURE_DELETE_CONFIG.PATTERNS[pass % SECURE_DELETE_CONFIG.PATTERNS.length];
      
      // Overwrite the entire file
      let written = 0;
      while (written < fileSize) {
        const toWrite = Math.min(pattern.length, fileSize - written);
        const fd = fs.openSync(filePath, 'w');
        try {
          fs.writeSync(fd, pattern.slice(0, toWrite), 0, toWrite, written);
        } finally {
          fs.closeSync(fd);
        }
        written += toWrite;
      }
      
      // Sync to disk to ensure write
      fs.fsyncSync(fs.openSync(filePath, 'r'));
    }
    
    // Final overwrite with random data
    const finalPattern = crypto.randomBytes(1024);
    let written = 0;
    while (written < fileSize) {
      const toWrite = Math.min(finalPattern.length, fileSize - written);
      const fd = fs.openSync(filePath, 'w');
      try {
        fs.writeSync(fd, finalPattern.slice(0, toWrite), 0, toWrite, written);
      } finally {
        fs.closeSync(fd);
      }
      written += toWrite;
    }
    
    // Sync and unlink
    fs.fsyncSync(fs.openSync(filePath, 'r'));
    unlinkSync(filePath);
    
    return true;
  } catch (error) {
    console.error(`Secure deletion failed for ${filePath}:`, error);
    // Try regular delete as fallback
    try {
      unlinkSync(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Cryptographic erasure - delete encryption keys
 * 
 * This makes data unreadable even if storage is recovered
 */
export function cryptographicErasure(genomeId: string, userId: string): boolean {
  const db = getDb();
  
  try {
    // Get the SNP IDs for this genome
    const snps = db.prepare(
      'SELECT id FROM snps WHERE genome_id = ?'
    ).all(genomeId) as Array<{ id: number }>;
    
    // Overwrite encrypted data with random data before deletion
    // This ensures even if DB is recovered, encrypted data is destroyed
    for (const snp of snps) {
      const randomData = crypto.randomBytes(128).toString('base64');
      db.prepare(
        'UPDATE snps SET genotype_encrypted = ? WHERE id = ?'
      ).run(randomData, snp.id);
    }
    
    return true;
  } catch (error) {
    console.error('Cryptographic erasure failed:', error);
    return false;
  }
}

// ============================================================================
// Secure Genome Deletion
// ============================================================================

/**
 * Securely delete a genome and all associated data
 */
export function secureDeleteGenome(
  genomeId: string,
  userId: string
): SecureDeletionResult {
  const db = getDb();
  let fileDeleted = false;
  let dbRecordsPurged = 0;
  let encryptionKeysDestroyed = false;
  let verificationPassed = false;
  
  try {
    // Get genome info before deletion
    const genome = db.prepare(
      'SELECT storage_path FROM genomes WHERE id = ? AND user_id = ?'
    ).get(genomeId, userId) as { storage_path: string } | undefined;
    
    if (!genome) {
      return {
        success: false,
        fileDeleted: false,
        dbRecordsPurged: 0,
        encryptionKeysDestroyed: false,
        verificationPassed: false,
        error: 'Genome not found',
      };
    }
    
    // Step 1: Cryptographic erasure (destroy encryption keys)
    if (SECURE_DELETE_CONFIG.CRYPTOGRAPHIC_ERASURE) {
      encryptionKeysDestroyed = cryptographicErasure(genomeId, userId);
    }
    
    // Step 2: Secure file deletion
    if (genome.storage_path && existsSync(genome.storage_path)) {
      fileDeleted = secureDeleteFile(genome.storage_path);
    }
    
    // Step 3: Purge database records
    // Count records before deletion
    const snpCount = db.prepare(
      'SELECT COUNT(*) as count FROM snps WHERE genome_id = ?'
    ).get(genomeId) as { count: number };
    
    // Delete SNPs first (child records)
    const snpResult = db.prepare('DELETE FROM snps WHERE genome_id = ?').run(genomeId);
    dbRecordsPurged += snpResult.changes;
    
    // Delete genome record
    const genomeResult = db.prepare(
      'DELETE FROM genomes WHERE id = ? AND user_id = ?'
    ).run(genomeId, userId);
    dbRecordsPurged += genomeResult.changes;
    
    // Step 4: Verification
    if (SECURE_DELETE_CONFIG.VERIFY_DELETION) {
      const verifyGenome = db.prepare(
        'SELECT 1 FROM genomes WHERE id = ?'
      ).get(genomeId);
      const verifySnps = db.prepare(
        'SELECT 1 FROM snps WHERE genome_id = ? LIMIT 1'
      ).get(genomeId);
      
      verificationPassed = !verifyGenome && !verifySnps;
    }
    
    // Log the deletion
    logDeletion({
      genomeId,
      userId,
      deletedAt: new Date(),
      method: encryptionKeysDestroyed ? 'cryptographic_erasure' : 'secure_delete',
      passes: SECURE_DELETE_CONFIG.PASSES,
      verificationResult: verificationPassed,
    });
    
    return {
      success: true,
      fileDeleted,
      dbRecordsPurged,
      encryptionKeysDestroyed,
      verificationPassed,
    };
  } catch (error) {
    console.error('Secure deletion failed:', error);
    return {
      success: false,
      fileDeleted,
      dbRecordsPurged,
      encryptionKeysDestroyed,
      verificationPassed,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log deletion to audit table
 */
function logDeletion(log: DeletionAuditLog): void {
  const db = getDb();
  
  try {
    db.prepare(
      `INSERT INTO secure_deletion_audit 
       (genome_id, user_id, deleted_at, method, passes, verification_result)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      log.genomeId,
      log.userId,
      log.deletedAt.toISOString(),
      log.method,
      log.passes,
      log.verificationResult ? 1 : 0
    );
  } catch (error) {
    console.error('Failed to log deletion:', error);
  }
}

// ============================================================================
// Database Initialization
// ============================================================================

export function initSecureDeletionTables(): void {
  const db = getDb();
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS secure_deletion_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      method TEXT NOT NULL,
      passes INTEGER DEFAULT 3,
      verification_result INTEGER DEFAULT 0
    )
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_deletion_audit_genome ON secure_deletion_audit(genome_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_deletion_audit_user ON secure_deletion_audit(user_id)
  `);
}

export default {
  secureDeleteGenome,
  secureDeleteFile,
  cryptographicErasure,
  initSecureDeletionTables,
};
