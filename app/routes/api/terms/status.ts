import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getUserTermsStatus } from '~/utils/terms';
import { getAuthUserSafe } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/terms/status')({
  GET: async ({ request }) => {
    try {
      const auth = getAuthUserSafe(request);
      
      if (!auth) {
        return json({ 
          success: false, 
          error: 'Authentication required' 
        }, { status: 401 });
      }
      
      const status = getUserTermsStatus(auth.user.id);
      
      return json({
        success: true,
        status,
      }, { status: 200 });
    } catch (error) {
      console.error('Error fetching terms status:', error);
      return json({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  },
});
