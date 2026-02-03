import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/dashboard')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();
      
      const url = new URL(request.url);
      const range = url.searchParams.get('range') || '30d';
      
      // Calculate date range
      const days = parseInt(range);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      // Get stats
      const stats = db.prepare(`
        SELECT 
          COUNT(DISTINCT g.id) as totalGenomes,
          COUNT(DISTINCT r.id) as totalReports,
          COALESCE(SUM(g.stored_snps), 0) as totalSNPs
        FROM genomes g
        LEFT JOIN reports r ON r.genome_id = g.id
        WHERE g.user_id = ?
      `).get(user.id) as {
        totalGenomes: number;
        totalReports: number;
        totalSNPs: number;
      };

      // Get sharing stats
      const sharingStats = db.prepare(`
        SELECT 
          COUNT(DISTINCT CASE WHEN shared_with_id = ? THEN id END) as sharedWithMe,
          COUNT(DISTINCT CASE WHEN owner_id = ? THEN id END) as sharedByMe
        FROM sharing_permissions
        WHERE (shared_with_id = ? OR owner_id = ?) AND status = 'active'
      `).get(user.id, user.id, user.id, user.id) as {
        sharedWithMe: number;
        sharedByMe: number;
      };

      // Get recent updates count
      const recentUpdates = db.prepare(`
        SELECT COUNT(*) as count
FROM research_updates
        WHERE date >= ?
      `).get(since) as { count: number };

      // Get recent genomes
      const recentGenomes = db.prepare(`
        SELECT 
          id,
          original_filename as filename,
          stored_snps as snpCount,
          processed_at as processedAt
        FROM genomes
        WHERE user_id = ?
        ORDER BY processed_at DESC
        LIMIT 4
      `).all(user.id);

      // Get recent reports
      const recentReports = db.prepare(`
        SELECT 
          r.id,
          r.genome_id as genomeId,
          g.original_filename as genomeName,
          r.created_at as generatedAt
        FROM reports r
        JOIN genomes g ON g.id = r.genome_id
        WHERE g.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5
      `).all(user.id);

      // Get recent updates affecting user's genomes
      const updates = db.prepare(`
        SELECT 
          ru.id,
          ru.snp_rsid as rsid,
          ru.snp_gene as gene,
          ru.change_type as changeType,
          ru.description,
          ru.date,
          ru.is_major as isMajor,
          COUNT(DISTINCT CASE WHEN gs.user_id = ? THEN gs.id END) as affectsUserCount
        FROM research_updates ru
        LEFT JOIN genome_snps gs ON gs.rsid = ru.snp_rsid AND gs.user_id = ?
        WHERE ru.date >= ?
        GROUP BY ru.id
        ORDER BY ru.date DESC, ru.is_major DESC
        LIMIT 5
      `).all(user.id, user.id, since);

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (stats.totalGenomes === 0) {
        recommendations.push('Upload your first genome to unlock personalized insights');
      }
      
      if (stats.totalGenomes > 0 && stats.totalReports === 0) {
        recommendations.push('Generate your first comprehensive report');
      }
      
      if (recentUpdates.count > 0) {
        recommendations.push(`Check out ${recentUpdates.count} new research updates that may affect your genome`);
      }
      
      if (sharingStats.sharedByMe === 0 && stats.totalGenomes > 0) {
        recommendations.push('Share your genetic data with family members');
      }

      return json({
        success: true,
        data: {
          stats: {
            totalGenomes: stats.totalGenomes,
            totalReports: stats.totalReports,
            sharedWithMe: sharingStats.sharedWithMe,
            sharedByMe: sharingStats.sharedByMe,
            recentUpdates: recentUpdates.count,
          },
          recentGenomes,
          recentReports,
          updates: updates.map((u: any) => ({
            ...u,
            affectsUser: u.affectsUserCount > 0,
          })),
          recommendations: recommendations.slice(0, 5),
        },
      });
    } catch (error) {
      console.error('Dashboard API error:', error);
      return json(
        { success: false, error: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }
  },
});
