/**
 * Email Module
 * 
 * Provides email sending functionality using Resend API and react-email templates.
 */

import { render } from '@react-email/render';
import * as React from 'react';

// Import email templates
import {
  PasswordResetEmail,
  WelcomeEmail,
  EmailVerification,
  ContactFormNotification,
  ContactFormConfirmation,
  SharingInvitation,
  MagicLinkEmail,
} from '~/emails';

// Email configuration types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  react?: React.ReactElement;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@geneticexplorer.com';
const FROM_NAME = process.env.FROM_NAME || 'Genetic Explorer';

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Handle react template - render to HTML
  let html = options.html;
  if (options.react && !html) {
    try {
      const { render } = await import('@react-email/render');
      html = await render(options.react);
    } catch (e) {
      console.error('[Email] Failed to render React email:', e);
    }
  }

  // If no API key, log to console in development
  if (!RESEND_API_KEY) {
    console.log('[Email] Would send email:', {
      to: options.to,
      subject: options.subject,
      from: options.from || `${FROM_NAME} <${FROM_EMAIL}>`,
      hasHtml: !!html,
    });
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || `${FROM_NAME} <${FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: html,
        text: options.text,
        reply_to: options.replyTo,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content instanceof Buffer 
            ? att.content.toString('base64') 
            : Buffer.from(att.content).toString('base64'),
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  to: string, 
  resetToken: string
): Promise<EmailResult> {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = await render(
    React.createElement(PasswordResetEmail, {
      resetUrl,
      expiresIn: '24 hours',
    })
  );

  return sendEmail({
    to,
    subject: 'Reset your Genetic Explorer password',
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  });
}

/**
 * Send an email verification email
 */
export async function sendVerificationEmail(
  to: string, 
  verificationToken: string
): Promise<EmailResult> {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  const html = await render(
    React.createElement(EmailVerification, {
      verificationUrl: verifyUrl,
    })
  );

  return sendEmail({
    to,
    subject: 'Verify your Genetic Explorer email',
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  });
}

/**
 * Send a welcome email
 */
export async function sendWelcomeEmail(
  to: string, 
  name: string
): Promise<EmailResult> {
  const html = await render(
    React.createElement(WelcomeEmail, {
      userName: name,
      loginUrl: `${process.env.APP_URL || 'http://localhost:3000'}/login`,
      uploadUrl: `${process.env.APP_URL || 'http://localhost:3000'}/upload`,
    })
  );

  return sendEmail({
    to,
    subject: 'Welcome to Genetic Explorer!',
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  });
}

/**
 * Send a sharing invitation email
 */
export async function sendSharingInvitation(
  to: string, 
  inviterName: string,
  inviterEmail: string,
  inviteToken: string,
  permissionLevel: string = 'view'
): Promise<EmailResult> {
  const acceptUrl = `${process.env.APP_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;
  
  const html = await render(
    React.createElement(SharingInvitation, {
      inviterName,
      inviterEmail,
      acceptUrl,
      permissionLevel: permissionLevel as 'view' | 'download' | 'manage',
      expiresIn: '7 days',
    })
  );

  return sendEmail({
    to,
    subject: `${inviterName} wants to share genetic data with you on Genetic Explorer`,
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  });
}

/**
 * Send a magic link email
 */
export async function sendMagicLinkEmail(
  to: string, 
  magicToken: string
): Promise<EmailResult> {
  const magicUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/magic?token=${magicToken}`;
  
  const html = await render(
    React.createElement(MagicLinkEmail, {
      magicLink: magicUrl,
      userEmail: to,
      expiresIn: '15 minutes',
    })
  );

  return sendEmail({
    to,
    subject: 'Your magic link to sign in to Genetic Explorer',
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  });
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormNotification(
  adminEmail: string,
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<EmailResult> {
  const html = await render(
    React.createElement(ContactFormNotification, {
      name,
      email,
      subject,
      message,
      type: 'contact',
    })
  );

  return sendEmail({
    to: adminEmail,
    subject: `Contact Form: ${subject}`,
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: email,
  });
}

/**
 * Send contact form confirmation to user
 */
export async function sendContactFormConfirmation(
  to: string,
  name: string,
  subject: string
): Promise<EmailResult> {
  const html = await render(
    React.createElement(ContactFormConfirmation, {
      name,
      subject,
    })
  );

  return sendEmail({
    to,
    subject: 'We received your message - Genetic Explorer',
    html,
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  });
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

/**
 * Get email configuration status
 */
export function getEmailStatus(): {
  configured: boolean;
  from: string;
} {
  return {
    configured: isEmailConfigured(),
    from: FROM_EMAIL,
  };
}
