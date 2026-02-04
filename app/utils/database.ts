import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type { SNP, AnalysisReport, GenomeData } from '~/types/genetics';
import { initializeResearchDatabase } from './researchDatabase';
import { runMigrations } from './databaseMigrations';
import { createIndexes, analyzeTables } from './databaseIndexes';
import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { encrypt, decrypt, getUserEncryptionKey } from './encryption';

let db: Database.Database | null = null;

// Ensure uploads directory exists
const UPLOADS_DIR = './uploads/genomes';
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database('./data/genetic_explorer.db');
    
    // Performance optimizations
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
    db.pragma('synchronous = NORMAL'); // Balance between safety and speed
    db.pragma('cache_size = -64000'); // 64MB cache (negative = kilobytes)
    db.pragma('temp_store = memory'); // Store temp tables in memory
    db.pragma('mmap_size = 268435456'); // 256MB memory-mapped I/O
    db.pragma('page_size = 4096'); // Optimal page size for most systems
    
    initDatabase();
    initializeResearchDatabase();
    runMigrations(db);
  }
  return db;
}

function initDatabase() {
  if (!db) return;

  // Users table - for multi-user support
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME,
      is_active INTEGER DEFAULT 1,
      email_verified INTEGER DEFAULT 0
    )
  `);

  // User profiles table - stores genetic profile preferences
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      bio TEXT,
      birth_date TEXT,
      sex TEXT,
      ancestry TEXT,
      timezone TEXT DEFAULT 'UTC',
      notification_preferences TEXT DEFAULT '{}',
      privacy_settings TEXT DEFAULT '{"share_anonymized": false, "allow_family_sharing": true}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Genome uploads table - enhanced with user ownership
  db.exec(`
    CREATE TABLE IF NOT EXISTS genomes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      source TEXT NOT NULL,
      snp_count INTEGER NOT NULL,
      stored_snps INTEGER NOT NULL,
      file_size INTEGER NOT NULL,
      decompressed_size INTEGER,
      checksum_sha256 TEXT NOT NULL,
      compression_type TEXT,
      storage_path TEXT,
      processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      is_primary INTEGER DEFAULT 0,
      nickname TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // SNPs table - now stores ALL SNPs with batching support
  db.exec(`
    CREATE TABLE IF NOT EXISTS snps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      genome_id TEXT NOT NULL,
      rsid TEXT NOT NULL,
      chromosome TEXT NOT NULL,
      position INTEGER NOT NULL,
      genotype TEXT NOT NULL,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE
    )
  `);

  // Analysis reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      report_data TEXT NOT NULL,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sharing permissions table - for family/friend sharing
  db.exec(`
    CREATE TABLE IF NOT EXISTS sharing_permissions (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      shared_with_id TEXT,
      genome_id TEXT,
      share_type TEXT NOT NULL DEFAULT 'friend',
      sensitivity_level TEXT NOT NULL DEFAULT 'normal',
      include_raw_data INTEGER DEFAULT 0,
      allow_matching INTEGER DEFAULT 0,
      can_download INTEGER DEFAULT 0,
      can_share INTEGER DEFAULT 0,
      permission_level TEXT NOT NULL DEFAULT 'view',
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      message TEXT,
      relationship_type TEXT,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      UNIQUE(owner_id, shared_with_id, genome_id)
    )
  `);

  // Sharing invites table - for pending invitations
  db.exec(`
    CREATE TABLE IF NOT EXISTS sharing_invites (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      email TEXT NOT NULL,
      genome_id TEXT,
      permission_level TEXT NOT NULL DEFAULT 'view',
      invite_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE
    )
  `);

  // Sessions table - for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active_at DATETIME,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Activity log table - for audit trail
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Password resets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Email verifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // OAuth accounts table - for social login
  db.exec(`
    CREATE TABLE IF NOT EXISTS oauth_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL CHECK(provider IN ('google', 'github')),
      provider_id TEXT NOT NULL,
      email TEXT,
      name TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_id)
    )
  `);

  // 2FA TOTP secrets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS totp_secrets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      secret TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 2FA backup codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS backup_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Passkeys/WebAuthn credentials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS passkeys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      credential_id TEXT NOT NULL,
      credential_public_key TEXT NOT NULL,
      counter INTEGER DEFAULT 0,
      transports TEXT,
      user_verified INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(credential_id)
    )
  `);

  // User privacy settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_privacy_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      show_sensitive_data INTEGER DEFAULT 0,
      disclaimer_agreed_at DATETIME,
      default_share_level TEXT DEFAULT 'normal',
      confirm_before_viewing INTEGER DEFAULT 1,
      notify_on_view INTEGER DEFAULT 0,
      notify_on_download INTEGER DEFAULT 1,
      notify_on_share INTEGER DEFAULT 1,
      daily_digest INTEGER DEFAULT 0,
      weekly_report INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sharing links table (for public/shared links)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sharing_links (
      id TEXT PRIMARY KEY,
      permission_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      clicks INTEGER DEFAULT 0,
      max_clicks INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (permission_id) REFERENCES sharing_permissions(id) ON DELETE CASCADE
    )
  `);

  // Sharing history/audit table (enhanced)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sharing_audit_log (
      id TEXT PRIMARY KEY,
      permission_id TEXT NOT NULL,
      viewer_id TEXT NOT NULL,
      action TEXT NOT NULL,
      data_type TEXT,
      items_accessed INTEGER DEFAULT 0,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (permission_id) REFERENCES sharing_permissions(id) ON DELETE CASCADE
    )
  `);

  // Sharing category settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sharing_category_settings (
      id TEXT PRIMARY KEY,
      permission_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      shared INTEGER DEFAULT 1,
      min_sensitivity_level TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (permission_id) REFERENCES sharing_permissions(id) ON DELETE CASCADE,
      UNIQUE(permission_id, category_id)
    )
  `);

  // ============================================
  // ANCESTRY TABLES
  // ============================================

  // Ancestry results table - Store ancestry analysis results
  db.exec(`
    CREATE TABLE IF NOT EXISTS ancestry_results (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      ethnicity_json TEXT NOT NULL,
      y_haplogroup TEXT,
      mt_haplogroup TEXT,
      confidence REAL,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Ancestry matches table - Store relative matches
  db.exec(`
    CREATE TABLE IF NOT EXISTS ancestry_matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      match_user_id TEXT,
      shared_dna_cm REAL,
      shared_percentage REAL,
      relationship_type TEXT,
      confidence REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ============================================
  // TRAITS TABLES
  // ============================================

  // Traits results table - Store traits analysis
  db.exec(`
    CREATE TABLE IF NOT EXISTS traits_results (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      traits_json TEXT NOT NULL,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // User traits preferences table - Store trait visibility preferences
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_traits_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      trait_id TEXT NOT NULL,
      is_visible INTEGER DEFAULT 1,
      share_with_family INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, trait_id)
    )
  `);

  // ============================================
  // CARRIER TABLES
  // ============================================

  // Carrier results table - Store carrier screening results
  db.exec(`
    CREATE TABLE IF NOT EXISTS carrier_results (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      results_json TEXT NOT NULL,
      has_pathogenic_variants INTEGER DEFAULT 0,
      counseling_recommended INTEGER DEFAULT 0,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Carrier sharing table - Track sharing with partners
  db.exec(`
    CREATE TABLE IF NOT EXISTS carrier_sharing (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      partner_email TEXT NOT NULL,
      shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      access_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME,
      accessed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ============================================
  // RELATIVES TABLES
  // ============================================

  // Relative matching preferences table - User preferences for DNA matching
  db.exec(`
    CREATE TABLE IF NOT EXISTS relative_matching_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      is_opted_in INTEGER DEFAULT 0,
      show_real_name INTEGER DEFAULT 0,
      allow_contact INTEGER DEFAULT 1,
      show_ancestry INTEGER DEFAULT 1,
      share_ethnicity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Relative matches table - Store match details (more detailed than ancestry_matches)
  db.exec(`
    CREATE TABLE IF NOT EXISTS relative_matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      match_user_id TEXT,
      relationship_prediction TEXT,
      shared_segments_json TEXT,
      ibd_segments_json TEXT,
      is_hidden INTEGER DEFAULT 0,
      can_contact INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Hidden matches table - Track hidden matches
  db.exec(`
    CREATE TABLE IF NOT EXISTS hidden_matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      match_user_id TEXT NOT NULL,
      hidden_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reason TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, match_user_id)
    )
  `);

  // Add OAuth columns to users table (for quick lookup)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN oauth_provider TEXT`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN oauth_id TEXT`);
  } catch (e) {
    // Column may already exist
  }
  // Add 2FA enabled column
  try {
    db.exec(`ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0`);
  } catch (e) {
    // Column may already exist
  }

  // Add watermark column to sharing_permissions
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN watermark TEXT`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN max_views INTEGER`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN max_downloads INTEGER`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN require_verification INTEGER DEFAULT 0`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN grace_period_hours INTEGER DEFAULT 24`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN revoked_at DATETIME`);
  } catch (e) {
    // Column may already exist
  }
  try {
    db.exec(`ALTER TABLE sharing_permissions ADD COLUMN grace_until DATETIME`);
  } catch (e) {
    // Column may already exist
  }

  // Create comprehensive indexes for performance
  createIndexes(db);
  analyzeTables(db);
}

