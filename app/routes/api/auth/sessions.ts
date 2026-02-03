import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth';
import { getUserSessions, deleteSession } from '~/utils/database';
import { logActivity } from '~/utils/database';
import { getClientIp } from '~/utils/rateLimit';

// Get user sessions
export const APIRouteGet = createAPIFileRoute('/api/auth/sessions')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      
      // Get current session token from cookie
      const cookieHeader = request.headers.get('cookie');
      const currentToken = cookieHeader
        ?.split(';')
        .find(c => c.trim().startsWith('session_token='))
        ?.split('=')[1];

      const sessions = getUserSessions(auth.id, currentToken);

      return json({
        success: true,
        sessions: sessions.map(s => ({
          id: s.id,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          lastActiveAt: s.lastActiveAt?.toISOString() || null,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          isCurrent: s.isCurrent,
        })),
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Get sessions error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// Delete a specific session (logout from another device)
export const APIRouteDelete = createAPIFileRoute('/api/auth/sessions')({
  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('id');
      
      if (!sessionId) {
        return json({ success: false, error: 'Session ID required' }, { status: 400 });
      }

      // Get the session to verify it belongs to the user
      const sessions = getUserSessions(auth.id);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return json({ success: false, error: 'Session not found' }, { status: 404 });
      }

      // Delete the session
      deleteSession(session.token);

      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'session_revoked', 'session', sessionId, {}, ipAddress);

      return json({
        success: true,
        message: 'Session terminated successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Delete session error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// Delete all other sessions (logout from all devices except current)
export const APIRouteDeleteAll = createAPIFileRoute('/api/auth/sessions')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const body = await request.json();
      const { action } = body;

      if (action !== 'logout_all') {
        return json({ success: false, error: 'Invalid action' }, { status: 400 });
      }

      // Get current session token from cookie
      const cookieHeader = request.headers.get('cookie');
      const currentToken = cookieHeader
        ?.split(';')
        .find(c => c.trim().startsWith('session_token='))
        ?.split('=')[1];

      if (!currentToken) {
        return json({ success: false, error: 'Current session not found' }, { status: 400 });
      }

      // Get all sessions and delete all except current
      const sessions = getUserSessions(auth.id, currentToken);
      let deletedCount = 0;

      for (const session of sessions) {
        if (!session.isCurrent) {
          deleteSession(session.token);
          deletedCount++;
        }
      }

      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'all_sessions_revoked', 'user', auth.id, { deletedCount }, ipAddress);

      return json({
        success: true,
        message: `Logged out from ${deletedCount} other device(s)`,
        deletedCount,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Delete all sessions error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
