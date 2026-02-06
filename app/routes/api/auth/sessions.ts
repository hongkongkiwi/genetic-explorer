import { createAPIFileRoute } from '@tanstack/start/api';
import { requireAuth } from '~/utils/auth.server';
import { getClientIp } from '~/utils/rateLimit';
import { logActivity } from '~/utils/database';
import { sendSecurityNotification } from '~/utils/securityNotifications';
import {
  getUserSessions,
  getSessionHistory,
  terminateSession,
  terminateOtherSessions,
  terminateAllUserSessions,
  recordSessionActivity,
} from '~/utils/sessionManagement';

// ============================================================================
// GET: Get all active sessions and session history
// ============================================================================

export const APIRouteGetSessions = createAPIFileRoute('/api/auth/sessions')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      
      // Get current session token
      const cookieHeader = request.headers.get('Cookie');
      const currentToken = cookieHeader?.match(/session_token=([^;]+)/)?.[1];

      // Record activity for current session
      if (currentToken) {
        recordSessionActivity(currentToken);
      }

      // Get active sessions
      const sessions = getUserSessions(auth.id, currentToken);
      
      // Get session history
      const history = getSessionHistory(auth.id, 20);

      return Response.json({
        success: true,
        data: {
          activeSessions: sessions,
          sessionHistory: history,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Get sessions error:', error);
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});

// ============================================================================
// DELETE: Terminate a specific session
// ============================================================================

export const APIRouteDeleteSession = createAPIFileRoute('/api/auth/sessions')({
  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent');
      
      const body = await request.json();
      const { sessionId } = body;

      if (!sessionId) {
        return Response.json(
          { success: false, error: 'Session ID required' },
          { status: 400 }
        );
      }

      // Get current session token
      const cookieHeader = request.headers.get('Cookie');
      const currentToken = cookieHeader?.match(/session_token=([^;]+)/)?.[1];

      // Get sessions to check if terminating current session
      const sessions = getUserSessions(auth.id, currentToken);
      const targetSession = sessions.find(s => s.id === sessionId);
      
      if (!targetSession) {
        return Response.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      const isCurrentSession = targetSession.isCurrentSession;

      // Terminate the session
      const terminated = terminateSession(auth.id, sessionId, 'user_terminated');

      if (!terminated) {
        return Response.json(
          { success: false, error: 'Failed to terminate session' },
          { status: 500 }
        );
      }

      // Log the action
      logActivity(
        auth.id,
        'session_terminated',
        'user',
        auth.id,
        { sessionId, isCurrentSession },
        ipAddress
      );

      // Send security notification
      sendSecurityNotification(
        auth.id,
        'session_terminated',
        {
          device: targetSession.deviceInfo.device,
          browser: targetSession.deviceInfo.browser,
          os: targetSession.deviceInfo.os,
        },
        ipAddress || undefined,
        userAgent || undefined
      );

      return Response.json({
        success: true,
        message: 'Session terminated successfully',
        terminatedCurrentSession: isCurrentSession,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Terminate session error:', error);
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});

// ============================================================================
// POST: Terminate all other sessions
// ============================================================================

export const APIRouteTerminateOthers = createAPIFileRoute('/api/auth/sessions')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent');
      
      // Get current session token
      const cookieHeader = request.headers.get('Cookie');
      const currentToken = cookieHeader?.match(/session_token=([^;]+)/)?.[1];

      if (!currentToken) {
        return Response.json(
          { success: false, error: 'Current session not found' },
          { status: 400 }
        );
      }

      // Terminate other sessions
      const terminatedCount = terminateOtherSessions(
        auth.id,
        currentToken,
        'user_terminated_others'
      );

      // Log the action
      logActivity(
        auth.id,
        'all_other_sessions_terminated',
        'user',
        auth.id,
        { terminatedCount },
        ipAddress
      );

      // Send security notification
      sendSecurityNotification(
        auth.id,
        'all_sessions_terminated',
        { terminatedCount },
        ipAddress || undefined,
        userAgent || undefined
      );

      return Response.json({
        success: true,
        message: `${terminatedCount} other session(s) terminated`,
        terminatedCount,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Terminate other sessions error:', error);
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});

// ============================================================================
// DELETE: Terminate all sessions (logout everywhere)
// ============================================================================

export const APIRouteTerminateAll = createAPIFileRoute('/api/auth/sessions')({
  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request);
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent');
      
      // Terminate all sessions
      const terminatedCount = terminateAllUserSessions(
        auth.id,
        'user_terminated_all'
      );

      // Log the action
      logActivity(
        auth.id,
        'all_sessions_terminated',
        'user',
        auth.id,
        { terminatedCount },
        ipAddress
      );

      // Send security notification
      sendSecurityNotification(
        auth.id,
        'all_sessions_terminated',
        { terminatedCount },
        ipAddress || undefined,
        userAgent || undefined
      );

      return Response.json({
        success: true,
        message: `All ${terminatedCount} session(s) terminated. You have been logged out.`,
        terminatedCount,
        loggedOut: true,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      console.error('Terminate all sessions error:', error);
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  },
});