export interface SaveGenomeResult {
  id: string;
  storedSnps: number;
  filePath: string;
}

export function saveGenome(
  filename: string,
  originalFilename: string,
  source: string,
  snps: SNP[],
  fileBuffer: Buffer,
  checksum: string,
  compressionType: string | null,
  userId?: string
): SaveGenomeResult {
  const db = getDb();
  const id = uuidv4();
  
  // Generate storage filename
  const fileExt = compressionType === 'gzip' ? '.gz' : compressionType === 'zip' ? '.zip' : '.txt';
  const storageFilename = `${id}${fileExt}`;
  const storagePath = join(UPLOADS_DIR, storageFilename);

  // Save original file to disk
  writeFileSync(storagePath, fileBuffer);

  // Insert genome record
  const insertGenome = db.prepare(`
    INSERT INTO genomes (
      id, user_id, filename, original_filename, source, snp_count, stored_snps,
      file_size, checksum_sha256, compression_type, storage_path, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGenome.run(
    id,
    userId || null,
    filename,
    originalFilename,
    source,
    snps.length,
    snps.length, // Now storing ALL SNPs
    fileBuffer.length,
    checksum,
    compressionType,
    storagePath,
    'processing'
  );

  // Store ALL SNPs in batches for better performance
  const BATCH_SIZE = 10000;
  const insertSNP = db.prepare(`
    INSERT INTO snps (genome_id, rsid, chromosome, position, genotype)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Process in transactions
  for (let i = 0; i < snps.length; i += BATCH_SIZE) {
    const batch = snps.slice(i, i + BATCH_SIZE);
    const insertBatch = db.transaction((batchSnps: SNP[]) => {
      for (const snp of batchSnps) {
        insertSNP.run(id, snp.rsid, snp.chromosome, snp.position, snp.genotype);
      }
    });
    insertBatch(batch);
  }

  // Update status to completed
  db.prepare(`UPDATE genomes SET status = ? WHERE id = ?`).run('completed', id);

  return {
    id,
    storedSnps: snps.length,
    filePath: storagePath,
  };
}

export function getGenomeFile(id: string): Buffer | null {
  try {
    const db = getDb();
    const genome = db.prepare(`SELECT storage_path FROM genomes WHERE id = ?`).get(id) as {
      storage_path: string;
    } | undefined;

    if (!genome || !genome.storage_path) return null;
    
    return readFileSync(genome.storage_path);
  } catch (error) {
    console.error(`Failed to read genome file ${id}:`, error);
    return null;
  }
}

export function verifyGenomeIntegrity(id: string): boolean {
  try {
    const db = getDb();
    const genome = db.prepare(`SELECT storage_path, checksum_sha256 FROM genomes WHERE id = ?`).get(id) as {
      storage_path: string;
      checksum_sha256: string;
    } | undefined;

    if (!genome) return false;

    const fileBuffer = readFileSync(genome.storage_path);
    const currentChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    return currentChecksum === genome.checksum_sha256;
  } catch (error) {
    console.error(`Integrity check failed for genome ${id}:`, error);
    return false;
  }
}

export function getGenome(id: string): GenomeData | null {
  const db = getDb();
  
  const genome = db.prepare(`
    SELECT id, filename, original_filename, source, snp_count, file_size, 
           checksum_sha256, compression_type, processed_at, status
    FROM genomes WHERE id = ?
  `).get(id) as {
    id: string;
    filename: string;
    original_filename: string;
    source: string;
    snp_count: number;
    file_size: number;
    checksum_sha256: string;
    compression_type: string | null;
    processed_at: string;
    status: string;
  } | undefined;

  if (!genome) return null;

  const snps = db.prepare(`
    SELECT rsid, chromosome, position, genotype 
    FROM snps WHERE genome_id = ? 
    ORDER BY chromosome, position
  `).all(id) as {
    rsid: string;
    chromosome: string;
    position: number;
    genotype: string;
  }[];

  return {
    id: genome.id,
    userId: '',
    filename: genome.original_filename,
    source: genome.source as GenomeData['source'],
    snpCount: genome.snp_count,
    processedAt: new Date(genome.processed_at),
    snps: snps.map(s => ({
      rsid: s.rsid,
      chromosome: s.chromosome,
      position: s.position,
      genotype: s.genotype,
    })),
  };
}

export interface SnpData {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
  frequency?: string;
}

/**
 * Get all SNPs for a specific genome
 */
export function getUserSNPs(genomeId: string): SnpData[] {
  const db = getDb();

  const snps = db.prepare(`
    SELECT rsid, chromosome, position, genotype
    FROM snps
    WHERE genome_id = ?
    ORDER BY chromosome, position
  `).all(genomeId) as {
    rsid: string;
    chromosome: string;
    position: number;
    genotype: string;
  }[];

  return snps.map(s => ({
    rsid: s.rsid,
    chromosome: s.chromosome,
    position: s.position,
    genotype: s.genotype,
  }));
}

export interface GenomeMetadata {
  id: string;
  filename: string;
  original_filename: string;
  source: string;
  snp_count: number;
  stored_snps: number;
  file_size: number;
  checksum_sha256: string;
  compression_type: string | null;
  processed_at: string;
  status: string;
}

export function getAllGenomes(): GenomeMetadata[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, filename, original_filename, source, snp_count, stored_snps,
           file_size, checksum_sha256, compression_type, processed_at, status
    FROM genomes 
    ORDER BY processed_at DESC
  `).all() as GenomeMetadata[];
}

export function deleteGenome(id: string): void {
  const db = getDb();
  
  // Get file path before deleting
  const genome = db.prepare(`SELECT storage_path FROM genomes WHERE id = ?`).get(id) as {
    storage_path: string;
  } | undefined;

  // Delete from database (cascades to SNPs and reports)
  db.prepare(`DELETE FROM genomes WHERE id = ?`).run(id);

  // Delete file from disk
  if (genome?.storage_path && existsSync(genome.storage_path)) {
    try {
      unlinkSync(genome.storage_path);
    } catch (error) {
      console.warn(`Failed to delete genome file ${genome.storage_path}:`, error);
    }
  }
}

export function saveReport(genomeId: string, userId: string, report: AnalysisReport): string {
  const db = getDb();
  const id = uuidv4();

  const insertReport = db.prepare(`
    INSERT INTO reports (id, genome_id, user_id, report_data)
    VALUES (?, ?, ?, ?)
  `);

  insertReport.run(id, genomeId, userId, JSON.stringify(report));

  return id;
}

export function getReport(genomeId: string): AnalysisReport | null {
  const db = getDb();
  
  const report = db.prepare(`
    SELECT report_data FROM reports WHERE genome_id = ? ORDER BY generated_at DESC LIMIT 1
  `).get(genomeId) as { report_data: string } | undefined;

  if (!report) return null;

  return JSON.parse(report.report_data) as AnalysisReport;
}

export function getAllReports(): Array<{
  id: string;
  genome_id: string;
  generated_at: string;
}> {
  const db = getDb();
  return db.prepare(`
    SELECT id, genome_id, generated_at FROM reports ORDER BY generated_at DESC
  `).all() as any[];
}

export function getDatabaseStats(): {
  totalGenomes: number;
  totalSNPs: number;
  totalReports: number;
  averageSnpsPerGenome: number;
} {
  const db = getDb();
  
  const genomeCount = (db.prepare('SELECT COUNT(*) as count FROM genomes').get() as any).count;
  const snpCount = (db.prepare('SELECT COUNT(*) as count FROM snps').get() as any).count;
  const reportCount = (db.prepare('SELECT COUNT(*) as count FROM reports').get() as any).count;

  return {
    totalGenomes: genomeCount,
    totalSNPs: snpCount,
    totalReports: reportCount,
    averageSnpsPerGenome: genomeCount > 0 ? Math.round(snpCount / genomeCount) : 0,
  };
}

// ==================== USER MANAGEMENT ====================

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isActive: boolean;
  emailVerified: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  birthDate: string | null;
  sex: string | null;
  ancestry: string | null;
  timezone: string;
  notificationPreferences: Record<string, boolean>;
  privacySettings: {
    shareAnonymized: boolean;
    allowFamilySharing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SharingPermission {
  id: string;
  ownerId: string;
  sharedWithId: string;
  genomeId: string | null;
  permissionLevel: 'view' | 'download' | 'manage';
  expiresAt: Date | null;
  createdAt: Date;
  status: 'active' | 'revoked' | 'expired';
  message: string | null;
  ownerEmail?: string;
  ownerName?: string;
  sharedWithEmail?: string;
  sharedWithName?: string;
  genomeNickname?: string;
}

export interface SharingInvite {
  id: string;
  ownerId: string;
  email: string;
  genomeId: string | null;
  permissionLevel: 'view' | 'download' | 'manage';
  inviteToken: string;
  expiresAt: Date;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

// User CRUD operations
export function createUser(email: string, passwordHash: string, displayName?: string): User {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(id, email, passwordHash, displayName || null, now, now);

  // Create default profile
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, user_id, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  insertProfile.run(uuidv4(), id, now, now);

  return {
    id,
    email,
    displayName: displayName || null,
    createdAt: new Date(now),
    updatedAt: new Date(now),
    lastLoginAt: null,
    isActive: true,
    emailVerified: false,
  };
}

export function getUserByEmail(email: string): (User & { passwordHash: string }) | null {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, password_hash, display_name, created_at, updated_at, last_login_at, is_active, email_verified
    FROM users WHERE email = ? AND is_active = 1
  `).get(email) as any;

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.password_hash,
    displayName: user.display_name,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
    lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
    isActive: user.is_active === 1,
    emailVerified: user.email_verified === 1,
  };
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, display_name, created_at, updated_at, last_login_at, is_active, email_verified
    FROM users WHERE id = ?
  `).get(id) as any;

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
    lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
    isActive: user.is_active === 1,
    emailVerified: user.email_verified === 1,
  };
}

export function updateUserLastLogin(userId: string): void {
  const db = getDb();
  db.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).run(new Date().toISOString(), userId);
}

export function updateUser(userId: string, updates: Partial<{ displayName: string; email: string }>): void {
  const db = getDb();
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.displayName !== undefined) {
    sets.push('display_name = ?');
    values.push(updates.displayName);
  }
  if (updates.email !== undefined) {
    sets.push('email = ?');
    values.push(updates.email);
  }

  if (sets.length > 0) {
    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(userId);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  }
}

// Profile operations
export function getUserProfile(userId: string): UserProfile | null {
  const db = getDb();
  const profile = db.prepare(`
    SELECT id, user_id, bio, birth_date, sex, ancestry, timezone, 
           notification_preferences, privacy_settings, created_at, updated_at
    FROM profiles WHERE user_id = ?
  `).get(userId) as any;

  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,
    bio: profile.bio,
    birthDate: profile.birth_date,
    sex: profile.sex,
    ancestry: profile.ancestry,
    timezone: profile.timezone,
    notificationPreferences: JSON.parse(profile.notification_preferences || '{}'),
    privacySettings: JSON.parse(profile.privacy_settings || '{}'),
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  };
}

export function updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): void {
  const db = getDb();
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.bio !== undefined) { sets.push('bio = ?'); values.push(updates.bio); }
  if (updates.birthDate !== undefined) { sets.push('birth_date = ?'); values.push(updates.birthDate); }
  if (updates.sex !== undefined) { sets.push('sex = ?'); values.push(updates.sex); }
  if (updates.ancestry !== undefined) { sets.push('ancestry = ?'); values.push(updates.ancestry); }
  if (updates.timezone !== undefined) { sets.push('timezone = ?'); values.push(updates.timezone); }
  if (updates.notificationPreferences !== undefined) { sets.push('notification_preferences = ?'); values.push(JSON.stringify(updates.notificationPreferences)); }
  if (updates.privacySettings !== undefined) { sets.push('privacy_settings = ?'); values.push(JSON.stringify(updates.privacySettings)); }

  if (sets.length > 0) {
    sets.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(userId);
    db.prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE user_id = ?`).run(...values);
  }
}

