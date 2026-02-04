import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encrypt,
  decrypt,
  encryptForUser,
  decryptForUser,
  encryptObject,
  decryptObject,
  getUserEncryptionKey,
  generateSecureToken,
  generateSecurePassword,
  hashData,
  verifyHash,
  rotateKey,
  getEncryptionStatus,
  validateEncryptionConfig,
  type EncryptedData,
} from './encryption';

describe('Encryption Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up test environment with a mock master key
    process.env = {
      ...originalEnv,
      ENCRYPTION_MASTER_KEY: 'test-master-key-that-is-32-bytes-long!',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Encrypt/Decrypt Operations', () => {
    it('should encrypt and decrypt plaintext correctly', () => {
      const key = getUserEncryptionKey('test-user-123');
      const plaintext = 'Hello, World! This is a secret message.';

      const encrypted = encrypt(plaintext, key);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted).toHaveProperty('version', 1);
      expect(encrypted.ciphertext).not.toBe(plaintext);
    });

    it('should decrypt encrypted data back to original plaintext', () => {
      const key = getUserEncryptionKey('test-user-123');
      const plaintext = 'Hello, World! This is a secret message.';

      const encrypted = encrypt(plaintext, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext (random IV)', () => {
      const key = getUserEncryptionKey('test-user-123');
      const plaintext = 'Same message';

      const encrypted1 = encrypt(plaintext, key);
      const encrypted2 = encrypt(plaintext, key);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should encrypt and decrypt empty string', () => {
      const key = getUserEncryptionKey('test-user-123');
      const plaintext = '';

      const encrypted = encrypt(plaintext, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt unicode characters', () => {
      const key = getUserEncryptionKey('test-user-123');
      const plaintext = 'Hello 世界! 🌍 ñ é ß';

      const encrypted = encrypt(plaintext, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt long text', () => {
      const key = getUserEncryptionKey('test-user-123');
      const plaintext = 'A'.repeat(10000);

      const encrypted = encrypt(plaintext, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('User-specific Encryption', () => {
    it('should generate same key for same user', () => {
      const key1 = getUserEncryptionKey('user-123');
      const key2 = getUserEncryptionKey('user-123');

      expect(key1.equals(key2)).toBe(true);
    });

    it('should generate different keys for different users', () => {
      const key1 = getUserEncryptionKey('user-123');
      const key2 = getUserEncryptionKey('user-456');

      expect(key1.equals(key2)).toBe(false);
    });

    it('should encrypt and decrypt for specific user', () => {
      const userId = 'user-abc-123';
      const plaintext = 'User-specific secret data';

      const encrypted = encryptForUser(userId, plaintext);
      const decrypted = decryptForUser(userId, encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should fail decryption with wrong user key', () => {
      const plaintext = 'Secret data';
      const encrypted = encryptForUser('user-1', plaintext);

      // Try to decrypt with different user's key
      const wrongKey = getUserEncryptionKey('user-2');
      
      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });
  });

  describe('Object Encryption', () => {
    it('should encrypt and decrypt objects', () => {
      const key = getUserEncryptionKey('test-user');
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true,
      };

      const encrypted = encryptObject(data, key);
      const decrypted = decryptObject<typeof data>(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt nested objects', () => {
      const key = getUserEncryptionKey('test-user');
      const data = {
        user: {
          profile: {
            name: 'Jane',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        metadata: {
          created: new Date().toISOString(),
        },
      };

      const encrypted = encryptObject(data, key);
      const decrypted = decryptObject<typeof data>(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt arrays', () => {
      const key = getUserEncryptionKey('test-user');
      const data = [1, 2, 3, 'four', 'five', { nested: true }];

      const encrypted = encryptObject(data, key);
      const decrypted = decryptObject<typeof data>(encrypted, key);

      expect(decrypted).toEqual(data);
    });
  });

  describe('Key Derivation', () => {
    it('should derive 32-byte key from master key', () => {
      const key = getUserEncryptionKey('any-user');
      expect(key.length).toBe(32);
    });

    it('should derive different keys for different user IDs', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        const key = getUserEncryptionKey(`user-${i}`);
        keys.add(key.toString('hex'));
      }
      expect(keys.size).toBe(100);
    });

    it('should derive key from short master key using scrypt', () => {
      process.env.ENCRYPTION_MASTER_KEY = 'short';
      
      const key = getUserEncryptionKey('test-user');
      expect(key.length).toBe(32);
    });
  });

  describe('Error Handling for Invalid Data', () => {
    it('should throw on decryption with wrong auth tag', () => {
      const key = getUserEncryptionKey('test-user');
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext, key);

      // Corrupt the auth tag
      const corrupted: EncryptedData = {
        ...encrypted,
        authTag: Buffer.from(encrypted.authTag, 'base64').map(b => b ^ 0xFF).toString('base64'),
      };

      expect(() => decrypt(corrupted, key)).toThrow();
    });

    it('should throw on decryption with wrong IV', () => {
      const key = getUserEncryptionKey('test-user');
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext, key);

      // Use wrong IV
      const corrupted: EncryptedData = {
        ...encrypted,
        iv: getUserEncryptionKey('different').toString('base64'),
      };

      expect(() => decrypt(corrupted, key)).toThrow();
    });

    it('should throw on unsupported encryption version', () => {
      const key = getUserEncryptionKey('test-user');
      const encrypted: EncryptedData = {
        ciphertext: 'test',
        iv: Buffer.alloc(16).toString('base64'),
        authTag: Buffer.alloc(16).toString('base64'),
        version: 999,
      };

      expect(() => decrypt(encrypted, key)).toThrow('Unsupported encryption version: 999');
    });

    it('should throw on decryption with corrupted ciphertext', () => {
      const key = getUserEncryptionKey('test-user');
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext, key);

      // Corrupt the ciphertext
      const corrupted: EncryptedData = {
        ...encrypted,
        ciphertext: encrypted.ciphertext.substring(0, encrypted.ciphertext.length - 4) + 'XXXX',
      };

      expect(() => decrypt(corrupted, key)).toThrow();
    });

    it('should throw on decryption with wrong key', () => {
      const key = getUserEncryptionKey('user-1');
      const wrongKey = getUserEncryptionKey('user-2');
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext, key);

      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it('should handle missing master key with fallback', () => {
      delete process.env.ENCRYPTION_MASTER_KEY;
      process.env.SESSION_SECRET = 'test-session-secret';

      // Should still work with derived key
      const key = getUserEncryptionKey('test-user');
      expect(key.length).toBe(32);

      const plaintext = 'Test message';
      const encrypted = encrypt(plaintext, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Secure Token Generation', () => {
    it('should generate token of specified length', () => {
      const token = generateSecureToken(32);
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSecureToken());
      }
      expect(tokens.size).toBe(100);
    });

    it('should generate hex-encoded tokens', () => {
      const token = generateSecureToken();
      expect(/^[a-f0-9]+$/i.test(token)).toBe(true);
    });
  });

  describe('Secure Password Generation', () => {
    it('should generate password of specified length', () => {
      const password = generateSecurePassword(16);
      expect(password.length).toBe(16);
    });

    it('should include uppercase letters', () => {
      const password = generateSecurePassword();
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should include lowercase letters', () => {
      const password = generateSecurePassword();
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should include numbers', () => {
      const password = generateSecurePassword();
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('should include symbols', () => {
      const password = generateSecurePassword();
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
    });

    it('should generate different passwords each time', () => {
      const passwords = new Set();
      for (let i = 0; i < 50; i++) {
        passwords.add(generateSecurePassword());
      }
      expect(passwords.size).toBe(50);
    });
  });

  describe('Hash Functions', () => {
    it('should create consistent hash for same data', () => {
      const data = 'test data';
      const hash1 = hashData(data);
      const hash2 = hashData(data, hash1.split(':')[1]);

      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different data', () => {
      const hash1 = hashData('data1');
      const hash2 = hashData('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct hash', () => {
      const data = 'secret data';
      const hashed = hashData(data);

      expect(verifyHash(data, hashed)).toBe(true);
    });

    it('should reject incorrect hash', () => {
      const data = 'secret data';
      const wrongData = 'wrong data';
      const hashed = hashData(data);

      expect(verifyHash(wrongData, hashed)).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const data = 'test';
      const hashed = hashData(data);
      
      // Should not throw and return false for wrong data
      expect(verifyHash('wrong', hashed)).toBe(false);
    });
  });

  describe('Key Rotation', () => {
    it('should re-encrypt data with new key', () => {
      const userId = 'user-123';
      const plaintext = 'Sensitive data';
      
      // First encrypt with original key
      const originalKey = getUserEncryptionKey(userId);
      const encrypted = encrypt(plaintext, originalKey);
      
      // Create a new key and rotate
      const newKey = getUserEncryptionKey('different-user');
      const reEncrypted = rotateKey(userId, encrypted, newKey);
      
      // Should be able to decrypt with new key
      const decrypted = decrypt(reEncrypted, newKey);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext after rotation', () => {
      const userId = 'user-123';
      const plaintext = 'Sensitive data';
      
      const originalKey = getUserEncryptionKey(userId);
      const encrypted = encrypt(plaintext, originalKey);
      
      const newKey = getUserEncryptionKey('different-user');
      const reEncrypted = rotateKey(userId, encrypted, newKey);
      
      expect(reEncrypted.ciphertext).not.toBe(encrypted.ciphertext);
    });
  });

  describe('Encryption Status', () => {
    it('should return correct status when master key is set', () => {
      const status = getEncryptionStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.masterKeySet).toBe(true);
      expect(status.algorithm).toBe('aes-256-gcm');
      expect(status.keyBits).toBe(256);
    });

    it('should report masterKeySet as false when key is too short', () => {
      process.env.ENCRYPTION_MASTER_KEY = 'short';
      
      const status = getEncryptionStatus();
      expect(status.masterKeySet).toBe(false);
    });

    it('should validate encryption config with valid key', () => {
      const validation = validateEncryptionConfig();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should report error when master key is missing', () => {
      delete process.env.ENCRYPTION_MASTER_KEY;
      
      const validation = validateEncryptionConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('ENCRYPTION_MASTER_KEY is not set');
    });

    it('should report error when master key is too short', () => {
      process.env.ENCRYPTION_MASTER_KEY = 'short';
      
      const validation = validateEncryptionConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('ENCRYPTION_MASTER_KEY should be at least 32 characters');
    });
  });

  describe('Field-level Encryption Helpers', () => {
    it('should encrypt and decrypt fields in objects', async () => {
      const { encryptField, decryptField } = await import('./encryption');
      const key = getUserEncryptionKey('test-user');
      
      const obj = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const encrypted = encryptField(obj, 'email', key);
      expect(encrypted._encryptedFields).toContain('email');
      expect(typeof encrypted.email).toBe('string');

      const decrypted = decryptField(encrypted, 'email', key);
      expect(decrypted.email).toBe('test@example.com');
    });
  });
});
