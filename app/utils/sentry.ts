/**
 * Sentry Error Tracking Integration
 * 
 * Initializes Sentry (or compatible third-party like GlitchTip) for error tracking.
 * Only active when SENTRY_DSN environment variable is set.
 * 
 * Environment Variables:
 - SENTRY_DSN - Sentry DSN (required)
 - SENTRY_URL - Custom Sentry URL for third-party compatibility (optional)
 - SENTRY_ENVIRONMENT - Environment tag (defaults to NODE_ENV)
 - SENTRY_RELEASE - Release version (optional)
 - SENTRY_TRACES_SAMPLE_RATE - Performance monitoring sample rate (0-1, default: 0.1)
 - SENTRY_PROFILES_SAMPLE_RATE - Profiling sample rate (0-1, default: 0.1)
 */

import * as Sentry from '@sentry/react';
import type { BrowserOptions } from '@sentry/react';

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return !!process.env.SENTRY_DSN;
}

/**
 * Get Sentry configuration for initialization
 */
function getSentryConfig(): BrowserOptions | null {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    return null;
  }

  const config: BrowserOptions = {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    
    // Performance Monitoring
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    
    // Profiling (if enabled)
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
    
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true',
    
    // Before send hook to filter/sanitize events
    beforeSend(event) {
      // Sanitize sensitive data
      if (event.request) {
        // Remove cookies
        delete event.request.cookies;
        // Remove authorization headers
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, string>;
          delete headers['authorization'];
          delete headers['cookie'];
          delete headers['x-api-key'];
        }
      }
      
      // Remove user email from events
      if (event.user?.email) {
        event.user.email = '[REDACTED]';
      }
      
      // Filter out specific errors that shouldn't be reported
      if (event.exception?.values) {
        const shouldIgnore = event.exception.values.some(
          (ex) =>
            ex.value?.includes('ResizeObserver loop limit exceeded') ||
            ex.value?.includes('Network request failed') ||
            ex.type === 'AbortError'
        );
        
        if (shouldIgnore) {
          return null;
        }
      }
      
      return event;
    },
  };

  return config;
}

/**
 * Initialize Sentry
 * Call this once at application startup
 */
export function initSentry(): void {
  if (!isSentryConfigured()) {
    console.log('[Sentry] Error tracking disabled (SENTRY_DSN not set)');
    return;
  }

  const config = getSentryConfig();
  if (!config) {
    return;
  }

  try {
    Sentry.init(config);
    console.log(`[Sentry] Error tracking enabled (${process.env.SENTRY_URL || 'default URL'})`);
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(userId: string, email?: string, extras?: Record<string, unknown>): void {
  if (!isSentryConfigured()) return;
  
  Sentry.setUser({
    id: userId,
    email: email ? '[REDACTED]' : undefined, // Don't send actual email
    ...extras,
  });
}

/**
 * Clear user context (call on logout)
 */
export function clearSentryUser(): void {
  if (!isSentryConfigured()) return;
  
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addSentryBreadcrumb(
  message: string,
  category?: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  if (!isSentryConfigured()) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
}

/**
 * Capture exception with additional context
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
  userId?: string
): void {
  if (!isSentryConfigured()) return;
  
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    if (userId) {
      scope.setUser({ id: userId });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
): void {
  if (!isSentryConfigured()) return;
  
  Sentry.captureMessage(message, level);
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.startInactiveSpan> | null {
  if (!isSentryConfigured()) return null;
  
  return Sentry.startInactiveSpan({ name, op });
}

/**
 * Get Sentry status for health checks
 */
export function getSentryStatus(): {
  enabled: boolean;
  dsn?: string;
  url?: string;
  environment?: string;
} {
  const enabled = isSentryConfigured();
  return {
    enabled,
    dsn: enabled ? '[CONFIGURED]' : undefined,
    url: process.env.SENTRY_URL,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  };
}

/**
 * Flush Sentry events (use before shutdown)
 */
export async function flushSentry(timeoutMs: number = 2000): Promise<boolean> {
  if (!isSentryConfigured()) return true;
  
  return Sentry.flush(timeoutMs);
}

export { Sentry };
export default Sentry;
