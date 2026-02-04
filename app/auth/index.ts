/**
 * Authentication Module
 */

// Core auth functions
export {
  registerUser,
  loginUser,
  validateSession,
  logoutUser,
  getCurrentUser,
  generatePasswordResetToken,
  changePassword,
  getAuthUser,
  requireAuth,
  getAuthUserSafe,
  type AuthResult,
  type RegisterData,
  type LoginData,
} from './auth-core';

// OAuth
export {
  isOAuthProviderConfigured,
  getConfiguredProviders,
  generateOAuthState,
  getOAuthAuthorizationUrl,
  validateOAuthState,
  getOAuthStateData,
  consumeOAuthState,
  cleanupExpiredOAuthState,
  exchangeCodeForTokens,
  getOAuthUserInfo,
  OAuthError,
  handleOAuthError,
  type OAuthProvider,
  type OAuthStateData,
} from './oauth';

// Two-Factor Authentication
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
  type Pending2FASession,
} from './two-factor';

// Magic Links
export {
  generateMagicLinkToken,
  storeMagicLinkToken,
  verifyMagicLinkToken,
  deleteMagicLinkToken,
  cleanupExpiredMagicLinks,
  getMagicLinkStats,
} from './magic-link';
