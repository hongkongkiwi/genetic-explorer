import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getTermsAndPrivacy } from '~/utils/terms';

export const APIRoute = createAPIFileRoute('/api/terms/current')({
  GET: async () => {
    try {
      const data = getTermsAndPrivacy();
      
      return json({
        success: true,
        data,
      }, { status: 200 });
    } catch (error) {
      console.error('Error fetching current terms:', error);
      return json({ 
        success: false, 
        error: 'Failed to fetch terms' 
      }, { status: 500 });
    }
  },
});
