import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/whats-new')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();
      
      const url = new URL(request.url);
      const range = url.searchParams.get('range') || '30d';
      
      // Calculate date range
      const days = range === 'all' ? 365 * 10 : parseInt(range);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      // Get stats
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as totalUpdates,
          SUM(CASE WHEN date >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as thisMonth,
          SUM(CASE WHEN change_type = 'new' THEN 1 ELSE 0 END) as newSnps,
          SUM(CASE WHEN change_type = 'research_added' THEN papers_added ELSE 0 END) as researchAdded,
          SUM(CASE WHEN change_type = 'recommendation_updated' THEN 1 ELSE 0 END) as recommendationsUpdated,
          SUM(CASE WHEN change_type = 'evidence_upgraded' THEN 1 ELSE 0 END) as evidenceUpgraded
        FROM research_updates
        WHERE date >= ?
      `).get(since) as {
        totalUpdates: number;
        thisMonth: number;
        newSnps: number;
        researchAdded: number;
        recommendationsUpdated: number;
        evidenceUpgraded: number;
      };

      // Get changelog
      const changelog = db.prepare(`
        SELECT
          ru.id,
          ru.snp_rsid as rsid,
          ru.snp_gene as gene,
          ru.change_type as changeType,
          ru.description,
          ru.date,
          ru.is_major as isMajor,
          ru.papers_added as papersAdded,
          COUNT(DISTINCT CASE WHEN s.genome_id IN (SELECT id FROM genomes WHERE user_id = ?) THEN s.id END) as affectsUserCount
        FROM research_updates ru
        LEFT JOIN snps s ON s.rsid = ru.snp_rsid
        WHERE ru.date >= ?
        GROUP BY ru.id
        ORDER BY ru.date DESC, ru.is_major DESC
      `).all(user.id, since);

      return json({
        success: true,
        data: {
          stats: {
            totalUpdates: stats.totalUpdates || 0,
            thisMonth: stats.thisMonth || 0,
            newSnps: stats.newSnps || 0,
            researchAdded: stats.researchAdded || 0,
            recommendationsUpdated: stats.recommendationsUpdated || 0,
            evidenceUpgraded: stats.evidenceUpgraded || 0,
          },
          changelog: changelog.map((item: any) => ({
            id: item.id.toString(),
            rsid: item.rsid,
            gene: item.gene,
            changeType: item.changeType,
            description: item.description,
            date: item.date,
            isMajor: Boolean(item.isMajor),
            papersAdded: item.papersAdded,
            affectsUserCount: item.affectsUserCount,
          })),
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Whats New API error:', error);
      return json(
        { success: false, error: 'Failed to fetch updates' },
        { status: 500 }
      );
    }
  },
});
