import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/search')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();

      const url = new URL(request.url);
      const query = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '10');

      if (!query.trim() || query.length < 2) {
        return json({ success: true, results: [] });
      }

      const searchTerm = `%${query}%`;
      const results: any[] = [];

      // Search genomes
      const genomes = db.prepare(`
        SELECT
          id,
          original_filename as title,
          stored_snps || ' SNPs' as subtitle,
          '/genomes' as href
        FROM genomes
        WHERE user_id = ? AND (
          original_filename LIKE ? OR
          source LIKE ?
        )
        LIMIT ?
      `).all(user.id, searchTerm, searchTerm, Math.ceil(limit / 4));

      genomes.forEach((g: any) => {
        results.push({ ...g, type: 'genome' });
      });

      // Search SNPs in user's genomes (join with genomes to get user_id)
      const snps = db.prepare(`
        SELECT DISTINCT
          s.rsid as id,
          s.rsid as title,
          s.genotype as subtitle,
          '/explorer?rsid=' || s.rsid as href
        FROM snps s
        JOIN genomes g ON g.id = s.genome_id
        WHERE g.user_id = ? AND (
          s.rsid LIKE ?
        )
        LIMIT ?
      `).all(user.id, searchTerm, Math.ceil(limit / 4));

      snps.forEach((s: any) => {
        results.push({ ...s, type: 'snp' });
      });

      // Search reports
      const reports = db.prepare(`
        SELECT
          r.id,
          g.original_filename as title,
          'Generated ' || datetime(r.created_at, 'localtime') as subtitle,
          '/report/' || r.genome_id as href
        FROM reports r
        JOIN genomes g ON g.id = r.genome_id
        WHERE g.user_id = ?
        LIMIT ?
      `).all(user.id, Math.ceil(limit / 4));

      reports.forEach((r: any) => {
        results.push({ ...r, type: 'report' });
      });

      // Search research database
      const research = db.prepare(`
        SELECT
          rsid as id,
          rsid as title,
          COALESCE(gene_name, 'Unknown gene') as subtitle,
          '/research?snp=' || rsid as href
        FROM snp_database
        WHERE rsid LIKE ? OR gene_symbol LIKE ? OR gene_name LIKE ?
        LIMIT ?
      `).all(searchTerm, searchTerm, searchTerm, Math.ceil(limit / 4));

      research.forEach((r: any) => {
        results.push({ ...r, type: 'research' });
      });

      return json({
        success: true,
        results: results.slice(0, limit),
      });
    } catch (error) {
      console.error('Search API error:', error);
      return json(
        { success: false, error: 'Search failed' },
        { status: 500 }
      );
    }
  },
});