// Sharing operations
export function createSharingPermission(
  ownerId: string,
  sharedWithId: string,
  permissionLevel: 'view' | 'download' | 'manage',
  genomeId?: string,
  expiresAt?: Date,
  message?: string
): SharingPermission {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO sharing_permissions (id, owner_id, shared_with_id, genome_id, permission_level, expires_at, created_at, created_by, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(id, ownerId, sharedWithId, genomeId || null, permissionLevel, expiresAt?.toISOString() || null, now, ownerId, message || null);

  return {
    id,
    ownerId,
    sharedWithId,
    genomeId: genomeId || null,
    permissionLevel,
    expiresAt: expiresAt || null,
    createdAt: new Date(now),
    status: 'active',
    message: message || null,
  };
}

export function createSharingInvite(
  ownerId: string,
  email: string,
  permissionLevel: 'view' | 'download' | 'manage',
  genomeId?: string,
  expiresDays: number = 7
): SharingInvite {
  const db = getDb();
  const id = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresDays * 24 * 60 * 60 * 1000);

  const insert = db.prepare(`
    INSERT INTO sharing_invites (id, owner_id, email, genome_id, permission_level, invite_token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const token = uuidv4();
  insert.run(id, ownerId, email, genomeId || null, permissionLevel, token, expiresAt.toISOString(), now.toISOString());

  return {
    id,
    ownerId,
    email,
    genomeId: genomeId || null,
    permissionLevel,
    inviteToken: token,
    expiresAt,
    createdAt: now,
    status: 'pending',
  };
}

export function getSharingInviteByToken(token: string): (SharingInvite & { ownerEmail: string; ownerName: string | null }) | null {
  const db = getDb();
  const invite = db.prepare(`
    SELECT i.*, u.email as owner_email, u.display_name as owner_name
    FROM sharing_invites i
    JOIN users u ON i.owner_id = u.id
    WHERE i.invite_token = ? AND i.status = 'pending' AND i.expires_at > datetime('now')
  `).get(token) as any;

  if (!invite) return null;

  return {
    id: invite.id,
    ownerId: invite.owner_id,
    email: invite.email,
    genomeId: invite.genome_id,
    permissionLevel: invite.permission_level,
    inviteToken: invite.invite_token,
    expiresAt: new Date(invite.expires_at),
    createdAt: new Date(invite.created_at),
    status: invite.status,
    ownerEmail: invite.owner_email,
    ownerName: invite.owner_name,
  };
}

export function acceptSharingInvite(inviteToken: string, userId: string): boolean {
  const db = getDb();
  
  const invite = db.prepare(`
    SELECT * FROM sharing_invites 
    WHERE invite_token = ? AND status = 'pending' AND expires_at > datetime('now')
  `).get(inviteToken) as any;

  if (!invite) return false;

  // Create the sharing permission
  createSharingPermission(
    invite.owner_id,
    userId,
    invite.permission_level,
    invite.genome_id || undefined
  );

  // Update invite status
  db.prepare(`UPDATE sharing_invites SET status = 'accepted' WHERE id = ?`).run(invite.id);

  return true;
}

export function getSharedWithMe(userId: string): SharingPermission[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT sp.*, u.email as owner_email, u.display_name as owner_name, g.nickname as genome_nickname
    FROM sharing_permissions sp
    JOIN users u ON sp.owner_id = u.id
    LEFT JOIN genomes g ON sp.genome_id = g.id
    WHERE sp.shared_with_id = ? AND sp.status = 'active'
      AND (sp.expires_at IS NULL OR sp.expires_at > datetime('now'))
    ORDER BY sp.created_at DESC
  `).all(userId) as any[];

  return rows.map(row => ({
    id: row.id,
    ownerId: row.owner_id,
    sharedWithId: row.shared_with_id,
    genomeId: row.genome_id,
    permissionLevel: row.permission_level,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    createdAt: new Date(row.created_at),
    status: row.status,
    message: row.message,
    ownerEmail: row.owner_email,
    ownerName: row.owner_name,
    genomeNickname: row.genome_nickname,
  }));
}

export function getMyShares(userId: string): SharingPermission[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT sp.*, u.email as shared_with_email, u.display_name as shared_with_name, g.nickname as genome_nickname
    FROM sharing_permissions sp
    JOIN users u ON sp.shared_with_id = u.id
    LEFT JOIN genomes g ON sp.genome_id = g.id
    WHERE sp.owner_id = ? AND sp.status = 'active'
    ORDER BY sp.created_at DESC
  `).all(userId) as any[];

  return rows.map(row => ({
    id: row.id,
    ownerId: row.owner_id,
    sharedWithId: row.shared_with_id,
    genomeId: row.genome_id,
    permissionLevel: row.permission_level,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    createdAt: new Date(row.created_at),
    status: row.status,
    message: row.message,
    sharedWithEmail: row.shared_with_email,
    sharedWithName: row.shared_with_name,
    genomeNickname: row.genome_nickname,
  }));
}

export function revokeSharingPermission(permissionId: string, ownerId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE sharing_permissions SET status = 'revoked' WHERE id = ? AND owner_id = ?
  `).run(permissionId, ownerId);
  return result.changes > 0;
}

