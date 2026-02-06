/**
 * Two-Factor Authentication Utilities
 * 
 * Re-exports from the auth module for convenience.
 */

export {
  generateBackupCodes,
  hashBackupCode,
  generateTOTPSecret,
  generateTOTPUri,
  verifyTOTP,
  generateEmailCode,
  storeEmailCode,
  verifyEmailCode,
  cleanupExpiredEmailCodes,
  generate2FAPendingToken,
  createPending2FASession,
  getPending2FASession,
  deletePending2FASession,
  cleanupExpired2FASessions,
} from '~/auth/two-factor';

export type {
  Pending2FASession,
} from '~/auth/two-factor';

// Aliases for backward compatibility
export { generateTOTPSecret as generateTotpSecret } from '~/auth/two-factor';
export { generateTOTPUri as getTotpUri } from '~/auth/two-factor';
export { verifyTOTP as verifyTotpCode } from '~/auth/two-factor';

// Re-export stub functions for 2FA functionality not yet implemented
export {
  isDelayRequiredForMethod,
  getPendingDisableRequest,
  createDisable2FARequest,
  cancelDisableRequest,
  terminateAllUserSessions,
  sendSecurityNotification,
  verifyPasskeyRegistration,
  savePasskeyChallenge,
  getPasskeyRegistrationOptions,
  getPasskeyAuthenticationOptions,
} from './twoFactorStubs';

// Additional stub functions for 2FA verification
import { logActivity } from '~/db';

interface BackupCodeResult {
  valid: boolean;
  remainingCodes?: number;
}

/**
 * Verify a backup code for a user
 * Stub implementation - in production this would check hashed codes in database
 */
export async function verifyBackupCode(userId: string, code: string): Promise<BackupCodeResult> {
  // This is a stub implementation
  // In production, this would:
  // 1. Get the stored backup codes for the user
  // 2. Hash the provided code and compare
  // 3. If valid, remove the used code
  // 4. Return remaining code count
  // Backup code verification attempt logged via activity system
  
  // Stub: always return invalid
  return { valid: false };
}

/**
 * Check if 2FA is required for a specific action
 * Stub implementation - can be configured based on security requirements
 */
export function is2faRequiredForAction(action: string): boolean {
  // These actions require 2FA verification
  const actionsRequiring2FA = ['export', 'delete_account', 'change_email', 'change_password'];
  return actionsRequiring2FA.includes(action);
}
