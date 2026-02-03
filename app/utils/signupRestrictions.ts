/**
 * Signup Restrictions Configuration
 *
 * This module provides environment-based controls for signup behavior.
 * All settings default to false (permissive) and can be enabled to restrict signup.
 */

// ============================================================================
// Environment Variable Names (for documentation)
// ============================================================================

export const SIGNUP_ENV_VARS = {
  // Disable password-based signup (users can only use OAuth)
  DISABLE_PASSWORD_SIGNUP: 'DISABLE_PASSWORD_SIGNUP',

  // Disable all signup (no new accounts can be created)
  DISABLE_SIGNUP: 'DISABLE_SIGNUP',

  // Comma-separated list of allowed email domains (e.g., "company.com,edu.org")
  ALLOWED_EMAIL_DOMAINS: 'ALLOWED_EMAIL_DOMAINS',

  // Block list of email domains (e.g., "tempmail.com,throwaway.org")
  BLOCKED_EMAIL_DOMAINS: 'BLOCKED_EMAIL_DOMAINS',

  // Require email verification before account activation
  REQUIRE_EMAIL_VERIFICATION: 'REQUIRE_EMAIL_VERIFICATION',

  // Maximum number of signups per IP per day (0 = unlimited)
  SIGNUP_RATE_LIMIT_PER_IP: 'SIGNUP_RATE_LIMIT_PER_IP',

  // Require admin approval for new signups (approval token required)
  REQUIRE_ADMIN_APPROVAL: 'REQUIRE_ADMIN_APPROVAL',

  // Invite-only mode (require valid invite token)
  INVITE_ONLY: 'INVITE_ONLY',

  // Allow specific email patterns (regex) - advanced
  ALLOWED_EMAIL_PATTERNS: 'ALLOWED_EMAIL_PATTERNS',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse comma-separated environment variable into array
 */
function parseEnvArray(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}

/**
 * Get environment variable as boolean (true if set to 'true', '1', 'yes')
 */
function getEnvBoolean(key: string): boolean {
  const value = process.env[key];
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get environment variable as integer
 */
function getEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ============================================================================
// Configuration Getters
// ============================================================================

export interface SignupConfig {
  /** Disable password-based signup */
  disablePasswordSignup: boolean;
  /** Disable all signup */
  disableSignup: boolean;
  /** List of allowed email domains (empty = all allowed) */
  allowedEmailDomains: string[];
  /** List of blocked email domains */
  blockedEmailDomains: string[];
  /** Require email verification */
  requireEmailVerification: boolean;
  /** Signup rate limit per IP per day (0 = unlimited) */
  signupRateLimitPerIp: number;
  /** Require admin approval */
  requireAdminApproval: boolean;
  /** Invite-only mode */
  inviteOnly: boolean;
  /** Allowed email patterns (regex) */
  allowedEmailPatterns: RegExp[];
}

let cachedConfig: SignupConfig | null = null;

/**
 * Get current signup configuration (cached for performance)
 */
export function getSignupConfig(): SignupConfig {
  if (cachedConfig) return cachedConfig;

  const allowedPatterns = parseEnvArray(process.env[SIGNUP_ENV_VARS.ALLOWED_EMAIL_PATTERNS] || '');

  cachedConfig = {
    disablePasswordSignup: getEnvBoolean(SIGNUP_ENV_VARS.DISABLE_PASSWORD_SIGNUP),
    disableSignup: getEnvBoolean(SIGNUP_ENV_VARS.DISABLE_SIGNUP),
    allowedEmailDomains: parseEnvArray(process.env[SIGNUP_ENV_VARS.ALLOWED_EMAIL_DOMAINS]),
    blockedEmailDomains: parseEnvArray(process.env[SIGNUP_ENV_VARS.BLOCKED_EMAIL_DOMAINS]),
    requireEmailVerification: getEnvBoolean(SIGNUP_ENV_VARS.REQUIRE_EMAIL_VERIFICATION),
    signupRateLimitPerIp: getEnvInt(SIGNUP_ENV_VARS.SIGNUP_RATE_LIMIT_PER_IP, 0),
    requireAdminApproval: getEnvBoolean(SIGNUP_ENV_VARS.REQUIRE_ADMIN_APPROVAL),
    inviteOnly: getEnvBoolean(SIGNUP_ENV_VARS.INVITE_ONLY),
    allowedEmailPatterns: allowedPatterns.map((p) => new RegExp(p, 'i')),
  };

  return cachedConfig;
}

/**
 * Clear config cache (useful for testing)
 */
export function clearSignupConfigCache(): void {
  cachedConfig = null;
}

// ============================================================================
// Validation Functions
// ============================================================================

export interface SignupValidationResult {
  allowed: boolean;
  reason?: string;
  errorCode?: string;
}

/**
 * Validate if signup is allowed
 */
export function canSignUp(): SignupValidationResult {
  const config = getSignupConfig();

  if (config.disableSignup) {
    return {
      allowed: false,
      reason: 'New account registration is currently disabled.',
      errorCode: 'SIGNUP_DISABLED',
    };
  }

  return { allowed: true };
}

/**
 * Validate email against signup restrictions
 */
export function validateSignupEmail(email: string): SignupValidationResult {
  const config = getSignupConfig();
  const normalizedEmail = email.toLowerCase().trim();
  const domain = normalizedEmail.split('@')[1];

  if (!domain) {
    return {
      allowed: false,
      reason: 'Invalid email address',
      errorCode: 'INVALID_EMAIL',
    };
  }

  // Check if signup is completely disabled
  if (config.disableSignup) {
    return {
      allowed: false,
      reason: 'New account registration is currently disabled.',
      errorCode: 'SIGNUP_DISABLED',
    };
  }

  // Check allowed domains (if configured)
  if (config.allowedEmailDomains.length > 0) {
    if (!config.allowedEmailDomains.includes(domain)) {
      return {
        allowed: false,
        reason: `Email domain '@${domain}' is not authorized for registration.`,
        errorCode: 'DOMAIN_NOT_ALLOWED',
      };
    }
  }

  // Check blocked domains
  if (config.blockedEmailDomains.includes(domain)) {
    return {
      allowed: false,
      reason: `Email domain '@${domain}' is not permitted.`,
      errorCode: 'DOMAIN_BLOCKED',
    };
  }

  // Check regex patterns
  for (const pattern of config.allowedEmailPatterns) {
    if (!pattern.test(normalizedEmail)) {
      return {
        allowed: false,
        reason: 'Email does not match the required pattern.',
        errorCode: 'EMAIL_PATTERN_MISMATCH',
      };
    }
  }

  return { allowed: true };
}

/**
 * Check if password signup is allowed
 */
export function canSignUpWithPassword(): SignupValidationResult {
  const config = getSignupConfig();

  if (config.disableSignup) {
    return {
      allowed: false,
      reason: 'New account registration is currently disabled.',
      errorCode: 'SIGNUP_DISABLED',
    };
  }

  if (config.disablePasswordSignup) {
    return {
      allowed: false,
      reason: 'Password-based signup is disabled. Please sign up with Google or GitHub.',
      errorCode: 'PASSWORD_SIGNUP_DISABLED',
    };
  }

  return { allowed: true };
}

/**
 * Check if OAuth signup is allowed (same restrictions apply)
 */
export function canSignUpWithOAuth(): SignupValidationResult {
  const config = getSignupConfig();

  if (config.disableSignup) {
    return {
      allowed: false,
      reason: 'New account registration is currently disabled.',
      errorCode: 'SIGNUP_DISABLED',
    };
  }

  return { allowed: true };
}

/**
 * Check if invite-only mode is active and validate token
 */
export function validateInviteToken(token: string): { valid: boolean; reason?: string } {
  const config = getSignupConfig();

  if (!config.inviteOnly) {
    return { valid: true };
  }

  // In invite-only mode, we would validate the token against stored invites
  // This is a placeholder - actual implementation would check against database
  if (!token || token.trim().length === 0) {
    return {
      valid: false,
      reason: 'This is an invite-only service. Please provide a valid invite token.',
    };
  }

  return { valid: true };
}

/**
 * Check if admin approval is required for new accounts
 */
export function isAdminApprovalRequired(): boolean {
  return getSignupConfig().requireAdminApproval;
}

/**
 * Get rate limit info for signup from an IP
 */
export function getSignupRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const config = getSignupConfig();

  if (config.signupRateLimitPerIp === 0) {
    return { allowed: true, remaining: -1, resetTime: 0 };
  }

  // In a production system, this would check against Redis/database
  // This is a placeholder for the rate limiting logic
  return {
    allowed: true,
    remaining: config.signupRateLimitPerIp,
    resetTime: Date.now() + 24 * 60 * 60 * 1000, // Reset after 24 hours
  };
}

// ============================================================================
// Configuration Helpers for UI
// ============================================================================

/**
 * Get configuration summary for admin UI
 */
export function getSignupConfigSummary(): {
  key: string;
  value: string | boolean | number;
  description: string;
}[] {
  const config = getSignupConfig();

  return [
    {
      key: SIGNUP_ENV_VARS.DISABLE_SIGNUP,
      value: config.disableSignup,
      description: 'Disable all new account registrations',
    },
    {
      key: SIGNUP_ENV_VARS.DISABLE_PASSWORD_SIGNUP,
      value: config.disablePasswordSignup,
      description: 'Disable password-based signup (OAuth only)',
    },
    {
      key: SIGNUP_ENV_VARS.ALLOWED_EMAIL_DOMAINS,
      value: config.allowedEmailDomains.length > 0
        ? config.allowedEmailDomains.join(', ')
        : false,
      description: 'Comma-separated list of allowed email domains',
    },
    {
      key: SIGNUP_ENV_VARS.BLOCKED_EMAIL_DOMAINS,
      value: config.blockedEmailDomains.length > 0
        ? config.blockedEmailDomains.join(', ')
        : false,
      description: 'Comma-separated list of blocked email domains',
    },
    {
      key: SIGNUP_ENV_VARS.INVITE_ONLY,
      value: config.inviteOnly,
      description: 'Require invite token for signup',
    },
    {
      key: SIGNUP_ENV_VARS.REQUIRE_EMAIL_VERIFICATION,
      value: config.requireEmailVerification,
      description: 'Require email verification before account activation',
    },
    {
      key: SIGNUP_ENV_VARS.SIGNUP_RATE_LIMIT_PER_IP,
      value: config.signupRateLimitPerIp || 'Unlimited',
      description: 'Max signups per IP per day',
    },
  ];
}

/**
 * Check if any restrictions are active
 */
export function hasActiveRestrictions(): boolean {
  const config = getSignupConfig();
  return (
    config.disableSignup ||
    config.disablePasswordSignup ||
    config.allowedEmailDomains.length > 0 ||
    config.blockedEmailDomains.length > 0 ||
    config.inviteOnly ||
    config.requireEmailVerification ||
    config.signupRateLimitPerIp > 0
  );
}
