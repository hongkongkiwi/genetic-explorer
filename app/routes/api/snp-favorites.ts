import { createAPIFileRoute } from '@tanstack/start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth.server';
import { csrfProtection } from '~/utils/csrf';

export const APIRoute = createAPIFileRoute('/api/snp-favorites')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();
      
      const favorites = db.prepare(`
        SELECT 
          rsid,
          notes,
          created_at as addedAt
        FROM snp_favorites
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(user.id);

      return Response.json({
        success: true,
        favorites,
      });
    } catch (error) {
      console.error('SNP Favorites GET error:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }
  },
  
  POST: async ({ request }) => {
    try {
      const user = requireAuth(request);
      
      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (csrfCheck.valid === false) {
        return Response.json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }
      
      const db = getDb();
      const { rsid, notes } = await request.json();
      
      if (!rsid) {
        return Response.json(
          { success: false, error: 'RSID is required' },
          { status: 400 }
        );
      }
      
      // Check if already favorited
      const existing = db.prepare(`
        SELECT id FROM snp_favorites WHERE user_id = ? AND rsid = ?
      `).get(user.id, rsid);
      
      if (existing) {
        return Response.json({ success: true, message: 'Already favorited' });
      }
      
      db.prepare(`
        INSERT INTO snp_favorites (user_id, rsid, notes, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(user.id, rsid, notes || null);

      return Response.json({
        success: true,
        message: 'Added to favorites',
      });
    } catch (error) {
      console.error('SNP Favorites POST error:', error);
      return Response.json(
        { success: false, error: 'Failed to add favorite' },
        { status: 500 }
      );
    }
  },
  
  DELETE: async ({ request }) => {
    try {
      const user = requireAuth(request);
      
      // CSRF protection
      const cookieHeader = request.headers.get('cookie');
      const csrfCheck = csrfProtection(request, cookieHeader);
      if (csrfCheck.valid === false) {
        return Response.json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status });
      }
      
      const db = getDb();
      const { rsid } = await request.json();
      
      if (!rsid) {
        return Response.json(
          { success: false, error: 'RSID is required' },
          { status: 400 }
        );
      }
      
      db.prepare(`
        DELETE FROM snp_favorites WHERE user_id = ? AND rsid = ?
      `).run(user.id, rsid);

      return Response.json({
        success: true,
        message: 'Removed from favorites',
      });
    } catch (error) {
      console.error('SNP Favorites DELETE error:', error);
      return Response.json(
        { success: false, error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }
  },
});