// Session management
export function createSession(userId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), userId, token, expiresAt.toISOString(), ipAddress || null, userAgent || null);
}

export function getSessionByToken(token: string): { userId: string; expiresAt: Date } | null {
  const db = getDb();
  const session = db.prepare(`
    SELECT user_id, expires_at FROM sessions 
    WHERE token = ? AND expires_at > datetime('now')
  `).get(token) as any;

  if (!session) return null;

  return {
    userId: session.user_id,
    expiresAt: new Date(session.expires_at),
  };
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}

export function deleteUserSessions(userId: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
}

/**
 * Get all active sessions for a user
 */
export interface UserSession {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
}

export function getUserSessions(userId: string, currentToken?: string): UserSession[] {
  const db = getDb();
  const sessions = db.prepare(`
    SELECT id, token, created_at, expires_at, last_active_at, ip_address, user_agent
    FROM sessions 
    WHERE user_id = ? AND expires_at > datetime('now')
    ORDER BY created_at DESC
  `).all(userId) as any[];

  return sessions.map(session => ({
    id: session.id,
    token: session.token,
    createdAt: new Date(session.created_at),
    expiresAt: new Date(session.expires_at),
    lastActiveAt: session.last_active_at ? new Date(session.last_active_at) : null,
    ipAddress: session.ip_address,
    userAgent: session.user_agent,
    isCurrent: currentToken ? session.token === currentToken : false,
  }));
}

// Activity logging
export function logActivity(
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>,
  ipAddress?: string
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, action, resourceType || null, resourceId || null, details ? JSON.stringify(details) : null, ipAddress || null);
}

export function getUserActivity(userId: string, limit: number = 50): Array<{
  id: number;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, any> | null;
  createdAt: Date;
}> {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, action, resource_type, resource_id, details, created_at
    FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit) as any[];

  return rows.map(row => ({
    id: row.id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    details: row.details ? JSON.parse(row.details) : null,
    createdAt: new Date(row.created_at),
  }));
}

// ============================================================================
// Two-Factor Authentication (2FA) Functions
// ============================================================================

/**
 * Save TOTP secret for a user
 * CRITICAL: Secret is encrypted at rest using AES-256-GCM
 */
export function saveTotpSecret(userId: string, secret: string): void {
  const db = getDb();
  
  // Encrypt the TOTP secret before storage
  const userKey = getUserEncryptionKey(userId);
  const encrypted = encrypt(secret, userKey);
  
  // Store as JSON string to preserve all encryption metadata
  const encryptedPayload = JSON.stringify(encrypted);
  
  db.prepare(`
    INSERT OR REPLACE INTO totp_secrets (user_id, secret, created_at)
    VALUES (?, ?, datetime('now'))
  `).run(userId, encryptedPayload);
}

/**
 * Get TOTP secret for a user
 * CRITICAL: Secret is decrypted after retrieval from database
 */
export function getTotpSecret(userId: string): string | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT secret FROM totp_secrets WHERE user_id = ?
  `).get(userId) as { secret: string } | undefined;
  
  if (!result?.secret) return null;
  
  try {
    // Parse the encrypted payload
    const encrypted = JSON.parse(result.secret);
    
    // Decrypt the TOTP secret
    const userKey = getUserEncryptionKey(userId);
    const decrypted = decrypt(encrypted, userKey);
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt TOTP secret:', error);
    return null;
  }
}

/**
 * Delete TOTP secret for a user
 */
export function deleteTotpSecret(userId: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM totp_secrets WHERE user_id = ?`).run(userId);
}

/**
 * Save backup codes for a user
 */
export function saveBackupCodes(userId: string, hashedCodes: string[]): void {
  const db = getDb();
  // Delete existing codes first
  db.prepare(`DELETE FROM backup_codes WHERE user_id = ?`).run(userId);
  // Insert new codes
  const insert = db.prepare(`
    INSERT INTO backup_codes (user_id, code_hash, used)
    VALUES (?, ?, 0)
  `);
  for (const codeHash of hashedCodes) {
    insert.run(userId, codeHash);
  }
}

/**
 * Get remaining backup codes count
 */
export function getBackupCodesCount(userId: string): number {
  const db = getDb();
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM backup_codes WHERE user_id = ? AND used = 0
  `).get(userId) as { count: number };
  return result.count;
}

/**
 * Verify and consume a backup code
 */
export function verifyAndUseBackupCode(userId: string, code: string): boolean {
  const db = getDb();
  const normalizedCode = code.replace(/-/g, '').toUpperCase();
  // Use the same salt derivation as hashBackupCode
  const salt = `${userId}-backup-code-salt`;
  const codeHash = crypto.pbkdf2Sync(normalizedCode, salt, 100000, 32, 'sha256').toString('hex');

  // Find and mark the code as used
  const result = db.prepare(`
    UPDATE backup_codes
    SET used = 1, used_at = datetime('now')
    WHERE user_id = ? AND code_hash = ? AND used = 0
  `).run(userId, codeHash);

  return result.changes > 0;
}

/**
 * Save a passkey credential for a user
 */
export function savePasskey(userId: string, credentialId: string, publicKey: string, counter: number): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO passkeys (user_id, credential_id, public_key, counter, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(userId, credentialId, publicKey, counter);
}

/**
 * Get all passkeys for a user
 */
export function getPasskeys(userId: string): Array<{ credentialId: string; publicKey: string; counter: number }> {
  const db = getDb();
  const results = db.prepare(`
    SELECT credential_id, public_key, counter FROM passkeys WHERE user_id = ?
  `).all(userId) as Array<{ credential_id: string; public_key: string; counter: number }>;
  return results.map(r => ({
    credentialId: r.credential_id,
    publicKey: r.public_key,
    counter: r.counter,
  }));
}

/**
 * Get a specific passkey by credential ID
 */
export function getPasskey(credentialId: string): { userId: string; publicKey: string; counter: number } | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT user_id, public_key, counter FROM passkeys WHERE credential_id = ?
  `).get(credentialId) as { user_id: string; public_key: string; counter: number } | undefined;
  return result ? {
    userId: result.user_id,
    publicKey: result.public_key,
    counter: result.counter,
  } : null;
}

/**
 * Update passkey counter after authentication
 */
export function updatePasskeyCounter(credentialId: string, newCounter: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE passkeys SET counter = ? WHERE credential_id = ?
  `).run(newCounter, credentialId);
}

/**
 * Delete a specific passkey
 */
export function deletePasskey(credentialId: string): boolean {
  const db = getDb();
  const result = db.prepare(`DELETE FROM passkeys WHERE credential_id = ?`).run(credentialId);
  return result.changes > 0;
}

/**
 * Delete all passkeys for a user
 */
export function deleteAllPasskeys(userId: string): number {
  const db = getDb();
  const result = db.prepare(`DELETE FROM passkeys WHERE user_id = ?`).run(userId);
  return result.changes;
}

/**
 * Set 2FA enabled status for a user
 */
export function setTwoFactorEnabled(userId: string, enabled: boolean): void {
  const db = getDb();
  db.prepare(`
    UPDATE users SET two_factor_enabled = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(enabled ? 1 : 0, userId);
}

/**
 * Check if 2FA is enabled for a user
 */
export function isTwoFactorEnabled(userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    SELECT two_factor_enabled FROM users WHERE id = ?
  `).get(userId) as { two_factor_enabled: number } | undefined;
  return (result?.two_factor_enabled || 0) === 1;
}

/**
 * Get complete 2FA status for a user
 */
export function getTwoFactorStatus(userId: string): {
  enabled: boolean;
  totpEnabled: boolean;
  passkeyEnabled: boolean;
  emailEnabled: boolean;
  backupCodesRemaining: number;
} {
  const db = getDb();

  const user = db.prepare(`
    SELECT two_factor_enabled FROM users WHERE id = ?
  `).get(userId) as { two_factor_enabled: number } | undefined;

  const totpSecret = db.prepare(`
    SELECT secret FROM totp_secrets WHERE user_id = ?
  `).get(userId);

  const passkeys = db.prepare(`
    SELECT COUNT(*) as count FROM passkeys WHERE user_id = ?
  `).get(userId) as { count: number };

  const backupCodes = db.prepare(`
    SELECT COUNT(*) as count FROM backup_codes WHERE user_id = ? AND used = 0
  `).get(userId) as { count: number };

  return {
    enabled: (user?.two_factor_enabled || 0) === 1,
    totpEnabled: !!totpSecret,
    passkeyEnabled: (passkeys?.count || 0) > 0,
    emailEnabled: true, // Email is always available as fallback
    backupCodesRemaining: backupCodes?.count || 0,
  };
}

// ============================================================================
// Genome ownership helpers
// ============================================================================

export function getUserGenomes(userId: string): GenomeMetadata[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, filename, original_filename, source, snp_count, stored_snps,
           file_size, checksum_sha256, compression_type, processed_at, status, is_primary, nickname
    FROM genomes 
    WHERE user_id = ?
    ORDER BY is_primary DESC, processed_at DESC
  `).all(userId) as GenomeMetadata[];
}

