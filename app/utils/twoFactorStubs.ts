/**
 * Stub functions for 2FA functionality not yet implemented
 */

import { logActivity } from '~/db';
import { logInfo } from './logger';

interface DisableRequest {
  userId: string;
  method: string;
  requestedAt: string;
  effectiveAt: string;
  ipAddress: string | null | undefined;
  userAgent: string | null | undefined;
}

const pendingDisableRequests = new Map<string, DisableRequest>();

export function isDelayRequiredForMethod(method: string): boolean {
  return method === 'email';
}

export function getPendingDisableRequest(userId: string): DisableRequest | undefined {
  return pendingDisableRequests.get(userId);
}

export function createDisable2FARequest(
  userId: string,
  method: string,
  ipAddress: string | null | undefined,
  userAgent: string | null | undefined
): { success: boolean; request?: DisableRequest; error?: string } {
  const now = new Date();
  const effectiveAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const request: DisableRequest = {
    userId,
    method,
    requestedAt: now.toISOString(),
    effectiveAt: effectiveAt.toISOString(),
    ipAddress,
    userAgent,
  };

  pendingDisableRequests.set(userId, request);

  return { success: true, request };
}

export function cancelDisableRequest(userId: string): void {
  pendingDisableRequests.delete(userId);
}

export function terminateAllUserSessions(userId: string, reason: string): void {
  // This would terminate all sessions - stub implementation
  logInfo(`Terminating all sessions for user ${userId}: ${reason}`);
}

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
}

// Passkey stubs with proper signatures
export function getPasskeyRegistrationOptions(
  userId: string,
  email: string,
  displayName: string,
  existingCredentials: string[]
): { challenge: string; [key: string]: unknown } {
  return { 
    challenge: crypto.randomUUID(),
    userId,
    email,
    displayName,
    existingCredentials,
  };
}

export function savePasskeyChallenge(userId: string, challenge: string): void {
  // Stub implementation
  logInfo(`Saving passkey challenge for ${userId}: ${challenge}`);
}

export function verifyPasskeyRegistration(
  userId: string,
  credential: unknown
): { valid: boolean; error?: string } {
  return { valid: false, error: 'Passkey support not yet implemented' };
}

export function getPasskeyAuthenticationOptions(
  userId: string,
  credentialIds?: string[]
): { challenge: string; [key: string]: unknown } {
  return { 
    challenge: crypto.randomUUID(),
    userId,
    credentialIds,
  };
}
