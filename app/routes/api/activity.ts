import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getUserActivity } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/activity')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);

      const activities = getUserActivity(auth.user.id, limit);

      return json({
        success: true,
        activities: activities.map(a => ({
          id: a.id,
          action: a.action,
          resourceType: a.resourceType,
          resourceId: a.resourceId,
          details: a.details,
          createdAt: a.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Get activity error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
