/**
 * Security Notifications
 * 
 * Sends email notifications to users for security-related events
 */

import { sendEmail } from './email';
import { getUserById } from './database';
import { 
  shouldSendNotification,
  type NotificationCategory,
  EVENT_CATEGORIES 
} from './notificationPreferences';

interface SecurityEvent {
  userId: string;
  eventType: SecurityEventType;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

type SecurityEventType = 
  | 'login_new_device'
  | 'login_suspicious'
  | 'password_changed'
  | 'email_changed'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_disabled_with_delay'
  | 'backup_codes_regenerated'
  | 'session_terminated'
  | 'all_sessions_terminated'
  | 'account_locked'
  | 'password_reset_requested'
  | 'password_reset_completed';

const EVENT_NAMES: Record<SecurityEventType, string> = {
  login_new_device: 'New Device Login',
  login_suspicious: 'Suspicious Login Attempt',
  password_changed: 'Password Changed',
  email_changed: 'Email Address Changed',
  '2fa_enabled': 'Two-Factor Authentication Enabled',
  '2fa_disabled': 'Two-Factor Authentication Disabled',
  '2fa_disabled_with_delay': 'Two-Factor Authentication Disabled (24hr Delay Active)',
  backup_codes_regenerated: 'Backup Codes Regenerated',
  session_terminated: 'Session Terminated',
  all_sessions_terminated: 'All Sessions Terminated',
  account_locked: 'Account Temporarily Locked',
  password_reset_requested: 'Password Reset Requested',
  password_reset_completed: 'Password Reset Completed',
};

/**
 * Send security notification email
 * Respects user notification preferences
 */
export async function sendSecurityNotification(
  userId: string,
  eventType: SecurityEventType,
  details: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const user = getUserById(userId);
    if (!user) {
      console.error('User not found for security notification:', userId);
      return;
    }

    // Don't send if user has no email
    if (!user.email) {
      return;
    }

    // Check user preferences
    const notificationCheck = shouldSendNotification(userId, eventType, 'email');
    
    if (!notificationCheck.shouldSend) {
      console.log(`Notification skipped for ${eventType}: ${notificationCheck.reason}`);
      return;
    }

    const eventName = EVENT_NAMES[eventType];
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    });

    // Build email content based on event type
    const emailContent = buildSecurityEmail(eventType, {
      ...details,
      timestamp,
      ipAddress,
      userAgent,
      userName: user.displayName || user.email,
    });

    await sendEmail({
      to: user.email,
      subject: `🔐 Security Alert: ${eventName}`,
      html: emailContent,
    });

    console.log(`Security notification sent: ${eventType} to ${user.email}`);
  } catch (error) {
    console.error('Failed to send security notification:', error);
    // Don't throw - security notifications should not break the main flow
  }
}

/**
 * Build HTML email content for security events
 */
