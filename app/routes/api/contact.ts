import { createAPIFileRoute } from '@tanstack/start/api';
import { sendEmail } from '~/utils/email';
import { ContactFormNotification, ContactFormConfirmation } from '~/emails/ContactForm';
import * as React from 'react';

export const APIRoute = createAPIFileRoute('/api/contact')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { name, email, subject, message, type } = body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return Response.json({ 
          success: false, 
          error: 'Name, email, subject, and message are required' 
        }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return Response.json({ 
          success: false, 
          error: 'Invalid email address' 
        }, { status: 400 });
      }

      // Store in database (optional - for tracking)
      // await storeContactSubmission({ name, email, subject, message, type });

      // Send notification to support team
      const supportEmail = process.env.SUPPORT_EMAIL || 'support@geneticexplorer.com';
      const notificationResult = await sendEmail({
        to: supportEmail,
        subject: `[${type.toUpperCase()}] ${subject}`,
        react: React.createElement(ContactFormNotification, {
          name,
          email,
          subject,
          message,
          type,
        }),
      });

      if (!notificationResult.success) {
        console.error('Failed to send support notification:', notificationResult.error);
      }

      // Send confirmation to user
      const confirmationResult = await sendEmail({
        to: email,
        subject: 'We received your message - Genetic Explorer',
        react: React.createElement(ContactFormConfirmation, {
          name,
          subject,
        }),
      });

      if (!confirmationResult.success) {
        console.error('Failed to send user confirmation:', confirmationResult.error);
        // Don't fail the request if confirmation fails, but log it
      }

      return Response.json({ 
        success: true, 
        message: 'Message received successfully' 
      });
    } catch (error) {
      console.error('Contact form error:', error);
      return Response.json({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  },
});
