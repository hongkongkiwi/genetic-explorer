/**
 * Email Utilities
 * 
 * Re-exports from the main email module.
 */

export {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendMagicLinkEmail,
  sendSharingInvitation,
  sendContactFormNotification,
  sendContactFormConfirmation,
  isEmailConfigured,
  getEmailStatus,
  type EmailOptions,
  type EmailResult,
} from '~/email';
