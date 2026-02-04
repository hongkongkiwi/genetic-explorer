/**
 * Magic Link Authentication Utilities
 * 
 * Handles generation, storage, and verification of magic link tokens
 * for passwordless email authentication
 */

import crypto from 'crypto';

const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_BYTES = 32;

interface MagicLinkToken {
  userId: string;
  email: string;
  createdAt: number;
  used: boolean;
}

// In-memory store for magic link tokens (use Redis in production)
const magicLinkStore = new Map<string, MagicLinkToken>();

/**
 * Generate a cryptographically secure magic link token
 */
export function generateMagicLinkToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * Store a magic link token with expiration
 */
export function storeMagicLinkToken(token: string, userId: string, email: string): void {
  magicLinkStore.set(token, {
    userId,
    email,
    createdAt: Date.now(),
    used: false,
  });

  // Auto-cleanup after expiry
  setTimeout(() => {
    const stored = magicLinkStore.get(token);
    if (stored) {
      magicLinkStore.delete(token);
    }
  }, MAGIC_LINK_EXPIRY_MS);
}

/**
 * Verify a magic link token
 * Returns token data if valid, null if invalid/expired/used
 */
export function verifyMagicLinkToken(token: string): { userId: string; email: string } | null {
  const stored = magicLinkStore.get(token);
  
  if (!stored) {
    return null;
  }

  // Check if already used
  if (stored.used) {
    return null;
  }

  // Check expiration
  if (Date.now() - stored.createdAt > MAGIC_LINK_EXPIRY_MS) {
    magicLinkStore.delete(token);
    return null;
  }

  // Mark as used (tokens are single-use)
  stored.used = true;

  return {
    userId: stored.userId,
    email: stored.email,
  };
}

/**
 * Delete a magic link token
 */
export function deleteMagicLinkToken(token: string): void {
  magicLinkStore.delete(token);
}

/**
 * Clean up expired tokens (call periodically)
 */
export function cleanupExpiredMagicLinks(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [token, data] of magicLinkStore.entries()) {
    if (now - data.createdAt > MAGIC_LINK_EXPIRY_MS) {
      magicLinkStore.delete(token);
      cleaned++;
    }
  }
  
  return cleaned;
}

/**
 * Get token stats (for monitoring)
 */
export function getMagicLinkStats(): {
  total: number;
  used: number;
  expired: number;
} {
  const now = Date.now();
  let used = 0;
  let expired = 0;
  
  for (const data of magicLinkStore.values()) {
    if (data.used) used++;
    if (now - data.createdAt > MAGIC_LINK_EXPIRY_MS) expired++;
  }
  
  return {
    total: magicLinkStore.size,
    used,
    expired,
  };
}
