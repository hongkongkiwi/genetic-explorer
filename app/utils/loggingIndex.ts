/**
 * Logging & Error Tracking Exports
 * 
 * Centralized exports for all logging and error tracking utilities.
 */

// Main logger
export {
  logger,
  createChildLogger,
  createComponentLogger,
  createSessionLogger,
  createRequestLogger,
  logSecurityEvent,
  logAuditEvent,
  logPerformanceMetric,
  logError,
  getLoggingStatus,
  flushLogs,
} from './logging';

// Axiom transport
export {
  AxiomTransport,
  isAxiomConfigured,
  getAxiomStatus,
} from './axiomTransport';

// Sentry client-side
export {
  initSentry,
  setSentryUser,
  clearSentryUser,
  addSentryBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  getSentryStatus,
  flushSentry,
  isSentryConfigured,
  Sentry,
} from './sentry';

// Sentry server-side
export {
  initSentryServer,
  setSentryUser as setSentryUserServer,
  clearSentryUser as clearSentryUserServer,
  addSentryBreadcrumb as addSentryBreadcrumbServer,
  captureException as captureExceptionServer,
  captureMessage as captureMessageServer,
  startTransaction as startTransactionServer,
  flushSentry as flushSentryServer,
  isSentryConfigured as isSentryConfiguredServer,
  SentryNode,
} from './sentry.server';

// Re-export for convenience
export { default as loggerDefault } from './logging';
export { default as SentryDefault } from './sentry';
