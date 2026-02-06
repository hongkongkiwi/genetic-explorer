/**
 * Signup Restrictions
 * 
 * Re-exports from the identity module.
 */

export {
  SIGNUP_ENV_VARS,
  getSignupConfig,
  clearSignupConfigCache,
  canSignUp,
  validateSignupEmail,
  canSignUpWithPassword,
  canSignUpWithOAuth,
  validateInviteToken,
  isAdminApprovalRequired,
  getSignupRateLimit,
  getSignupConfigSummary,
  hasActiveRestrictions,
} from './identity/signup-restrictions';

export type {
  SignupConfig,
  SignupValidationResult,
} from './identity/signup-restrictions';
