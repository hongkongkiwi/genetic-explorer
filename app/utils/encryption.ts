/**
 * Encryption Utilities
 * 
 * Provides user-specific encryption for sensitive genetic data.
 * Uses AES-256-GCM for authenticated encryption.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get or derive a user's encryption key
 * In production, this should use a proper key management service (KMS)
 */
function getUserKey(userId: string): Buffer {
  // Combine master key with user ID for per-user encryption
  const masterKey = process.env.MASTER_KEY || '';
  if (!masterKey) {
    throw new Error('MASTER_KEY not configured');
  }
  
  // Derive user-specific key using HKDF-like approach
  return crypto.scryptSync(masterKey, userId, KEY_LENGTH);
}

/**
 * Encrypt data for a specific user
 */
export function encryptForUser(userId: string, data: string): { encrypted: string; iv: string } {
  try {
    const key = getUserKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Combine encrypted data with auth tag
    const combined = Buffer.from(encrypted, 'base64');
    const result = Buffer.concat([combined, authTag]);
    
    return {
      encrypted: result.toString('base64'),
      iv: iv.toString('base64'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data for a specific user
 */
export function decryptForUser(userId: string, encrypted: { encrypted: string; iv: string }): string {
  try {
    const key = getUserKey(userId);
    const iv = Buffer.from(encrypted.iv, 'base64');
    
    // Split encrypted data from auth tag
    const combined = Buffer.from(encrypted.encrypted, 'base64');
    const authTag = combined.slice(-AUTH_TAG_LENGTH);
    const encryptedData = combined.slice(0, -AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or key may have changed');
  }
}

/**
 * Get master key synchronously
 * @deprecated Use environment variable directly or proper key management
 */
export function getMasterKeySync(): string {
  const key = process.env.MASTER_KEY;
  if (!key) {
    throw new Error('MASTER_KEY not configured');
  }
  return key;
}

/**
 * Generate a secure random key
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('base64');
  const hash = crypto.scryptSync(data, usedSalt, 32).toString('base64');
  return { hash, salt: usedSalt };
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hash: string, salt: string): boolean {
  const computed = crypto.scryptSync(data, salt, 32).toString('base64');
  return computed === hash;
}
