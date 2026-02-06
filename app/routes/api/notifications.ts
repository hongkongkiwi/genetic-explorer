import { createAPIFileRoute } from '@tanstack/start/api';
import { getDb } from '~/db';
import { requireAuth } from '~/auth/auth-core';

// Types
interface Notification {
  id: number;
  type: 'research_update' | 'sharing_invite' | 'genome_complete' | 'system' | 'security';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const APIRoute = createAPIFileRoute('/api/notifications')({
  // GET /api/notifications - Get user's notifications
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const unreadOnly = url.searchParams.get('unread') === 'true';

      const db = getDb();
      
      let query = `
        SELECT 
          id,
          type,
          title,
          message,
          data,
          is_read as isRead,
          created_at as createdAt
        FROM notifications 
        WHERE user_id = ?
      `;
      const params: any[] = [user.id];

      if (unreadOnly) {
        query += ' AND is_read = 0';
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const notifications = db.prepare(query).all(...params) as Notification[];

      // Parse JSON data field
      notifications.forEach((n: any) => {
        if (n.data) {
          try {
            n.data = JSON.parse(n.data);
          } catch {
            n.data = null;
          }
        }
      });

      // Get unread count
      const unreadResult = db.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
      ).get(user.id) as { count: number };

      return Response.json({
        success: true,
        notifications,
        unreadCount: unreadResult.count,
        pagination: {
          limit,
          offset,
          hasMore: notifications.length === limit,
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      return Response.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
    }
  },

  // POST /api/notifications - Create notification (internal use)
  POST: async ({ request }) => {
    try {
      const user = requireAuth(request);
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { type, title, message, data, userId } = body;

      // Only admins can create notifications for other users
      const targetUserId = userId || user.id;
      // Admin check stub - would need isAdmin property
      const isAdmin = false;
      if (targetUserId !== user.id && !isAdmin) {
        return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }

      if (!type || !title || !message) {
        return Response.json({ 
          success: false, 
          error: 'Type, title, and message are required' 
        }, { status: 400 });
      }

      const db = getDb();
      const result = db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        targetUserId,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null
      );

      return Response.json({
        success: true,
        notification: {
          id: result.lastInsertRowid,
          type,
          title,
          message,
          data,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Create notification error:', error);
      return Response.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
    }
  },

  // PATCH /api/notifications - Mark as read (bulk)
  PATCH: async ({ request }) => {
    try {
      const user = requireAuth(request);
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { ids, markAll } = body;

      const db = getDb();

      if (markAll) {
        // Mark all as read
        db.prepare(
          'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
        ).run(user.id);

        return Response.json({
          success: true,
          message: 'All notifications marked as read',
        });
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return Response.json({ 
          success: false, 
          error: 'ids array is required' 
        }, { status: 400 });
      }

      // Mark specific notifications as read
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`
        UPDATE notifications 
        SET is_read = 1 
        WHERE id IN (${placeholders}) AND user_id = ?
      `).run(...ids, user.id);

      return Response.json({
        success: true,
        message: `${ids.length} notification(s) marked as read`,
      });
    } catch (error) {
      console.error('Mark notifications read error:', error);
      return Response.json({ success: false, error: 'Failed to update notifications' }, { status: 500 });
    }
  },

  // DELETE /api/notifications - Delete notifications
  DELETE: async ({ request }) => {
    try {
      const user = requireAuth(request);
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const url = new URL(request.url);
      const ids = url.searchParams.get('ids')?.split(',').map(Number);

      const db = getDb();

      if (!ids || ids.length === 0) {
        return Response.json({ 
          success: false, 
          error: 'ids parameter is required' 
        }, { status: 400 });
      }

      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`
        DELETE FROM notifications 
        WHERE id IN (${placeholders}) AND user_id = ?
      `).run(...ids, user.id);

      return Response.json({
        success: true,
        message: `${ids.length} notification(s) deleted`,
      });
    } catch (error) {
      console.error('Delete notifications error:', error);
      return Response.json({ success: false, error: 'Failed to delete notifications' }, { status: 500 });
    }
  },
});
