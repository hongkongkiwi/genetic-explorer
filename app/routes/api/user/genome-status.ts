import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getGenomeStatus, getGatedFeaturesList } from '~/utils/genomeGate';

/**
 * GET /api/user/genome-status
 * 
 * Returns the user's genome upload status and available features.
 * Used by frontend to show/hide gated features.
 */
export const APIRoute = createAPIFileRoute('/api/user/genome-status')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const genomeStatus = getGenomeStatus(auth.id);
      const gatedFeatures = getGatedFeaturesList();

      return json({
        success: true,
        data: {
          ...genomeStatus,
          gatedFeatures: genomeStatus.hasGenome ? [] : gatedFeatures,
          ungatedFeatures: [
            'account-settings',
            'profile',
            'security',
            'notifications',
            'help',
            'upload-genome',
          ],
        },
      });

    } catch (error) {
      console.error('Genome status error:', error);
      return json(
        {
          success: false,
          error: 'Failed to get genome status',
        },
        { status: 500 }
      );
    }
  },
});
