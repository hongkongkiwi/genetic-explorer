import crypto from 'crypto';

/**
 * Two-Factor Authentication (2FA) Utilities
 *
 * Supports:
 * - TOTP (Time-based One-Time Passwords) via authenticator apps
 * - Email-based verification codes
 * - WebAuthn/Passkeys (registration and authentication)
 */

// ============================================================================
// TOTP Configuration
// ============================================================================

const TOTP_ISSUER = 'Genetic Explorer';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_ALGORITHM = 'sha1';

/**
 * Generate a secret for TOTP
 */
export function generateTotpSecret(): string {
  return crypto.randomBytes(32).toString('base32');
}

/**
 * Generate TOTP URI for QR code
 */
export function getTotpUri(secret: string, email: string): string {
  const encodedSecret = encodeURIComponent(secret);
  const encodedIssuer = encodeURIComponent(TOTP_ISSUER);
  return `otpauth://totp/${encodedIssuer}:${encodeURIComponent(email)}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

/**
 * Verify a TOTP code
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  if (!code || code.length !== TOTP_DIGITS || !/^\d+$/.test(code)) {
    return false;
  }

  const epoch = Math.floor(Date.now() / 1000);
  const periods = [
    Math.floor(epoch / TOTP_PERIOD),
    Math.floor(epoch / TOTP_PERIOD) - 1,
    Math.floor(epoch / TOTP_PERIOD) + 1,
  ];

  for (const period of periods) {
    const expectedCode = generateTotpAtPeriod(secret, period);
    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }

  return false;
}

function generateTotpAtPeriod(secret: string, period: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(period), 0);

  const key = Buffer.from(secret.replace(/\s/g, '').toLowerCase(), 'base32');
  const hmac = crypto.createHmac(TOTP_ALGORITHM, key);
  hmac.update(buffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return a === b;
  }
}

// ============================================================================
// Email Verification Codes
// ============================================================================

const EMAIL_CODE_LENGTH = 6;
const EMAIL_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

// In-memory store for email codes (use Redis in production)
const emailCodeStore = new Map<string, { code: string; expiresAt: number }>();

/**
 * Generate an email verification code
 */
export function generateEmailCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Store an email verification code
 */
export function storeEmailCode(email: string, code: string): void {
  emailCodeStore.set(email, {
    code,
    expiresAt: Date.now() + EMAIL_CODE_EXPIRY,
  });

  // Clean up expired codes
  const now = Date.now();
  for (const [key, value] of emailCodeStore.entries()) {
    if (value.expiresAt < now) {
      emailCodeStore.delete(key);
    }
  }
}

/**
 * Verify an email code
 */
export function verifyEmailCode(email: string, code: string): boolean {
  const stored = emailCodeStore.get(email);
  if (!stored) return false;

  if (Date.now() > stored.expiresAt) {
    emailCodeStore.delete(email);
    return false;
  }

  const isValid = timingSafeEqual(code.toUpperCase(), stored.code.toUpperCase());
  if (isValid || Date.now() > stored.expiresAt) {
    emailCodeStore.delete(email);
  }

  return isValid;
}

// ============================================================================
// WebAuthn/Passkey Utilities
// ============================================================================

/**
 * Generate challenge for WebAuthn
 */
export function generateWebAuthnChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Options for passkey registration
 */
export interface PasskeyRegistrationOptions {
  challenge: string;
  rpName: string;
  rpId: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  timeout: number;
  excludeCredentials: { id: string; transports: string }[];
  authenticatorSelection: {
    userVerification: 'preferred' | 'required' | 'discouraged';
    residentKey: 'preferred' | 'required' | 'discouraged';
    authenticatorAttachment: 'platform' | 'cross-platform' | undefined;
  };
  attestationType: 'none' | 'indirect' | 'direct';
}

/**
 * Generate passkey registration options
 */
export function getPasskeyRegistrationOptions(
  userId: string,
  email: string,
  displayName: string,
  existingCredentials: string[] = []
): PasskeyRegistrationOptions {
  const rpId = process.env.APP_URL?.replace(/https?:\/\//, '') || 'geneticexplorer.com';

  return {
    challenge: generateWebAuthnChallenge(),
    rpName: 'Genetic Explorer',
    rpId,
    userId: Buffer.from(userId).toString('base64url'),
    userName: email,
    userDisplayName: displayName,
    timeout: 60000, // 60 seconds
    excludeCredentials: existingCredentials.map((id) => ({
      id,
      transports: ['cross-platform', 'platform'],
    })),
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
      authenticatorAttachment: undefined, // Allow any
    },
    attestationType: 'none',
  };
}

/**
 * Options for passkey authentication
 */
export interface PasskeyAuthenticationOptions {
  challenge: string;
  timeout: number;
  userId: string;
  allowCredentials: { id: string; transports: string }[];
  userVerification: 'preferred' | 'required' | 'discouraged';
}

/**
 * Generate passkey authentication options
 */
export function getPasskeyAuthenticationOptions(
  userId: string,
  credentialIds: string[]
): PasskeyAuthenticationOptions {
  return {
    challenge: generateWebAuthnChallenge(),
    timeout: 60000,
    userId: Buffer.from(userId).toString('base64url'),
    allowCredentials: credentialIds.map((id) => ({
      id,
      transports: ['cross-platform', 'platform'],
    })),
    userVerification: 'preferred',
  };
}

// ============================================================================
// Passkey Challenge Storage (in-memory, use Redis in production)
// ============================================================================

const passkeyChallengeStore = new Map<string, { challenge: string; userId: string; expiresAt: number }>();
const PASSKEY_CHALLENGE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Store passkey challenge for verification
 */
export function savePasskeyChallenge(userId: string, challenge: string): void {
  passkeyChallengeStore.set(userId, {
    challenge,
    userId,
    expiresAt: Date.now() + PASSKEY_CHALLENGE_EXPIRY,
  });
}

/**
 * Get and validate passkey challenge
 */
export function getPasskeyChallenge(userId: string): string | null {
  const stored = passkeyChallengeStore.get(userId);
  if (!stored) return null;

  if (Date.now() > stored.expiresAt) {
    passkeyChallengeStore.delete(userId);
    return null;
  }

  return stored.challenge;
}

/**
 * Clear passkey challenge
 */
export function clearPasskeyChallenge(userId: string): void {
  passkeyChallengeStore.delete(userId);
}

/**
 * Verify passkey registration response
 */
export async function verifyPasskeyRegistration(
  userId: string,
  response: any
): Promise<{ valid: boolean; error?: string }> {
  const challenge = getPasskeyChallenge(userId);
  if (!challenge) {
    return { valid: false, error: 'Challenge expired or not found' };
  }

  // Verify the challenge matches
  if (response.challenge !== challenge) {
    return { valid: false, error: 'Invalid challenge' };
  }

  // Verify the response format
  if (!response.id || !response.rawId || !response.response) {
    return { valid: false, error: 'Invalid response format' };
  }

  // Clear the challenge after verification
  clearPasskeyChallenge(userId);

  return { valid: true };
}

/**
 * Verify passkey authentication response
 */
export async function verifyPasskeyAuthentication(
  userId: string,
  credentialId: string,
  response: any,
  expectedChallenge: string
): Promise<{ valid: boolean; newCounter: number; error?: string }> {
  // Verify the challenge matches
  if (response.challenge !== expectedChallenge) {
    return { valid: false, newCounter: 0, error: 'Invalid challenge' };
  }

  // Verify the credential ID matches
  if (response.credentialId !== credentialId) {
    return { valid: false, newCounter: 0, error: 'Invalid credential' };
  }

  // Get the stored public key and counter
  const { getPasskey, updatePasskeyCounter } = require('~/utils/database');
  const passkey = getPasskey(credentialId);

  if (!passkey) {
    return { valid: false, newCounter: 0, error: 'Passkey not found' };
  }

  // Verify user ownership
  if (passkey.userId !== userId) {
    return { valid: false, newCounter: 0, error: 'Passkey belongs to different user' };
  }

  // Parse the authenticator data from the response
  const authData = parseAuthenticatorData(response.response.authenticatorData);
  if (!authData) {
    return { valid: false, newCounter: 0, error: 'Invalid authenticator data' };
  }

  // Verify the counter is greater than the stored one (prevents replay)
  if (authData.counter <= passkey.counter) {
    return { valid: false, newCounter: 0, error: 'Invalid counter (possible replay attack)' };
  }

  // Update the counter
  updatePasskeyCounter(credentialId, authData.counter);

  return { valid: true, newCounter: authData.counter };
}

/**
 * Parse authenticator data from WebAuthn response
 */
function parseAuthenticatorData(authDataBase64: string): { counter: number } | null {
  try {
    const authData = Buffer.from(authDataBase64, 'base64');

    // Authenticator data structure:
    // - 32 bytes: RP ID hash
    // - 1 byte: flags (UP, UV, AT, ED)
    // - 4 bytes: sign counter
    // - Optional: attested credential data
    // - Optional: extensions

    if (authData.length < 37) {
      return null;
    }

    const counter = authData.readUInt32BE(32);
    return { counter };
  } catch {
    return null;
  }
}

// ============================================================================
// 2FA Status Interface
// ============================================================================

export interface TwoFactorStatus {
  enabled: boolean;
  totpEnabled: boolean;
  passkeyEnabled: boolean;
  emailEnabled: boolean;
  backupCodesRemaining: number;
}

/**
 * Get 2FA status for a user (placeholder - implement with database)
 */
export async function getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
  // This would query the database
  // For now, return default status
  return {
    enabled: false,
    totpEnabled: false,
    passkeyEnabled: false,
    emailEnabled: false,
    backupCodesRemaining: 0,
  };
}

// ============================================================================
// Backup Codes
// ============================================================================

const BACKUP_CODE_LENGTH = 10;
const BACKUP_CODE_COUNT = 10;

/**
 * Generate backup codes
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
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  const normalizedCode = code.replace(/-/g, '').toUpperCase();
  return crypto.pbkdf2Sync(normalizedCode, 'backup-code-salt', 100000, 32, 'sha256').toString('hex');
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  userId: string,
  code: string
): Promise<{ valid: boolean; codeIndex: number | null; remainingCodes: number }> {
  // This would check against stored hashed codes
  // Returns false for now - implement with database
  return { valid: false, codeIndex: null, remainingCodes: 0 };
}

// ============================================================================
// 2FA Verification Types
// ============================================================================

export type TwoFactorMethod = 'totp' | 'passkey' | 'email' | 'backup';

export interface TwoFactorChallenge {
  method: TwoFactorMethod;
  challenge?: string;
  expiresAt: number;
  userId: string;
}

export interface TwoFactorVerificationResult {
  success: boolean;
  error?: string;
  requiresTwoFactor?: boolean;
  challenge?: TwoFactorChallenge;
}

// ============================================================================
// Environment Configuration
// ============================================================================

export const TWO_FACTOR_ENV_VARS = {
  // Enable/disable 2FA features
  ENABLE_TOTP: 'ENABLE_TOTP',
  ENABLE_PASSKEY: 'ENABLE_PASSKEY',
  ENABLE_EMAIL_2FA: 'ENABLE_EMAIL_2FA',
  ENABLE_BACKUP_CODES: 'ENABLE_BACKUP_CODES',

  // Require 2FA for sensitive operations
  REQUIRE_2FA_FOR_EXPORT: 'REQUIRE_2FA_FOR_EXPORT',
  REQUIRE_2FA_FOR_DELETE: 'REQUIRE_2FA_FOR_DELETE',
  REQUIRE_2FA_FOR_PASSWORD_CHANGE: 'REQUIRE_2FA_FOR_PASSWORD_CHANGE',

  // Passkey RP ID (defaults to hostname)
  PASSKEY_RP_ID: 'PASSKEY_RP_ID',
  PASSKEY_RP_NAME: 'PASSKEY_RP_NAME',
} as const;

function get2faEnvBoolean(key: string): boolean {
  return process.env[key] === 'true' || process.env[key] === '1';
}

export function is2faEnabled(method: 'totp' | 'passkey' | 'email' | 'backup'): boolean {
  switch (method) {
    case 'totp':
      return get2faEnvBoolean(TWO_FACTOR_ENV_VARS.ENABLE_TOTP);
    case 'passkey':
      return get2faEnvBoolean(TWO_FACTOR_ENV_VARS.ENABLE_PASSKEY);
    case 'email':
      return get2faEnvBoolean(TWO_FACTOR_ENV_VARS.ENABLE_EMAIL_2FA);
    case 'backup':
      return get2faEnvBoolean(TWO_FACTOR_ENV_VARS.ENABLE_BACKUP_CODES);
    default:
      return false;
  }
}

export function is2faRequiredForAction(action: 'export' | 'delete' | 'password_change'): boolean {
  const envMap = {
    export: TWO_FACTOR_ENV_VARS.REQUIRE_2FA_FOR_EXPORT,
    delete: TWO_FACTOR_ENV_VARS.REQUIRE_2FA_FOR_DELETE,
    password_change: TWO_FACTOR_ENV_VARS.REQUIRE_2FA_FOR_PASSWORD_CHANGE,
  };
  return get2faEnvBoolean(envMap[action]);
}
