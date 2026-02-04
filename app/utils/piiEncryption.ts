/**
 * PII (Personally Identifiable Information) Encryption
 * 
 * Provides field-level encryption for sensitive user data:
 * - Email addresses
 * - Display names
 * - Phone numbers
 * - Addresses
 * 
 * Uses deterministic encryption for searchable fields (email) and
 * non-deterministic encryption for non-searchable fields (display name).
 */

import crypto from 'crypto';
import { getMasterKeySync, encrypt, decrypt, EncryptedData } from '~/security';

// PII fields configuration
interface PIIFieldConfig {
  searchable: boolean;  // If true, uses deterministic encryption (same plaintext = same ciphertext)
  sensitive: boolean;   // If true, always encrypt
}

const PII_FIELDS: Record<string, PIIFieldConfig> = {
  email: { searchable: true, sensitive: true },
  displayName: { searchable: false, sensitive: true },
  phoneNumber: { searchable: true, sensitive: true },
  address: { searchable: false, sensitive: true },
  bio: { searchable: false, sensitive: false }, // Bio is less sensitive
};

// Cache for searchable field keys (deterministic encryption)
let searchableKey: Buffer | null = null;

/**
 * Get the deterministic encryption key for searchable fields
 * Same input will always produce same output (for searching)
 */
function getSearchableKey(): Buffer {
  if (!searchableKey) {
    const masterKey = getMasterKeySync();
    const hmac = crypto.createHmac('sha256', masterKey);
    hmac.update('pii:searchable');
    searchableKey = hmac.digest();
  }
  return searchableKey;
}

/**
 * Get the user-specific PII encryption key
 */
function getUserPIIKey(userId: string): Buffer {
  const masterKey = getMasterKeySync();
  const hmac = crypto.createHmac('sha256', masterKey);
  hmac.update(`pii:user:${userId}`);
  return hmac.digest();
}

/**
 * Encrypt PII field
 * Uses deterministic encryption for searchable fields
 */
export function encryptPII(
  userId: string,
  fieldName: string,
  value: string
): string {
  if (!value || value.trim() === '') {
    return value;
  }

  const config = PII_FIELDS[fieldName];
  if (!config?.sensitive) {
    return value; // Don't encrypt non-sensitive fields
  }

  if (config.searchable) {
    // Deterministic encryption for searchable fields
    const key = getSearchableKey();
    const encrypted = encrypt(value, key);
    return JSON.stringify({ ...encrypted, _type: 'pii', _field: fieldName });
  } else {
    // Non-deterministic encryption for non-searchable fields
    const key = getUserPIIKey(userId);
    const encrypted = encrypt(value, key);
    return JSON.stringify({ ...encrypted, _type: 'pii', _field: fieldName });
  }
}

/**
 * Decrypt PII field
 */
export function decryptPII(
  userId: string,
  fieldName: string,
  encryptedValue: string
): string {
  if (!encryptedValue || !encryptedValue.startsWith('{')) {
    return encryptedValue; // Not encrypted
  }

  try {
    const encrypted = JSON.parse(encryptedValue) as EncryptedData & { _type?: string };
    
    // Check if it's a PII encrypted field
    if (encrypted._type !== 'pii') {
      return encryptedValue; // Not our encryption format
    }

    const config = PII_FIELDS[fieldName];
    
    if (config?.searchable) {
      const key = getSearchableKey();
      return decrypt(encrypted, key);
    } else {
      const key = getUserPIIKey(userId);
      return decrypt(encrypted, key);
    }
  } catch (error) {
    console.error(`Failed to decrypt PII field ${fieldName}:`, error);
    return '[ENCRYPTED]'; // Return placeholder on error
  }
}

/**
 * Encrypt email address (searchable)
 */
export function encryptEmail(email: string): string {
  if (!email) return email;
  
  const key = getSearchableKey();
  const encrypted = encrypt(email.toLowerCase().trim(), key);
  return JSON.stringify({ ...encrypted, _type: 'pii_email' });
}

/**
 * Decrypt email address
 */
export function decryptEmail(encryptedEmail: string): string {
  if (!encryptedEmail || !encryptedEmail.startsWith('{')) {
    return encryptedEmail;
  }

  try {
    const encrypted = JSON.parse(encryptedEmail) as EncryptedData & { _type?: string };
    
    if (encrypted._type !== 'pii_email') {
      return encryptedEmail;
    }

    const key = getSearchableKey();
    return decrypt(encrypted, key);
  } catch (error) {
    console.error('Failed to decrypt email:', error);
    return '[ENCRYPTED]';
  }
}

/**
 * Get searchable hash of email (for lookups without decryption)
 * This produces the same hash for the same email
 */
export function getEmailSearchHash(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const key = getSearchableKey();
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(normalizedEmail);
  return hmac.digest('hex');
}

/**
 * Encrypt display name (non-searchable)
 */
export function encryptDisplayName(userId: string, displayName: string): string {
  if (!displayName) return displayName;
  
  const key = getUserPIIKey(userId);
  const encrypted = encrypt(displayName, key);
  return JSON.stringify({ ...encrypted, _type: 'pii_display_name' });
}

/**
 * Decrypt display name
 */
export function decryptDisplayName(userId: string, encryptedName: string): string {
  if (!encryptedName || !encryptedName.startsWith('{')) {
    return encryptedName;
  }

  try {
    const encrypted = JSON.parse(encryptedName) as EncryptedData & { _type?: string };
    
    if (encrypted._type !== 'pii_display_name') {
      return encryptedName;
    }

    const key = getUserPIIKey(userId);
    return decrypt(encrypted, key);
  } catch (error) {
    console.error('Failed to decrypt display name:', error);
    return '[ENCRYPTED]';
  }
}

/**
 * Check if a value is encrypted PII
 */
export function isEncryptedPII(value: string): boolean {
  if (!value || !value.startsWith('{')) return false;
  
  try {
    const parsed = JSON.parse(value);
    return parsed._type?.startsWith('pii') ?? false;
  } catch {
    return false;
  }
}

/**
 * Encrypt user profile PII fields
 */
export function encryptUserProfile(userId: string, profile: {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  [key: string]: any;
}): Record<string, any> {
  return {
    ...profile,
    ...(profile.email && { email: encryptEmail(profile.email) }),
    ...(profile.displayName && { displayName: encryptDisplayName(userId, profile.displayName) }),
    ...(profile.phoneNumber && { phoneNumber: encryptPII(userId, 'phoneNumber', profile.phoneNumber) }),
    _piiEncrypted: true,
  };
}

/**
 * Decrypt user profile PII fields
 */
export function decryptUserProfile(userId: string, profile: {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  [key: string]: any;
}): Record<string, any> {
  return {
    ...profile,
    ...(profile.email && { email: decryptEmail(profile.email) }),
    ...(profile.displayName && { displayName: decryptDisplayName(userId, profile.displayName) }),
    ...(profile.phoneNumber && { phoneNumber: decryptPII(userId, 'phoneNumber', profile.phoneNumber) }),
  };
}
