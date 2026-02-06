/**
 * Security Notifications
 * 
 * Stub implementations for security notifications.
 */

import { logActivity } from '~/db';
import { logInfo } from './logger';

export function sendSecurityNotification(
  userId: string,
  type: string,
  details: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): void {
  logActivity(
    userId,
    `security_notification_${type}`,
    'user',
    userId,
    { ...details, userAgent },
    ipAddress
  );
  
  logInfo(`Security notification sent to ${userId}: ${type}`);
}

// Device tracking
const userDevices = new Map<string, Array<{ userAgent: string; ip: string; firstSeen: Date }>>();

export function isNewDevice(userId: string, userAgent: string, ipAddress: string): boolean {
  const devices = userDevices.get(userId) || [];
  
  const existingDevice = devices.find(
    d => d.userAgent === userAgent && d.ip === ipAddress
  );
  
  if (!existingDevice) {
    devices.push({
      userAgent,
      ip: ipAddress,
      firstSeen: new Date(),
    });
    userDevices.set(userId, devices);
    return true;
  }
  
  return false;
}
