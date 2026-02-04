import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { csrfProtection } from '~/utils/csrf';
import { 
  getSharedWithMe, 
  getMyShares, 
  createSharingPermission,
  createSharingInvite,
  revokeSharingPermission,
  getUserByEmail,
  getGenome,
  getDb,
  type SharingPermission
} from '~/utils/database';

export const APIRoute = createAPIFileRoute('/api/sharing')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const url = new URL(request.url);
      const type = url.searchParams.get('type');

      if (type === 'shared-with-me') {
        const shared = getSharedWithMe(auth.id);
        return json({ success: true, data: shared });
      }

      // Default: get my shares
      const shares = getMyShares(auth.id);
      return json({ success: true, data: shares });
    } catch (error) {
      console.error('Get sharing API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },

  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (csrfCheck.valid === false) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }

      const body = await request.json();
      const { email, genomeId, permissionLevel = 'view', expiresAt, message } = body;

      if (!email) {
        return json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      // Validate permission level
      if (!['view', 'download', 'manage'].includes(permissionLevel)) {
        return json({ success: false, error: 'Invalid permission level' }, { status: 400 });
      }

      // Check if user exists
      const targetUser = getUserByEmail(email);

      // If sharing specific genome, verify ownership
      if (genomeId) {
        const genome = getGenome(genomeId);
        if (!genome) {
          return json({ success: false, error: 'Genome not found' }, { status: 404 });
        }
        // Verify the requester owns this genome
        // Note: getGenome doesn't return user_id in the result, need to query directly
        const ownershipCheck = getDb().prepare(`
          SELECT id FROM genomes WHERE id = ? AND user_id = ?
        `).get(genomeId, auth.id);

        if (!ownershipCheck) {
          return json({ success: false, error: 'You do not own this genome' }, { status: 403 });
        }
      }

      let result: SharingPermission | { inviteToken: string };

      if (targetUser) {
        // Create direct sharing permission
        const expires = expiresAt ? new Date(expiresAt) : undefined;
        result = createSharingPermission(
          auth.id,
          targetUser.id,
          permissionLevel,
          genomeId,
          expires,
          message
        );
      } else {
        // Create an invite
        const invite = createSharingInvite(
          auth.id,
          email,
          permissionLevel,
          genomeId,
          expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 7
        );
        result = { inviteToken: invite.inviteToken };
      }

      return json({ success: true, data: result }, { status: 201 });
    } catch (error) {
      console.error('Create sharing API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },

  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (csrfCheck.valid === false) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }

      const url = new URL(request.url);
      const permissionId = url.searchParams.get('id');

      if (!permissionId) {
        return json({ success: false, error: 'Permission ID is required' }, { status: 400 });
      }

      const success = revokeSharingPermission(permissionId, auth.id);

      if (!success) {
        return json({ success: false, error: 'Permission not found or you do not have permission to revoke it' }, { status: 404 });
      }

      return json({ success: true });
    } catch (error) {
      console.error('Revoke sharing API error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
