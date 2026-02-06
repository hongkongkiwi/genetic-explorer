/**
 * Monitoring Initialization
 * 
 * Initializes all monitoring and logging systems at application startup.
 * Call this function early in your application lifecycle.
 * 
 * Usage:
 *   import { initMonitoring } from '~/utils/initMonitoring';
 *   initMonitoring();
 */

import { initSentry, isSentryEnabled as isSentryConfigured } from './sentry';
import { initSentryServer } from './logging/sentry.server';

function isSentryConfiguredServer(): boolean {
  return !!process.env.SENTRY_DSN;
}
import { isAxiomConfigured, getAxiomStatus } from './axiomTransport';
import { getLoggingStatus, logger } from './logging';
import { logInfo } from './logger';

/**
 * Check if running on server
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Initialize all monitoring systems
 */
export function initMonitoring(): void {
  logInfo('[Monitoring] Initializing...');

  // Initialize Sentry
  if (isServer()) {
    initSentryServer();
  } else {
    initSentry({});
  }

  // Log initialization status
  const loggingStatus = getLoggingStatus();
  const sentryStatus = isServer() ? isSentryConfiguredServer() : isSentryConfigured();
  const axiomStatus = getAxiomStatus();

  logger.withContext({
    eventType: 'startup',
    monitoring: {
      console: loggingStatus.consoleEnabled,
      axiom: axiomStatus.enabled,
      axiomDataset: axiomStatus.dataset,
      sentry: sentryStatus,
    },
  }).info('Monitoring systems initialized');

  logInfo('[Monitoring] Status:', {
    console: loggingStatus.consoleEnabled ? 'enabled' : 'disabled',
    axiom: axiomStatus.enabled ? `enabled (${axiomStatus.dataset})` : 'disabled',
    sentry: sentryStatus ? 'enabled' : 'disabled',
  });
}

/**
 * Get complete monitoring status
 */
export function getMonitoringStatus(): {
  logging: ReturnType<typeof getLoggingStatus>;
  axiom: ReturnType<typeof getAxiomStatus>;
  sentry: { enabled: boolean };
} {
  return {
    logging: getLoggingStatus(),
    axiom: getAxiomStatus(),
    sentry: { enabled: isServer() ? isSentryConfiguredServer() : isSentryConfigured() },
  };
}

/**
 * Graceful shutdown of monitoring systems
 */
export async function shutdownMonitoring(): Promise<void> {
  logger.info('Shutting down monitoring systems...');

  // Flush logs
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Flush Sentry
  if (isServer()) {
    const { flushSentry } = await import('./logging/sentry.server');
    await flushSentry(5000);
  } else {
    const { flushSentry } = await import('./sentry');
    await flushSentry(5000);
  }

  logInfo('[Monitoring] Shutdown complete');
}

export default initMonitoring;