function buildSecurityEmail(
  eventType: SecurityEventType,
  data: Record<string, any>
): string {
  const { timestamp, ipAddress, userAgent, userName } = data;
  
  const deviceInfo = userAgent ? parseUserAgent(userAgent) : null;
  const deviceStr = deviceInfo ? `${deviceInfo.browser} on ${deviceInfo.os}` : 'Unknown device';
  
  let specificContent = '';
  let actionRequired = '';
  
  switch (eventType) {
    case 'login_new_device':
      specificContent = `
        <p>A new device just logged into your Genetic Explorer account:</p>
        <ul>
          <li><strong>Device:</strong> ${deviceStr}</li>
          <li><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</li>
          <li><strong>Time:</strong> ${timestamp}</li>
        </ul>
      `;
      actionRequired = `
        <p style="color: #dc2626;"><strong>If this wasn't you:</strong></p>
        <ol>
          <li>Change your password immediately</li>
          <li>Enable two-factor authentication if not already enabled</li>
          <li>Review and terminate any suspicious sessions</li>
        </ol>
      `;
      break;
      
    case 'login_suspicious':
      specificContent = `
        <p>We detected a suspicious login attempt on your account:</p>
        <ul>
          <li><strong>Device:</strong> ${deviceStr}</li>
          <li><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</li>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Reason:</strong> ${data.reason || 'Unusual activity detected'}</li>
        </ul>
      `;
      actionRequired = `
        <p style="color: #dc2626;"><strong>If this wasn't you:</strong></p>
        <ol>
          <li>Change your password immediately</li>
          <li>Check your account activity</li>
          <li>Contact support if you need assistance</li>
        </ol>
      `;
      break;
      
    case 'password_changed':
      specificContent = `
        <p>Your password was successfully changed.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
      `;
      actionRequired = `
        <p style="color: #dc2626;"><strong>If you didn't make this change:</strong></p>
        <ol>
          <li><a href="${getBaseUrl()}/forgot-password">Reset your password immediately</a></li>
          <li>Contact our support team</li>
        </ol>
      `;
      break;
      
    case '2fa_enabled':
      specificContent = `
        <p>Two-factor authentication has been enabled on your account.</p>
        <ul>
          <li><strong>Method:</strong> ${data.method || 'TOTP'}</li>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
        <p>Your account is now more secure. You'll need to provide a second factor when logging in.</p>
      `;
      break;
      
    case '2fa_disabled':
      specificContent = `
        <p style="color: #dc2626;">Two-factor authentication has been disabled on your account.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
        <p><strong>Your account is less secure.</strong> We strongly recommend re-enabling 2FA.</p>
      `;
      actionRequired = `
        <p style="color: #dc2626;"><strong>If you didn't make this change:</strong></p>
        <ol>
          <li>Change your password immediately</li>
          <li>Re-enable two-factor authentication</li>
          <li>Review your account security settings</li>
        </ol>
      `;
      break;
      
    case '2fa_disabled_with_delay':
      const availableAt = data.availableAt ? new Date(data.availableAt).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long',
      }) : 'in 24 hours';
      
      specificContent = `
        <p>Two-factor authentication has been disabled on your account via email verification.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0;">
          <p style="margin: 0;"><strong>⚠️ Security Delay Active</strong></p>
          <p style="margin: 8px 0 0 0;">For your protection, you will not be able to log in until <strong>${availableAt}</strong>.</p>
        </div>
      `;
      actionRequired = `
        <p><strong>If you didn't make this change:</strong></p>
        <ol>
          <li>Contact our support team immediately</li>
          <li>We can help secure your account</li>
        </ol>
      `;
      break;
      
    case 'backup_codes_regenerated':
      specificContent = `
        <p>Your two-factor authentication backup codes have been regenerated.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
        <p><strong>Your old backup codes are no longer valid.</strong> Make sure to save your new codes in a safe place.</p>
      `;
      break;
      
    case 'session_terminated':
      specificContent = `
        <p>A session was terminated on your account.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${data.device || deviceStr}</li>
        </ul>
      `;
      break;
      
    case 'all_sessions_terminated':
      specificContent = `
        <p><strong>All sessions were terminated on your account.</strong></p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
        <p>You will need to log in again on all devices.</p>
      `;
      break;
      
    case 'password_reset_requested':
      specificContent = `
        <p>A password reset was requested for your account.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
      `;
      actionRequired = `
        <p style="color: #dc2626;"><strong>If you didn't request this:</strong></p>
        <p>You can safely ignore this email. The reset link will expire in 1 hour.</p>
      `;
      break;
      
    case 'password_reset_completed':
      specificContent = `
        <p>Your password was successfully reset.</p>
        <ul>
          <li><strong>Time:</strong> ${timestamp}</li>
          <li><strong>Device:</strong> ${deviceStr}</li>
        </ul>
      `;
      actionRequired = `
        <p style="color: #dc2626;"><strong>If you didn't make this change:</strong></p>
        <ol>
          <li>Contact our support team immediately</li>
        </ol>
      `;
      break;
      
    default:
      specificContent = `<p>A security event occurred on your account at ${timestamp}.</p>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Security Alert</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hello ${userName},</p>
        
        ${specificContent}
        
        ${actionRequired}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #64748b;">
            <strong>Need help?</strong><br>
            Contact our support team at <a href="mailto:support@geneticexplorer.com">support@geneticexplorer.com</a>
          </p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 6px; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">
            This is an automated security notification from Genetic Explorer.<br>
            Account: ${userName}<br>
            Time: ${timestamp}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Parse user agent string to get browser and OS info
 */
function parseUserAgent(userAgent: string): { browser: string; os: string } | null {
  try {
    let browser = 'Unknown browser';
    let os = 'Unknown OS';

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('iPhone')) os = 'iPhone';
    else if (userAgent.includes('iPad')) os = 'iPad';
    else if (userAgent.includes('Android')) os = 'Android';

    return { browser, os };
  } catch {
    return null;
  }
}

/**
 * Get base URL for the application
 */
function getBaseUrl(): string {
  return process.env.PUBLIC_APP_URL || 'https://geneticexplorer.com';
}

/**
 * Check if a device is new (not seen before by this user)
 * This is a simplified implementation - in production you'd track known devices
 */
export function isNewDevice(userId: string, userAgent: string, ipAddress: string): boolean {
  // In a full implementation, this would check against a devices table
  // For now, we'll rely on session tracking and heuristics
  return false; // Placeholder - always return false for now
}
