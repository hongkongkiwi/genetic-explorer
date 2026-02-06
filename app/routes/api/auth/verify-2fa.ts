/**
 * 2FA Verification API
 * 
 * Verifies TOTP codes, backup codes, or email codes for 2FA login
 */

import { createAPIFileRoute } from '@tanstack/start/api';
import { createSession, logActivity, getUserById } from '~/utils/database';
import { rateLimitAuth, createRateLimitHeaders, getClientIp } from '~/utils/rateLimit';
import { logSecurityEvent } from '~/utils/security';
import { 
  getPending2FASession, 
  deletePending2FASession,
  verifyTOTP 
} from '~/utils/twoFactor';

const SESSION_DURATION_DAYS = 7;

export const APIRoute = createAPIFileRoute('/api/auth/verify-2fa')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { pendingToken, method, code, rememberMe } = body;

      if (!pendingToken || !method || !code) {
        return Response.json({ 
          success: false, 
          error: 'Missing required fields' 
        }, { status: 400 });
      }

      // Get client IP for rate limiting
      const ipAddress = getClientIp(request);
      
      // Check rate limit
      const rateLimitResult = rateLimitAuth(ipAddress);
      const rateLimitHeaderObj = createRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime, 5);
      const headers = new Headers();
      Object.entries(rateLimitHeaderObj).forEach(([key, value]) => headers.set(key, value));
      
      if (!rateLimitResult.allowed) {
        return Response.json({ 
          success: false, 
          error: `Too many attempts. Please try again in ${rateLimitResult.retryAfter} seconds.` 
        }, { 
          status: 429,
          headers,
        });
      }

      // Validate pending session
      const pendingSession = getPending2FASession(pendingToken);
      if (!pendingSession) {
        return Response.json({ 
          success: false, 
          error: 'Session expired. Please log in again.' 
        }, { status: 401, headers });
      }

      // Verify the 2FA code based on method
      let verified = false;
      
      switch (method) {
        case 'totp':
          verified = await verifyTOTPCode(pendingSession.userId, code);
          break;
        case 'backup':
          verified = await verifyBackupCode(pendingSession.userId, code);
          break;
        case 'passkey':
          // Passkey verification would be handled separately via WebAuthn
          return Response.json({ 
            success: false, 
            error: 'Passkey verification not supported via this endpoint' 
          }, { status: 400, headers });
        default:
          return Response.json({ 
            success: false, 
            error: 'Invalid 2FA method' 
          }, { status: 400, headers });
      }

      if (!verified) {
        logSecurityEvent('2fa_verification_failed', {
          ip: ipAddress,
          userId: pendingSession.userId,
          method,
        }, 'warning');
        
        return Response.json({ 
          success: false, 
          error: 'Invalid verification code. Please try again.' 
        }, { status: 401, headers });
      }

      // Get user details
      const user = getUserById(pendingSession.userId);
      if (!user) {
        return Response.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404, headers });
      }

      // Create session
      const sessionToken = generateSessionToken();
      const durationDays = rememberMe ? 30 : SESSION_DURATION_DAYS;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      const userAgent = request.headers.get('user-agent') || undefined;

      createSession(user.id, sessionToken, expiresAt, ipAddress, userAgent);

      // Clean up pending session
      deletePending2FASession(pendingToken);

      // Log successful 2FA login
      logActivity(user.id, 'user_login_2fa', 'user', user.id, { 
        email: user.email,
        method 
      }, ipAddress);

      logSecurityEvent('2fa_verification_success', {
        ip: ipAddress,
        userId: user.id,
        method,
      }, 'info');

      // Set session cookie
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : SESSION_DURATION_DAYS * 24 * 60 * 60;
      headers.set('Set-Cookie', `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`);

      return Response.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        sessionToken,
      }, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      return Response.json({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  },
});

/**
 * Verify TOTP code
 */
async function verifyTOTPCode(userId: string, code: string): Promise<boolean> {
  try {
    const { getDb } = require('~/utils/database');
    const db = getDb();
    
    const result = db.prepare(`
      SELECT secret FROM totp_secrets WHERE user_id = ? AND verified = 1
    `).get(userId) as { secret: string } | undefined;
    
    if (!result) return false;
    
    return verifyTOTP(code, result.secret);
  } catch {
    return false;
  }
}

/**
 * Verify backup code
 */
async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  try {
    const { getDb } = require('~/utils/database');
    const db = getDb();
    
    const normalizedCode = code.replace(/-/g, '').toUpperCase();
    const salt = `${userId}-backup-code-salt`;
    const codeHash = require('crypto').pbkdf2Sync(normalizedCode, salt, 100000, 32, 'sha256').toString('hex');
    
    const result = db.prepare(`
      UPDATE backup_codes
      SET used = 1, used_at = datetime('now')
      WHERE user_id = ? AND code_hash = ? AND used = 0
    `).run(userId, codeHash);
    
    return result.changes > 0;
  } catch {
    return false;
  }
}

function generateSessionToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}
