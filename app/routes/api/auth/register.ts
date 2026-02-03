import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { registerUser } from '~/utils/auth';
import {
  canSignUpWithPassword,
  validateSignupEmail,
  getSignupConfig,
  getSignupRateLimit,
} from '~/utils/signupRestrictions';
import { logActivity } from '~/utils/database';
import { getClientIp, createRateLimitHeaders } from '~/utils/rateLimit';

export const APIRoute = createAPIFileRoute('/api/auth/register')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { email, password, displayName } = body;
      const ipAddress = getClientIp(request);

      if (!email || !password) {
        return json({ success: false, error: 'Email and password are required' }, { status: 400 });
      }

      // Check if password signup is allowed
      const passwordCheck = canSignUpWithPassword();
      if (!passwordCheck.allowed) {
        return json({ success: false, error: passwordCheck.reason }, { status: 403 });
      }

      // Check if signup is completely disabled
      const signupCheck = validateSignupEmail(email);
      if (!signupCheck.allowed) {
        return json({ success: false, error: signupCheck.reason }, { status: 403 });
      }

      // Check rate limit
      const rateLimit = getSignupRateLimit(ipAddress);
      const headers = createRateLimitHeaders({ allowed: true, remaining: rateLimit.remaining, retryAfter: 0 });

      if (!rateLimit.allowed) {
        return json({
          success: false,
          error: 'Too many signup attempts. Please try again later.',
        }, { status: 429, headers });
      }

      const result = await registerUser({ email, password, displayName });

      if (result.success && result.user) {
        // Log the registration
        logActivity(result.user.id, 'user_registered', 'user', result.user.id, { email }, ipAddress);

        // Check if email verification is required
        const config = getSignupConfig();
        if (config.requireEmailVerification) {
          // User is created but marked as unverified
          // Email verification logic would be triggered here
        }

        return json({
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName,
          }
        }, { status: 201 });
      }

      return json({ success: false, error: result.error }, { status: 400 });
    } catch (error) {
      console.error('Registration API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
