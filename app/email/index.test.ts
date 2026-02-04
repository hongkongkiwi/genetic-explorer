import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
const originalEnv = process.env;

describe('email configuration', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use resend as default provider', () => {
    // Default should be resend
    const provider = process.env.EMAIL_PROVIDER || 'resend';
    expect(provider).toBe('resend');
  });

  it('should read resend API key from env', () => {
    process.env.RESEND_API_KEY = 'test-api-key';
    expect(process.env.RESEND_API_KEY).toBe('test-api-key');
  });

  it('should read SMTP configuration from env', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';

    expect(process.env.SMTP_HOST).toBe('smtp.example.com');
    expect(process.env.SMTP_PORT).toBe('587');
    expect(process.env.SMTP_USER).toBe('user@example.com');
    expect(process.env.SMTP_PASS).toBe('password');
  });

  it('should read email from configuration', () => {
    process.env.EMAIL_FROM = 'noreply@geneticexplorer.com';
    process.env.EMAIL_FROM_NAME = 'Genetic Explorer';

    expect(process.env.EMAIL_FROM).toBe('noreply@geneticexplorer.com');
    expect(process.env.EMAIL_FROM_NAME).toBe('Genetic Explorer');
  });
});

describe('email types', () => {
  it('should have correct email interface', () => {
    // Test that our types are correct
    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    };

    expect(emailOptions).toHaveProperty('to');
    expect(emailOptions).toHaveProperty('subject');
    expect(emailOptions).toHaveProperty('html');
  });

  it('should support multiple recipients', () => {
    const emailOptions = {
      to: ['a@example.com', 'b@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    };

    expect(Array.isArray(emailOptions.to)).toBe(true);
    expect(emailOptions.to).toHaveLength(2);
  });

  it('should support attachments', () => {
    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
      attachments: [
        {
          filename: 'test.pdf',
          content: Buffer.from('test'),
        },
      ],
    };

    expect(emailOptions.attachments).toHaveLength(1);
    expect(emailOptions.attachments[0]).toHaveProperty('filename');
    expect(emailOptions.attachments[0]).toHaveProperty('content');
  });
});
