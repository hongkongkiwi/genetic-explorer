import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/research/snp-updates')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();
      
      // Get recent updates with their status for user's genomes
      const updates = db.prepare(`
        SELECT DISTINCT
          ru.snp_rsid as rsid,
          ru.change_type as status,
          ru.date
        FROM research_updates ru
        JOIN snps s ON s.rsid = ru.snp_rsid
        JOIN genomes g ON g.id = s.genome_id AND g.user_id = ?
        WHERE ru.date >= datetime('now', '-90 days')
        ORDER BY ru.date DESC
      `).all(user.id);

      // Convert to map for easy lookup
      const updatesMap: Record<string, { rsid: string; status: string; date: string }> = {};
      updates.forEach((u: any) => {
        updatesMap[u.rsid] = u;
      });

      return json({
        success: true,
        updates: updatesMap,
      });
    } catch (error) {
      console.error('SNP Updates API error:', error);
      return json(
        { success: false, error: 'Failed to fetch SNP updates' },
        { status: 500 }
      );
    }
  },
});
