/**
 * Sentry Error Tracking - Client Side
 */

import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

const defaultConfig: SentryConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION,
  tracesSampleRate: 0.1,
};

let isInitialized = false;

/**
 * Initialize Sentry for client-side error tracking
 */
export function initSentry(config: Partial<SentryConfig> = {}): void {
  if (isInitialized) return;
  if (typeof window === 'undefined') return; // Only run on client

  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.dsn) {
    console.log('[Sentry] No DSN provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: finalConfig.dsn,
    environment: finalConfig.environment,
    release: finalConfig.release,
    tracesSampleRate: finalConfig.tracesSampleRate,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    beforeSend(event) {
      // Don't send PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });

  isInitialized = true;
  console.log('[Sentry] Client initialized');
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>): string {
  if (!isInitialized) {
    console.error('[Sentry] Exception:', error, context);
    return 'not-initialized';
  }
  return Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): string {
  if (!isInitialized) {
    console.log(`[Sentry ${level}]`, message);
    return 'not-initialized';
  }
  return Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (!isInitialized) return;
  
  if (user) {
    Sentry.setUser({ id: user.id });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Set a tag
 */
export function setTag(key: string, value: string): void {
  if (!isInitialized) return;
  Sentry.setTag(key, value);
}

/**
 * Add a breadcrumb
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
}): void {
  if (!isInitialized) return;
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a transaction for performance monitoring
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
 * Get Sentry configuration
 */
export function getSentryConfig(): SentryConfig {
  return { ...defaultConfig };
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return !!defaultConfig.dsn;
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return isInitialized;
}

/**
 * Close Sentry and flush events
 */
export async function closeSentry(): Promise<void> {
  if (!isInitialized) return;
  await Sentry.close();
  isInitialized = false;
}

/**
 * Flush Sentry events
 */
export async function flushSentry(timeout?: number): Promise<void> {
  if (!isInitialized) return;
  await Sentry.flush(timeout);
}

// Re-export Sentry types
export { Sentry };
