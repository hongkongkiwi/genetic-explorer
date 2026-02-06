/**
 * Sentry Server-Side Error Tracking
 */

import * as Sentry from '@sentry/node';

// Sentry configuration
const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.APP_VERSION;

let isInitialized = false;

/**
 * Initialize Sentry for server-side error tracking
 */
export function initSentryServer(): void {
  if (isInitialized) return;
  if (!SENTRY_DSN) {
    console.log('[Sentry Server] No DSN provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    release: APP_VERSION,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.httpIntegration(),
    ],
    beforeSend(event) {
      // Sanitize PII
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.cookie;
      }
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });

  isInitialized = true;
  console.log('[Sentry Server] Initialized');
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>): string {
  if (!isInitialized) {
    console.error('[Sentry Server] Exception:', error, context);
    return 'not-initialized';
  }
  return Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): string {
  if (!isInitialized) {
    console.log(`[Sentry Server ${level}]`, message);
    return 'not-initialized';
  }
  return Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!isInitialized) return;
  
  if (user) {
    Sentry.setUser({ id: user.id });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Clear user context
 */
export function clearSentryUser(): void {
  if (!isInitialized) return;
  Sentry.setUser(null);
}

/**
 * Add a breadcrumb
 */
export function addSentryBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
}): void {
  if (!isInitialized) return;
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a transaction
 * Note: In newer Sentry SDK versions, use startInactiveSpan or startSpan
 */
export function startTransaction(context: { name: string; op?: string }): {
  finish: () => void;
  startChild: (ctx: { op: string; description: string }) => { finish: () => void };
} {
  if (!isInitialized) {
    return {
      finish: () => {},
      startChild: () => ({ finish: () => {} }),
    };
  }

  // Sentry v8+ uses different APIs - this is a simplified stub
  return {
    finish: () => {},
    startChild: () => ({ finish: () => {} }),
  };
}

/**
 * Log server error
 */
export function logServerError(error: Error, context?: Record<string, unknown>): void {
  console.error('[Server Error]', error, context);
  captureException(error, context);
}

/**
 * Log server message
 */
export function logServerMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  console.log(`[Server ${level}]`, message);
  captureMessage(message, level);
}

/**
 * Flush Sentry events
 */
export async function flushSentry(timeout?: number): Promise<void> {
  if (!isInitialized) return;
  await Sentry.flush(timeout);
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return isInitialized;
}

// Re-export Sentry
export { Sentry as SentryNode };
