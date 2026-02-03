import { z } from 'zod';

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Required
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // Optional with defaults
  DATABASE_URL: z.string().default('./data/genetic_explorer.db'),
  UPLOADS_DIR: z.string().default('./uploads'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  APP_URL: z.string().default('http://localhost:3000'),
  
  // OpenAI (optional but recommended)
  OPENAI_API_KEY: z.string().min(1).optional().or(z.literal('')),
  
  // Encryption (optional for dev, required for prod)
  ENCRYPTION_MASTER_KEY: z.string().min(32).optional().or(z.literal('')),
  
  // Email configuration
  EMAIL_PROVIDER: z.enum(['resend', 'smtp']).default('resend'),
  EMAIL_FROM: z.string().email().default('noreply@geneticexplorer.com'),
  EMAIL_FROM_NAME: z.string().default('Genetic Explorer'),
  SUPPORT_EMAIL: z.string().email().default('support@geneticexplorer.com'),
  
  // Resend
  RESEND_API_KEY: z.string().optional().or(z.literal('')),
  
  // SMTP (if using SMTP provider)
  SMTP_HOST: z.string().optional().or(z.literal('')),
  SMTP_PORT: z.string().default('587'),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string().optional().or(z.literal('')),
  SMTP_PASS: z.string().optional().or(z.literal('')),
  
  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal('')),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal('')),
  GITHUB_CLIENT_ID: z.string().optional().or(z.literal('')),
  GITHUB_CLIENT_SECRET: z.string().optional().or(z.literal('')),
  OAUTH_CALLBACK_URL: z.string().optional().or(z.literal('')),
  
  // Signup restrictions
  DISABLE_SIGNUP: z.string().default('false'),
  DISABLE_PASSWORD_SIGNUP: z.string().default('false'),
  ALLOWED_EMAIL_DOMAINS: z.string().optional().or(z.literal('')),
  BLOCKED_EMAIL_DOMAINS: z.string().optional().or(z.literal('')),
  INVITE_ONLY: z.string().default('false'),
  REQUIRE_EMAIL_VERIFICATION: z.string().default('true'),
  SIGNUP_RATE_LIMIT_PER_IP: z.string().default('10'),
  
  // Feature flags
  ENABLE_NOTIFICATIONS: z.string().default('true'),
  ENABLE_SHARING: z.string().default('true'),
  ENABLE_RESEARCH_UPDATES: z.string().default('true'),
  
  // Analytics (optional)
  POSTHOG_API_KEY: z.string().optional().or(z.literal('')),
  POSTHOG_HOST: z.string().default('https://app.posthog.com'),
  
  // Error tracking (optional)
  SENTRY_DSN: z.string().optional().or(z.literal('')),
});

/**
 * Parsed and validated environment variables
 */
export const env = envSchema.parse(process.env);

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Validate environment on module load
 * This will throw if required variables are missing in production
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (isProduction) {
    if (!env.ENCRYPTION_MASTER_KEY || env.ENCRYPTION_MASTER_KEY.length < 32) {
      errors.push('ENCRYPTION_MASTER_KEY is required in production and must be at least 32 characters');
    }
    
    if (!env.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is recommended in production for AI analysis features');
    }
    
    if (env.EMAIL_PROVIDER === 'resend' && !env.RESEND_API_KEY) {
      errors.push('RESEND_API_KEY is required when EMAIL_PROVIDER is resend');
    }
    
    if (env.EMAIL_PROVIDER === 'smtp') {
      if (!env.SMTP_HOST) errors.push('SMTP_HOST is required when EMAIL_PROVIDER is smtp');
      if (!env.SMTP_USER) errors.push('SMTP_USER is required when EMAIL_PROVIDER is smtp');
      if (!env.SMTP_PASS) errors.push('SMTP_PASS is required when EMAIL_PROVIDER is smtp');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get public environment variables (safe to expose to client)
 */
export function getPublicEnv() {
  return {
    NODE_ENV: env.NODE_ENV,
    APP_URL: env.APP_URL,
    ENABLE_NOTIFICATIONS: env.ENABLE_NOTIFICATIONS,
    ENABLE_SHARING: env.ENABLE_SHARING,
    ENABLE_RESEARCH_UPDATES: env.ENABLE_RESEARCH_UPDATES,
  };
}

export default env;
