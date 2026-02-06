/**
 * Terms and Conditions Utilities
 */

// Track terms acceptance (in production, this would be in the database)
const userTermsAccepted = new Map<string, string>(); // userId -> version accepted
const CURRENT_TERMS_VERSION = '2024-01-01';

export function userRequiresTermsAcceptance(userId: string): boolean {
  const acceptedVersion = userTermsAccepted.get(userId);
  return acceptedVersion !== CURRENT_TERMS_VERSION;
}

export function getUserTermsStatus(userId: string): {
  accepted: boolean;
  acceptedVersion: string | null;
  currentVersion: string;
  requiresAcceptance: boolean;
} {
  const acceptedVersion = userTermsAccepted.get(userId) || null;
  return {
    accepted: acceptedVersion === CURRENT_TERMS_VERSION,
    acceptedVersion,
    currentVersion: CURRENT_TERMS_VERSION,
    requiresAcceptance: acceptedVersion !== CURRENT_TERMS_VERSION,
  };
}

export function initTermsTables(): void {
  console.log('Terms tables initialized');
}

export function getTermsAndPrivacy(): {
  termsVersion: string;
  privacyVersion: string;
  termsContent: string;
  privacyContent: string;
  lastUpdated: string;
} {
  return {
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_TERMS_VERSION,
    termsContent: 'Terms of Service content...',
    privacyContent: 'Privacy Policy content...',
    lastUpdated: new Date().toISOString(),
  };
}

export function acceptTerms(userId: string, _ipAddress?: string, _userAgent?: string): { success: boolean; error?: string } {
  try {
    userTermsAccepted.set(userId, CURRENT_TERMS_VERSION);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
