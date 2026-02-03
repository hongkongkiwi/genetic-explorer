import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getUserOAuthAccounts, unlinkOAuthAccount, getUserById } from '~/utils/database';
import { logActivity } from '~/utils/database';
import { getClientIp } from '~/utils/rateLimit';

// Get connected OAuth accounts
export const APIRouteGet = createAPIFileRoute('/api/auth/accounts')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      const accounts = getUserOAuthAccounts(auth.id);
      const user = getUserById(auth.id);

      return json({
        success: true,
        accounts: accounts.map(a => ({
          id: a.id,
          provider: a.provider,
          email: a.email,
          name: a.name,
          avatarUrl: a.avatarUrl,
          createdAt: a.createdAt.toISOString(),
        })),
        hasPassword: !!user?.passwordHash,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Get accounts error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// Disconnect OAuth account
export const APIRouteDelete = createAPIFileRoute('/api/auth/accounts')({
  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const body = await request.json();
      const { provider } = body;

      if (!provider || !['google', 'github'].includes(provider)) {
        return json({ success: false, error: 'Invalid provider' }, { status: 400 });
      }

      // Check if user has a password or other OAuth accounts
      const user = getUserById(auth.id);
      const accounts = getUserOAuthAccounts(auth.id);
      const hasOtherAccounts = accounts.length > 1;
      const hasPassword = !!user?.passwordHash;

      if (!hasOtherAccounts && !hasPassword) {
        return json({
          success: false,
          error: 'You cannot disconnect your only sign-in method. Please set a password first.',
        }, { status: 400 });
      }

      const success = unlinkOAuthAccount(auth.id, provider as 'google' | 'github');

      if (!success) {
        return json({ success: false, error: 'Account not found' }, { status: 404 });
      }

      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'oauth_disconnected', 'oauth_account', auth.id, { provider }, ipAddress);

      return json({
        success: true,
        message: `Successfully disconnected ${provider} account`,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Disconnect account error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
