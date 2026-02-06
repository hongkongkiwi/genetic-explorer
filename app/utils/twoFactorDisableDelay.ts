/**
 * Two-Factor Disable Delay
 * 
 * Handles the delay period when disabling 2FA for security.
 */

import { getPendingDisableRequest } from './twoFactorStubs';

export function initTwoFactorDisableDelayTables(): void {
  console.log('2FA disable delay tables initialized');
}

interface LoginCheckResult {
  allowed: boolean;
  reason?: string;
  remainingTime?: number;
  effectiveAt?: string;
}

export function canUserLogin(userId: string): LoginCheckResult {
  const pendingRequest = getPendingDisableRequest(userId);
  
  if (pendingRequest) {
    const now = Date.now();
    const effectiveTime = new Date(pendingRequest.effectiveAt).getTime();
    
    if (now < effectiveTime) {
      return {
        allowed: false,
        reason: 'Two-factor authentication disable is pending. You cannot log in during this security period.',
        remainingTime: effectiveTime - now,
        effectiveAt: pendingRequest.effectiveAt,
      };
    }
  }
  
  return { allowed: true };
}

export function getFormattedRemainingTime(remainingTimeMs: number): string {
  const hours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
