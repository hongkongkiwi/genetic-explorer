/**
 * Magic Link Authentication Utilities
 * 
 * Handles generation, storage, and verification of magic link tokens
 * for passwordless email authentication
 * 
 * SECURITY: All tokens are stored in database (not memory) for:
 * - Persistence across server restarts
 * - Distributed/multi-instance deployments
 * - Audit trail compliance
 */

import crypto from 'crypto';
import { getDb } from '~/db';

const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_BYTES = 32;

/**
 * Generate a cryptographically secure magic link token
 */
export function generateMagicLinkToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * Store a magic link token in database
 */
export function storeMagicLinkToken(token: string, userId: string, email: string): void {
  const db = getDb();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);
  
  db.prepare(`
    INSERT INTO magic_link_tokens (token, user_id, email, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, email, expiresAt.toISOString());
}

/**
 * Verify a magic link token from database
 * Returns token data if valid, null if invalid/expired/used
 */
export function verifyMagicLinkToken(token: string): { userId: string; email: string } | null {
  const db = getDb();
  
  // Get token data
  const result = db.prepare(`
    SELECT user_id, email, used, expires_at
    FROM magic_link_tokens
    WHERE token = ?
  `).get(token) as { 
    user_id: string; 
    email: string; 
    used: number; 
    expires_at: string;
  } | undefined;
  
  if (!result) return null;
  
  // Check if already used
  if (result.used === 1) return null;
  
  // Check expiration
  if (new Date() > new Date(result.expires_at)) {
    // Clean up expired token
    deleteMagicLinkToken(token);
    return null;
  }
  
  // Mark as used (single-use tokens)
  db.prepare(`
    UPDATE magic_link_tokens SET used = 1 WHERE token = ?
  `).run(token);
  
  return {
    userId: result.user_id,
    email: result.email,
  };
}

/**
 * Delete a magic link token from database
 */
export function deleteMagicLinkToken(token: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM magic_link_tokens WHERE token = ?`).run(token);
}

/**
 * Clean up all expired tokens (call periodically, e.g., via cron job)
 * Returns number of cleaned tokens
 */
export function cleanupExpiredMagicLinks(): number {
  const db = getDb();
  const now = new Date().toISOString();
  
  const result = db.prepare(`
    DELETE FROM magic_link_tokens
    WHERE expires_at < ? OR used = 1
  `).run(now);
  
  return result.changes;
}

/**
 * Get token stats (for monitoring)
 */
export function getMagicLinkStats(): {
  total: number;
  used: number;
  expired: number;
  active: number;
} {
  const db = getDb();
  const now = new Date().toISOString();
  
  const total = db.prepare(`SELECT COUNT(*) as count FROM magic_link_tokens`).get() as { count: number };
  const used = db.prepare(`SELECT COUNT(*) as count FROM magic_link_tokens WHERE used = 1`).get() as { count: number };
  const expired = db.prepare(`SELECT COUNT(*) as count FROM magic_link_tokens WHERE expires_at < ?`).get(now) as { count: number };
  const active = db.prepare(`
    SELECT COUNT(*) as count FROM magic_link_tokens 
    WHERE used = 0 AND expires_at > ?
  `).get(now) as { count: number };
  
  return {
    total: total.count,
    used: used.count,
    expired: expired.count,
    active: active.count,
  };
}
