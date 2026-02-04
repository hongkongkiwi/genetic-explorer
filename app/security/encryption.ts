/**
 * Data Encryption Utilities for At-Rest Encryption
 *
 * Uses AES-256-GCM for authenticated encryption of sensitive user data.
 * Supports cloud KMS (AWS/Azure/GCP) with envelope encryption for cost efficiency.
 * 
 * COST OPTIMIZATION: Uses local data key caching to minimize cloud KMS API calls.
 * Only calls cloud KMS on startup or key rotation (every 24 hours).
 *
 * IMPORTANT: This is for encrypting data at rest (in database, files, etc.)
 * NOT for transport security (use HTTPS for that).
 */

import crypto from 'crypto';
import { getMasterKey as getKMSMasterKey, isCloudKMSEnabled, getKMSProvider } from './kms';

// ============================================================================
// Configuration
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const AUTH_TAG_LENGTH = 16; // 16 bytes authentication tag
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 32;

// Cached master key (avoid async calls for every encryption)
let cachedMasterKey: Buffer | null = null;
let masterKeyPromise: Promise<Buffer> | null = null;

/**
 * Get the master encryption key
 * First checks for cloud KMS configuration, then falls back to environment variable
 * 
 * COST OPTIMIZATION: With cloud KMS, this returns a locally cached data key.
 * Cloud KMS is only called when the data key expires (every 24 hours) or on startup.
 */
export async function getMasterKey(): Promise<Buffer> {
  // Return cached key if available
  if (cachedMasterKey) {
    return cachedMasterKey;
  }

  // If a fetch is already in progress, return that promise
  if (masterKeyPromise) {
    return masterKeyPromise;
  }

  // Start fetching the master key
  masterKeyPromise = (async () => {
    try {
      // Try cloud KMS first (includes local fallback)
      const key = await getKMSMasterKey();
      cachedMasterKey = key;
      return key;
    } catch (error) {
      console.error('Failed to get master key:', error);
      throw error;
    } finally {
      masterKeyPromise = null;
    }
  })();

  return masterKeyPromise;
}

/**
 * Synchronous master key getter (for backward compatibility)
 * WARNING: This only works if the master key has been previously cached
 */
export function getMasterKeySync(): Buffer {
  if (cachedMasterKey) {
    return cachedMasterKey;
  }

  // Fallback to environment variable (synchronous)
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!masterKey) {
    // In production, we MUST have a proper encryption key
    if (process.env.NODE_ENV === 'production') {
      if (isCloudKMSEnabled()) {
        throw new Error(
          'FATAL: Cloud KMS is enabled but master key has not been initialized. ' +
          'Call await getMasterKey() during application startup.'
        );
      }
      throw new Error(
        'FATAL SECURITY ERROR: ENCRYPTION_MASTER_KEY environment variable is required in production.\n' +
        'The application cannot start without a secure encryption key.\n' +
        'Please set ENCRYPTION_MASTER_KEY to a cryptographically secure random string (at least 32 characters).\n' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }

    // In development only, we can use a derived key (with clear warning)
    console.warn('⚠️  SECURITY WARNING: ENCRYPTION_MASTER_KEY not set! Using derived key for development only.');
    console.warn('   This is NOT SECURE for production use.');
    console.warn('   Set ENCRYPTION_MASTER_KEY to a secure 32+ character random string.');

    // Derive a key from available secrets for development
    const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
    return crypto.scryptSync(sessionSecret, 'genetic-explorer-salt', KEY_LENGTH);
  }

  // Ensure the key is exactly 32 bytes by deriving a proper key
  return crypto.scryptSync(masterKey, 'genetic-explorer-key-derivation-v1', KEY_LENGTH);
}

/**
 * Initialize encryption system
 * Call this during application startup to ensure master key is loaded
 */
export async function initializeEncryption(): Promise<void> {
  const key = await getMasterKey();
  const provider = getKMSProvider();
  
  if (isCloudKMSEnabled()) {
    console.log(`✅ Encryption initialized with ${provider} KMS (envelope encryption)`);
  } else {
    console.log('✅ Encryption initialized with environment key');
  }
}

/**
 * Get or create the encryption key for a specific user
 * Each user has their own encryption key derived from the master key
 */
export function getUserEncryptionKey(userId: string): Buffer {
  const masterKey = getMasterKeySync();

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
  cloudKMS: boolean;
  kmsProvider: string;
  algorithm: string;
  keyBits: number;
}

export function getEncryptionStatus(): EncryptionStatus {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  return {
    enabled: true,
    masterKeySet: !!masterKey && masterKey.length >= 32,
    cloudKMS: isCloudKMSEnabled(),
    kmsProvider: getKMSProvider(),
    algorithm: ALGORITHM,
    keyBits: KEY_LENGTH * 8,
  };
}

// ============================================================================
// Environment Variables
// ============================================================================

