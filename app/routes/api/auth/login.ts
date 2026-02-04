import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { loginUser } from '~/utils/auth';
import { logActivity, getUserByEmail } from '~/utils/database';
import { rateLimitAuth, createRateLimitHeaders, getClientIp } from '~/utils/rateLimit';
import { detectSuspiciousActivity, logSecurityEvent } from '~/utils/security';
import { 
  createPending2FASession, 
  generate2FAPendingToken,
  get2FAStatus 
} from '~/utils/twoFactor';

export const APIRoute = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { email, password, rememberMe } = body;

      if (!email || !password) {
        return json({ success: false, error: 'Email and password are required' }, { status: 400 });
      }

      // Get client IP for rate limiting
      const ipAddress = getClientIp(request);
      
      // Check rate limit
      const rateLimitResult = rateLimitAuth(ipAddress);
      const headers = createRateLimitHeaders(rateLimitResult);
      
      if (!rateLimitResult.allowed) {
        logSecurityEvent('rate_limit_exceeded', {
          ip: ipAddress,
          endpoint: '/api/auth/login',
          email: email,
        }, 'warning');
        
        return json({ 
          success: false, 
          error: `Too many login attempts. Please try again in ${rateLimitResult.retryAfter} seconds.` 
        }, { 
          status: 429,
          headers,
        });
      }

      // Detect suspicious activity
      const { suspicious, reasons } = detectSuspiciousActivity(request, body);
      if (suspicious) {
        logSecurityEvent('suspicious_login_attempt', {
          ip: ipAddress,
          email: email,
          reasons,
        }, 'warning');
      }

      const userAgent = request.headers.get('user-agent') || undefined;

      // First, verify credentials without creating session
      const result = await loginUser({ email, password, rememberMe }, ipAddress, userAgent, false);

      if (result.success && result.user) {
        // Check if 2FA is enabled
        const twoFAStatus = get2FAStatus(result.user.id);
        
        if (twoFAStatus.enabled) {
          // Create pending 2FA session instead of full login
          const pendingToken = generate2FAPendingToken();
          const availableMethods = [];
          
          if (twoFAStatus.totpEnabled) availableMethods.push('totp');
          if (twoFAStatus.passkeyEnabled) availableMethods.push('passkey');
          availableMethods.push('backup'); // Always allow backup codes
          
          createPending2FASession(
            pendingToken,
            result.user.id,
            result.user.email,
            availableMethods
          );
          
          logSecurityEvent('2fa_challenge_initiated', {
            ip: ipAddress,
            email: email,
            methods: availableMethods,
          }, 'info');
          
          return json({
            success: true,
            requires2FA: true,
            pendingToken,
            methods: availableMethods,
            user: {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName,
            },
          }, {
            status: 200,
            headers,
          });
        }
        
        // No 2FA - complete login
        if (result.sessionToken) {
          // Log the successful login
          logActivity(result.user.id, 'user_login', 'user', result.user.id, { email }, ipAddress);

          const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
          headers.append('Set-Cookie', `session_token=${result.sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`);
          
          return json({
            success: true,
            user: {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName,
            },
            sessionToken: result.sessionToken,
            requires2FA: false,
          }, {
            status: 200,
            headers,
          });
        }
      }

      // Log failed login
      logSecurityEvent('failed_login', {
        ip: ipAddress,
        email: email,
        reason: result.error,
      }, 'info');

      return json({ success: false, error: result.error }, { status: 401, headers });
    } catch (error) {
      console.error('Login API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// Helper function to get 2FA status (import or define)
function get2FAStatus(userId: string): { enabled: boolean; totpEnabled: boolean; passkeyEnabled: boolean } {
  const { getDb } = require('~/utils/database');
  const db = getDb();
  
  const user = db.prepare(`
    SELECT two_factor_enabled FROM users WHERE id = ?
  `).get(userId) as { two_factor_enabled: number } | undefined;

  const totpSecret = db.prepare(`
    SELECT secret FROM totp_secrets WHERE user_id = ? AND verified = 1
  `).get(userId) as { secret: string } | undefined;

  const passkeys = db.prepare(`
    SELECT COUNT(*) as count FROM passkeys WHERE user_id = ?
  `).get(userId) as { count: number } | undefined;

  return {
    enabled: (user?.two_factor_enabled || 0) === 1,
    totpEnabled: !!totpSecret,
    passkeyEnabled: (passkeys?.count || 0) > 0,
  };
}
