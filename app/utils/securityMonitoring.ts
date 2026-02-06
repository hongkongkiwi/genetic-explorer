/**
 * Security Monitoring and Alerting
 * 
 * Tracks security events, detects anomalies, and alerts on suspicious activity.
 * Integrates with the activity logging system for audit trails.
 */

import { logActivity } from '~/db';

// Security event types
export type SecurityEventType =
  | 'suspicious_login'
  | 'brute_force_attempt'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'csrf_violation'
  | 'xss_attempt'
  | 'sql_injection_attempt'
  | 'rate_limit_exceeded'
  | 'unusual_access_pattern'
  | 'account_takeover_attempt';

// Severity levels
export type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  type: SecurityEventType;
  severity: Severity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

// Thresholds for anomaly detection
const THRESHOLDS = {
  // Failed login attempts
  failedLogins: {
    warning: 3,    // 3 failed attempts
    alert: 5,      // 5 failed attempts (suspicious)
    critical: 10,  // 10 failed attempts (brute force)
    windowMinutes: 15,
  },
  
  // Account access from new locations
  newLocation: {
    warning: 1,
    alert: 3,      // 3 new locations in short time
    windowHours: 24,
  },
  
  // Data access volume
  dataAccess: {
    warning: 1000,  // 1000 records
    alert: 10000,   // 10000 records
    critical: 50000, // 50000 records
    windowMinutes: 60,
  },
  
  // API rate anomalies
  apiRequests: {
    warning: 100,   // 100 requests per minute
    alert: 500,     // 500 requests per minute
    critical: 1000, // 1000 requests per minute
  },
};

// In-memory event buffer (for immediate pattern detection)
const eventBuffer: SecurityEvent[] = [];
const BUFFER_MAX_SIZE = 1000;
const BUFFER_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Record a security event
 */
