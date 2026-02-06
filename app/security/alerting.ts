/**
 * Security Alerting Service
 * 
 * Provides security event monitoring and alerting capabilities.
 * Supports multiple alert channels: console, email, webhooks.
 */

import { env } from '~/utils/shared/env';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AlertChannel {
  name: string;
  send(alert: SecurityAlert): Promise<void>;
}

/**
 * Console alert channel for development
 */
class ConsoleAlertChannel implements AlertChannel {
  name = 'console';

  async send(alert: SecurityAlert): Promise<void> {
    const icon = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    }[alert.severity];

    console.log(
      `${icon} [SECURITY ${alert.severity.toUpperCase()}] ${alert.category}: ${alert.message}`,
      {
        id: alert.id,
        timestamp: alert.timestamp,
        userId: alert.userId,
        ipAddress: alert.ipAddress,
        details: alert.details,
      }
    );
  }
}

/**
 * Email alert channel for production
 */
class EmailAlertChannel implements AlertChannel {
  name = 'email';
  private to: string;

  constructor(to: string) {
    this.to = to;
  }

  async send(alert: SecurityAlert): Promise<void> {
    // In production, integrate with your email service
    // Example: await sendEmail({ to: this.to, subject, html });
    
    if (env.NODE_ENV === 'development') {
      console.log(`[Email Alert] Would send to ${this.to}:`, alert);
    }
  }
}

/**
 * Webhook alert channel for integrations
 */
class WebhookAlertChannel implements AlertChannel {
  name = 'webhook';
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async send(alert: SecurityAlert): Promise<void> {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }
}

/**
 * Alert manager that coordinates multiple channels
 */
class AlertManager {
  private channels: Map<string, AlertChannel> = new Map();
  private alertHistory: SecurityAlert[] = [];
  private readonly maxHistorySize = 1000;

  constructor() {
    // Always add console channel
    this.addChannel(new ConsoleAlertChannel());

    // Add email channel if configured
    if (env.SUPPORT_EMAIL) {
      this.addChannel(new EmailAlertChannel(env.SUPPORT_EMAIL));
    }
  }

  addChannel(channel: AlertChannel): void {
    this.channels.set(channel.name, channel);
  }

  removeChannel(name: string): void {
    this.channels.delete(name);
  }

  async sendAlert(
    severity: AlertSeverity,
    category: string,
    message: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const alert: SecurityAlert = {
      id: generateAlertId(),
      timestamp: new Date(),
      severity,
      category,
      message,
      details,
    };

    // Store in history
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift();
    }

    // Send to all channels
    const promises = Array.from(this.channels.values()).map((channel) =>
      channel.send(alert).catch((error) => {
        console.error(`Failed to send alert to ${channel.name}:`, error);
      })
    );

    await Promise.all(promises);
  }

  getAlertHistory(
    severity?: AlertSeverity,
    limit: number = 100
  ): SecurityAlert[] {
    let alerts = this.alertHistory;

    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity);
    }

    return alerts.slice(-limit);
  }

  clearHistory(): void {
    this.alertHistory = [];
  }
}

/**
 * Generate unique alert ID
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Global alert manager instance
export const alertManager = new AlertManager();

/**
 * Convenience functions for common alert types
 */

export async function alertBruteForceAttempt(
  ipAddress: string,
  attempts: number,
  userId?: string
): Promise<void> {
  await alertManager.sendAlert(
    'high',
    'brute_force',
    `Possible brute force attack detected from ${ipAddress}`,
    { attempts, ipAddress, userId }
  );
}

export async function alertSuspiciousActivity(
  userId: string,
  activity: string,
  ipAddress?: string
): Promise<void> {
  await alertManager.sendAlert(
    'medium',
    'suspicious_activity',
    `Suspicious activity detected for user ${userId}`,
    { activity, ipAddress, userId }
  );
}

export async function alertDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<void> {
  await alertManager.sendAlert(
    'low',
    'data_access',
    `Data access: ${action} ${resourceType}`,
    { userId, resourceType, resourceId, action }
  );
}

export async function alertSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: AlertSeverity = 'medium'
): Promise<void> {
  await alertManager.sendAlert(severity, 'security_event', event, details);
}

export async function alertUnauthorizedAccess(
  userId: string,
  resource: string,
  ipAddress?: string
): Promise<void> {
  await alertManager.sendAlert(
    'high',
    'unauthorized_access',
    `Unauthorized access attempt to ${resource}`,
    { userId, resource, ipAddress }
  );
}

export async function alertSystemError(
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  await alertManager.sendAlert(
    'critical',
    'system_error',
    `System error: ${error.message}`,
    { error: error.message, stack: error.stack, ...context }
  );
}
