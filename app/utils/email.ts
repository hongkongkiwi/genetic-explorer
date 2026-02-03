import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import * as React from 'react';

// Email provider types
export type EmailProvider = 'resend' | 'smtp';

interface EmailConfig {
  provider: EmailProvider;
  // Resend config
  resendApiKey?: string;
  // SMTP config
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  // Common
  fromEmail: string;
  fromName: string;
}

// Get email config from environment
function getEmailConfig(): EmailConfig {
  const provider = (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend';
  
  return {
    provider,
    resendApiKey: process.env.RESEND_API_KEY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    fromEmail: process.env.EMAIL_FROM || 'noreply@geneticexplorer.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Genetic Explorer',
  };
}

// Initialize email clients
let resendClient: Resend | null = null;
let smtpTransporter: nodemailer.Transporter | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const config = getEmailConfig();
    if (!config.resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    resendClient = new Resend(config.resendApiKey);
  }
  return resendClient;
}

function getSmtpTransporter(): nodemailer.Transporter {
  if (!smtpTransporter) {
    const config = getEmailConfig();
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      throw new Error('SMTP configuration incomplete');
    }
    
    smtpTransporter = nodemailer.createTransporter({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }
  return smtpTransporter;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using configured provider (Resend or SMTP)
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const config = getEmailConfig();
  
  try {
    // Render React component to HTML if provided
    let html = options.html;
    if (options.react && !html) {
      html = await render(options.react);
    }
    
    // Generate plain text from HTML if not provided
    let text = options.text;
    if (html && !text) {
      // Simple HTML to text conversion
      text = html
        .replace(/<style[^>]*>.*<\/style>/gs, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const from = `${config.fromName} <${config.fromEmail}>`;
    
    if (config.provider === 'resend') {
      return await sendWithResend({ ...options, html, text, from });
    } else {
      return await sendWithSmtp({ ...options, html, text, from });
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function sendWithResend(
  options: SendEmailOptions & { html?: string; text?: string; from: string }
): Promise<EmailResult> {
  const client = getResendClient();
  
  const { data, error } = await client.emails.send({
    from: options.from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
    })),
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, messageId: data?.id };
}

async function sendWithSmtp(
  options: SendEmailOptions & { html?: string; text?: string; from: string }
): Promise<EmailResult> {
  const transporter = getSmtpTransporter();
  
  const info = await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
  });
  
  return { success: true, messageId: info.messageId };
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<{ valid: boolean; error?: string }> {
  const config = getEmailConfig();
  
  try {
    if (config.provider === 'resend') {
      if (!config.resendApiKey) {
        return { valid: false, error: 'RESEND_API_KEY not set' };
      }
      const client = getResendClient();
      // Resend doesn't have a direct verify method, but we can check domains
      const { error } = await client.domains.list();
      if (error) {
        return { valid: false, error: error.message };
      }
    } else {
      if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
        return { valid: false, error: 'SMTP configuration incomplete' };
      }
      const transporter = getSmtpTransporter();
      await transporter.verify();
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send bulk emails (batch)
 */
export async function sendBulkEmails(
  emails: SendEmailOptions[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(emails.map(sendEmail));
  
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      success++;
    } else {
      failed++;
      if (result.status === 'rejected') {
        errors.push(result.reason?.message || 'Unknown error');
      } else if (!result.value.success) {
        errors.push(result.value.error || 'Unknown error');
      }
    }
  });
  
  return { success, failed, errors };
}
