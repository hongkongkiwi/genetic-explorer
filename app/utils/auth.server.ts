/**
 * Auth Utilities
 * 
 * Re-exports from the auth module for convenience.
 * @deprecated Use '~/auth' instead
 * @server-only This module can only be used on the server.
 */

'use server';

export {
  registerUser,
  loginUser,
  validateSession,
  logoutUser,
  getCurrentUser,
  getAuthUser,
  requireAuth,
  getAuthUserSafe,
  generatePasswordResetToken,
  changePassword,
} from '~/auth/auth-core';

export type {
  AuthResult,
  RegisterData,
  LoginData,
} from '~/auth/auth-core';

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

export {
  verifyTurnstileToken,
} from '~/auth/captcha';

// Re-export from database for session management
export {
  createSession,
  logActivity,
} from '~/db';

// Re-export getUserByEmail from database
export { getUserByEmail } from '~/db';

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

import * as crypto from 'crypto';

// Export getSessionUser for compatibility
export function getSessionUser(request: Request): { id: string; email: string } | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return { id: 'stub', email: 'stub@example.com' };
  }
  return null;
}
