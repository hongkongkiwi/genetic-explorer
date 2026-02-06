/**
 * Centralized Logging Utility
 * 
 * Uses Loglayer with:
 - Axiom transport (if AXIOM_TOKEN and AXIOM_DATASET are set)
 - Console transport (fallback, always enabled in development)
 * 
 * Environment Variables:
 - AXIOM_TOKEN - Axiom API token
 - AXIOM_DATASET - Axiom dataset name
 - AXIOM_URL - Custom Axiom URL for third-party compatibility (optional)
 - NODE_ENV - Set to 'production' to disable console logging when Axiom is configured
 */

import { LogLayer, type LogLayerConfig } from 'loglayer';
import { AxiomTransport, isAxiomConfigured } from '../axiomTransport';

// Simple console transport for LogLayer
class ConsoleTransport {
  id = 'console';
  
  log(level: string, message: string, metadata?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const meta = metadata ? ` ${JSON.stringify(metadata)}` : '';
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${meta}`);
  }
  
  trace(message: string, metadata?: Record<string, unknown>) { this.log('trace', message, metadata); }
  debug(message: string, metadata?: Record<string, unknown>) { this.log('debug', message, metadata); }
  info(message: string, metadata?: Record<string, unknown>) { this.log('info', message, metadata); }
  warn(message: string, metadata?: Record<string, unknown>) { this.log('warn', message, metadata); }
  error(message: string, metadata?: Record<string, unknown>) { this.log('error', message, metadata); }
  fatal(message: string, metadata?: Record<string, unknown>) { this.log('fatal', message, metadata); }
  
  // LogLayer transport interface methods
  shipToLogger(_log: any) { return { success: true }; }
}

// Initialize transports
const transports: (AxiomTransport | ConsoleTransport)[] = [];

// Add Axiom transport if configured
if (isAxiomConfigured()) {
  transports.push(new AxiomTransport());
}

// Always add console transport as fallback
transports.push(new ConsoleTransport());

// Build config - LogLayer requires at least one transport
const config: LogLayerConfig = {
  transport: transports.length === 1 ? transports[0] : transports as any,
};

/**
 * Main logger instance
 */
export const logger = new LogLayer(config);

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.withContext(context);
}

/**
 * Create a logger for a specific component/module
 */
export function createComponentLogger(component: string) {
  return logger.withContext({ component });
}

/**
 * Create a logger for a specific user session
 */
export function createSessionLogger(userId: string, sessionId?: string) {
  return logger.withContext({
    userId,
    sessionId,
  });
}

/**
 * Create a logger for API requests
 */
export function createRequestLogger(
  requestId: string,
  method: string,
  path: string,
  userId?: string
) {
  return logger.withContext({
    requestId,
    method,
    path,
    userId,
  });
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
) {
  logger
    .withContext({ eventType: 'security', severity })
    .warn(`Security Event: ${event}`);
  
  // Also log details if present
  if (Object.keys(details).length > 0) {
    logger.withContext({ eventType: 'security', severity, ...details }).debug('Security details');
  }
}

/**
 * Log an audit event (user actions, data access)
 */
export function logAuditEvent(
  action: string,
  userId: string,
  resource: string,
  details?: Record<string, unknown>
) {
  const log = logger.withContext({
    eventType: 'audit',
    userId,
    resource,
  });
  
  log.info(`Audit: ${action}`);
  
  if (details && Object.keys(details).length > 0) {
    log.withContext(details).debug('Audit details');
  }
}

/**
 * Log a performance metric
 */
export function logPerformanceMetric(
  metric: string,
  value: number,
  unit: string,
  context?: Record<string, unknown>
) {
  logger
    .withContext({
      eventType: 'performance',
      metric,
      value,
      unit,
      ...context,
    })
    .debug(`Performance: ${metric} = ${value}${unit}`);
}

/**
 * Log an error with full context
 */
export function logError(
  error: Error | string,
  context?: Record<string, unknown>,
  requestId?: string
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  logger
    .withContext({
      eventType: 'error',
      errorName: error instanceof Error ? error.name : 'Error',
      errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      requestId,
      ...context,
    })
    .error(errorMessage);
}

/**
 * Get logging configuration status
 */
export function getLoggingStatus(): {
  consoleEnabled: boolean;
  axiomEnabled: boolean;
  axiomDataset?: string;
  axiomUrl?: string;
} {
  return {
    consoleEnabled: true,
    axiomEnabled: isAxiomConfigured(),
    axiomDataset: process.env.AXIOM_DATASET,
    axiomUrl: process.env.AXIOM_URL,
  };
}

/**
 * Flush all logs (use before shutdown)
 */
export async function flushLogs(): Promise<void> {
  // Flush Axiom transports
  for (const transport of transports) {
    if ('shutdown' in transport && typeof (transport as any).shutdown === 'function') {
      await (transport as any).shutdown();
    }
  }
  
  // Ensure all async operations complete
  await new Promise((resolve) => setTimeout(resolve, 100));
}

export default logger;
