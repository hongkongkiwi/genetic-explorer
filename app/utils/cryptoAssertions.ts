/**
 * Compile-Time and Runtime Cryptographic Assertions
 * 
 * Inspired by Lightway's compile-time assertions (e.g., wolfssl key size checks)
 * 
 * These assertions ensure cryptographic parameters are correct at:
 * 1. TypeScript compile time (via type system)
 * 2. Application startup (via runtime checks)
 * 3. Test time (via unit tests)
 * 
 * SECURITY: Catches misconfigurations before they reach production
 */

import crypto from 'crypto';
import { logInfo } from './logger';

// ============================================================================
// CONSTANTS - These are enforced by the type system
// ============================================================================

/**
 * AES-256-GCM parameters
 * Using 'as const' ensures these are treated as literal types
 */
export const CRYPTO_CONSTANTS = {
  // AES-256 requires exactly 32 bytes (256 bits)
  AES_KEY_SIZE: 32 as const,
  AES_IV_SIZE: 16 as const,
  AES_AUTH_TAG_SIZE: 16 as const,
  AES_ALGORITHM: 'aes-256-gcm' as const,
  
  // PBKDF2 parameters
  PBKDF2_ITERATIONS: 100000 as const,
  PBKDF2_KEYLEN: 64 as const,
  PBKDF2_DIGEST: 'sha512' as const,
  
  // Session token length
  SESSION_TOKEN_BYTES: 32 as const,
  
  // HMAC
  HMAC_ALGORITHM: 'sha256' as const,
  HMAC_KEY_SIZE: 32 as const,
  
  // Scrypt parameters for password hashing
  SCRYPT_N: 16384 as const,  // 2^14
  SCRYPT_R: 8 as const,
  SCRYPT_P: 1 as const,
  SCRYPT_MAXMEM: 67108864 as const, // 64MB = 64 * 1024 * 1024
} as const;

// Type-level assertion that key size matches algorithm
// If AES_KEY_SIZE doesn't match what aes-256-gcm expects, this will error
type AssertKeySize = typeof CRYPTO_CONSTANTS.AES_KEY_SIZE extends 32 ? true : false;
const _assertKeySize: AssertKeySize = true;

// ============================================================================
// RUNTIME VALIDATION
// ============================================================================

/**
 * Validates that Node.js crypto supports our required algorithms
 * Throws if any required algorithm is missing
 */
export function validateCryptoSupport(): void {
  const requiredAlgorithms = [
    'aes-256-gcm',
    'sha256',
    'sha512',
  ];
  
  for (const algo of requiredAlgorithms) {
    try {
      // Test that algorithm exists by trying to use it
      if (algo.startsWith('aes-')) {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        crypto.createCipheriv(algo, key, iv);
      } else {
        crypto.createHash(algo);
      }
    } catch (error) {
      throw new Error(
        `CRITICAL: Required cryptographic algorithm '${algo}' is not supported. ` +
        `This system may not be suitable for running Genetic Explorer.`
      );
    }
  }
  
  logInfo('✅ All required cryptographic algorithms are supported');
}

/**
 * Validates key length at runtime
 * Throws if key is not exactly 32 bytes
 */
export function validateAESKey(key: Buffer): asserts key is Buffer & { length: 32 } {
  if (key.length !== CRYPTO_CONSTANTS.AES_KEY_SIZE) {
    throw new Error(
      `CRITICAL: Invalid AES key length. ` +
      `Expected ${CRYPTO_CONSTANTS.AES_KEY_SIZE} bytes, got ${key.length} bytes. ` +
      `AES-256 requires exactly 256 bits (32 bytes).`
    );
  }
}

/**
 * Validates IV length at runtime
 */
export function validateIV(iv: Buffer): asserts iv is Buffer & { length: 16 } {
  if (iv.length !== CRYPTO_CONSTANTS.AES_IV_SIZE) {
    throw new Error(
      `CRITICAL: Invalid IV length. ` +
      `Expected ${CRYPTO_CONSTANTS.AES_IV_SIZE} bytes, got ${iv.length} bytes.`
    );
  }
}

/**
 * Validates authentication tag length
 */