export async function recordSecurityEvent(
  event: Omit<SecurityEvent, 'timestamp'>
): Promise<void> {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Add to buffer for pattern analysis
  eventBuffer.push(fullEvent);
  cleanupBuffer();

  // Log to database
  if (event.userId) {
    try {
      logActivity(
        event.userId,
        `security_${event.type}`,
        'security_event',
        undefined,
        { 
          message: event.details.message || `Security event: ${event.type}`,
          severity: event.severity,
          ...event.details 
        },
        event.ipAddress
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Check if we need to alert
  await checkForAnomalies(fullEvent);

  // Console output for critical events
  if (event.severity === 'critical') {
    console.error('🚨 CRITICAL SECURITY EVENT:', event);
  } else if (event.severity === 'high') {
    console.warn('⚠️  HIGH SEVERITY SECURITY EVENT:', event);
  }
}

/**
 * Clean up old events from buffer
 */
function cleanupBuffer(): void {
  const now = Date.now();
  const cutoff = now - BUFFER_TTL_MS;
  
  // Remove old events
  while (eventBuffer.length > 0 && eventBuffer[0].timestamp.getTime() < cutoff) {
    eventBuffer.shift();
  }
  
  // Limit buffer size
  while (eventBuffer.length > BUFFER_MAX_SIZE) {
    eventBuffer.shift();
  }
}

/**
 * Check for anomaly patterns
 */
async function checkForAnomalies(event: SecurityEvent): Promise<void> {
  // Get recent events for this user/IP
  const recentEvents = getRecentEvents(
    event.userId,
    event.ipAddress,
    THRESHOLDS.failedLogins.windowMinutes
  );

  switch (event.type) {
    case 'suspicious_login':
      await detectBruteForce(recentEvents, event);
      break;
    case 'rate_limit_exceeded':
      await detectRateAnomaly(recentEvents, event);
      break;
    case 'unusual_access_pattern':
      await detectAccessAnomaly(recentEvents, event);
      break;
  }
}

/**
 * Get recent events for a user or IP
 */
function getRecentEvents(
  userId?: string,
  ipAddress?: string,
  windowMinutes: number = 15
): SecurityEvent[] {
  const cutoff = Date.now() - (windowMinutes * 60 * 1000);
  
  return eventBuffer.filter(e => {
    if (e.timestamp.getTime() < cutoff) return false;
    if (userId && e.userId === userId) return true;
    if (ipAddress && e.ipAddress === ipAddress) return true;
    return false;
  });
}

/**
 * Detect brute force attacks
 */
async function detectBruteForce(
  recentEvents: SecurityEvent[],
  currentEvent: SecurityEvent
): Promise<void> {
  const failedLogins = recentEvents.filter(
    e => e.type === 'suspicious_login' || e.type === 'brute_force_attempt'
  );

  const count = failedLogins.length;
  const { warning, alert, critical } = THRESHOLDS.failedLogins;

  if (count >= critical) {
    await sendSecurityAlert({
      type: 'brute_force_attack',
      severity: 'critical',
      message: `Possible brute force attack detected: ${count} failed login attempts`,
      userId: currentEvent.userId,
      ipAddress: currentEvent.ipAddress,
      details: {
        attemptCount: count,
        timeWindow: `${THRESHOLDS.failedLogins.windowMinutes} minutes`,
      },
    });
  } else if (count >= alert) {
    await sendSecurityAlert({
      type: 'suspicious_login_pattern',
      severity: 'high',
      message: `Suspicious login pattern: ${count} failed attempts`,
      userId: currentEvent.userId,
      ipAddress: currentEvent.ipAddress,
      details: {
        attemptCount: count,
      },
    });
  }
}

/**
 * Detect rate limit anomalies
 */
async function detectRateAnomaly(
  recentEvents: SecurityEvent[],
  currentEvent: SecurityEvent
): Promise<void> {
  const rateLimitEvents = recentEvents.filter(
    e => e.type === 'rate_limit_exceeded'
  );

  if (rateLimitEvents.length >= 3) {
    await sendSecurityAlert({
      type: 'rate_limit_abuse',
      severity: 'high',
      message: `Multiple rate limit violations from same source`,
      userId: currentEvent.userId,
      ipAddress: currentEvent.ipAddress,
      details: {
        violationCount: rateLimitEvents.length,
      },
    });
  }
}

/**
 * Detect unusual access patterns
 */
async function detectAccessAnomaly(
  recentEvents: SecurityEvent[],
  currentEvent: SecurityEvent
): Promise<void> {
  // Check for rapid data access
  const dataAccessEvents = recentEvents.filter(
    e => e.type === 'unusual_access_pattern'
  );

  if (dataAccessEvents.length >= 5) {
    await sendSecurityAlert({
      type: 'data_exfiltration_suspected',
      severity: 'critical',
      message: 'Suspicious data access pattern detected - possible data exfiltration',
      userId: currentEvent.userId,
      ipAddress: currentEvent.ipAddress,
      details: {
        accessEventCount: dataAccessEvents.length,
      },
    });
  }
}

/**
 * Send security alert
 * In production, this would integrate with email, Slack, PagerDuty, etc.
 */
async function sendSecurityAlert(alert: {
  type: string;
  severity: Severity;
  message: string;
  userId?: string;
  ipAddress?: string;
  details: Record<string, any>;
}): Promise<void> {
  // Log alert to console
  console.error(`🚨 SECURITY ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`, {
    type: alert.type,
    userId: alert.userId,
    ipAddress: alert.ipAddress,
    details: alert.details,
    timestamp: new Date().toISOString(),
  });

  // Send to alerting service asynchronously
  import('~/security/alerting').then(({ alertManager }) => {
    alertManager.sendAlert(
      alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'high' : 'medium',
      'security_monitoring',
      alert.message,
      {
        type: alert.type,
        userId: alert.userId,
        ipAddress: alert.ipAddress,
        ...alert.details,
      }
    ).catch(err => console.error('Failed to send alert:', err));
  }).catch(() => {
    // Alerting module not available
  });
}

// ============================================================================
// Convenience functions for common security events
// ============================================================================

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(
  email: string,
  ipAddress?: string,
  userAgent?: string,
  reason?: string
): Promise<void> {
  await recordSecurityEvent({
    type: 'suspicious_login',
    severity: 'low',
    ipAddress,
    userAgent,
    details: {
      attemptedEmail: email,
      reason: reason || 'Invalid credentials',
    },
  });
}

/**
 * Record CSRF violation
 */
export async function recordCsrfViolation(
  ipAddress?: string,
  userAgent?: string,
  path?: string
): Promise<void> {
  await recordSecurityEvent({
    type: 'csrf_violation',
    severity: 'high',
    ipAddress,
    userAgent,
    details: {
      path: path || 'unknown',
    },
  });
}

/**
 * Record XSS attempt
 */
export async function recordXssAttempt(
  ipAddress?: string,
  userAgent?: string,
  payload?: string
): Promise<void> {
  await recordSecurityEvent({
    type: 'xss_attempt',
    severity: 'high',
    ipAddress,
    userAgent,
    details: {
      payload: payload?.substring(0, 1000), // Truncate large payloads
    },
  });
}

/**
 * Record SQL injection attempt
 */
export async function recordSqlInjectionAttempt(
  ipAddress?: string,
  userAgent?: string,
  query?: string
): Promise<void> {
  await recordSecurityEvent({
    type: 'sql_injection_attempt',
    severity: 'critical',
    ipAddress,
    userAgent,
    details: {
      query: query?.substring(0, 1000),
    },
  });
}

/**
 * Record rate limit exceeded
 */
export async function recordRateLimitExceeded(
  userId: string,
  ipAddress: string,
  endpoint: string,
  limit: number
): Promise<void> {
  await recordSecurityEvent({
    type: 'rate_limit_exceeded',
    severity: 'medium',
    userId,
    ipAddress,
    details: {
      endpoint,
      limit,
    },
  });
}

/**
 * Record unusual data access
 */
export async function recordUnusualAccess(
  userId: string,
  ipAddress: string,
  resource: string,
  count: number
): Promise<void> {
  await recordSecurityEvent({
    type: 'unusual_access_pattern',
    severity: 'medium',
    userId,
    ipAddress,
    details: {
      resource,
      count,
    },
  });
}

/**
 * Get security metrics
 */
export function getSecurityMetrics(): {
  totalEvents: number;
  eventsBySeverity: Record<Severity, number>;
  eventsByType: Record<string, number>;
  recentAlerts: SecurityEvent[];
} {
  cleanupBuffer();

  const eventsBySeverity: Record<Severity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  const eventsByType: Record<string, number> = {};

  for (const event of eventBuffer) {
    eventsBySeverity[event.severity]++;
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  }

  return {
    totalEvents: eventBuffer.length,
    eventsBySeverity,
    eventsByType,
    recentAlerts: eventBuffer
      .filter(e => e.severity === 'high' || e.severity === 'critical')
      .slice(-10),
  };
}

/**
 * Reset security event buffer (useful for testing)
 */
export function resetSecurityBuffer(): void {
  eventBuffer.length = 0;
}
