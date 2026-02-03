/**
 * D1 Schema Definition
 *
 * This file defines the schema for Cloudflare D1 database.
 * Use this with wrangler to create and migrate your D1 database.
 *
 * To apply this schema:
 * 1. wrangler d1 execute genetic-explorer-db --file=./app/utils/d1Schema.sql --local
 * 2. wrangler d1 execute genetic-explorer-db --file=./app/utils/d1Schema.sql --remote
 */

export const D1_SCHEMA = `
-- ============================================
-- D1 Schema for Genetic Explorer
-- ============================================

-- Users table - for multi-user support
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT,
  is_active INTEGER DEFAULT 1,
  email_verified INTEGER DEFAULT 0
);

-- User profiles table - stores genetic profile preferences
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
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Genome uploads table
CREATE TABLE IF NOT EXISTS genomes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  source TEXT NOT NULL,
  snp_count INTEGER NOT NULL,
  stored_snps INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  compression_type TEXT,
  storage_path TEXT,
  processed_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  is_primary INTEGER DEFAULT 0,
  nickname TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SNPs table - stores individual SNP data
CREATE TABLE IF NOT EXISTS snps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  genome_id TEXT NOT NULL,
  rsid TEXT NOT NULL,
  chromosome TEXT NOT NULL,
  position INTEGER NOT NULL,
  genotype TEXT NOT NULL,
  FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE
);

-- Analysis reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  genome_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  generated_at TEXT DEFAULT (datetime('now')),
  report_data TEXT NOT NULL,
  FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sharing permissions table - for family/friend sharing
CREATE TABLE IF NOT EXISTS sharing_permissions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  shared_with_id TEXT NOT NULL,
  genome_id TEXT,
  permission_level TEXT NOT NULL DEFAULT 'view',
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  message TEXT,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(owner_id, shared_with_id, genome_id)
);

-- Sharing invites table - for pending invitations
CREATE TABLE IF NOT EXISTS sharing_invites (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  email TEXT NOT NULL,
  genome_id TEXT,
  permission_level TEXT NOT NULL DEFAULT 'view',
  invite_token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE
);

-- Sessions table - for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_active_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity log table - for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SNP favorites table
CREATE TABLE IF NOT EXISTS snp_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rsid TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, rsid),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Research updates tracking table
CREATE TABLE IF NOT EXISTS research_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rsid TEXT NOT NULL,
  gene_name TEXT,
  change_type TEXT NOT NULL,
  description TEXT,
  source TEXT,
  date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  link TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_genomes_user_id ON genomes(user_id);
CREATE INDEX IF NOT EXISTS idx_genomes_status ON genomes(status);
CREATE INDEX IF NOT EXISTS idx_snps_genome_id ON snps(genome_id);
CREATE INDEX IF NOT EXISTS idx_snps_rsid ON snps(rsid);
CREATE INDEX IF NOT EXISTS idx_snps_chromosome_position ON snps(chromosome, position);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_owner ON sharing_permissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_shared ON sharing_permissions(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_research_updates_rsid ON research_updates(rsid);
CREATE INDEX IF NOT EXISTS idx_research_updates_date ON research_updates(date);

-- ============================================
-- FULL TEXT SEARCH (SQLite FTS5)
-- ============================================

CREATE VIRTUAL TABLE IF NOT EXISTS snps_fts USING fts5(
  rsid, gene, chromosome, position, genotype,
  content='snps',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS snps_ai AFTER INSERT ON snps BEGIN
  INSERT INTO snps_fts(rowid, rsid, gene, chromosome, position, genotype)
  VALUES (new.id, new.rsid, new.chromosome, new.position, new.genotype);
END;

CREATE TRIGGER IF NOT EXISTS snps_ad AFTER DELETE ON snps BEGIN
  INSERT INTO snps_fts(snps_fts, rowid, rsid, gene, chromosome, position, genotype)
  VALUES ('delete', old.id, old.rsid, old.chromosome, old.position, old.genotype);
END;
`;

/**
 * Get schema as SQL string for D1 execution
 */
export function getSchemaSQL(): string {
  return D1_SCHEMA;
}
