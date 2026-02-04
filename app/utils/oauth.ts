import crypto from 'crypto';
import type { OAuthProfile } from './database';
import { getDb } from './database';

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

const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

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

interface OAuthStateData {
  provider: OAuthProvider;
  redirectTo: string;
  link: boolean;
}

/**
 * Generate OAuth state with additional data
 * Stores in database for persistence across restarts
 */
export function generateOAuthState(data: { provider: OAuthProvider; redirectTo: string; link: boolean }): string {
  const state = crypto.randomBytes(32).toString('hex');
  const db = getDb();
  const expiresAt = new Date(Date.now() + STATE_EXPIRY_MS);
  
  db.prepare(`
    INSERT INTO oauth_state_tokens (state, provider, redirect_to, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(state, data.provider, data.redirectTo, expiresAt.toISOString());
  
  return state;
}

/**
 * Generate OAuth authorization URL
 */
export function getOAuthAuthorizationUrl(provider: OAuthProvider, redirectUri: string, state?: string): string {
  const config = OAUTH_CONFIG[provider];

  if (!config.clientId) {
    throw new Error(`${provider} OAuth is not configured`);
  }

  // Generate state for CSRF protection if not provided
  const oauthState = state || generateOAuthState({ provider, redirectTo: '/dashboard', link: false });

  // Clean up expired states
  cleanupExpiredOAuthState();

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
  const db = getDb();
  const now = new Date().toISOString();
  
  const result = db.prepare(`
    SELECT provider FROM oauth_state_tokens
    WHERE state = ? AND expires_at > ?
  `).get(state, now) as { provider: OAuthProvider } | undefined;
  
  if (!result) return null;
  
  // Consume the state (one-time use)
  db.prepare(`DELETE FROM oauth_state_tokens WHERE state = ?`).run(state);
  
  return result.provider;
}

/**
 * Get OAuth state data without consuming it (for callback processing)
 */
export function getOAuthStateData(state: string): OAuthStateData | null {
  const db = getDb();
  const now = new Date().toISOString();
  
  const result = db.prepare(`
    SELECT provider, redirect_to, expires_at
    FROM oauth_state_tokens
    WHERE state = ? AND expires_at > ?
  `).get(state, now) as { 
    provider: OAuthProvider; 
    redirect_to: string;
    expires_at: string;
  } | undefined;
  
  if (!result) return null;
  
  return {
    provider: result.provider,
    redirectTo: result.redirect_to,
    link: false, // Link flag stored separately or derived from context
  };
}

/**
 * Consume OAuth state after processing
 */
export function consumeOAuthState(state: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM oauth_state_tokens WHERE state = ?`).run(state);
}

/**
 * Clean up expired OAuth state tokens
 * Call periodically (e.g., via cron job)
 */
export function cleanupExpiredOAuthState(): number {
  const db = getDb();
  const now = new Date().toISOString();
  
  const result = db.prepare(`
    DELETE FROM oauth_state_tokens WHERE expires_at < ?
  `).run(now);
  
  return result.changes;
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
