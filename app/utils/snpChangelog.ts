/**
 * SNP Changelog & Update Tracking System
 * 
 * Tracks additions, updates, and research changes for SNPs
 * Provides user notifications about relevant updates
 */

import { getDb } from './database';

export interface SNPChangelogEntry {
  id: number;
  rsid: string;
  changeType: 'added' | 'updated' | 'research_added' | 'recommendation_updated' | 'evidence_upgraded';
  changeDescription: string;
  oldValue?: string;
  newValue?: string;
  relatedResearch?: {
    pmid: string;
    title: string;
    journal: string;
  };
  createdAt: Date;
  isMajorUpdate: boolean;
}

export interface UserSnpUpdate {
  rsid: string;
  userGenotype: string;
  changeType: SNPChangelogEntry['changeType'];
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  actionRecommended?: string;
  relatedPapers?: Array<{
    pmid: string;
    title: string;
    journal: string;
    year: number;
  }>;
  date: Date;
  isRead: boolean;
}

/**
 * Initialize changelog tables
 */
export function initializeChangelogDatabase() {
  const db = getDb();

  // SNP changelog table
  db.exec(`
    CREATE TABLE IF NOT EXISTS snp_changelog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rsid TEXT NOT NULL,
      change_type TEXT NOT NULL,
      change_description TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      related_pmid TEXT,
      related_title TEXT,
      related_journal TEXT,
      is_major_update INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rsid) REFERENCES research_snps(rsid)
    )
  `);

  // User notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_snp_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      genome_id TEXT NOT NULL,
      rsid TEXT NOT NULL,
      change_type TEXT NOT NULL,
      description TEXT NOT NULL,
      impact TEXT NOT NULL,
      action_recommended TEXT,
      related_papers TEXT, -- JSON array
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read INTEGER DEFAULT 0,
      is_dismissed INTEGER DEFAULT 0
    )
  `);

  // User read status
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_read_updates (
      user_id TEXT NOT NULL,
      last_read_changelog_id INTEGER,
      last_read_date DATETIME,
      PRIMARY KEY (user_id)
    )
  `);

  // Indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_changelog_rsid ON snp_changelog(rsid)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_changelog_date ON snp_changelog(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_snp_notifications(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_snp_notifications(user_id, is_read)`);
}

/**
 * Add a new changelog entry
 */
export function addChangelogEntry(entry: Omit<SNPChangelogEntry, 'id' | 'createdAt'>): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO snp_changelog 
    (rsid, change_type, change_description, old_value, new_value, 
     related_pmid, related_title, related_journal, is_major_update)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    entry.rsid,
    entry.changeType,
    entry.changeDescription,
    entry.oldValue || null,
    entry.newValue || null,
    entry.relatedResearch?.pmid || null,
    entry.relatedResearch?.title || null,
    entry.relatedResearch?.journal || null,
    entry.isMajorUpdate ? 1 : 0
  );
}

/**
 * Get recent changelog entries
 */
export function getRecentChangelog(days: number = 30): SNPChangelogEntry[] {
  const db = getDb();
  
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = db.prepare(`
    SELECT * FROM snp_changelog 
    WHERE created_at >= ?
    ORDER BY created_at DESC
  `).all(since.toISOString()) as any[];

  return rows.map(row => ({
    id: row.id,
    rsid: row.rsid,
    changeType: row.change_type,
    changeDescription: row.change_description,
    oldValue: row.old_value,
    newValue: row.new_value,
    relatedResearch: row.related_pmid ? {
      pmid: row.related_pmid,
      title: row.related_title,
      journal: row.related_journal,
    } : undefined,
    createdAt: new Date(row.created_at),
    isMajorUpdate: row.is_major_update === 1,
  }));
}

/**
 * Get changelog for specific SNPs
 */
export function getChangelogForSNPs(rsids: string[], days: number = 90): SNPChangelogEntry[] {
  const db = getDb();
  
  const since = new Date();
  since.setDate(since.getDate() - days);

  const placeholders = rsids.map(() => '?').join(',');
  
  const rows = db.prepare(`
    SELECT * FROM snp_changelog 
    WHERE rsid IN (${placeholders})
    AND created_at >= ?
    ORDER BY created_at DESC
  `).all(...rsids, since.toISOString()) as any[];

  return rows.map(row => ({
    id: row.id,
    rsid: row.rsid,
    changeType: row.change_type,
    changeDescription: row.change_description,
    oldValue: row.old_value,
    newValue: row.new_value,
    relatedResearch: row.related_pmid ? {
      pmid: row.related_pmid,
      title: row.related_title,
      journal: row.related_journal,
    } : undefined,
    createdAt: new Date(row.created_at),
    isMajorUpdate: row.is_major_update === 1,
  }));
}

