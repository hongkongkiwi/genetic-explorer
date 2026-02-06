import { createAPIFileRoute } from '@tanstack/start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth.server';

export const APIRoute = createAPIFileRoute('/api/compare-genomes')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();
      
      const url = new URL(request.url);
      const genomeA = url.searchParams.get('a');
      const genomeB = url.searchParams.get('b');
      
      if (!genomeA || !genomeB) {
        return Response.json(
          { success: false, error: 'Both genome IDs are required' },
          { status: 400 }
        );
      }
      
      // Verify both genomes belong to user
      const genomeCheck = db.prepare(`
        SELECT COUNT(*) as count FROM genomes 
        WHERE id IN (?, ?) AND user_id = ?
      `).get(genomeA, genomeB, user.id) as { count: number };
      
      if (genomeCheck.count !== 2) {
        return Response.json(
          { success: false, error: 'One or both genomes not found' },
          { status: 404 }
        );
      }
      
      // Get SNPs for both genomes
      const snpsA = db.prepare(`
        SELECT rsid, genotype, chromosome, position
        FROM snps
        WHERE genome_id = ?
      `).all(genomeA) as any[];

      const snpsB = db.prepare(`
        SELECT rsid, genotype, chromosome, position
        FROM snps
        WHERE genome_id = ?
      `).all(genomeB) as any[];
      
      // Create lookup maps
      const mapA = new Map(snpsA.map(s => [s.rsid, s]));
      const mapB = new Map(snpsB.map(s => [s.rsid, s]));
      
      // Calculate shared and unique variants
      let sharedVariants = 0;
      let uniqueToA = 0;
      let uniqueToB = 0;
      const differences: any[] = [];
      
      // Check SNPs in A
      for (const snpA of snpsA) {
        const snpB = mapB.get(snpA.rsid);
        if (snpB) {
          sharedVariants++;
          // Check for genotype difference
          if (snpA.genotype !== snpB.genotype) {
            differences.push({
              rsid: snpA.rsid,
              genomeA: {
                genotype: snpA.genotype,
              },
              genomeB: {
                genotype: snpB.genotype,
              },
              significance: 'unknown',
            });
          }
        } else {
          uniqueToA++;
        }
      }
      
      // Check SNPs only in B
      for (const snpB of snpsB) {
        if (!mapA.has(snpB.rsid)) {
          uniqueToB++;
        }
      }
      
      // Calculate similarity score
      const totalUniqueVariants = sharedVariants + uniqueToA + uniqueToB;
      const similarity = totalUniqueVariants > 0
        ? (sharedVariants / totalUniqueVariants) * 100
        : 0;

      return Response.json({
        success: true,
        sharedVariants,
        uniqueToA,
        uniqueToB,
        differences: differences.slice(0, 50), // Limit to top 50
        similarity: Math.round(similarity * 100) / 100,
      });
    } catch (error) {
      console.error('Compare genomes API error:', error);
      return Response.json(
        { success: false, error: 'Comparison failed' },
        { status: 500 }
      );
    }
  },
});
