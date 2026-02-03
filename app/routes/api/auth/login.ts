import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { loginUser } from '~/utils/auth';
import { logActivity } from '~/utils/database';
import { rateLimitAuth, createRateLimitHeaders, getClientIp } from '~/utils/rateLimit';
import { detectSuspiciousActivity, logSecurityEvent } from '~/utils/security';

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

      const result = await loginUser({ email, password, rememberMe }, ipAddress, userAgent);

      if (result.success && result.user && result.sessionToken) {
        // Log the successful login
        logActivity(result.user.id, 'user_login', 'user', result.user.id, { email }, ipAddress);

        // Set session cookie
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
        
        // Add rate limit headers to successful response
        headers.append('Set-Cookie', `session_token=${result.sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`);
        
        return json({
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName,
          },
          sessionToken: result.sessionToken,
        }, {
          status: 200,
          headers,
        });
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
