/**
 * CAPTCHA Verification
 * 
 * Supports hCaptcha and Cloudflare Turnstile.
 */

export interface CaptchaConfig {
  provider: 'hcaptcha' | 'turnstile';
  secretKey: string;
  siteKey: string;
}

export interface CaptchaVerifyResult {
  success: boolean;
  score?: number;
  error?: string;
}

// CAPTCHA configuration from environment
const CAPTCHA_CONFIG: CaptchaConfig = {
  provider: (process.env.CAPTCHA_PROVIDER as 'hcaptcha' | 'turnstile') || 'turnstile',
  secretKey: process.env.CAPTCHA_SECRET_KEY || '',
  siteKey: process.env.CAPTCHA_SITE_KEY || '',
};

// Verification URLs
const VERIFY_URLS = {
  hcaptcha: 'https://hcaptcha.com/siteverify',
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
};

/**
 * Check if CAPTCHA is configured
 */
export function isCaptchaConfigured(): boolean {
  return !!CAPTCHA_CONFIG.secretKey && !!CAPTCHA_CONFIG.siteKey;
}

/**
 * Get CAPTCHA configuration
 */
export function getCaptchaConfig(): Omit<CaptchaConfig, 'secretKey'> {
  return {
    provider: CAPTCHA_CONFIG.provider,
    siteKey: CAPTCHA_CONFIG.siteKey,
  };
}

/**
 * Verify CAPTCHA token
 */
export async function verifyCaptcha(token: string, remoteip?: string): Promise<CaptchaVerifyResult> {
  if (!CAPTCHA_CONFIG.secretKey) {
    console.warn('[CAPTCHA] Not configured, skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Missing CAPTCHA token' };
  }

  const url = VERIFY_URLS[CAPTCHA_CONFIG.provider];
  
  const params = new URLSearchParams({
    secret: CAPTCHA_CONFIG.secretKey,
    response: token,
  });

  if (remoteip) {
    params.append('remoteip', remoteip);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return { success: false, error: 'Verification service error' };
    }

    const data = await response.json();

    if (!data.success) {
      const errorCodes = data['error-codes']?.join(', ') || 'Unknown error';
      return { success: false, error: errorCodes };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error('[CAPTCHA] Verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Verify CAPTCHA middleware for API routes
 */
export async function requireCaptcha(
  request: Request
): Promise<{ success: boolean; error?: string }> {
  // Get token from header or body
  const token = request.headers.get('X-Captcha-Token');
  
  if (!token) {
    try {
      const body = await request.clone().json();
      if (body.captchaToken) {
        const result = await verifyCaptcha(body.captchaToken);
        return result;
      }
    } catch {
      // Body parsing failed
    }
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA required' };
  }

  const remoteip = request.headers.get('X-Forwarded-For') || 
                   request.headers.get('X-Real-IP') ||
                   'unknown';

  return verifyCaptcha(token, remoteip);
}

/**
 * Generate CAPTCHA script tag for client
 */
export function getCaptchaScriptUrl(): string {
  if (CAPTCHA_CONFIG.provider === 'hcaptcha') {
    return 'https://js.hcaptcha.com/1/api.js';
  }
  return 'https://challenges.cloudflare.com/turnstile/v0/api.js';
}

/**
 * Get CAPTCHA widget attributes
 */
export function getCaptchaWidgetAttrs(): Record<string, string> {
  return {
    'data-sitekey': CAPTCHA_CONFIG.siteKey,
    'data-theme': 'auto',
  };
}

/**
 * Verify Turnstile token (alias for verifyCaptcha)
 */
export async function verifyTurnstileToken(token: string, remoteip?: string): Promise<CaptchaVerifyResult> {
  return verifyCaptcha(token, remoteip);
}
