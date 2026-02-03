import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getGenome } from '~/utils/database';
import { verifyOwnership, canAccessGenome, DataAccessError } from '~/utils/dataAccessControl';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/genome/$id')({
  GET: async ({ request, params }) => {
    try {
      const auth = requireAuth(request);
      const genome = getGenome(params.id);

      if (!genome) {
        return json({ success: false, error: 'Genome not found' }, { status: 404 });
      }

      // Verify user has access to this genome
      const access = await canAccessGenome(auth.id, params.id);
      if (!access.canAccess) {
        return json({ success: false, error: 'Access denied' }, { status: 403 });
      }

      // If not owner, don't return sensitive data
      if (access.permissionLevel !== 'owner') {
        return json({
          success: true,
          genome: {
            id: genome.id,
            filename: genome.filename,
            original_filename: genome.original_filename,
            source: genome.source,
            snp_count: genome.snp_count,
            processed_at: genome.processed_at,
            status: genome.status,
            nickname: genome.nickname,
            // Exclude raw data and sensitive fields for shared users
          },
          permissionLevel: access.permissionLevel,
        });
      }

      return json({ success: true, genome, permissionLevel: 'owner' });
    } catch (error) {
      if (error instanceof DataAccessError) {
        return json({ success: false, error: error.message }, { status: error.code === 'UNAUTHORIZED' ? 401 : 403 });
      }
      console.error('Failed to fetch genome:', error);
      return json({ success: false, error: 'Failed to fetch genome' }, { status: 500 });
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const auth = requireAuth(request);

      // Verify ownership before deletion
      await verifyOwnership(auth.id, 'genome', params.id);

      // Perform deletion
      const { deleteGenome } = require('~/utils/database');
      const success = deleteGenome(params.id, auth.id);

      if (!success) {
        return json({ success: false, error: 'Failed to delete genome' }, { status: 500 });
      }

      return json({ success: true, message: 'Genome deleted successfully' });
    } catch (error) {
      if (error instanceof DataAccessError) {
        return json({ success: false, error: error.message }, { status: error.code === 'UNAUTHORIZED' ? 401 : 403 });
      }
      console.error('Failed to delete genome:', error);
      return json({ success: false, error: 'Failed to delete genome' }, { status: 500 });
    }
  },
});
