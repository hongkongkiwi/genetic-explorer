/**
 * Sentry Server-Side Integration
 * 
 * For use in API routes and server-side rendering.
 * Compatible with Sentry and third-party Sentry-compatible services.
 */

import * as SentryNode from '@sentry/node';
import type { NodeOptions } from '@sentry/node';
import { logInfo, logError } from './logger';

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return !!process.env.SENTRY_DSN;
}

/**
 * Get Sentry configuration for Node.js
 */
function getSentryServerConfig(): NodeOptions | null {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    return null;
  }

  const config: NodeOptions = {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    
    // Performance Monitoring
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    
    // Profiles Sample Rate
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
    
    // Debug mode
    debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true',
    
    // Integrations
    integrations: [
      SentryNode.httpIntegration(),
    ],
    
    // Before send hook
    beforeSend(event) {
      // Sanitize sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, string>;
          delete headers['authorization'];
          delete headers['cookie'];
          delete headers['x-api-key'];
          delete headers['x-api-secret'];
        }
      }
      
      // Redact user email
      if (event.user?.email) {
        event.user.email = '[REDACTED]';
      }
      
      return event;
    },
    
    // Server name (don't expose actual hostname)
    serverName: 'genetic-explorer-server',
  };

  return config;
}

/**
 * Initialize Sentry for server-side
 */
export function initSentryServer(): void {
  if (!isSentryConfigured()) {
    logInfo('[Sentry Server] Error tracking disabled (SENTRY_DSN not set)');
    return;
  }

  const config = getSentryServerConfig();
  if (!config) {
    return;
  }

  try {
    SentryNode.init(config);
    logInfo(`[Sentry Server] Error tracking enabled (${process.env.SENTRY_URL || 'default URL'})`);
  } catch (error) {
    logError('[Sentry Server] Failed to initialize:', error instanceof Error ? error : undefined);
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(userId: string, extras?: Record<string, unknown>): void {
  if (!isSentryConfigured()) return;
  
  SentryNode.setUser({
    id: userId,
    ...extras,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser(): void {
  if (!isSentryConfigured()) return;
  
  SentryNode.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addSentryBreadcrumb(
  message: string,
  category?: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  if (!isSentryConfigured()) return;
  
  SentryNode.addBreadcrumb({
    message,
    category,
    level,
  });
}

/**
 * Capture exception
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
  userId?: string
): void {
  if (!isSentryConfigured()) return;
  
  SentryNode.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    if (userId) {
      scope.setUser({ id: userId });
    }
    SentryNode.captureException(error);
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
  
  SentryNode.captureMessage(message, level);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof SentryNode.startInactiveSpan> | null {
  if (!isSentryConfigured()) return null;
  
  return SentryNode.startInactiveSpan({ name, op });
}

/**
 * Flush Sentry events
 */
export async function flushSentry(timeoutMs: number = 2000): Promise<boolean> {
  if (!isSentryConfigured()) return true;
  
  return SentryNode.flush(timeoutMs);
}

export { SentryNode };
export default SentryNode;
