import { redirect, json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import {
  exchangeCodeForTokens,
  getOAuthUserInfo,
  validateOAuthState,
  OAuthProvider,
} from '~/utils/oauth';
import {
  getUserByOAuth,
  getUserByEmailForOAuth,
  createOAuthUser,
  linkOAuthAccount,
  updateUserLastLogin,
  type User,
} from '~/utils/database';
import { createSession, generateSessionToken, logActivity } from '~/utils/auth';
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
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  // Validate state
  const stateProvider = validateOAuthState(state);
  if (!stateProvider || stateProvider !== provider) {
    throw new Error('Invalid OAuth state');
  }

  // Check if OAuth signup is allowed
  const oauthCheck = canSignUpWithOAuth();
  if (!oauthCheck.allowed) {
    return { success: false, error: oauthCheck.reason };
  }

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

  // Find or create user
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
      const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

      if (!code || !state) {
        return json({ success: false, error: 'Missing authorization code or state' }, { status: 400 });
      }

      // Try to get provider from state first, then from query param
      const stateProvider = validateOAuthState(state);
      const provider = stateProvider || providerParam;

      if (!provider || !['google', 'github'].includes(provider)) {
        return json({ success: false, error: 'Invalid OAuth provider' }, { status: 400 });
      }

      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || undefined;

      const result = await handleOAuthCallback(provider, code, state, redirectTo, ipAddress, userAgent);

      if (!result.success) {
        return json({ success: false, error: result.error }, { status: 403 });
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
      return json({ success: false, error: errorMessage }, { status: 500 });
    }
  },
});
