/**
 * Leader Election for Multi-Instance Deployments
 * 
 * Ensures only one instance runs background jobs using SQLite-based locking.
 * 
 * Use case:
 * - Background data processing
 * - Scheduled tasks (cleanup, reports)
 * - Key rotation
 * 
 * For production with many instances, consider Redis Redlock or Consul.
 */

import { getDb } from './database';

interface LockOptions {
  ttlSeconds: number;  // Time-to-live for the lock
}

interface LeaderLock {
  instanceId: string;
  acquiredAt: Date;
  expiresAt: Date;
}

// This instance's unique ID
const INSTANCE_ID = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Track locks held by this instance
const heldLocks = new Set<string>();

/**
 * Initialize the leader election table
 */
function initLeaderTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS leader_locks (
      task_name TEXT PRIMARY KEY,
      instance_id TEXT NOT NULL,
      acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    )
  `);
  
  // Create index for efficient cleanup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leader_locks_expires 
    ON leader_locks(expires_at)
  `);
}

/**
 * Try to acquire leadership for a task
 */
export function acquireLeadership(
  taskName: string,
  options: LockOptions = { ttlSeconds: 60 }
): boolean {
  initLeaderTable();
  
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + options.ttlSeconds * 1000);
  
  try {
    // Try to acquire lock
    const result = db.prepare(`
      INSERT INTO leader_locks (task_name, instance_id, expires_at)
      VALUES (?, ?, datetime(? / 1000, 'unixepoch'))
      ON CONFLICT(task_name) DO UPDATE SET
        instance_id = CASE 
          WHEN expires_at < datetime('now') THEN excluded.instance_id
          ELSE instance_id
        END,
        acquired_at = CASE 
          WHEN expires_at < datetime('now') THEN excluded.acquired_at
          ELSE acquired_at
        END,
        expires_at = CASE 
          WHEN expires_at < datetime('now') THEN excluded.expires_at
          ELSE expires_at
        END
      WHERE expires_at < datetime('now')
      RETURNING instance_id
    `).get(taskName, INSTANCE_ID, expiresAt.getTime()) as { instance_id: string } | undefined;
    
    const acquired = result?.instance_id === INSTANCE_ID;
    
    if (acquired) {
      heldLocks.add(taskName);
    }
    
    return acquired;
  } catch (error) {
    console.error(`Failed to acquire leadership for ${taskName}:`, error);
    return false;
  }
}

/**
 * Release leadership for a task
 */
export function releaseLeadership(taskName: string): void {
  const db = getDb();
  
  // Only release if we hold the lock
  db.prepare(`
    DELETE FROM leader_locks 
    WHERE task_name = ? AND instance_id = ?
  `).run(taskName, INSTANCE_ID);
  
  heldLocks.delete(taskName);
}

/**
 * Extend leadership lock
 */
export function extendLeadership(
  taskName: string,
  ttlSeconds: number
): boolean {
  if (!heldLocks.has(taskName)) {
    return false;
  }
  
  const db = getDb();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  
  const result = db.prepare(`
    UPDATE leader_locks 
    SET expires_at = datetime(? / 1000, 'unixepoch')
    WHERE task_name = ? AND instance_id = ?
    RETURNING task_name
  `).get(expiresAt.getTime(), taskName, INSTANCE_ID) as { task_name: string } | undefined;
  
  return !!result;
}

/**
 * Check if this instance is the leader for a task
 */
export function isLeader(taskName: string): boolean {
  return heldLocks.has(taskName);
}

/**
 * Get current leader for a task
 */
export function getCurrentLeader(taskName: string): LeaderLock | null {
  const db = getDb();
  
  const result = db.prepare(`
    SELECT instance_id, acquired_at, expires_at 
    FROM leader_locks 
    WHERE task_name = ? AND expires_at > datetime('now')
  `).get(taskName) as { instance_id: string; acquired_at: string; expires_at: string } | undefined;
  
  if (!result) {
    return null;
  }
  
  return {
    instanceId: result.instance_id,
    acquiredAt: new Date(result.acquired_at),
    expiresAt: new Date(result.expires_at),
  };
}

/**
 * Execute a task as leader (with automatic lock management)
 */
export async function executeAsLeader<T>(
  taskName: string,
  fn: () => Promise<T>,
  options: LockOptions = { ttlSeconds: 60 }
): Promise<T | null> {
  if (!acquireLeadership(taskName, options)) {
    return null;
  }
  
  try {
    // Extend lock periodically while task runs
    const extensionInterval = setInterval(() => {
      if (!extendLeadership(taskName, options.ttlSeconds)) {
        console.warn(`Lost leadership for ${taskName}`);
        clearInterval(extensionInterval);
      }
    }, (options.ttlSeconds * 1000) / 2); // Extend at half TTL
    
    const result = await fn();
    
    clearInterval(extensionInterval);
    return result;
  } finally {
    releaseLeadership(taskName);
  }
}

/**
 * Cleanup expired locks
 */
export function cleanupExpiredLocks(): void {
  const db = getDb();
  
  const result = db.prepare(`
    DELETE FROM leader_locks WHERE expires_at < datetime('now')
  `).run();
  
  if (result.changes > 0) {
    console.log(`🧹 Cleaned up ${result.changes} expired leader locks`);
  }
}

/**
 * Get all held locks for this instance
 */
export function getHeldLocks(): string[] {
  return Array.from(heldLocks);
}

/**
 * Release all locks held by this instance
 * Call during shutdown
 */
export function releaseAllLocks(): void {
  const db = getDb();
  
  for (const taskName of heldLocks) {
    releaseLeadership(taskName);
  }
  
  // Cleanup any stale locks from this instance
  db.prepare(`
    DELETE FROM leader_locks WHERE instance_id = ?
  `).run(INSTANCE_ID);
  
  heldLocks.clear();
}

// Periodic cleanup of expired locks
setInterval(cleanupExpiredLocks, 60000); // Every minute
