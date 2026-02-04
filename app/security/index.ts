/**
 * Security Module
 */
export {
  encrypt,
  decrypt,
  getUserEncryptionKey,
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
  rotateKey,
  type EncryptedData,
  type EncryptionStatus,
  type KeyRotationResult,
} from './encryption';

export {
  generateCsrfToken,
  validateCsrfToken,
  csrfProtection,
  getCsrfCookieOptions,
} from './csrf';

export {
  rateLimitByIp,
  rateLimitByUser,
  rateLimitAuth,
  rateLimitSensitive,
  getClientIp,
  createRateLimitHeaders,
  type RateLimitResult,
} from './rate-limit';

export {
  getSecurityHeaders,
  sanitizeInput,
  sanitizeFilename,
  generateNonce,
  getSecureCookieOptions,
  logSecurityEvent,
  detectSuspiciousActivity,
} from './security-core';
