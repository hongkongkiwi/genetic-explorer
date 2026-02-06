/**
 * Security Utilities
 * 
 * Provides security-related functionality for the application.
 */

import { logActivity } from '~/db';
import { encryptForUser, decryptForUser, getMasterKeySync } from './encryption';
import { logInfo, logError } from './logger';

interface SecurityEvent {
  type: string;
  ip?: string;
  email?: string;
  userId?: string;
  reasons?: string[];
  remainingTime?: number;
  endpoint?: string;
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  type: string,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'error' = 'info'
): void {
  if (severity === 'error') {
    logError(`[Security ${severity.toUpperCase()}] ${type}:`, undefined, details);
  } else {
    logInfo(`[Security ${severity.toUpperCase()}] ${type}:`, details);
  }
  
  // Also log to database if it's a warning or error
  if (severity !== 'info' && details.userId) {
    logActivity(
      details.userId as string,
      `security_${type}`,
      'security',
      type,
      details,
      (details.ip as string) || undefined
    );
  }
}

/**
 * Detect suspicious activity in a request
 */
export function detectSuspiciousActivity(
  request: Request,
  body: Record<string, unknown>
): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for missing user agent
  const userAgent = request.headers.get('user-agent');
  if (!userAgent) {
    reasons.push('missing_user_agent');
  }
  
  // Check for suspicious patterns in body
  const bodyStr = JSON.stringify(body);
  if (bodyStr.includes('<script') || bodyStr.includes('javascript:')) {
    reasons.push('potential_xss');
  }
  
  // Check for SQL injection patterns
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)|(--|#|\/\*)/i;
  if (sqlPatterns.test(bodyStr)) {
    reasons.push('potential_sql_injection');
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

// Device tracking
const knownDevices = new Map<string, Set<string>>();

/**
 * Check if this is a new device for the user
 */
export function isNewDevice(userId: string, userAgent: string, ipAddress: string): boolean {
  const deviceKey = `${userAgent}:${ipAddress}`;
  const userDevices = knownDevices.get(userId);
  
  if (!userDevices) {
    knownDevices.set(userId, new Set([deviceKey]));
    return true;
  }
  
  if (userDevices.has(deviceKey)) {
    return false;
  }
  
  userDevices.add(deviceKey);
  return true;
}

/**
 * Clear device tracking for a user (e.g., on password change)
 */
export function clearKnownDevices(userId: string): void {
  knownDevices.delete(userId);
}

// Re-export encryption functions for convenience
export { encryptForUser, decryptForUser, getMasterKeySync };

/**
 * Initialize encryption system
 */
export function initializeEncryption(): void {
  // Verify master key is configured
  try {
    getMasterKeySync();
    logInfo('[Security] Encryption initialized');
  } catch (error) {
    logError('[Security] Encryption initialization failed:', error);
    throw error;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return require('crypto').randomBytes(length).toString('base64url');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
    feedback.push('Password should be at least 12 characters long');
  } else {
    feedback.push('Password is too short (minimum 8 characters)');
  }
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  return {
    valid: score >= 4,
    score,
    feedback,
  };
}