export function getAccessibleGenomes(userId: string): Array<GenomeMetadata & { accessLevel: 'owner' | 'shared'; sharedBy?: string }> {
  const db = getDb();
  
  // Get user's own genomes
  const ownGenomes = db.prepare(`
    SELECT id, filename, original_filename, source, snp_count, stored_snps,
           file_size, checksum_sha256, compression_type, processed_at, status, is_primary, nickname
    FROM genomes 
    WHERE user_id = ?
    ORDER BY is_primary DESC, processed_at DESC
  `).all(userId) as any[];

  // Get shared genomes
  const sharedGenomes = db.prepare(`
    SELECT g.id, g.filename, g.original_filename, g.source, g.snp_count, g.stored_snps,
           g.file_size, g.checksum_sha256, g.compression_type, g.processed_at, g.status, g.is_primary, g.nickname,
           u.email as shared_by_email, u.display_name as shared_by_name, sp.permission_level
    FROM sharing_permissions sp
    JOIN genomes g ON sp.genome_id = g.id OR sp.genome_id IS NULL
    JOIN users u ON g.user_id = u.id
    WHERE sp.shared_with_id = ? AND sp.status = 'active'
      AND (sp.expires_at IS NULL OR sp.expires_at > datetime('now'))
      AND (sp.genome_id IS NULL OR sp.genome_id = g.id)
    ORDER BY g.processed_at DESC
  `).all(userId) as any[];

  const ownResults = ownGenomes.map(g => ({ ...g, accessLevel: 'owner' as const }));
  const sharedResults = sharedGenomes.map(g => ({
    ...g,
    accessLevel: 'shared' as const,
    sharedBy: g.shared_by_name || g.shared_by_email,
  }));

  return [...ownResults, ...sharedResults];
}

export function setPrimaryGenome(userId: string, genomeId: string): void {
  const db = getDb();
  // Clear existing primary
  db.prepare(`UPDATE genomes SET is_primary = 0 WHERE user_id = ?`).run(userId);
  // Set new primary
  db.prepare(`UPDATE genomes SET is_primary = 1 WHERE id = ? AND user_id = ?`).run(genomeId, userId);
}

