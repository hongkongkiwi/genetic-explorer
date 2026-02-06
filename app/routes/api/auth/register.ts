import { createAPIFileRoute } from '@tanstack/start/api';
import { registerUser } from '~/utils/auth.server';
import {
  canSignUpWithPassword,
  validateSignupEmail,
  getSignupConfig,
  getSignupRateLimit,
} from '~/utils/signupRestrictions';
import { logActivity } from '~/utils/database';
import { getClientIp, createRateLimitHeaders } from '~/utils/rateLimit';
import { acceptTerms } from '~/utils/terms';

export const APIRoute = createAPIFileRoute('/api/auth/register')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { email, password, displayName, acceptTerms: userAcceptedTerms } = body;
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || undefined;

      // Validate terms acceptance
      if (!userAcceptedTerms) {
        return Response.json({ 
          success: false, 
          error: 'You must accept the Terms of Service and Privacy Policy to create an account' 
        }, { status: 400 });
      }

      if (!email || !password) {
        return Response.json({ success: false, error: 'Email and password are required' }, { status: 400 });
      }

      // Check if password signup is allowed
      const passwordCheck = canSignUpWithPassword();
      if (!passwordCheck.allowed) {
        return Response.json({ success: false, error: passwordCheck.reason }, { status: 403 });
      }

      // Check if signup is completely disabled
      const signupCheck = validateSignupEmail(email);
      if (!signupCheck.allowed) {
        return Response.json({ success: false, error: signupCheck.reason }, { status: 403 });
      }

      // Check rate limit
      const rateLimit = getSignupRateLimit(ipAddress || 'unknown');
      const headers = createRateLimitHeaders(rateLimit.remaining, Date.now() + 60000, 10);

      if (!rateLimit.allowed) {
        return Response.json({
          success: false,
          error: 'Too many signup attempts. Please try again later.',
        }, { status: 429, headers: new Headers(headers) });
      }

      const result = await registerUser({ email, password, displayName });

      if (result.success && result.user) {
        // Record terms acceptance
        const termsResult = acceptTerms(result.user.id, ipAddress, userAgent);
        if (!termsResult.success) {
          console.error('Failed to record terms acceptance:', termsResult.error);
        }

        // Log the registration
        logActivity(result.user.id, 'user_registered', 'user', result.user.id, { email }, ipAddress);

        // Check if email verification is required
        const config = getSignupConfig();
        if (config.requireEmailVerification) {
          // User is created but marked as unverified
          // Email verification logic would be triggered here
        }

        return Response.json({
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName,
          }
        }, { status: 201 });
      }

      return Response.json({ success: false, error: result.error }, { status: 400 });
    } catch (error) {
      console.error('Registration API error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
