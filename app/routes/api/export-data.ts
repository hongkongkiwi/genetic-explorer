import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth.server';
import { exportUserDataAsZip, deleteAllUserData } from '~/utils/dataExport';
import { rateLimitSensitive } from '~/utils/rateLimit';
import { logSecurityEvent } from '~/utils/security';

export const APIRoute = createAPIFileRoute('/api/export-data')({
  // GET /api/export-data - Export all user data
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // Rate limit sensitive data export
      const rateLimit = rateLimitSensitive(user.id);
      if (!rateLimit.allowed) {
        return Response.json({
          success: false,
          error: `Too many export requests. Please try again in ${rateLimit.retryAfter} seconds.`,
        }, { status: 429 });
      }

      logSecurityEvent('data_export_initiated', {
        userId: user.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }, 'info');

      // Generate comprehensive export
      const result = await exportUserDataAsZip(user.id, {});

      if (!result.success) {
        return Response.json({ success: false, error: result.error }, { status: 500 });
      }

      // For now, return JSON instead of ZIP (ZIP requires additional setup)
      return Response.json({
        success: true,
        message: 'Data export available in JSON format. ZIP export requires additional configuration.',
        data: result.data,
      });
    } catch (error) {
      console.error('Export data error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },

  // DELETE /api/export-data - Delete all user data (GDPR right to be forgotten)
  DELETE: async ({ request }) => {
    try {
      const user = requireAuth(request);
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // Rate limit deletion requests
      const rateLimit = rateLimitSensitive(user.id);
      if (!rateLimit.allowed) {
        return Response.json({
          success: false,
          error: `Too many deletion requests. Please try again in ${rateLimit.retryAfter} seconds.`,
        }, { status: 429 });
      }

      // Get confirmation from body
      const body = await request.json().catch(() => ({}));
      if (!body.confirm || body.confirm !== `DELETE ${user.email}`) {
        return Response.json({
          success: false,
          error: 'Confirmation required. Send {confirm: "DELETE ' + user.email + '"}',
        }, { status: 400 });
      }

      logSecurityEvent('account_deletion_initiated', {
        userId: user.id,
        email: user.email,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }, 'warning');

      // Delete all data
      const result = await deleteAllUserData(user.id);

      if (result.success) {
        logSecurityEvent('account_deletion_completed', {
          userId: user.id,
          deletedItems: result.deletedItems,
        }, 'warning');

        return Response.json({
          success: true,
          message: 'All user data has been deleted',
          deletedItems: result.deletedItems,
        }, {
          headers: {
            // Clear session cookie
            'Set-Cookie': 'session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
          },
        });
      } else {
        return Response.json({
          success: false,
          error: 'Partial deletion completed with errors',
          deletedItems: result.deletedItems,
          errors: result.errors,
        }, { status: 500 });
      }
    } catch (error) {
      console.error('Delete data error:', error);
      return Response.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