export function canAccessGenome(userId: string, genomeId: string): { canAccess: boolean; permissionLevel: 'owner' | 'view' | 'download' | 'manage' } {
  const db = getDb();

  // Check ownership
  const ownGenome = db.prepare(`SELECT id FROM genomes WHERE id = ? AND user_id = ?`).get(genomeId, userId);
  if (ownGenome) {
    return { canAccess: true, permissionLevel: 'owner' };
  }

  // Check sharing permissions
  const shared = db.prepare(`
    SELECT permission_level FROM sharing_permissions 
    WHERE (genome_id = ? OR genome_id IS NULL) AND shared_with_id = ? 
    AND status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).get(genomeId, userId) as any;

  if (shared) {
    return { canAccess: true, permissionLevel: shared.permission_level };
  }

  return { canAccess: false, permissionLevel: 'view' };
}

// Password reset functions
export function generatePasswordResetToken(userId: string): string {
  const db = getDb();
  const id = uuidv4();
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  db.prepare(`
    INSERT INTO password_resets (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, token, expiresAt.toISOString());

  return token;
}

export function generateEmailVerificationToken(userId: string): string {
  const db = getDb();
  const id = uuidv4();
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  db.prepare(`
    INSERT INTO email_verifications (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, token, expiresAt.toISOString());

  return token;
}

// ============================================
// Optimized Batch Query Utilities
// ============================================

/**
 * Batch insert SNPs with optimized prepared statement reuse
 * This is much faster than individual inserts
 */
export function batchInsertSNPs(
  db: Database.Database,
  genomeId: string,
  snps: Array<{ rsid: string; chromosome: string; position: number; genotype: string }>,
  batchSize = 1000
): number {
  const insert = db.prepare(`
    INSERT INTO snps (genome_id, rsid, chromosome, position, genotype)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((snpList: typeof snps) => {
    for (const snp of snpList) {
      insert.run(genomeId, snp.rsid, snp.chromosome, snp.position, snp.genotype);
    }
  });

  let inserted = 0;
  for (let i = 0; i < snps.length; i += batchSize) {
    const batch = snps.slice(i, i + batchSize);
    insertMany(batch);
    inserted += batch.length;
  }

  return inserted;
}

/**
 * Get SNPs with pagination and filtering - optimized single query
 */
export function getSNPsPaginated(
  db: Database.Database,
  options: {
    userId: string;
    genomeId?: string;
    search?: string;
    category?: string;
    impact?: string;
    chromosome?: string;
    favoritesOnly?: boolean;
    page: number;
    limit: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }
): {
  items: Array<{
    rsid: string;
    gene: string | null;
    chromosome: string;
    position: number;
    genotype: string;
    category: string;
    clinicalImpact: string;
    summary: string | null;
  }>;
  total: number;
  hasMore: boolean;
} {
  const {
    userId,
    genomeId,
    search,
    category,
    impact,
    chromosome,
    favoritesOnly,
    page,
    limit,
    sortBy,
    sortDirection,
  } = options;

  const offset = (page - 1) * limit;
  const params: (string | number)[] = [userId];
  const conditions: string[] = ['gs.user_id = ?'];

  if (genomeId) {
    conditions.push('gs.genome_id = ?');
    params.push(genomeId);
  }

  if (search) {
    conditions.push('(gs.rsid LIKE ? OR gs.gene LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category && category !== 'all') {
    conditions.push('gs.category = ?');
    params.push(category);
  }

  if (impact && impact !== 'all') {
    conditions.push('gs.clinical_impact = ?');
    params.push(impact);
  }

  if (chromosome && chromosome !== 'all') {
    conditions.push('gs.chromosome = ?');
    params.push(chromosome);
  }

  if (favoritesOnly) {
    conditions.push('EXISTS (SELECT 1 FROM snp_favorites sf WHERE sf.user_id = gs.user_id AND sf.rsid = gs.rsid)');
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countQuery = db.prepare(`
    SELECT COUNT(*) as total
    FROM snps gs
    WHERE ${whereClause}
  `);
  const { total } = countQuery.get(...params) as { total: number };

  // Get paginated results
  const validSortColumns: Record<string, string> = {
    rsid: 'gs.rsid',
    gene: 'gs.gene',
    chromosome: 'gs.chromosome',
    category: 'gs.category',
    impact: 'gs.clinical_impact',
  };

  const orderBy = validSortColumns[sortBy] || 'gs.rsid';
  const orderDir = sortDirection.toUpperCase();

  const dataQuery = db.prepare(`
    SELECT
      gs.rsid,
      '' as gene,
      gs.chromosome,
      gs.position,
      gs.genotype,
      '' as category,
      '' as clinicalImpact,
      sd.description as summary
    FROM snps gs
    LEFT JOIN snp_database sd ON sd.rsid = gs.rsid
    WHERE ${whereClause}
    ORDER BY ${orderBy} ${orderDir}
    LIMIT ? OFFSET ?
  `);

  const items = dataQuery.all(...params, limit, offset) as Array<{
    rsid: string;
    gene: string | null;
    chromosome: string;
    position: number;
    genotype: string;
    category: string;
    clinicalImpact: string;
    summary: string | null;
  }>;

  return {
    items,
    total,
    hasMore: offset + items.length < total,
  };
}

/**
 * Get dashboard stats in a single optimized query
 */
export function getDashboardStats(
  db: Database.Database,
  userId: string,
  since: string
): {
  totalGenomes: number;
  totalReports: number;
  totalSNPs: number;
  sharedWithMe: number;
  sharedByMe: number;
  recentUpdates: number;
} {
  const query = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM genomes WHERE user_id = ? AND status = 'completed') as totalGenomes,
      (SELECT COUNT(*) FROM reports r JOIN genomes g ON g.id = r.genome_id WHERE g.user_id = ?) as totalReports,
      (SELECT COALESCE(SUM(stored_snps), 0) FROM genomes WHERE user_id = ?) as totalSNPs,
      (SELECT COUNT(*) FROM sharing_permissions WHERE shared_with_id = ? AND status = 'active') as sharedWithMe,
      (SELECT COUNT(*) FROM sharing_permissions WHERE owner_id = ? AND status = 'active') as sharedByMe,
      (SELECT COUNT(*) FROM research_updates WHERE date >= ?) as recentUpdates
  `);

  return query.get(userId, userId, userId, userId, userId, since) as {
    totalGenomes: number;
    totalReports: number;
    totalSNPs: number;
    sharedWithMe: number;
    sharedByMe: number;
    recentUpdates: number;
  };
}

/**
 * Search across multiple tables with UNION ALL
 */
export function globalSearch(
  db: Database.Database,
  userId: string,
  searchTerm: string,
  limit: number
): Array<{
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
}> {
  const searchPattern = `%${searchTerm}%`;

  const query = db.prepare(`
    SELECT * FROM (
      SELECT 
        id,
        'genome' as type,
        original_filename as title,
        stored_snps || ' SNPs' as subtitle,
        '/genomes' as href,
        1 as priority
      FROM genomes
      WHERE user_id = ? AND original_filename LIKE ?
      
      UNION ALL
      
      SELECT
        rsid as id,
        'snp' as type,
        rsid as title,
        'Unknown - ' || genotype as subtitle,
        '/explorer?rsid=' || rsid as href,
        2 as priority
      FROM snps
      WHERE genome_id IN (SELECT id FROM genomes WHERE user_id = ?) AND rsid LIKE ?
      GROUP BY rsid
      
      UNION ALL
      
      SELECT 
        r.id,
        'report' as type,
        g.original_filename as title,
        'Generated ' || datetime(r.created_at, 'localtime') as subtitle,
        '/report/' || r.genome_id as href,
        3 as priority
      FROM reports r
      JOIN genomes g ON g.id = r.genome_id
      WHERE g.user_id = ?
      
      UNION ALL
      
      SELECT 
        rsid as id,
        'research' as type,
        rsid as title,
        COALESCE(gene_name, 'Unknown gene') as subtitle,
        '/research?snp=' || rsid as href,
        4 as priority
      FROM snp_database
      WHERE rsid LIKE ? OR gene_symbol LIKE ?
      LIMIT ?
    )
    ORDER BY priority
    LIMIT ?
  `);

  return query.all(
    userId, searchPattern,
    userId, searchPattern, searchPattern,
    userId,
    searchPattern, searchPattern,
    limit,
    limit
  ) as Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    href: string;
  }>;
}

// ============================================
// OAUTH FUNCTIONS
// ============================================

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: 'google' | 'github';
  providerId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface OAuthProfile {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Get user by OAuth provider and provider ID
 */
export function getUserByOAuth(provider: 'google' | 'github', providerId: string): User | null {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, display_name, created_at, updated_at, last_login_at, is_active, email_verified
    FROM users WHERE oauth_provider = ? AND oauth_id = ?
  `).get(provider, providerId) as any;

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
    lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
    isActive: user.is_active === 1,
    emailVerified: user.email_verified === 1,
  };
}

/**
 * Get user by email for OAuth account linking
 */
export function getUserByEmailForOAuth(email: string): User | null {
  return getUserByEmail(email);
}

/**
 * Create a new user with OAuth authentication
 */
export function createOAuthUser(profile: OAuthProfile, displayName?: string): User {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at, oauth_provider, oauth_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // OAuth users don't have a password hash (they use social login)
  insertUser.run(id, profile.email, '', displayName || profile.name || null, now, now, profile.provider, profile.providerId);

  // Create default profile
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, user_id, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  insertProfile.run(uuidv4(), id, now, now);

  // Create OAuth account record
  const insertOAuth = db.prepare(`
    INSERT INTO oauth_accounts (id, user_id, provider, provider_id, email, name, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOAuth.run(uuidv4(), id, profile.provider, profile.providerId, profile.email, profile.name, profile.avatarUrl || null, now);

  return {
    id,
    email: profile.email,
    displayName: displayName || profile.name || null,
    createdAt: new Date(now),
    updatedAt: new Date(now),
    lastLoginAt: null,
    isActive: true,
    emailVerified: false, // OAuth emails are typically verified by the provider
  };
}

/**
 * Link an OAuth account to an existing user
 */
export function linkOAuthAccount(userId: string, profile: OAuthProfile): void {
  const db = getDb();
  const now = new Date().toISOString();

  // Update user's OAuth fields
  db.prepare(`
    UPDATE users SET oauth_provider = ?, oauth_id = ?, updated_at = ?
    WHERE id = ?
  `).run(profile.provider, profile.providerId, now, userId);

  // Create OAuth account record
  db.prepare(`
    INSERT INTO oauth_accounts (id, user_id, provider, provider_id, email, name, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), userId, profile.provider, profile.providerId, profile.email, profile.name, profile.avatarUrl || null, now);
}

/**
 * Check if an OAuth account exists
 */
export function getOAuthAccount(provider: 'google' | 'github', providerId: string): OAuthAccount | null {
  const db = getDb();
  const account = db.prepare(`
    SELECT id, user_id, provider, provider_id, email, name, avatar_url, created_at
    FROM oauth_accounts WHERE provider = ? AND provider_id = ?
  `).get(provider, providerId) as any;

  if (!account) return null;

  return {
    id: account.id,
    userId: account.user_id,
    provider: account.provider,
    providerId: account.provider_id,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatar_url,
    createdAt: new Date(account.created_at),
  };
}

/**
 * Get all OAuth accounts for a user
 */
export function getUserOAuthAccounts(userId: string): OAuthAccount[] {
  const db = getDb();
  const accounts = db.prepare(`
    SELECT id, user_id, provider, provider_id, email, name, avatar_url, created_at
    FROM oauth_accounts WHERE user_id = ?
  `).all(userId) as any[];

  return accounts.map(account => ({
    id: account.id,
    userId: account.user_id,
    provider: account.provider,
    providerId: account.provider_id,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatar_url,
    createdAt: new Date(account.created_at),
  }));
}

/**
 * Unlink an OAuth account from a user
 */
export function unlinkOAuthAccount(userId: string, provider: 'google' | 'github'): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM oauth_accounts WHERE user_id = ? AND provider = ?
  `).run(userId, provider);

  if (result.changes > 0) {
    // Clear OAuth fields from users table
    db.prepare(`
      UPDATE users SET oauth_provider = NULL, oauth_id = NULL, updated_at = ?
      WHERE id = ? AND oauth_provider = ?
    `).run(new Date().toISOString(), userId, provider);
    return true;
  }
  return false;
}

/**
 * Update user avatar from OAuth
 */
export function updateUserAvatar(userId: string, avatarUrl: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE profiles SET avatar_url = ?, updated_at = ?
    WHERE user_id = ?
  `).run(avatarUrl, new Date().toISOString(), userId);
}

// ============================================================================
// ANCESTRY FUNCTIONS
// ============================================================================

export interface AncestryResult {
  id: string;
  genomeId: string;
  userId: string;
  ethnicity: Array<{ region: string; percentage: number }>;
  yHaplogroup: string | null;
  mtHaplogroup: string | null;
  confidence: number;
  analyzedAt: Date;
}

export interface AncestryMatch {
  id: string;
  userId: string;
  matchUserId: string | null;
  sharedDnaCm: number | null;
  sharedPercentage: number | null;
  relationshipType: string | null;
  confidence: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: Date;
}

export function saveAncestryResult(
  genomeId: string,
  userId: string,
  ethnicity: Array<{ region: string; percentage: number }>,
  yHaplogroup?: string,
  mtHaplogroup?: string,
  confidence?: number
): AncestryResult {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO ancestry_results (id, genome_id, user_id, ethnicity_json, y_haplogroup, mt_haplogroup, confidence, analyzed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    genomeId,
    userId,
    JSON.stringify(ethnicity),
    yHaplogroup || null,
    mtHaplogroup || null,
    confidence || null,
    now
  );

  return {
    id,
    genomeId,
    userId,
    ethnicity,
    yHaplogroup: yHaplogroup || null,
    mtHaplogroup: mtHaplogroup || null,
    confidence: confidence || 0,
    analyzedAt: new Date(now),
  };
}

