/**
 * Secure Logging Utility
 * 
 * Prevents sensitive information from being logged to console.
 * Sanitizes error messages to avoid information leakage.
 */

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
 * Secure console logging - only logs in development
 */
export function logError(context: string, error: Error | string | unknown, metadata?: Record<string, unknown>): void {
  const sanitizedMessage = sanitizeError(error);
  
  // In production, don't log to console - use proper logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to secure logging service (Sentry, Datadog, etc.)
    // This is a placeholder - implement actual integration
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: { context, metadata },
      });
    }
    return;
  }
  
  // Development logging with sanitization
  const sanitizedMetadata = metadata ? sanitizeLogMessage(JSON.stringify(metadata)) : '';
  console.error(`[${context}] ${sanitizedMessage}`, sanitizedMetadata);
}

/**
 * Secure console warn
 */
export function logWarn(context: string, message: string, metadata?: Record<string, unknown>): void {
  const sanitizedMessage = sanitizeLogMessage(message);
  
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    return;
  }
  
  const sanitizedMetadata = metadata ? sanitizeLogMessage(JSON.stringify(metadata)) : '';
  console.warn(`[${context}] ${sanitizedMessage}`, sanitizedMetadata);
}

/**
 * Secure console info (development only)
 */
export function logInfo(context: string, message: string): void {
  if (process.env.NODE_ENV === 'production') {
    return; // No info logs in production
  }
  
  console.log(`[${context}] ${sanitizeLogMessage(message)}`);
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

export default {
  sanitizeLogMessage,
  sanitizeError,
  logError,
  logWarn,
  logInfo,
  createSafeError,
};
