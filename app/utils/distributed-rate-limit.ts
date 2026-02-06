/**
 * Distributed Rate Limiting
 * 
 * SQLite-backed rate limiting for multi-instance deployments.
 * All instances share the same rate limit counters via the database.
 * 
 * For high-traffic deployments, consider Redis instead.
 */

import { getDb } from '~/db';
import { registerInterval } from './intervalRegistry';

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for rate limit keys
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Initialize the rate limit table
 */
function initRateLimitTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS rate_limit_entries (
      key TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0,
      window_start INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    )
  `);
  
  // Create index for efficient cleanup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rate_limit_reset 
    ON rate_limit_entries(reset_at)
  `);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupExpiredRateLimits(): void {
  try {
    const db = getDb();
    const now = Date.now();
    const result = db.prepare(`
      DELETE FROM rate_limit_entries WHERE reset_at < ?
    `).run(now);
    
    if (result.changes > 0) {
      console.log(`🧹 Cleaned up ${result.changes} expired rate limit entries`);
    }
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error);
  }
}

/**
 * Check rate limit using database storage
 * All instances share the same counters
 */
export function checkDistributedRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  initRateLimitTable();
  
  const db = getDb();
  const now = Date.now();
  const key = options.keyPrefix ? `${options.keyPrefix}:${identifier}` : identifier;
  
  // Use a transaction for atomicity
  const checkLimit = db.transaction(() => {
    // Try to get existing entry
    const existing = db.prepare(`
      SELECT count, reset_at FROM rate_limit_entries WHERE key = ?
    `).get(key) as { count: number; reset_at: number } | undefined;
    
    // If no entry or window expired, create new entry
    if (!existing || existing.reset_at < now) {
      const resetAt = now + options.windowMs;
      
      db.prepare(`
        INSERT OR REPLACE INTO rate_limit_entries (key, count, window_start, reset_at)
        VALUES (?, 1, ?, ?)
      `).run(key, now, resetAt);
      
      return {
        allowed: true,
        limit: options.maxRequests,
        remaining: options.maxRequests - 1,
        resetAt,
      };
    }
    
    // Check if limit exceeded
    if (existing.count >= options.maxRequests) {
      const retryAfter = Math.ceil((existing.reset_at - now) / 1000);
      
      return {
        allowed: false,
        limit: options.maxRequests,
        remaining: 0,
        resetAt: existing.reset_at,
        retryAfter,
      };
    }
    
    // Increment count
    db.prepare(`
      UPDATE rate_limit_entries SET count = count + 1 WHERE key = ?
    `).run(key);
    
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - existing.count - 1,
      resetAt: existing.reset_at,
    };
  });
  
  return checkLimit();
}

/**
 * Rate limit by IP address (distributed)
 */
export function rateLimitByIpDistributed(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  return checkDistributedRateLimit(ip, {
    windowMs,
    maxRequests,
    keyPrefix: 'ip',
  });
}

/**
 * Rate limit by user ID (distributed)
 */
export function rateLimitByUserDistributed(
  userId: string,
  maxRequests: number = 1000,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  return checkDistributedRateLimit(userId, {
    windowMs,
    maxRequests,
    keyPrefix: 'user',
  });
}

/**
 * Strict rate limit for auth endpoints (distributed)
 */
export function rateLimitAuthDistributed(
  identifier: string
): RateLimitResult {
  return checkDistributedRateLimit(identifier, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 attempts per hour
    keyPrefix: 'auth',
  });
}

/**
 * Reset rate limit for an identifier
 */
export function resetDistributedRateLimit(identifier: string, prefix?: string): void {
  const db = getDb();
  const key = prefix ? `${prefix}:${identifier}` : identifier;
  
  db.prepare(`DELETE FROM rate_limit_entries WHERE key = ?`).run(key);
}

/**
 * Get rate limit stats
 */
export function getDistributedRateLimitStats(): {
  totalEntries: number;
  oldestEntry: number | null;
} {
  const db = getDb();
  
  const total = db.prepare(`SELECT COUNT(*) as count FROM rate_limit_entries`).get() as { count: number };
  const oldest = db.prepare(`SELECT MIN(window_start) as start FROM rate_limit_entries`).get() as { start: number | null };
  
  return {
    totalEntries: total.count,
    oldestEntry: oldest.start,
  };
}

// Start periodic cleanup
registerInterval(setInterval(cleanupExpiredRateLimits, CLEANUP_INTERVAL_MS));
