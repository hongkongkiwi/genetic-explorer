/**
 * Two-Factor Authentication Utilities
 * 
 * Supports TOTP, Passkey, and Backup Code verification
 */

import crypto from 'crypto';
import { authenticator } from 'otplib';

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 10;
const EMAIL_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// In-memory store for email verification codes (use Redis in production)
const emailCodeStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const code = crypto.randomBytes(BACKUP_CODE_LENGTH / 2).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }
  return codes;
}

/**
 * Hash a backup code for secure storage
 */
export function hashBackupCode(code: string, userId: string): string {
  const normalizedCode = code.replace(/-/g, '').toUpperCase();
  const salt = `${userId}-backup-code-salt`;
  return crypto.pbkdf2Sync(normalizedCode, salt, 100000, 32, 'sha256').toString('hex');
}

/**
 * Generate TOTP secret
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTOTPUri(secret: string, email: string): string {
  return authenticator.keyuri(email, 'Genetic Explorer', secret);
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/**
 * Generate email verification code
 */
export function generateEmailCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Store email verification code
 */
export function storeEmailCode(userId: string, code: string): void {
  const expiresAt = Date.now() + EMAIL_CODE_EXPIRY_MS;
  emailCodeStore.set(userId, { code, expiresAt });
  
  // Cleanup expired codes
  setTimeout(() => {
    const stored = emailCodeStore.get(userId);
    if (stored && Date.now() > stored.expiresAt) {
      emailCodeStore.delete(userId);
    }
  }, EMAIL_CODE_EXPIRY_MS);
}

/**
 * Verify email code
 */
export function verifyEmailCode(userId: string, code: string): boolean {
  const stored = emailCodeStore.get(userId);
  if (!stored) return false;
  
  if (Date.now() > stored.expiresAt) {
    emailCodeStore.delete(userId);
    return false;
  }
  
  const valid = stored.code === code.toUpperCase().replace(/\s/g, '');
  if (valid) {
    emailCodeStore.delete(userId); // Single use
  }
  
  return valid;
}

/**
 * Generate a temporary token for 2FA pending state
 */
export function generate2FAPendingToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In-memory store for pending 2FA sessions
interface Pending2FASession {
  userId: string;
  email: string;
  expiresAt: number;
  methods: string[];
}

const pending2FASessions = new Map<string, Pending2FASession>();
const PENDING_2FA_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Create a pending 2FA session
 */
export function createPending2FASession(
  token: string,
  userId: string,
  email: string,
  methods: string[]
): void {
  const expiresAt = Date.now() + PENDING_2FA_EXPIRY_MS;
  pending2FASessions.set(token, { userId, email, expiresAt, methods });
  
  // Auto-cleanup
  setTimeout(() => {
    const session = pending2FASessions.get(token);
    if (session && Date.now() > session.expiresAt) {
      pending2FASessions.delete(token);
    }
  }, PENDING_2FA_EXPIRY_MS);
}

/**
 * Get and validate pending 2FA session
 */
export function getPending2FASession(token: string): Pending2FASession | null {
  const session = pending2FASessions.get(token);
  if (!session) return null;
  
  if (Date.now() > session.expiresAt) {
    pending2FASessions.delete(token);
    return null;
  }
  
  return session;
}

/**
 * Delete pending 2FA session
 */
export function deletePending2FASession(token: string): void {
  pending2FASessions.delete(token);
}

/**
 * Clean up all expired sessions (call periodically)
 */
export function cleanupExpired2FASessions(): void {
  const now = Date.now();
  for (const [token, session] of pending2FASessions.entries()) {
    if (now > session.expiresAt) {
      pending2FASessions.delete(token);
    }
  }
}