export const ENCRYPTION_ENV_VARS = {
  ENCRYPTION_MASTER_KEY: 'ENCRYPTION_MASTER_KEY',
  AWS_KMS_KEY_ID: 'AWS_KMS_KEY_ID',
  AZURE_KEY_VAULT_URL: 'AZURE_KEY_VAULT_URL',
  AZURE_KEY_NAME: 'AZURE_KEY_NAME',
  GCP_KMS_KEY_NAME: 'GCP_KMS_KEY_NAME',
} as const;

export function validateEncryptionConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if cloud KMS is configured
  const cloudKMSEnabled = isCloudKMSEnabled();
  
  if (!cloudKMSEnabled) {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      errors.push('ENCRYPTION_MASTER_KEY is not set (and no cloud KMS configured)');
    } else if (masterKey.length < 32) {
      errors.push('ENCRYPTION_MASTER_KEY should be at least 32 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Deterministic Encryption for Searchable Fields (Email Addresses)
// ============================================================================
//
// Deterministic encryption uses a fixed IV derived from the plaintext,
// so the same plaintext always produces the same ciphertext.
// This allows searching/lookup while still providing encryption at rest.
//
// SECURITY NOTE: This is less secure than randomized encryption because:
// 1. Patterns in the data are preserved (identical emails = identical ciphertexts)
// 2. Brute force attacks are possible if the attacker knows the key space
//
// Use only for fields that MUST be searchable (like email for login)

const DETERMINISTIC_ALGORITHM = 'aes-256-siv'; // Synthetic IV mode for deterministic encryption

/**
 * Generate a deterministic IV from the plaintext using HMAC
 * This ensures the same plaintext always produces the same IV
 */
function generateDeterministicIV(plaintext: string, key: Buffer): Buffer {
  // Use HMAC to derive a consistent IV from the plaintext
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(plaintext);
  return hmac.digest().slice(0, IV_LENGTH);
}

export interface DeterministicEncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
  deterministic: true;
}

/**
 * Encrypt data deterministically (same input = same output)
 * Uses AES-256-GCM with IV derived from plaintext via HMAC
 * 
 * Use case: Email addresses that need to be looked up by exact match
 */
export function encryptDeterministic(plaintext: string, key: Buffer): DeterministicEncryptedData {
  // Derive deterministic IV from plaintext
  const iv = generateDeterministicIV(plaintext, key);

  // Create cipher with deterministic IV
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
    deterministic: true,
  };
}

/**
 * Decrypt deterministically encrypted data
 */
export function decryptDeterministic(encrypted: DeterministicEncryptedData, key: Buffer): string {
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
 * Encrypt email address deterministically for storage
 * Allows lookup by email while keeping it encrypted at rest
 */
export function encryptEmail(email: string, key: Buffer): DeterministicEncryptedData {
  // Normalize email (lowercase, trim)
  const normalizedEmail = email.toLowerCase().trim();
  return encryptDeterministic(normalizedEmail, key);
}

/**
 * Decrypt email address
 */
export function decryptEmail(encrypted: DeterministicEncryptedData, key: Buffer): string {
  return decryptDeterministic(encrypted, key);
}

/**
 * Search for email by generating the deterministic ciphertext
 * Returns the encrypted form that can be used in database queries
 */
export function getEmailSearchToken(email: string, key: Buffer): string {
  const encrypted = encryptEmail(email, key);
  return JSON.stringify(encrypted);
}

/**
 * Verify if a plaintext email matches an encrypted email
 * Useful for login without decrypting stored emails
 */
export function verifyEmail(plaintextEmail: string, encryptedEmailJson: string, key: Buffer): boolean {
  try {
    const encrypted = JSON.parse(encryptedEmailJson) as DeterministicEncryptedData;
    const decrypted = decryptDeterministic(encrypted, key);
    // Constant-time comparison to prevent timing attacks
    const expected = plaintextEmail.toLowerCase().trim();
    if (decrypted.length !== expected.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(decrypted), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ============================================================================
// User-specific Deterministic Encryption Helpers
// ============================================================================

/**
 * Encrypt email for a specific user
 */
export function encryptEmailForUser(email: string, userId: string): DeterministicEncryptedData {
  const userKey = getUserEncryptionKey(userId);
  return encryptEmail(email, userKey);
}

/**
 * Verify email for a specific user
 */
export function verifyEmailForUser(plaintextEmail: string, encryptedEmailJson: string, userId: string): boolean {
  const userKey = getUserEncryptionKey(userId);
  return verifyEmail(plaintextEmail, encryptedEmailJson, userKey);
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
  initializeEncryption,
  getMasterKey,
  getMasterKeySync,
  encryptDeterministic,
  decryptDeterministic,
  encryptEmail,
  decryptEmail,
  getEmailSearchToken,
  verifyEmail,
};
