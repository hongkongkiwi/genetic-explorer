/**
 * Data Encryption Utilities for At-Rest Encryption
 *
 * Uses AES-256-GCM for authenticated encryption of sensitive user data.
 * All encryption keys are derived from the master encryption key stored in
 * environment variables.
 *
 * IMPORTANT: This is for encrypting data at rest (in database, files, etc.)
 * NOT for transport security (use HTTPS for that).
 */

import crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes authentication tag
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 32;

/**
 * Get the master encryption key from environment
 * Falls back to a derived key if not set (for development)
 */
function getMasterKey(): Buffer {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!masterKey) {
    // In production, this should NEVER happen
    console.warn('WARNING: ENCRYPTION_MASTER_KEY not set! Using derived key (NOT SECURE for production)');

    // Derive a key from available secrets for development
    const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
    return crypto.scryptSync(sessionSecret, 'genetic-explorer-salt', KEY_LENGTH);
  }

  // Ensure the key is exactly 32 bytes
  if (masterKey.length < KEY_LENGTH) {
    // Derive a proper key from the provided master key
    return crypto.scryptSync(masterKey, 'genetic-explorer-key-derivation', KEY_LENGTH);
  }

  return Buffer.from(masterKey.substring(0, KEY_LENGTH), 'utf8');
}

/**
 * Get or create the encryption key for a specific user
 * Each user has their own encryption key derived from the master key
 */
export function getUserEncryptionKey(userId: string): Buffer {
  const masterKey = getMasterKey();

  // Derive a user-specific key using HMAC
  const hmac = crypto.createHmac('sha256', masterKey);
  hmac.update(`user:${userId}`);
  const derivedKey = hmac.digest();

  return derivedKey;
}

// ============================================================================
// Encryption Functions
// ============================================================================

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
}

/**
 * Encrypt plaintext data using AES-256-GCM
 * Returns base64-encoded encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string, key: Buffer): EncryptedData {
  // Generate a random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the data
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    version: 1,
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export function decrypt(encrypted: EncryptedData, key: Buffer): string {
  // Verify version
  if (encrypted.version !== 1) {
    throw new Error(`Unsupported encryption version: ${encrypted.version}`);
  }

  // Create decipher
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt the data
  let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Encrypt data for a specific user
 */
export function encryptForUser(userId: string, plaintext: string): EncryptedData {
  const userKey = getUserEncryptionKey(userId);
  return encrypt(plaintext, userKey);
}

/**
 * Decrypt data for a specific user
 */
export function decryptForUser(userId: string, encrypted: EncryptedData): string {
  const userKey = getUserEncryptionKey(userId);
  return decrypt(encrypted, userKey);
}

/**
 * Encrypt an object (JSON stringified)
 */
export function encryptObject<T>(data: T, key: Buffer): EncryptedData {
  return encrypt(JSON.stringify(data), key);
}

/**
 * Decrypt to an object
 */
export function decryptObject<T>(encrypted: EncryptedData, key: Buffer): T {
  const plaintext = decrypt(encrypted, key);
  return JSON.parse(plaintext);
}

// ============================================================================
// Field-level Encryption Helpers
// ============================================================================

/**
 * Encrypt a specific field in an object
 */
export function encryptField<T extends Record<string, any>>(
  obj: T,
  fieldName: keyof T & string,
  key: Buffer
): T & { _encryptedFields: string[] } {
  const encrypted = encrypt(String(obj[fieldName]), key);
  return {
    ...obj,
    [fieldName]: JSON.stringify(encrypted),
    _encryptedFields: [fieldName],
  } as any;
}

/**
 * Decrypt a specific field in an object
 */
export function decryptField<T extends Record<string, any>>(
  obj: T,
  fieldName: keyof T & string,
  key: Buffer
): T {
  const encrypted = JSON.parse(String(obj[fieldName])) as EncryptedData;
  const decrypted = decrypt(encrypted, key);

  return {
    ...obj,
    [fieldName]: decrypted,
  } as any;
}

// ============================================================================
// Secure Random Generation
// ============================================================================

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + symbols;

  // Ensure at least one of each type
  const password = [
    uppercase[crypto.randomInt(uppercase.length)],
    lowercase[crypto.randomInt(lowercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  // Fill the rest
  while (password.length < length) {
    password.push(all[crypto.randomInt(all.length)]);
  }

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

// ============================================================================
// Hash Functions
// ============================================================================

/**
 * Create a secure hash (one-way)
 */
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');
  return crypto.scryptSync(data, actualSalt, 64).toString('hex') + ':' + actualSalt;
}

/**
 * Verify a hash against data
 */
export function verifyHash(data: string, hashedData: string): boolean {
  const [hash, salt] = hashedData.split(':');
  const computedHash = crypto.scryptSync(data, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}

// ============================================================================
// Key Rotation
// ============================================================================

export interface KeyRotationResult {
  success: boolean;
  reencryptedFields: number;
  error?: string;
}

/**
 * Re-encrypt data with a new key (for key rotation)
 */
export function rotateKey(
  userId: string,
  encryptedData: EncryptedData,
  newKey: Buffer
): EncryptedData {
  // Decrypt with old key
  const plaintext = decrypt(encryptedData, getUserEncryptionKey(userId));

  // Re-encrypt with new key
  return encrypt(plaintext, newKey);
}

// ============================================================================
// Encryption Status
// ============================================================================

export interface EncryptionStatus {
  enabled: boolean;
  masterKeySet: boolean;
  algorithm: string;
  keyBits: number;
}

export function getEncryptionStatus(): EncryptionStatus {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  return {
    enabled: true,
    masterKeySet: !!masterKey && masterKey.length >= 32,
    algorithm: ALGORITHM,
    keyBits: KEY_LENGTH * 8,
  };
}

// ============================================================================
// Environment Variables
// ============================================================================

export const ENCRYPTION_ENV_VARS = {
  ENCRYPTION_MASTER_KEY: 'ENCRYPTION_MASTER_KEY',
} as const;

export function validateEncryptionConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!masterKey) {
    errors.push('ENCRYPTION_MASTER_KEY is not set');
  } else if (masterKey.length < 32) {
    errors.push('ENCRYPTION_MASTER_KEY should be at least 32 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  encrypt,
  decrypt,
  encryptForUser,
  decryptForUser,
  encryptObject,
  decryptObject,
  generateSecureToken,
  generateSecurePassword,
  hashData,
  verifyHash,
  getEncryptionStatus,
  validateEncryptionConfig,
};