export function getAncestryResult(genomeId: string): AncestryResult | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, genome_id, user_id, ethnicity_json, y_haplogroup, mt_haplogroup, confidence, analyzed_at
    FROM ancestry_results WHERE genome_id = ?
  `).get(genomeId) as any;

  if (!result) return null;

  return {
    id: result.id,
    genomeId: result.genome_id,
    userId: result.user_id,
    ethnicity: JSON.parse(result.ethnicity_json),
    yHaplogroup: result.y_haplogroup,
    mtHaplogroup: result.mt_haplogroup,
    confidence: result.confidence,
    analyzedAt: new Date(result.analyzed_at),
  };
}

export function getUserAncestryResults(userId: string): AncestryResult[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, genome_id, user_id, ethnicity_json, y_haplogroup, mt_haplogroup, confidence, analyzed_at
    FROM ancestry_results WHERE user_id = ? ORDER BY analyzed_at DESC
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    genomeId: result.genome_id,
    userId: result.user_id,
    ethnicity: JSON.parse(result.ethnicity_json),
    yHaplogroup: result.y_haplogroup,
    mtHaplogroup: result.mt_haplogroup,
    confidence: result.confidence,
    analyzedAt: new Date(result.analyzed_at),
  }));
}

export function saveAncestryMatch(
  userId: string,
  matchUserId: string | null,
  sharedDnaCm?: number,
  sharedPercentage?: number,
  relationshipType?: string,
  confidence?: number
): AncestryMatch {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO ancestry_matches (id, user_id, match_user_id, shared_dna_cm, shared_percentage, relationship_type, confidence, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    userId,
    matchUserId || null,
    sharedDnaCm || null,
    sharedPercentage || null,
    relationshipType || null,
    confidence || null,
    'pending',
    now
  );

  return {
    id,
    userId,
    matchUserId: matchUserId || null,
    sharedDnaCm: sharedDnaCm || null,
    sharedPercentage: sharedPercentage || null,
    relationshipType: relationshipType || null,
    confidence: confidence || null,
    status: 'pending',
    createdAt: new Date(now),
  };
}

export function getAncestryMatches(userId: string): AncestryMatch[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, user_id, match_user_id, shared_dna_cm, shared_percentage, relationship_type, confidence, status, created_at
    FROM ancestry_matches WHERE user_id = ? AND status != 'blocked' ORDER BY shared_dna_cm DESC
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    userId: result.user_id,
    matchUserId: result.match_user_id,
    sharedDnaCm: result.shared_dna_cm,
    sharedPercentage: result.shared_percentage,
    relationshipType: result.relationship_type,
    confidence: result.confidence,
    status: result.status,
    createdAt: new Date(result.created_at),
  }));
}

export function updateAncestryMatchStatus(
  matchId: string,
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
): boolean {
  const db = getDb();
  const result = db.prepare(`
    UPDATE ancestry_matches SET status = ? WHERE id = ?
  `).run(status, matchId);
  return result.changes > 0;
}

// ============================================================================
// TRAITS FUNCTIONS
// ============================================================================

export interface TraitsResult {
  id: string;
  genomeId: string;
  userId: string;
  traits: Record<string, any>;
  analyzedAt: Date;
}

export interface TraitPreference {
  id: string;
  userId: string;
  traitId: string;
  isVisible: boolean;
  shareWithFamily: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function saveTraitsResult(
  genomeId: string,
  userId: string,
  traits: Record<string, any>
): TraitsResult {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO traits_results (id, genome_id, user_id, traits_json, analyzed_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insert.run(id, genomeId, userId, JSON.stringify(traits), now);

  return {
    id,
    genomeId,
    userId,
    traits,
    analyzedAt: new Date(now),
  };
}

export function getTraitsResult(genomeId: string): TraitsResult | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, genome_id, user_id, traits_json, analyzed_at
    FROM traits_results WHERE genome_id = ?
  `).get(genomeId) as any;

  if (!result) return null;

  return {
    id: result.id,
    genomeId: result.genome_id,
    userId: result.user_id,
    traits: JSON.parse(result.traits_json),
    analyzedAt: new Date(result.analyzed_at),
  };
}

export function getUserTraitsResults(userId: string): TraitsResult[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, genome_id, user_id, traits_json, analyzed_at
    FROM traits_results WHERE user_id = ? ORDER BY analyzed_at DESC
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    genomeId: result.genome_id,
    userId: result.user_id,
    traits: JSON.parse(result.traits_json),
    analyzedAt: new Date(result.analyzed_at),
  }));
}

export function saveTraitPreference(
  userId: string,
  traitId: string,
  isVisible: boolean,
  shareWithFamily: boolean
): TraitPreference {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO user_traits_preferences (id, user_id, trait_id, is_visible, share_with_family, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, trait_id) DO UPDATE SET
      is_visible = excluded.is_visible,
      share_with_family = excluded.share_with_family,
      updated_at = excluded.updated_at
  `);

  insert.run(
    id,
    userId,
    traitId,
    isVisible ? 1 : 0,
    shareWithFamily ? 1 : 0,
    now,
    now
  );

  return {
    id,
    userId,
    traitId,
    isVisible,
    shareWithFamily,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function getTraitPreferences(userId: string): TraitPreference[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, user_id, trait_id, is_visible, share_with_family, created_at, updated_at
    FROM user_traits_preferences WHERE user_id = ?
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    userId: result.user_id,
    traitId: result.trait_id,
    isVisible: result.is_visible === 1,
    shareWithFamily: result.share_with_family === 1,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  }));
}

export function getTraitPreference(userId: string, traitId: string): TraitPreference | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, user_id, trait_id, is_visible, share_with_family, created_at, updated_at
    FROM user_traits_preferences WHERE user_id = ? AND trait_id = ?
  `).get(userId, traitId) as any;

  if (!result) return null;

  return {
    id: result.id,
    userId: result.user_id,
    traitId: result.trait_id,
    isVisible: result.is_visible === 1,
    shareWithFamily: result.share_with_family === 1,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  };
}

// ============================================================================
// CARRIER FUNCTIONS
// ============================================================================

export interface CarrierResult {
  id: string;
  genomeId: string;
  userId: string;
  results: Record<string, any>;
  hasPathogenicVariants: boolean;
  counselingRecommended: boolean;
  analyzedAt: Date;
}

export interface CarrierSharing {
  id: string;
  userId: string;
  partnerEmail: string;
  sharedAt: Date;
  accessToken: string;
  expiresAt: Date | null;
  accessedAt: Date | null;
}

export function saveCarrierResult(
  genomeId: string,
  userId: string,
  results: Record<string, any>,
  hasPathogenicVariants: boolean,
  counselingRecommended: boolean
): CarrierResult {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO carrier_results (id, genome_id, user_id, results_json, has_pathogenic_variants, counseling_recommended, analyzed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    genomeId,
    userId,
    JSON.stringify(results),
    hasPathogenicVariants ? 1 : 0,
    counselingRecommended ? 1 : 0,
    now
  );

  return {
    id,
    genomeId,
    userId,
    results,
    hasPathogenicVariants,
    counselingRecommended,
    analyzedAt: new Date(now),
  };
}

export function getCarrierResult(genomeId: string): CarrierResult | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, genome_id, user_id, results_json, has_pathogenic_variants, counseling_recommended, analyzed_at
    FROM carrier_results WHERE genome_id = ?
  `).get(genomeId) as any;

  if (!result) return null;

  return {
    id: result.id,
    genomeId: result.genome_id,
    userId: result.user_id,
    results: JSON.parse(result.results_json),
    hasPathogenicVariants: result.has_pathogenic_variants === 1,
    counselingRecommended: result.counseling_recommended === 1,
    analyzedAt: new Date(result.analyzed_at),
  };
}

export function getUserCarrierResults(userId: string): CarrierResult[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, genome_id, user_id, results_json, has_pathogenic_variants, counseling_recommended, analyzed_at
    FROM carrier_results WHERE user_id = ? ORDER BY analyzed_at DESC
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    genomeId: result.genome_id,
    userId: result.user_id,
    results: JSON.parse(result.results_json),
    hasPathogenicVariants: result.has_pathogenic_variants === 1,
    counselingRecommended: result.counseling_recommended === 1,
    analyzedAt: new Date(result.analyzed_at),
  }));
}

export function shareCarrierResults(
  userId: string,
  partnerEmail: string,
  expiresDays?: number
): CarrierSharing {
  const db = getDb();
  const id = uuidv4();
  const accessToken = uuidv4();
  const now = new Date();
  const expiresAt = expiresDays ? new Date(now.getTime() + expiresDays * 24 * 60 * 60 * 1000) : null;

  const insert = db.prepare(`
    INSERT INTO carrier_sharing (id, user_id, partner_email, shared_at, access_token, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    userId,
    partnerEmail,
    now.toISOString(),
    accessToken,
    expiresAt?.toISOString() || null
  );

  return {
    id,
    userId,
    partnerEmail,
    sharedAt: now,
    accessToken,
    expiresAt,
    accessedAt: null,
  };
}

export function getCarrierSharingByToken(accessToken: string): CarrierSharing | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, user_id, partner_email, shared_at, access_token, expires_at, accessed_at
    FROM carrier_sharing WHERE access_token = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).get(accessToken) as any;

  if (!result) return null;

  return {
    id: result.id,
    userId: result.user_id,
    partnerEmail: result.partner_email,
    sharedAt: new Date(result.shared_at),
    accessToken: result.access_token,
    expiresAt: result.expires_at ? new Date(result.expires_at) : null,
    accessedAt: result.accessed_at ? new Date(result.accessed_at) : null,
  };
}

