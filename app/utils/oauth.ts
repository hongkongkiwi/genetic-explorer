/**
 * OAuth Utilities
 * 
 * Supports Google and GitHub OAuth providers.
 */

import crypto from 'crypto';

export interface OAuthProvider {
  id: string;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
}

export interface OAuthState {
  provider: string;
  redirectUrl: string;
  nonce: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

// OAuth provider configurations
const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
  },
  github: {
    id: 'github',
    name: 'GitHub',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['read:user', 'user:email'],
  },
};

// Client credentials from environment
const OAUTH_CREDENTIALS: Record<string, { clientId: string; clientSecret: string }> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  },
};

/**
 * Get OAuth provider configuration
 */
export function getOAuthProvider(providerId: string): OAuthProvider | undefined {
  return OAUTH_PROVIDERS[providerId];
}

/**
 * Check if OAuth provider is configured
 */
export function isOAuthProviderConfigured(providerId: string): boolean {
  const creds = OAUTH_CREDENTIALS[providerId];
  return !!creds?.clientId && !!creds?.clientSecret;
}

/**
 * Generate OAuth state parameter
 */
export function generateOAuthState(provider: string, redirectUrl: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const state: OAuthState = {
    provider,
    redirectUrl,
    nonce,
  };
  return Buffer.from(JSON.stringify(state)).toString('base64url');
}

/**
 * Parse OAuth state parameter
 */
export function parseOAuthState(state: string): OAuthState | null {
  try {
    return JSON.parse(Buffer.from(state, 'base64url').toString());
  } catch {
    return null;
  }
}

/**
 * Generate PKCE code challenge and verifier
 */
export function generateCodeChallenge(): { codeChallenge: string; codeVerifier: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeChallenge, codeVerifier };
}

/**
 * Build authorization URL
 */
export function buildAuthorizationUrl(
  provider: OAuthProvider,
  redirectUri: string,
  state: string,
  codeChallenge?: string
): string {
  const creds = OAUTH_CREDENTIALS[provider.id];
  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: provider.scopes.join(' '),
    state,
  });

  if (codeChallenge) {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }

  return `${provider.authorizeUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<OAuthTokens | null> {
  const creds = OAUTH_CREDENTIALS[provider.id];
  
  if (!creds.clientId || !creds.clientSecret) {
    console.error(`[OAuth] ${provider.name} credentials not configured`);
    return null;
  }

  const params = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  try {
    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[OAuth] Token exchange failed:`, error);
      return null;
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000) 
        : undefined,
    };
  } catch (error) {
    console.error(`[OAuth] Token exchange error:`, error);
    return null;
  }
}

/**
 * Get user info from OAuth provider
 */
export async function getOAuthUserInfo(
  provider: OAuthProvider,
  tokens: OAuthTokens
): Promise<OAuthUserInfo | null> {
  try {
    const response = await fetch(provider.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[OAuth] User info fetch failed:`, await response.text());
      return null;
    }

    const data = await response.json();

    // Normalize user info based on provider
    if (provider.id === 'google') {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
      };
    }

    if (provider.id === 'github') {
      // For GitHub, we need to fetch emails separately if not public
      let email = data.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Accept': 'application/json',
          },
        });
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          const primary = emails.find((e: { primary: boolean; email: string }) => e.primary);
          email = primary?.email || emails[0]?.email;
        }
      }

      return {
        id: data.id.toString(),
        email,
        name: data.name || data.login,
        picture: data.avatar_url,
      };
    }

    return null;
  } catch (error) {
    console.error(`[OAuth] User info error:`, error);
    return null;
  }
}

/**
 * Get available OAuth providers
 */
export function getAvailableProviders(): Array<{ id: string; name: string; configured: boolean }> {
  return Object.values(OAUTH_PROVIDERS).map(p => ({
    id: p.id,
    name: p.name,
    configured: isOAuthProviderConfigured(p.id),
  }));
}
