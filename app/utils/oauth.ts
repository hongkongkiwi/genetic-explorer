import crypto from 'crypto';
import type { OAuthProfile } from './database';

// OAuth provider types
export type OAuthProvider = 'google' | 'github';

// OAuth configuration
const OAUTH_CONFIG: Record<OAuthProvider, {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
}> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: ['openid', 'email', 'profile'],
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: ['user:email'],
  },
};

// In-memory state storage for CSRF protection (in production, use Redis or similar)
const stateStore = new Map<string, { provider: OAuthProvider; createdAt: number }>();

/**
 * Check if an OAuth provider is configured
 */
export function isOAuthProviderConfigured(provider: OAuthProvider): boolean {
  const config = OAUTH_CONFIG[provider];
  return !!(config.clientId && config.clientSecret);
}

/**
 * Get all configured OAuth providers
 */
export function getConfiguredProviders(): OAuthProvider[] {
  const configured: OAuthProvider[] = [];
  for (const provider of ['google', 'github'] as OAuthProvider[]) {
    if (isOAuthProviderConfigured(provider)) {
      configured.push(provider);
    }
  }
  return configured;
}

/**
 * Generate OAuth authorization URL
 */
export function getOAuthAuthorizationUrl(provider: OAuthProvider, redirectUri: string, state?: string): string {
  const config = OAUTH_CONFIG[provider];

  if (!config.clientId) {
    throw new Error(`${provider} OAuth is not configured`);
  }

  // Generate state for CSRF protection
  const oauthState = state || crypto.randomBytes(32).toString('hex');
  stateStore.set(oauthState, {
    provider,
    createdAt: Date.now(),
  });

  // Clean up old states (older than 10 minutes)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of stateStore.entries()) {
    if (value.createdAt < tenMinutesAgo) {
      stateStore.delete(key);
    }
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope.join(' '),
    state: oauthState,
    // Access type and prompt for Google
    ...(provider === 'google' ? {
      access_type: 'offline',
      prompt: 'consent',
    } : {}),
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Validate and consume OAuth state
 */
export function validateOAuthState(state: string): OAuthProvider | null {
  const stateData = stateStore.get(state);
  if (!stateData) {
    return null;
  }

  // Check if state is expired (10 minutes)
  if (Date.now() - stateData.createdAt > 10 * 60 * 1000) {
    stateStore.delete(state);
    return null;
  }

  // Consume the state (one-time use)
  stateStore.delete(state);

  return stateData.provider;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForTokens(
  provider: OAuthProvider,
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const config = OAUTH_CONFIG[provider];

  if (!config.clientSecret) {
    throw new Error(`${provider} OAuth is not configured`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`OAuth token exchange failed for ${provider}:`, error);
    throw new Error('Failed to exchange authorization code');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get user profile from OAuth provider
 */
export async function getOAuthUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthProfile> {
  const config = OAUTH_CONFIG[provider];

  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to fetch ${provider} user info:`, error);
    throw new Error('Failed to fetch user information');
  }

  const data = await response.json();

  if (provider === 'google') {
    return {
      provider: 'google',
      providerId: data.id,
      email: data.email,
      name: data.name,
      avatarUrl: data.picture,
    };
  } else {
    // GitHub
    return {
      provider: 'github',
      providerId: String(data.id),
      email: data.email,
      name: data.name || data.login,
      avatarUrl: data.avatar_url,
    };
  }
}

/**
 * Generate a random state string for OAuth
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * OAuth error class
 */
export class OAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: OAuthProvider
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

/**
 * Handle OAuth errors
 */
export function handleOAuthError(error: unknown, provider?: OAuthProvider): never {
  if (error instanceof OAuthError) {
    throw error;
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error(`OAuth error (${provider || 'unknown'}):`, error);
  throw new OAuthError(message, 'oauth_error', provider);
}