export function validateAuthTag(tag: Buffer): asserts tag is Buffer & { length: 16 } {
  if (tag.length !== CRYPTO_CONSTANTS.AES_AUTH_TAG_SIZE) {
    throw new Error(
      `CRITICAL: Invalid auth tag length. ` +
      `Expected ${CRYPTO_CONSTANTS.AES_AUTH_TAG_SIZE} bytes, got ${tag.length} bytes.`
    );
  }
}

// ============================================================================
// SECURE COMPARISON HELPERS
// ============================================================================

/**
 * Type-safe secure comparison for buffers
 * Ensures both buffers are the same length before comparison
 */
export function secureCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/**
 * Type-safe secure comparison for hex strings
 */
export function secureCompareHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    return secureCompare(bufA, bufB);
  } catch {
    return false;
  }
}

// ============================================================================
// TYPE-SAFE CRYPTOGRAPHIC OPERATIONS
// ============================================================================

/**
 * Type-safe AES-256-GCM encryption
 * Returns typed buffers that match expected sizes
 */
export function encryptAES256GCM(
  plaintext: Buffer,
  key: Buffer & { length: 32 },
  iv: Buffer & { length: 16 }
): { ciphertext: Buffer; authTag: Buffer & { length: 16 } } {
  validateAESKey(key);
  validateIV(iv);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag() as Buffer & { length: 16 };
  
  return { ciphertext, authTag };
}

/**
 * Type-safe AES-256-GCM decryption
 */
export function decryptAES256GCM(
  ciphertext: Buffer,
  key: Buffer & { length: 32 },
  iv: Buffer & { length: 16 },
  authTag: Buffer & { length: 16 }
): Buffer {
  validateAESKey(key);
  validateIV(iv);
  validateAuthTag(authTag);
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Run all cryptographic validations at startup
 * Call this during application initialization
 */
export function initializeCryptoAssertions(): void {
  logInfo('🔐 Initializing cryptographic assertions...');
  
  // Validate crypto support
  validateCryptoSupport();
  
  // Validate constants
  const errors: string[] = [];
  
  if (CRYPTO_CONSTANTS.AES_KEY_SIZE !== 32) {
    errors.push(`AES_KEY_SIZE must be 32, got ${CRYPTO_CONSTANTS.AES_KEY_SIZE}`);
  }
  
  if (CRYPTO_CONSTANTS.AES_IV_SIZE !== 16) {
    errors.push(`AES_IV_SIZE must be 16, got ${CRYPTO_CONSTANTS.AES_IV_SIZE}`);
  }
  
  if (CRYPTO_CONSTANTS.PBKDF2_ITERATIONS < 10000) {
    errors.push(`PBKDF2_ITERATIONS should be at least 10000`);
  }
  
  if (errors.length > 0) {
    throw new Error(
      'CRITICAL: Cryptographic configuration errors:\n' + errors.join('\n')
    );
  }
  
  // Test encryption round-trip
  const testKey = crypto.randomBytes(32) as Buffer & { length: 32 };
  const testIV = crypto.randomBytes(16) as Buffer & { length: 16 };
  const testData = Buffer.from('Genetic Explorer Crypto Test');
  
  try {
    const { ciphertext, authTag } = encryptAES256GCM(testData, testKey, testIV);
    const decrypted = decryptAES256GCM(ciphertext, testKey, testIV, authTag);
    
    if (!decrypted.equals(testData)) {
      throw new Error('Encryption round-trip test failed');
    }
    
    logInfo('✅ Encryption round-trip test passed');
  } catch (error) {
    throw new Error(
      `CRITICAL: Encryption test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
  
  logInfo('✅ All cryptographic assertions passed');
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for 32-byte buffers (AES keys)
 */
export function isValidAESKey(buf: Buffer): buf is Buffer & { length: 32 } {
  return buf.length === 32;
}

/**
 * Type guard for 16-byte buffers (IVs)
 */
export function isValidIV(buf: Buffer): buf is Buffer & { length: 16 } {
  return buf.length === 16;
}

export default {
  CRYPTO_CONSTANTS,
  validateCryptoSupport,
  validateAESKey,
  validateIV,
  validateAuthTag,
  secureCompare,
  secureCompareHex,
  encryptAES256GCM,
  decryptAES256GCM,
  initializeCryptoAssertions,
  isValidAESKey,
  isValidIV,
};
