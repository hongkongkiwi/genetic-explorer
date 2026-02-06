/**
 * Database Schema Definitions
 * 
 * All table schemas in one place for easy reference and maintenance.
 * These are used by initDatabase() in database-legacy.ts
 */

export const SCHEMA = {
  users: `
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
  `,

  profiles: `
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
  `,

  genomes: `
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
  `,

  snps: `
    CREATE TABLE IF NOT EXISTS snps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      genome_id TEXT NOT NULL,
      rsid TEXT NOT NULL,
      chromosome TEXT NOT NULL,
      position INTEGER NOT NULL,
      genotype_encrypted TEXT NOT NULL,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE
    )
  `,

  reports: `
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      report_data TEXT NOT NULL,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  sharingPermissions: `
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
      created_by TEXT,
      relationship_type TEXT,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      UNIQUE(owner_id, shared_with_id, genome_id)
    )
  `,

  sharingInvites: `
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
  `,

  sessions: `
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
  `,

  activityLogs: `
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
  `,

  passwordResets: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  emailVerifications: `
    CREATE TABLE IF NOT EXISTS email_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  oauthAccounts: `
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
  `,

  totpSecrets: `
    CREATE TABLE IF NOT EXISTS totp_secrets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      secret TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  backupCodes: `
    CREATE TABLE IF NOT EXISTS backup_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  passkeys: `
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
  `,

  userPrivacySettings: `
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
  `,

  sharingLinks: `
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
  `,

  sharingAuditLog: `
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
  `,

  sharingCategorySettings: `
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
  `,

  ancestryResults: `
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
  `,

  ancestryMatches: `
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
  `,

  traitsResults: `
    CREATE TABLE IF NOT EXISTS traits_results (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      traits_json TEXT NOT NULL,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  userTraitsPreferences: `
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
  `,

  carrierResults: `
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
  `,

  carrierSharing: `
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
  `,

  relativeMatchingPreferences: `
    CREATE TABLE IF NOT EXISTS relative_matching_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      is_opted_in INTEGER DEFAULT 0,
      show_real_name INTEGER DEFAULT 0,
      allow_contact INTEGER DEFAULT 1,
      show_ancestry INTEGER DEFAULT 1,
      show_traits INTEGER DEFAULT 0,
      min_relationship TEXT DEFAULT 'distant',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  relativeMatches: `
    CREATE TABLE IF NOT EXISTS relative_matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      match_user_id TEXT NOT NULL,
      shared_dna_percent REAL,
      shared_segments INTEGER,
      total_shared_cm REAL,
      largest_segment_cm REAL,
      relationship TEXT,
      relationship_confidence TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, match_user_id)
    )
  `,

  snpFavorites: `
    CREATE TABLE IF NOT EXISTS snp_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      rsid TEXT NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, rsid)
    )
  `,

  notificationPreferences: `
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      email_enabled INTEGER DEFAULT 1,
      browser_enabled INTEGER DEFAULT 1,
      marketing_emails INTEGER DEFAULT 0,
      research_emails INTEGER DEFAULT 1,
      security_alerts INTEGER DEFAULT 1,
      weekly_digest INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  systemSettings: `
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  dataEncryptionKeys: `
    CREATE TABLE IF NOT EXISTS data_encryption_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key_version INTEGER DEFAULT 1,
      encrypted_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, key_version)
    )
  `,

  genomeBackups: `
    CREATE TABLE IF NOT EXISTS genome_backups (
      id TEXT PRIMARY KEY,
      genome_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      backup_path TEXT NOT NULL,
      backup_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (genome_id) REFERENCES genomes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
} as const;

export type TableName = keyof typeof SCHEMA;

/**
 * Get all table creation SQL statements in dependency order
 */
export function getAllSchemas(): string[] {
  return [
    SCHEMA.users,
    SCHEMA.profiles,
    SCHEMA.genomes,
    SCHEMA.snps,
    SCHEMA.reports,
    SCHEMA.sharingPermissions,
    SCHEMA.sharingInvites,
    SCHEMA.sessions,
    SCHEMA.activityLogs,
    SCHEMA.passwordResets,
    SCHEMA.emailVerifications,
    SCHEMA.oauthAccounts,
    SCHEMA.totpSecrets,
    SCHEMA.backupCodes,
    SCHEMA.passkeys,
    SCHEMA.userPrivacySettings,
    SCHEMA.sharingLinks,
    SCHEMA.sharingAuditLog,
    SCHEMA.sharingCategorySettings,
    SCHEMA.ancestryResults,
    SCHEMA.ancestryMatches,
    SCHEMA.traitsResults,
    SCHEMA.userTraitsPreferences,
    SCHEMA.carrierResults,
    SCHEMA.carrierSharing,
    SCHEMA.relativeMatchingPreferences,
    SCHEMA.relativeMatches,
    SCHEMA.snpFavorites,
    SCHEMA.notificationPreferences,
    SCHEMA.systemSettings,
    SCHEMA.dataEncryptionKeys,
    SCHEMA.genomeBackups,
  ];
}
