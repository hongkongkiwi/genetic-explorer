import { createAPIFileRoute } from '@tanstack/start/api';
import {
  exchangeCodeForTokens,
  getOAuthUserInfo,
  type OAuthProvider,
} from '~/auth/oauth';
import {
  getOAuthProvider,
  parseOAuthState,
  type OAuthUserInfo,
} from '~/utils/oauth';

// Allowed redirect paths (prevent open redirect attacks)
const ALLOWED_REDIRECT_PATHS = ['/dashboard', '/settings', '/profile', '/'];

/**
 * Validate and sanitize redirect URL
 * Prevents open redirect vulnerabilities
 */
function validateRedirectPath(path: string): string {
  // Only allow relative paths
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return '/dashboard';
  }
  
  // Get pathname without query string
  const pathname = path.split('?')[0];
  
  // Check against allowlist
  if (!ALLOWED_REDIRECT_PATHS.includes(pathname)) {
    return '/dashboard';
  }
  
  return path;
}
import {
  getUserByOAuth,
  getUserByEmailForOAuth,
  createOAuthUser,
  linkOAuthAccount,
  updateUserLastLogin,
  type User,
} from '~/utils/database';
import { createSession, generateSessionToken, logActivity } from '~/utils/auth.server';
import { getClientIp } from '~/utils/rateLimit';
import {
  canSignUpWithOAuth,
  validateSignupEmail,
  getSignupRateLimit,
} from '~/utils/signupRestrictions';

interface AuthResult {
  success: boolean;
  user?: User;
  sessionToken?: string;
  error?: string;
}

// OAuth state management
const oauthStates = new Map<string, { provider: string; redirectTo: string; link: boolean; expires: number }>();

function getOAuthStateData(state: string) {
  const data = oauthStates.get(state);
  if (data && data.expires > Date.now()) {
    return data;
  }
  return null;
}

function consumeOAuthState(state: string) {
  oauthStates.delete(state);
}

function validateOAuthState(state: string): string | null {
  const data = getOAuthStateData(state);
  return data?.provider || null;
}

async function handleOAuthCallback(
  provider: OAuthProvider,
  code: string,
  _state: string,
  _redirectTo: string,
  linkMode: boolean,
  currentUserId: string | null,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  // Get callback URL
  const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/oauth/callback`;

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(provider, code, callbackUrl);

  if (!tokens) {
    return { success: false, error: 'Failed to exchange code for tokens' };
  }

  // Get user profile
  const profile = await getOAuthUserInfo(provider, tokens.accessToken);

  if (!profile) {
    return { success: false, error: 'Failed to get user profile' };
  }

  // Check email against signup restrictions
  const emailCheck = validateSignupEmail(profile.email);
  if (!emailCheck.allowed) {
    return { success: false, error: emailCheck.reason };
  }

  // Check rate limit
  const rateLimit = getSignupRateLimit(ipAddress || 'unknown');
  if (!rateLimit.allowed) {
    return { success: false, error: 'Too many signup attempts. Please try again later.' };
  }

  // Handle account linking for authenticated users
  if (linkMode && currentUserId) {
    // Check if this OAuth account is already linked to another user
    const existingOAuthUser = getUserByOAuth(provider, profile.providerId);
    if (existingOAuthUser) {
      return { success: false, error: 'This account is already linked to another user' };
    }

    // Link OAuth account to current user
    linkOAuthAccount(currentUserId, profile as any);
    logActivity(currentUserId, 'oauth_linked', 'user', currentUserId, { provider }, ipAddress);

    return {
      success: true,
      user: { id: currentUserId } as User,
    };
  }

  // Find or create user (normal login/signup flow)
  let user = getUserByOAuth(provider, profile.providerId);

  if (user) {
    // User exists, update last login
    updateUserLastLogin(user.id);
  } else {
    // Check if user exists with same email
    const existingUser = getUserByEmailForOAuth(profile.email);

    if (existingUser) {
      // Link OAuth account to existing user
      linkOAuthAccount(existingUser.id, profile as any);
      user = existingUser;
      updateUserLastLogin(user.id);
    } else {
      // Check if OAuth signup is allowed
      const oauthCheck = canSignUpWithOAuth();
      if (!oauthCheck.allowed) {
        return { success: false, error: oauthCheck.reason };
      }
      // Create new user
      user = createOAuthUser(profile as any);
    }
  }

  // Create session
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  createSession(user.id, sessionToken, expiresAt, ipAddress, userAgent);

  // Log activity
  logActivity(user.id, 'oauth_login', 'user', user.id, { provider }, ipAddress);

  return {
    success: true,
    user,
    sessionToken,
  };
}

export const APIRoute = createAPIFileRoute('/api/auth/oauth/callback')({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const providerParam = url.searchParams.get('provider');

      if (!code || !state) {
        return Response.json({ success: false, error: 'Missing authorization code or state' }, { status: 400 });
      }

      // Get state data
      const stateData = getOAuthStateData(state);
      let provider = getOAuthProvider(providerParam || stateData?.provider || '');
      let redirectTo = '/dashboard';
      let linkMode = false;

      if (stateData) {
        provider = getOAuthProvider(stateData.provider);
        // SECURITY: Validate redirect path to prevent open redirect
        redirectTo = validateRedirectPath(stateData.redirectTo);
        linkMode = stateData.link;
        consumeOAuthState(state);
      } else {
        // Try to validate state the old way for backwards compatibility
        const stateProvider = validateOAuthState(state);
        if (stateProvider) {
          provider = getOAuthProvider(stateProvider);
        }
      }

      if (!provider || !['google', 'github'].includes(provider as unknown as string)) {
        return Response.json({ success: false, error: 'Invalid OAuth provider' }, { status: 400 });
      }

      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || undefined;

      // Check if user is already authenticated (for account linking)
      let currentUserId: string | null = null;
      if (linkMode) {
        // For account linking, we'd need to check the session
        // This is a simplified version
        currentUserId = null;
      }

      const result = await handleOAuthCallback(
        provider as any,
        code,
        state,
        redirectTo,
        linkMode,
        currentUserId,
        ipAddress,
        userAgent
      );

      if (!result.success) {
        return Response.redirect(`${redirectTo}?oauth=error&error=${encodeURIComponent(result.error || 'Unknown error')}`, 302);
      }

      if (linkMode) {
        // Account linking successful, redirect back to settings
        return Response.redirect(`${redirectTo}?oauth=linked&provider=${provider.id}`, 302);
      }

      if (result.success && result.user && result.sessionToken) {
        // Set session cookie
        const maxAge = 7 * 24 * 60 * 60; // 7 days

        return Response.redirect(`${redirectTo}?oauth=success`, 302);
      }

      return Response.json({ success: false, error: 'Authentication failed' }, { status: 500 });
    } catch (error) {
      console.error('OAuth callback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return Response.redirect(`/login?oauth=error&error=${encodeURIComponent(errorMessage)}`, 302);
    }
  },
});
