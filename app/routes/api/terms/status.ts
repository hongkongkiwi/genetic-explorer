import { createAPIFileRoute } from '@tanstack/start/api';
import { getUserTermsStatus } from '~/utils/terms';
import { getAuthUserSafe } from '~/utils/auth.server';

export const APIRoute = createAPIFileRoute('/api/terms/status')({
  GET: async ({ request }) => {
    try {
      const auth = getAuthUserSafe(request);
      
      if (!auth) {
        return Response.json({ 
          success: false, 
          error: 'Authentication required' 
        }, { status: 401 });
      }
      
      const status = getUserTermsStatus(auth.user.id);
      
      return Response.json({
        success: true,
        status,
      }, { status: 200 });
    } catch (error) {
      console.error('Error fetching terms status:', error);
      return Response.json({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  },
});
