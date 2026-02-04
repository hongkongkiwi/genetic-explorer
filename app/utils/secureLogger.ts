/**
 * Secure Logging Utility
 * 
 * Prevents sensitive information from being logged to console.
 * Sanitizes error messages to avoid information leakage.
 * 
 * Uses Loglayer for structured logging with Axiom integration
 * and Sentry for error tracking.
 */

import { logger, logError as logErrorToSystem } from './logging';
import { isSentryConfigured, captureException } from './sentry';

// Patterns that might indicate sensitive data
const SENSITIVE_PATTERNS = [
  // API Keys and tokens
  /sk-[a-zA-Z0-9]{20,}/g,                    // OpenAI API keys
  /re_[a-zA-Z0-9]{20,}/g,                    // Resend API keys
  /[a-zA-Z0-9]{32,}/g,                       // Generic 32+ char tokens
  
  // Passwords and secrets (in key=value format)
  /password[=:]\S+/gi,
  /secret[=:]\S+/gi,
  /token[=:]\S+/gi,
  /key[=:]\S+/gi,
  
  // Email addresses (keep domain for context)
  /[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  
  // Genetic data patterns
  /rs\d+/g,                                  // SNP IDs are fine to log
  /genotype[=:]\w+/gi,                       // But not actual genotypes
  
  // Session/Auth tokens
  /Bearer\s+\S+/g,
  /session[_-]?token[=:]\S+/gi,
];

// Error types that should never expose internal details
const PRODUCTION_SAFE_ERRORS = [
  'Failed to decrypt',
  'Encryption error',
  'Database error',
  'Authentication failed',
  'Authorization failed',
];

/**
 * Sanitize a string to remove sensitive information
 */
export function sanitizeLogMessage(message: string): string {
  let sanitized = message;
  
  // Replace sensitive patterns
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, '[OPENAI_KEY_REDACTED]');
  sanitized = sanitized.replace(/re_[a-zA-Z0-9]{20,}/g, '[RESEND_KEY_REDACTED]');
  sanitized = sanitized.replace(/[a-f0-9]{64,}/gi, '[HASH_REDACTED]');
  sanitized = sanitized.replace(/password[=:]\S+/gi, 'password=[REDACTED]');
  sanitized = sanitized.replace(/secret[=:]\S+/gi, 'secret=[REDACTED]');
  sanitized = sanitized.replace(/Bearer\s+\S+/g, 'Bearer [TOKEN_REDACTED]');
  
  // Redact email local part, keep domain for debugging
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    '[REDACTED]@$1'
  );
  
  return sanitized;
}

/**
 * Create a safe error message for production
 */
export function sanitizeError(error: Error | string | unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  // In production, return generic messages for sensitive operations
  if (process.env.NODE_ENV === 'production') {
    // Check if this is a sensitive error type
    if (PRODUCTION_SAFE_ERRORS.some(safe => message.toLowerCase().includes(safe.toLowerCase()))) {
      return 'An error occurred while processing your request. Please try again or contact support.';
    }
  }
  
  return sanitizeLogMessage(message);
}

/**
 * Secure console logging - uses Loglayer with sanitization
 */
export function logError(
  context: string, 
  error: Error | string | unknown, 
  metadata?: Record<string, unknown>
): void {
  const sanitizedMessage = sanitizeError(error);
  const sanitizedMetadata = metadata ? 
    Object.fromEntries(
      Object.entries(metadata).map(([k, v]) => [
        k, 
        typeof v === 'string' ? sanitizeLogMessage(v) : v
      ])
    ) : {};

  // Use structured logging
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  logErrorToSystem(errorObj, {
    context,
    ...sanitizedMetadata,
  });

  // Also report to Sentry if configured
  if (isSentryConfigured() && error instanceof Error) {
    captureException(error, { context, ...sanitizedMetadata });
  }
}

/**
 * Secure console warn
 */
export function logWarn(
  context: string, 
  message: string, 
  metadata?: Record<string, unknown>
): void {
  const sanitizedMessage = sanitizeLogMessage(message);
  
  logger
    .withContext({ context, level: 'warn', ...metadata })
    .warn(sanitizedMessage);
}

/**
 * Secure console info (development only via Loglayer)
 */
export function logInfo(context: string, message: string): void {
  const sanitizedMessage = sanitizeLogMessage(message);
  
  logger
    .withContext({ context, level: 'info' })
    .info(sanitizedMessage);
}

/**
 * Create a safe error object that doesn't leak sensitive info
 */
export function createSafeError(
  originalError: Error,
  publicMessage: string,
  errorCode: string
): Error {
  // Log the original error securely
  logError('ErrorHandler', originalError);
  
  // Return a new error with safe message
  const safeError = new Error(publicMessage);
  (safeError as any).code = errorCode;
  (safeError as any).originalError = process.env.NODE_ENV === 'development' ? originalError : undefined;
  
  return safeError;
}

/**
 * Log a security event with automatic Sentry reporting
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): void {
  // Sanitize details
  const sanitizedDetails = Object.fromEntries(
    Object.entries(details).map(([k, v]) => [
      k,
      typeof v === 'string' ? sanitizeLogMessage(v) : v
    ])
  );

  logger
    .withContext({
      eventType: 'security',
      severity,
      ...sanitizedDetails,
    })
    .warn(`Security Event: ${event}`);

  // Report high/critical severity to Sentry
  if ((severity === 'high' || severity === 'critical') && isSentryConfigured()) {
    captureException(new Error(`Security Event: ${event}`), sanitizedDetails);
  }
}

/**
 * Log an audit event
 */
export function logAuditEvent(
  action: string,
  userId: string,
  resource: string,
  details?: Record<string, unknown>
): void {
  logger
    .withContext({
      eventType: 'audit',
      userId,
      resource,
      ...details,
    })
    .info(`Audit: ${action}`);
}

export default {
  sanitizeLogMessage,
  sanitizeError,
  logError,
  logWarn,
  logInfo,
  createSafeError,
  logSecurityEvent,
  logAuditEvent,
};
