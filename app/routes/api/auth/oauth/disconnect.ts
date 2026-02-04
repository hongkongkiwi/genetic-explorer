import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { unlinkOAuthAccount, getUserOAuthAccounts } from '~/utils/database';
import { logActivity } from '~/utils/database';
import { getClientIp } from '~/utils/rateLimit';
import { OAuthProvider } from '~/utils/oauth';
import { csrfProtection } from '~/utils/csrf';

export const APIRoute = createAPIFileRoute('/api/auth/oauth/disconnect')({
  POST: async ({ request }) => {
    try {
      // Require authentication
      const auth = requireAuth(request);

      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (!csrfCheck.valid) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }

      const body = await request.json();
      const { provider } = body as { provider: OAuthProvider };

      // Validate provider
      if (!provider || !['google', 'github'].includes(provider)) {
        return json({ success: false, error: 'Invalid OAuth provider' }, { status: 400 });
      }

      // Check if user has other OAuth accounts or password
      const oauthAccounts = getUserOAuthAccounts(auth.id);
      const hasOtherOAuth = oauthAccounts.length > 1;

      if (!hasOtherOAuth) {
        // Check if user has a password (can check via database)
        // For now, we'll allow disconnect but warn the user
        // In production, you might want to require them to set a password first
      }

      // Unlink the OAuth account
      const success = unlinkOAuthAccount(auth.id, provider);

      if (!success) {
        return json({ success: false, error: 'OAuth account not found' }, { status: 404 });
      }

      const ipAddress = getClientIp(request);

      // Log activity
      logActivity(auth.id, 'oauth_disconnect', 'oauth_account', auth.id, { provider }, ipAddress);

      return json({
        success: true,
        message: `Successfully disconnected ${provider}`,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('OAuth disconnect error:', error);
      return json({ success: false, error: 'Failed to disconnect OAuth account' }, { status: 500 });
    }
  },
});