export function recordCarrierSharingAccess(accessToken: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE carrier_sharing SET accessed_at = datetime('now') WHERE access_token = ?
  `).run(accessToken);
}

export function getUserCarrierSharing(userId: string): CarrierSharing[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, user_id, partner_email, shared_at, access_token, expires_at, accessed_at
    FROM carrier_sharing WHERE user_id = ? ORDER BY shared_at DESC
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    userId: result.user_id,
    partnerEmail: result.partner_email,
    sharedAt: new Date(result.shared_at),
    accessToken: result.access_token,
    expiresAt: result.expires_at ? new Date(result.expires_at) : null,
    accessedAt: result.accessed_at ? new Date(result.accessed_at) : null,
  }));
}

export function revokeCarrierSharing(sharingId: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM carrier_sharing WHERE id = ? AND user_id = ?
  `).run(sharingId, userId);
  return result.changes > 0;
}

// ============================================================================
// RELATIVES FUNCTIONS
// ============================================================================

export interface MatchingPreferences {
  id: string;
  userId: string;
  isOptedIn: boolean;
  showRealName: boolean;
  allowContact: boolean;
  showAncestry: boolean;
  shareEthnicity: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelativeMatch {
  id: string;
  userId: string;
  matchUserId: string | null;
  relationshipPrediction: string | null;
  sharedSegments: any[];
  ibdSegments: any[];
  isHidden: boolean;
  canContact: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HiddenMatch {
  id: string;
  userId: string;
  matchUserId: string;
  hiddenAt: Date;
  reason: string | null;
}

export function updateMatchingPreferences(
  userId: string,
  preferences: Partial<Omit<MatchingPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): MatchingPreferences {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  // Check if preferences already exist
  const existing = db.prepare(`SELECT id FROM relative_matching_preferences WHERE user_id = ?`).get(userId) as any;

  if (existing) {
    const sets: string[] = [];
    const values: any[] = [];

    if (preferences.isOptedIn !== undefined) { sets.push('is_opted_in = ?'); values.push(preferences.isOptedIn ? 1 : 0); }
    if (preferences.showRealName !== undefined) { sets.push('show_real_name = ?'); values.push(preferences.showRealName ? 1 : 0); }
    if (preferences.allowContact !== undefined) { sets.push('allow_contact = ?'); values.push(preferences.allowContact ? 1 : 0); }
    if (preferences.showAncestry !== undefined) { sets.push('show_ancestry = ?'); values.push(preferences.showAncestry ? 1 : 0); }
    if (preferences.shareEthnicity !== undefined) { sets.push('share_ethnicity = ?'); values.push(preferences.shareEthnicity ? 1 : 0); }

    sets.push('updated_at = ?');
    values.push(now);
    values.push(userId);

    db.prepare(`UPDATE relative_matching_preferences SET ${sets.join(', ')} WHERE user_id = ?`).run(...values);

    return getMatchingPreferences(userId)!;
  } else {
    const insert = db.prepare(`
      INSERT INTO relative_matching_preferences (id, user_id, is_opted_in, show_real_name, allow_contact, show_ancestry, share_ethnicity, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      userId,
      preferences.isOptedIn !== undefined ? (preferences.isOptedIn ? 1 : 0) : 0,
      preferences.showRealName !== undefined ? (preferences.showRealName ? 1 : 0) : 0,
      preferences.allowContact !== undefined ? (preferences.allowContact ? 1 : 0) : 1,
      preferences.showAncestry !== undefined ? (preferences.showAncestry ? 1 : 0) : 1,
      preferences.shareEthnicity !== undefined ? (preferences.shareEthnicity ? 1 : 0) : 1,
      now,
      now
    );

    return {
      id,
      userId,
      isOptedIn: preferences.isOptedIn || false,
      showRealName: preferences.showRealName || false,
      allowContact: preferences.allowContact !== false,
      showAncestry: preferences.showAncestry !== false,
      shareEthnicity: preferences.shareEthnicity !== false,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }
}

export function getMatchingPreferences(userId: string): MatchingPreferences | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, user_id, is_opted_in, show_real_name, allow_contact, show_ancestry, share_ethnicity, created_at, updated_at
    FROM relative_matching_preferences WHERE user_id = ?
  `).get(userId) as any;

  if (!result) {
    // Return default preferences
    return {
      id: '',
      userId,
      isOptedIn: false,
      showRealName: false,
      allowContact: true,
      showAncestry: true,
      shareEthnicity: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: result.id,
    userId: result.user_id,
    isOptedIn: result.is_opted_in === 1,
    showRealName: result.show_real_name === 1,
    allowContact: result.allow_contact === 1,
    showAncestry: result.show_ancestry === 1,
    shareEthnicity: result.share_ethnicity === 1,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  };
}

export function saveRelativeMatch(
  userId: string,
  matchUserId: string | null,
  relationshipPrediction?: string,
  sharedSegments?: any[],
  ibdSegments?: any[],
  canContact?: boolean
): RelativeMatch {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO relative_matches (id, user_id, match_user_id, relationship_prediction, shared_segments_json, ibd_segments_json, can_contact, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    userId,
    matchUserId || null,
    relationshipPrediction || null,
    JSON.stringify(sharedSegments || []),
    JSON.stringify(ibdSegments || []),
    canContact !== false ? 1 : 0,
    now,
    now
  );

  return {
    id,
    userId,
    matchUserId: matchUserId || null,
    relationshipPrediction: relationshipPrediction || null,
    sharedSegments: sharedSegments || [],
    ibdSegments: ibdSegments || [],
    isHidden: false,
    canContact: canContact !== false,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function getRelativeMatches(userId: string, includeHidden: boolean = false): RelativeMatch[] {
  const db = getDb();
  let query = `
    SELECT id, user_id, match_user_id, relationship_prediction, shared_segments_json, ibd_segments_json, is_hidden, can_contact, created_at, updated_at
    FROM relative_matches WHERE user_id = ?
  `;
  
  if (!includeHidden) {
    query += ` AND is_hidden = 0`;
  }
  
  query += ` ORDER BY created_at DESC`;

  const results = db.prepare(query).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    userId: result.user_id,
    matchUserId: result.match_user_id,
    relationshipPrediction: result.relationship_prediction,
    sharedSegments: JSON.parse(result.shared_segments_json || '[]'),
    ibdSegments: JSON.parse(result.ibd_segments_json || '[]'),
    isHidden: result.is_hidden === 1,
    canContact: result.can_contact === 1,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  }));
}

export function hideMatch(userId: string, matchUserId: string, reason?: string): HiddenMatch {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  // Start transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Insert into hidden_matches
    const insert = db.prepare(`
      INSERT INTO hidden_matches (id, user_id, match_user_id, hidden_at, reason)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, match_user_id) DO UPDATE SET
        hidden_at = excluded.hidden_at,
        reason = excluded.reason
    `);

    insert.run(id, userId, matchUserId, now, reason || null);

    // Update relative_matches to mark as hidden
    db.prepare(`
      UPDATE relative_matches SET is_hidden = 1, updated_at = ? WHERE user_id = ? AND match_user_id = ?
    `).run(now, userId, matchUserId);

    db.exec('COMMIT');

    return {
      id,
      userId,
      matchUserId,
      hiddenAt: new Date(now),
      reason: reason || null,
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function unhideMatch(userId: string, matchUserId: string): boolean {
  const db = getDb();
  const now = new Date().toISOString();

  // Start transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Remove from hidden_matches
    const deleteResult = db.prepare(`
      DELETE FROM hidden_matches WHERE user_id = ? AND match_user_id = ?
    `).run(userId, matchUserId);

    // Update relative_matches to mark as not hidden
    db.prepare(`
      UPDATE relative_matches SET is_hidden = 0, updated_at = ? WHERE user_id = ? AND match_user_id = ?
    `).run(now, userId, matchUserId);

    db.exec('COMMIT');

    return deleteResult.changes > 0;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function getHiddenMatches(userId: string): HiddenMatch[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, user_id, match_user_id, hidden_at, reason
    FROM hidden_matches WHERE user_id = ? ORDER BY hidden_at DESC
  `).all(userId) as any[];

  return results.map(result => ({
    id: result.id,
    userId: result.user_id,
    matchUserId: result.match_user_id,
    hiddenAt: new Date(result.hidden_at),
    reason: result.reason,
  }));
}

export function isMatchHidden(userId: string, matchUserId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    SELECT 1 FROM hidden_matches WHERE user_id = ? AND match_user_id = ?
  `).get(userId, matchUserId);
  
  return !!result;
}
