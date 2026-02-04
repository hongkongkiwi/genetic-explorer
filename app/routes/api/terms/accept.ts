import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { acceptTerms, getUserTermsStatus } from '~/utils/terms';
import { getAuthUserSafe } from '~/utils/auth';
import { getClientIp } from '~/utils/rateLimit';
import { logActivity } from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/terms/accept')({
  POST: async ({ request }) => {
    try {
      // Get the authenticated user
      const auth = getAuthUserSafe(request);
      
      if (!auth) {
        // Check for pending login (user has verified credentials but hasn't accepted terms)
        // In this case, we need a special token or the user ID from the pending login
        const body = await request.json();
        const { pendingUserId } = body;
        
        if (!pendingUserId) {
          return json({ 
            success: false, 
            error: 'Authentication required' 
          }, { status: 401 });
        }
        
        // Accept terms for pending user
        const ipAddress = getClientIp(request);
        const userAgent = request.headers.get('user-agent') || undefined;
        
        const result = acceptTerms(pendingUserId, ipAddress, userAgent);
        
        if (!result.success) {
          return json({ 
            success: false, 
            error: result.error || 'Failed to accept terms' 
          }, { status: 500 });
        }
        
        // Log the acceptance
        logActivity(pendingUserId, 'terms_accepted', 'user', pendingUserId, {}, ipAddress);
        
        // Return the updated status
        const termsStatus = getUserTermsStatus(pendingUserId);
        
        return json({
          success: true,
          message: 'Terms accepted successfully',
          termsStatus,
        }, { status: 200 });
      }
      
      // User is fully authenticated - accept terms
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent') || undefined;
      
      const result = acceptTerms(auth.user.id, ipAddress, userAgent);
      
      if (!result.success) {
        return json({ 
          success: false, 
          error: result.error || 'Failed to accept terms' 
        }, { status: 500 });
      }
      
      // Log the acceptance
      logActivity(auth.user.id, 'terms_accepted', 'user', auth.user.id, {}, ipAddress);
      
      // Return the updated status
      const termsStatus = getUserTermsStatus(auth.user.id);
      
      return json({
        success: true,
        message: 'Terms accepted successfully',
        termsStatus,
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error accepting terms:', error);
      return json({ 
        success: false, 
        error: 'An unexpected error occurred' 
      }, { status: 500 });
    }
  },
});
