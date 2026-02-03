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
