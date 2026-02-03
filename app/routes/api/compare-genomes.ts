import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { getDb } from '~/utils/database';
import { requireAuth } from '~/utils/auth';

export const APIRoute = createAPIFileRoute('/api/compare-genomes')({
  GET: async ({ request }) => {
    try {
      const user = requireAuth(request);
      const db = getDb();
      
      const url = new URL(request.url);
      const genomeA = url.searchParams.get('a');
      const genomeB = url.searchParams.get('b');
      
      if (!genomeA || !genomeB) {
        return json(
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
        return json(
          { success: false, error: 'One or both genomes not found' },
          { status: 404 }
        );
      }
      
      // Get SNPs for both genomes
      const snpsA = db.prepare(`
        SELECT rsid, gene, genotype, chromosome, position, clinical_impact
        FROM genome_snps
        WHERE genome_id = ?
      `).all(genomeA) as any[];
      
      const snpsB = db.prepare(`
        SELECT rsid, gene, genotype, chromosome, position, clinical_impact
        FROM genome_snps
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
            const significance = 
              snpA.clinical_impact === 'high' || snpB.clinical_impact === 'high' ? 'high' :
              snpA.clinical_impact === 'moderate' || snpB.clinical_impact === 'moderate' ? 'medium' : 'low';
            
            differences.push({
              rsid: snpA.rsid,
              gene: snpA.gene,
              genomeA: {
                genotype: snpA.genotype,
                impact: snpA.clinical_impact,
              },
              genomeB: {
                genotype: snpB.genotype,
                impact: snpB.clinical_impact,
              },
              significance,
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
      
      // Sort differences by significance
      const significanceOrder = { high: 0, medium: 1, low: 2 };
      differences.sort((a, b) => 
        significanceOrder[a.significance] - significanceOrder[b.significance]
      );

      return json({
        success: true,
        sharedVariants,
        uniqueToA,
        uniqueToB,
        differences: differences.slice(0, 50), // Limit to top 50
        similarity: Math.round(similarity * 100) / 100,
      });
    } catch (error) {
      console.error('Compare genomes API error:', error);
      return json(
        { success: false, error: 'Comparison failed' },
        { status: 500 }
      );
    }
  },
});
