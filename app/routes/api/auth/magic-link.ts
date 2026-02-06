/**
 * Magic Link Authentication API
 * 
 * Provides passwordless email login
 * Users receive a time-limited, single-use link to sign in
 */

import { createAPIFileRoute } from '@tanstack/start/api';
import { generateMagicLinkToken, storeMagicLinkToken, verifyMagicLinkToken, deleteMagicLinkToken } from '~/auth';
import { createSession, getUserByEmail, logActivity } from '~/utils/database';
import { generateSessionToken } from '~/utils/auth.server';
import { rateLimitAuth, createRateLimitHeaders, getClientIp } from '~/security/rate-limit';
import { logSecurityEvent } from '~/security';

const SESSION_DURATION_DAYS = 7;

export const APIRoute = createAPIFileRoute('/api/auth/magic-link')({
  // Request a magic link
  POST: async ({ request }: { request: Request }) => {
    try {
      const body = await request.json() as { email?: string; redirectTo?: string };
      const { email, redirectTo } = body;

      if (!email) {
        return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return Response.json({ success: false, error: 'Invalid email address' }, { status: 400 });
      }

      const ipAddress = getClientIp(request);
      
      // Rate limit magic link requests
      const rateLimitResult = rateLimitAuth(ipAddress + ':magic-link');
      const headers = createRateLimitHeaders(rateLimitResult);
      
      if (!rateLimitResult.allowed) {
        return Response.json({ 
          success: false, 
          error: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.` 
        }, { 
          status: 429,
          headers,
        });
      }

      // Check if user exists (don't reveal this to prevent user enumeration)
      const user = getUserByEmail(email);
      
      if (user) {
        // Generate magic link token
        const token = generateMagicLinkToken();
        storeMagicLinkToken(token, user.id, email);

        // Build magic link URL
        const baseUrl = process.env.APP_URL || 'https://genetic-explorer.com';
        const magicLink = `${baseUrl}/auth/magic?token=${token}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`;

        // Send email
        try {
          // In production, this would send an actual email via email service
          // The magic link should NEVER be logged as it provides authentication
          logSecurityEvent('magic_link_requested', {
            ip: ipAddress,
            email: email,
          }, 'info');
        } catch (emailError) {
          console.error('Failed to send magic link email:', emailError);
          // Don't reveal error to user - they shouldn't know if email failed
        }
      }

      // Always return success to prevent user enumeration
      return Response.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a sign-in link.' 
      }, { headers });
    } catch (error) {
      console.error('Magic link request error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },

  // Verify magic link and create session
  GET: async ({ request }: { request: Request }) => {
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');

      if (!token) {
        return Response.json({ success: false, error: 'Invalid or missing token' }, { status: 400 });
      }

      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || undefined;

      // Verify token
      const tokenData = verifyMagicLinkToken(token);
      
      if (!tokenData) {
        logSecurityEvent('magic_link_verification_failed', {
          ip: ipAddress,
          reason: 'invalid_or_expired_token',
        }, 'warning');
        
        return Response.json({ 
          success: false, 
          error: 'This sign-in link has expired or already been used. Please request a new one.' 
        }, { status: 401 });
      }

      // Get user
      const user = getUserByEmail(tokenData.email);
      if (!user) {
        return Response.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      // Check if account is active
      if (!user.isActive) {
        return Response.json({ success: false, error: 'Account has been deactivated' }, { status: 403 });
      }

      // Delete token (single-use)
      deleteMagicLinkToken(token);

      // Create session
      const sessionToken = generateSessionToken();
      const durationDays = SESSION_DURATION_DAYS;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      createSession(user.id, sessionToken, expiresAt, ipAddress, userAgent);

      // Log activity
      logActivity(user.id, 'user_login_magic_link', 'user', user.id, { 
        email: user.email 
      }, ipAddress);

      logSecurityEvent('magic_link_verification_success', {
        ip: ipAddress,
        userId: user.id,
      }, 'info');

      // Set session cookie
      const headers = new Headers();
      headers.append('Set-Cookie', `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${durationDays * 24 * 60 * 60}; Path=/`);

      return Response.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        sessionToken,
      }, { headers });
    } catch (error) {
      console.error('Magic link verification error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
