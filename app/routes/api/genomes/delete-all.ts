import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { csrfProtection } from '~/utils/csrf';
import { deleteAllUserGenomes, logActivity } from '~/utils/database';

/**
 * DELETE /api/genomes/delete-all
 * 
 * Deletes all genome data for the authenticated user while keeping their account.
 * This puts the user back in "genome-gated" status.
 * 
 * This is different from account deletion - the user can still:
 * - Log in
 * - Manage account settings
 * - Upload new genomes
 * - Access ungated features
 */
export const APIRoute = createAPIFileRoute('/api/genomes/delete-all')({
  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (csrfCheck.valid === false) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }

      const userId = auth.id;

      // Delete all genomes using the database function
      const deleteResult = deleteAllUserGenomes(userId);
      
      if (deleteResult.deletedCount === 0) {
        return json({
          success: true,
          message: 'No genome data to delete',
          deletedCount: 0,
        });
      }

      // Log the activity
      logActivity(
        userId,
        'genome_data_deleted',
        'security',
        undefined,
        {
          genomesDeleted: deleteResult.deletedCount,
          filesDeleted: deleteResult.deletedFiles.length,
          filesFailed: deleteResult.failedFiles.length,
          timestamp: new Date().toISOString(),
        }
      );

      return json({
        success: true,
        message: `Successfully deleted ${deleteResult.deletedCount} genome(s) and associated data`,
        deletedCount: deleteResult.deletedCount,
        filesDeleted: deleteResult.deletedFiles.length,
        filesFailed: deleteResult.failedFiles.length > 0 ? deleteResult.failedFiles.length : undefined,
        note: 'Your account and settings have been preserved. You can upload new genomes anytime.',
      });

    } catch (error) {
      console.error('Delete all genomes error:', error);
      return json(
        {
          success: false,
          error: 'Failed to delete genome data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  },
});
