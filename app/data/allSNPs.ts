/**
 * Master SNP Database
 * 
 * Combines all SNP databases:
 * - Comprehensive (50 high-impact)
 * - Expanded (28 additional)
 * - Additional Categories (100+ for new categories)
 * 
 * Total: 170+ SNPs across 24 categories
 */

import type { SNPInfo } from '~/types/genetics';
import { COMPREHENSIVE_SNP_DATABASE } from './comprehensiveSNPs';
import { EXPANDED_SNP_DATABASE } from './expandedSNPs';
import { ADDITIONAL_CATEGORIES_SNPS } from './additionalCategories';

// Merge all databases
export const MASTER_SNP_DATABASE: Record<string, SNPInfo> = {
  ...COMPREHENSIVE_SNP_DATABASE,
  ...EXPANDED_SNP_DATABASE,
  ...ADDITIONAL_CATEGORIES_SNPS,
};

// Calculate statistics
export const DATABASE_STATS = {
  totalSNPs: Object.keys(MASTER_SNP_DATABASE).length,
  categories: [...new Set(Object.values(MASTER_SNP_DATABASE).map(s => s.category))],
  byCategory: Object.values(MASTER_SNP_DATABASE).reduce((acc, snp) => {
    acc[snp.category] = (acc[snp.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  highImpact: Object.values(MASTER_SNP_DATABASE).filter(s => 
    s.impact === 'High' || s.impact === 'Very High'
  ).length,
};

// Get SNP info
export function getSNPInfo(rsid: string): SNPInfo | null {
  return MASTER_SNP_DATABASE[rsid] || null;
}

// Get SNPs by category
export function getSNPsByCategory(category: string): SNPInfo[] {
  return Object.values(MASTER_SNP_DATABASE)
    .filter(snp => snp.category === category);
}

// Get SNPs by gene
export function getSNPsByGene(gene: string): SNPInfo[] {
  return Object.values(MASTER_SNP_DATABASE)
    .filter(snp => snp.gene === gene);
}

// Get high-impact SNPs
export function getHighImpactSNPs(): SNPInfo[] {
  return Object.values(MASTER_SNP_DATABASE)
    .filter(snp => snp.impact === 'High' || snp.impact === 'Very High');
}

// Get SNPs with drug interactions
export function getPharmacogenomicSNPs(): SNPInfo[] {
  return Object.values(MASTER_SNP_DATABASE)
    .filter(snp => snp.category === 'Drug Metabolism' || snp.affectedDrugs);
}

// Search SNPs
export function searchSNPs(query: string): SNPInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(MASTER_SNP_DATABASE)
    .filter(snp => 
      snp.rsid.toLowerCase().includes(lowerQuery) ||
      snp.gene.toLowerCase().includes(lowerQuery) ||
      snp.category.toLowerCase().includes(lowerQuery) ||
      snp.description.toLowerCase().includes(lowerQuery)
    );
}

// Get all categories
export function getAllCategories(): string[] {
  return [...new Set(Object.values(MASTER_SNP_DATABASE).map(s => s.category))];
}

// Get database summary
export function getDatabaseSummary(): {
  total: number;
  categories: string[];
  byCategory: Record<string, number>;
  highImpact: number;
  withDrugInfo: number;
  withRecommendations: number;
} {
  const snps = Object.values(MASTER_SNP_DATABASE);
  
  return {
    total: snps.length,
    categories: getAllCategories(),
    byCategory: DATABASE_STATS.byCategory,
    highImpact: snps.filter(s => s.impact === 'High' || s.impact === 'Very High').length,
    withDrugInfo: snps.filter(s => s.affectedDrugs && s.affectedDrugs.length > 0).length,
    withRecommendations: snps.filter(s => s.recommendations && s.recommendations.length > 0).length,
  };
}

// Export for debugging
console.log('Master SNP Database loaded:', {
  total: DATABASE_STATS.totalSNPs,
  categories: DATABASE_STATS.categories.length,
  highImpact: DATABASE_STATS.highImpact,
});
