import { redirect, json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import {
  exchangeCodeForTokens,
  getOAuthUserInfo,
  validateOAuthState,
  getOAuthStateData,
  consumeOAuthState,
  OAuthProvider,
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
import { createSession, generateSessionToken, logActivity, getAuthUser } from '~/utils/auth';
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

async function handleOAuthCallback(
  provider: OAuthProvider,
  code: string,
  state: string,
  redirectTo: string,
  linkMode: boolean,
  currentUserId: string | null,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  // Get callback URL
  const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/oauth/callback`;

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(provider, code, callbackUrl);

  // Get user profile
  const profile = await getOAuthUserInfo(provider, tokens.accessToken);

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
    linkOAuthAccount(currentUserId, profile);
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
      linkOAuthAccount(existingUser.id, profile);
      user = existingUser;
      updateUserLastLogin(user.id);
    } else {
      // Check if OAuth signup is allowed
      const oauthCheck = canSignUpWithOAuth();
      if (!oauthCheck.allowed) {
        return { success: false, error: oauthCheck.reason };
      }
      // Create new user
      user = createOAuthUser(profile);
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
      const providerParam = url.searchParams.get('provider') as OAuthProvider | null;

      if (!code || !state) {
        return json({ success: false, error: 'Missing authorization code or state' }, { status: 400 });
      }

      // Get state data
      const stateData = getOAuthStateData(state);
      let provider = providerParam;
      let redirectTo = '/dashboard';
      let linkMode = false;

      if (stateData) {
        provider = stateData.provider;
        // SECURITY: Validate redirect path to prevent open redirect
        redirectTo = validateRedirectPath(stateData.redirectTo);
        linkMode = stateData.link;
        consumeOAuthState(state);
      } else {
        // Try to validate state the old way for backwards compatibility
        const stateProvider = validateOAuthState(state);
        if (stateProvider) {
          provider = stateProvider;
        }
      }

      if (!provider || !['google', 'github'].includes(provider)) {
        return json({ success: false, error: 'Invalid OAuth provider' }, { status: 400 });
      }

      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || undefined;

      // Check if user is already authenticated (for account linking)
      let currentUserId: string | null = null;
      if (linkMode) {
        try {
          const auth = getAuthUser(request);
          currentUserId = auth.id;
        } catch {
          // User not authenticated, can't link account
          return redirect('/login?error=not_authenticated');
        }
      }

      const result = await handleOAuthCallback(
        provider,
        code,
        state,
        redirectTo,
        linkMode,
        currentUserId,
        ipAddress,
        userAgent
      );

      if (!result.success) {
        return redirect(`${redirectTo}?oauth=error&error=${encodeURIComponent(result.error || 'Unknown error')}`);
      }

      if (linkMode) {
        // Account linking successful, redirect back to settings
        return redirect(`${redirectTo}?oauth=linked&provider=${provider}`);
      }

      if (result.success && result.user && result.sessionToken) {
        // Set session cookie
        const maxAge = 7 * 24 * 60 * 60; // 7 days

        return redirect(`${redirectTo}?oauth=success`, {
          headers: [
            `Set-Cookie: session_token=${result.sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`,
          ],
          statusCode: 302,
        });
      }

      return json({ success: false, error: 'Authentication failed' }, { status: 500 });
    } catch (error) {
      console.error('OAuth callback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return redirect(`/login?oauth=error&error=${encodeURIComponent(errorMessage)}`);
    }
  },
});
