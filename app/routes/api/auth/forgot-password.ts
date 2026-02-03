import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getUserByEmail, generatePasswordResetToken, storePasswordResetToken } from '~/utils/database';
import { sendEmail } from '~/utils/email';
import PasswordResetEmail from '~/emails/PasswordReset';
import * as React from 'react';

export const APIRoute = createAPIFileRoute('/api/auth/forgot-password')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      // Check if user exists
      const user = getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return json({ 
          success: true, 
          message: 'If an account exists, reset instructions have been sent' 
        });
      }

      // Generate reset token
      const token = generatePasswordResetToken();
      
      // Store token in database with expiration (24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      storePasswordResetToken(user.id, token, expiresAt.toISOString());
      
      // Build reset URL
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      
      // Send email using React Email template
      const emailResult = await sendEmail({
        to: email,
        subject: 'Reset your Genetic Explorer password',
        react: React.createElement(PasswordResetEmail, {
          resetUrl,
          userName: user.displayName || undefined,
          expiresIn: '24 hours',
        }),
      });
      
      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        // Still return success to prevent email enumeration
        // But log the error for monitoring
      }

      return json({ 
        success: true, 
        message: 'If an account exists, reset instructions have been sent' 
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
