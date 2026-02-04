import { Database } from 'better-sqlite3';

// Migration to add new tables for v2 features
export function runMigrations(db: Database) {
  const migrations = [
    // SNP Favorites table
    {
      name: 'create_snp_favorites',
      sql: `
        CREATE TABLE IF NOT EXISTS snp_favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          rsid TEXT NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, rsid),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_snp_favorites_user ON snp_favorites(user_id);
      `,
    },
    
    // Research Updates table
    {
      name: 'create_research_updates',
      sql: `
        CREATE TABLE IF NOT EXISTS research_updates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          snp_rsid TEXT NOT NULL,
          snp_gene TEXT,
          change_type TEXT NOT NULL,
          description TEXT NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_major BOOLEAN DEFAULT 0,
          papers_added INTEGER DEFAULT 0,
          FOREIGN KEY (snp_rsid) REFERENCES snp_database(rsid)
        );
        CREATE INDEX IF NOT EXISTS idx_research_updates_date ON research_updates(date);
        CREATE INDEX IF NOT EXISTS idx_research_updates_rsid ON research_updates(snp_rsid);
      `,
    },
    
    // User Activity Log table
    {
      name: 'create_activity_log',
      sql: `
        CREATE TABLE IF NOT EXISTS activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          resource_type TEXT,
          resource_id TEXT,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
      `,
    },
    
    // Notifications table
    {
      name: 'create_notifications',
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          data TEXT,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
      `,
    },
    
    // Security: API Keys table for request signing
    {
      name: 'create_api_keys',
      sql: `
        CREATE TABLE IF NOT EXISTS api_keys (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          key TEXT UNIQUE NOT NULL,
          secret TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          last_used_at DATETIME,
          is_active INTEGER DEFAULT 1,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
        CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
      `,
    },
    
    // Security: Used nonces for replay protection
    {
      name: 'create_used_nonces',
      sql: `
        CREATE TABLE IF NOT EXISTS used_nonces (
          nonce TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_used_nonces_created_at ON used_nonces(created_at);
      `,
    },
    
    // Security: Replay windows for sliding window protection
    {
      name: 'create_replay_windows',
      sql: `
        CREATE TABLE IF NOT EXISTS replay_windows (
          window_id TEXT PRIMARY KEY,
          max_counter TEXT NOT NULL,
          bitmap TEXT NOT NULL,
          packets_received INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_replay_windows_updated_at ON replay_windows(updated_at);
      `,
    },
    
    // Security: User key versions for key rotation
    {
      name: 'create_user_key_versions',
      sql: `
        CREATE TABLE IF NOT EXISTS user_key_versions (
          user_id TEXT PRIMARY KEY,
          key_version INTEGER DEFAULT 1,
          rotated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_key_versions_rotated_at ON user_key_versions(rotated_at);
      `,
    },
    
    // Security: Key rotation jobs
    {
      name: 'create_key_rotation_jobs',
      sql: `
        CREATE TABLE IF NOT EXISTS key_rotation_jobs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          status TEXT NOT NULL,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          total_items INTEGER DEFAULT 0,
          processed_items INTEGER DEFAULT 0,
          failed_items INTEGER DEFAULT 0,
          old_key_version INTEGER,
          new_key_version INTEGER,
          error TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_rotation_jobs_status ON key_rotation_jobs(status, started_at);
      `,
    },
    
    // Genome backups for replacement
    {
      name: 'create_genome_backups',
      sql: `
        CREATE TABLE IF NOT EXISTS genome_backups (
          id TEXT PRIMARY KEY,
          genome_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          backup_data_encrypted TEXT NOT NULL,
          reason TEXT,
          restored_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_genome_backups_genome_id ON genome_backups(genome_id);
        CREATE INDEX IF NOT EXISTS idx_genome_backups_user_id ON genome_backups(user_id);
      `,
    },
  ];

  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Run pending migrations
  const executedMigrations = db.prepare('SELECT name FROM migrations').all() as { name: string }[];
  const executedNames = new Set(executedMigrations.map(m => m.name));

  for (const migration of migrations) {
    if (!executedNames.has(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      db.exec(migration.sql);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
    }
  }
}
