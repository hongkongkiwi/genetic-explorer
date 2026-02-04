/**
 * 2FA Disable Delay
 * 
 * Implements a 24-hour security delay when 2FA is disabled via email code.
 * This protects accounts from being immediately compromised if email is breached.
 */

import { getDb } from './database';
import crypto from 'crypto';
import { sendSecurityNotification } from './securityNotifications';

const DISABLE_2FA_DELAY_HOURS = 24;
const DISABLE_2FA_DELAY_MS = DISABLE_2FA_DELAY_HOURS * 60 * 60 * 1000;

export interface TwoFactorDisableRequest {
  id: string;
  userId: string;
  requestedAt: string;
  effectiveAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  verificationMethod: 'email' | 'totp' | 'passkey';
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * Initialize 2FA disable delay tables
 */
export function initTwoFactorDisableDelayTables(): void {
  const db = getDb();

  // Table for pending 2FA disable requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS two_factor_disable_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      effective_at DATETIME NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
      verification_method TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_2fa_disable_requests_user_id ON two_factor_disable_requests(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_2fa_disable_requests_status ON two_factor_disable_requests(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_2fa_disable_requests_effective_at ON two_factor_disable_requests(effective_at)`);
}

/**
 * Create a new 2FA disable request
 */
export function createDisable2FARequest(
  userId: string,
  verificationMethod: 'email' | 'totp' | 'passkey',
  ipAddress: string | null = null,
  userAgent: string | null = null
): { success: boolean; request?: TwoFactorDisableRequest; error?: string } {
  try {
    const db = getDb();

    // Check if there's already a pending request
    const existing = getPendingDisableRequest(userId);
    if (existing) {
      return {
        success: false,
        error: 'A 2FA disable request is already pending',
        request: existing,
      };
    }

    // Calculate effective time (24 hours from now)
    const requestedAt = new Date();
    const effectiveAt = new Date(requestedAt.getTime() + DISABLE_2FA_DELAY_MS);

    const request: TwoFactorDisableRequest = {
      id: crypto.randomUUID(),
      userId,
      requestedAt: requestedAt.toISOString(),
      effectiveAt: effectiveAt.toISOString(),
      status: 'pending',
      verificationMethod,
      ipAddress,
      userAgent,
    };

    // Store in database
    db.prepare(`
      INSERT INTO two_factor_disable_requests 
      (id, user_id, requested_at, effective_at, status, verification_method, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      request.id,
      request.userId,
      request.requestedAt,
      request.effectiveAt,
      request.status,
      request.verificationMethod,
      request.ipAddress,
      request.userAgent
    );

    // Send security notification
    sendSecurityNotification(
      userId,
      '2fa_disabled_with_delay',
      {
        availableAt: request.effectiveAt,
        verificationMethod,
      },
      ipAddress || undefined,
      userAgent || undefined
    );

    return { success: true, request };
  } catch (error) {
    console.error('Error creating 2FA disable request:', error);
    return { success: false, error: 'Failed to create disable request' };
  }
}

/**
 * Get pending 2FA disable request for a user
 */
export function getPendingDisableRequest(userId: string): TwoFactorDisableRequest | null {
  try {
    const db = getDb();

    const request = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        requested_at as requestedAt,
        effective_at as effectiveAt,
        status,
        verification_method as verificationMethod,
        ip_address as ipAddress,
        user_agent as userAgent
      FROM two_factor_disable_requests
      WHERE user_id = ? AND status = 'pending'
    `).get(userId) as TwoFactorDisableRequest | undefined;

    if (!request) return null;

    // Check if the request has expired (should be completed by now)
    const effectiveAt = new Date(request.effectiveAt);
    if (new Date() >= effectiveAt) {
      // Mark as completed
      completeDisableRequest(request.id);
      return null;
    }

    return request;
  } catch (error) {
    console.error('Error getting pending disable request:', error);
    return null;
  }
}

/**
 * Check if user has a pending 2FA disable request
 */
export function hasPendingDisableRequest(userId: string): boolean {
  return getPendingDisableRequest(userId) !== null;
}

/**
 * Check if user is in the 2FA disable delay period
 * Returns the remaining time in milliseconds, or 0 if no delay
 */
export function getDisableDelayRemaining(userId: string): number {
  const request = getPendingDisableRequest(userId);
  if (!request) return 0;

  const effectiveAt = new Date(request.effectiveAt);
  const now = new Date();
  const remaining = effectiveAt.getTime() - now.getTime();

  return Math.max(0, remaining);
}

/**
 * Complete a 2FA disable request (mark as completed)
 */
export function completeDisableRequest(requestId: string): boolean {
  try {
    const db = getDb();

    db.prepare(`
      UPDATE two_factor_disable_requests
      SET status = 'completed'
      WHERE id = ?
    `).run(requestId);

    return true;
  } catch (error) {
    console.error('Error completing disable request:', error);
    return false;
  }
}

/**
 * Cancel a pending 2FA disable request
 */
export function cancelDisableRequest(userId: string): boolean {
  try {
    const db = getDb();

    db.prepare(`
      UPDATE two_factor_disable_requests
      SET status = 'cancelled'
      WHERE user_id = ? AND status = 'pending'
    `).run(userId);

    return true;
  } catch (error) {
    console.error('Error cancelling disable request:', error);
    return false;
  }
}

/**
 * Check if a user can log in (not in 2FA disable delay period)
 */
export function canUserLogin(userId: string): {
  allowed: boolean;
  reason?: string;
  remainingTime?: number;
  effectiveAt?: string;
} {
  const remainingTime = getDisableDelayRemaining(userId);

  if (remainingTime > 0) {
    const request = getPendingDisableRequest(userId);
    return {
      allowed: false,
      reason: `Two-factor authentication was recently disabled. For your security, you cannot log in for ${DISABLE_2FA_DELAY_HOURS} hours.`,
      remainingTime,
      effectiveAt: request?.effectiveAt,
    };
  }

  return { allowed: true };
}

/**
 * Get formatted time remaining until login is allowed
 */
export function getFormattedRemainingTime(remainingMs: number): string {
  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Clean up old completed/cancelled requests
 */
export function cleanupOldDisableRequests(): number {
  try {
    const db = getDb();

    // Delete requests older than 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const result = db.prepare(`
      DELETE FROM two_factor_disable_requests
      WHERE status IN ('completed', 'cancelled') AND requested_at < ?
    `).run(cutoff.toISOString());

    return result.changes;
  } catch (error) {
    console.error('Error cleaning up old disable requests:', error);
    return 0;
  }
}

/**
 * Get all pending disable requests (for admin/monitoring)
 */
export function getAllPendingDisableRequests(): TwoFactorDisableRequest[] {
  try {
    const db = getDb();

    const requests = db.prepare(`
      SELECT 
        id,
        user_id as userId,
        requested_at as requestedAt,
        effective_at as effectiveAt,
        status,
        verification_method as verificationMethod,
        ip_address as ipAddress,
        user_agent as userAgent
      FROM two_factor_disable_requests
      WHERE status = 'pending'
      ORDER BY requested_at DESC
    `).all() as TwoFactorDisableRequest[];

    return requests;
  } catch (error) {
    console.error('Error getting pending disable requests:', error);
    return [];
  }
}

/**
 * Check if 2FA was disabled using email verification method
 * This determines if the delay should apply
 */
export function isDelayRequiredForMethod(method: string): boolean {
  // Only apply delay for email-based verification
  // TOTP and Passkey are considered stronger verification methods
  return method === 'email';
}