/**
 * Create notification for user about SNP updates
 */
export function createUserNotification(
  userId: string,
  genomeId: string,
  notification: Omit<UserSnpUpdate, 'date' | 'isRead'>
): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO user_snp_notifications
    (user_id, genome_id, rsid, change_type, description, impact, 
     action_recommended, related_papers)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    userId,
    genomeId,
    notification.rsid,
    notification.changeType,
    notification.description,
    notification.impact,
    notification.actionRecommended || null,
    notification.relatedPapers ? JSON.stringify(notification.relatedPapers) : null
  );
}

/**
 * Get unread notifications for user
 */
export function getUnreadNotifications(userId: string): UserSnpUpdate[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT * FROM user_snp_notifications 
    WHERE user_id = ? AND is_read = 0 AND is_dismissed = 0
    ORDER BY date DESC
  `).all(userId) as any[];

  return rows.map(row => ({
    rsid: row.rsid,
    userGenotype: row.user_genotype,
    changeType: row.change_type,
    description: row.description,
    impact: row.impact,
    actionRecommended: row.action_recommended,
    relatedPapers: row.related_papers ? JSON.parse(row.related_papers) : undefined,
    date: new Date(row.date),
    isRead: row.is_read === 1,
  }));
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE user_snp_notifications 
    SET is_read = 1 
    WHERE id = ?
  `).run(notificationId);
}

/**
 * Mark all notifications as read for user
 */
export function markAllNotificationsAsRead(userId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE user_snp_notifications 
    SET is_read = 1 
    WHERE user_id = ?
  `).run(userId);
}

/**
 * Get notification count for user
 */
export function getUnreadNotificationCount(userId: string): number {
  const db = getDb();
  
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM user_snp_notifications 
    WHERE user_id = ? AND is_read = 0 AND is_dismissed = 0
  `).get(userId) as { count: number };

  return result.count;
}

/**
 * Get major updates that affect user's SNPs
 */
export function getMajorUpdatesForUser(
  userId: string,
  userSnps: string[]
): SNPChangelogEntry[] {
  const db = getDb();
  
  // Get last read date
  const lastRead = db.prepare(`
    SELECT last_read_date FROM user_read_updates WHERE user_id = ?
  `).get(userId) as { last_read_date: string } | undefined;

  const since = lastRead?.last_read_date || new Date(0).toISOString();

  const placeholders = userSnps.map(() => '?').join(',');
  
  const rows = db.prepare(`
    SELECT * FROM snp_changelog 
    WHERE rsid IN (${placeholders})
    AND created_at > ?
    AND is_major_update = 1
    ORDER BY created_at DESC
  `).all(...userSnps, since) as any[];

  return rows.map(row => ({
    id: row.id,
    rsid: row.rsid,
    changeType: row.change_type,
    changeDescription: row.change_description,
    oldValue: row.old_value,
    newValue: row.new_value,
    relatedResearch: row.related_pmid ? {
      pmid: row.related_pmid,
      title: row.related_title,
      journal: row.related_journal,
    } : undefined,
    createdAt: new Date(row.created_at),
    isMajorUpdate: row.is_major_update === 1,
  }));
}

/**
 * Update user's last read timestamp
 */
export function updateLastRead(userId: string, lastChangelogId: number): void {
  const db = getDb();
  
  db.prepare(`
    INSERT OR REPLACE INTO user_read_updates 
    (user_id, last_read_changelog_id, last_read_date)
    VALUES (?, ?, ?)
  `).run(userId, lastChangelogId, new Date().toISOString());
}

/**
 * Generate changelog summary for display
 */
export function generateChangelogSummary(
  entries: SNPChangelogEntry[]
): {
  total: number;
  byType: Record<string, number>;
  majorUpdates: number;
  recentAdditions: number;
  researchUpdates: number;
} {
  return {
    total: entries.length,
    byType: entries.reduce((acc, entry) => {
      acc[entry.changeType] = (acc[entry.changeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    majorUpdates: entries.filter(e => e.isMajorUpdate).length,
    recentAdditions: entries.filter(e => e.changeType === 'added').length,
    researchUpdates: entries.filter(e => e.changeType === 'research_added').length,
  };
}

// Initialize on module load
initializeChangelogDatabase();
