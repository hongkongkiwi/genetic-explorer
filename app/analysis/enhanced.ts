/**
 * Enhanced Genetic Analysis using Research Database
 */

import type { SNP, GeneticVariant } from '~/types/genetics';
import { 
  getResearchSNP, 
  getClinVarForSNP, 
  getPapersForSNP,
  getDrugInteractionsForGene,
  getGWASStudiesForSNP,
} from '~/utils/research/database';
import { syncSNPFromNCBI, syncClinVarForSNP, syncPubMedPapersForSNP } from '~/utils/research/sync';

export interface EnhancedVariant extends GeneticVariant {
  clinvarRecords: Awaited<ReturnType<typeof getClinVarForSNP>>;
  relatedPapers: Awaited<ReturnType<typeof getPapersForSNP>>;
  gwasStudies: Awaited<ReturnType<typeof getGWASStudiesForSNP>>;
}

export async function analyzeSNPAgainstResearch(snp: SNP): Promise<EnhancedVariant | null> {
  let researchSNP = getResearchSNP(snp.rsid);
  
  if (!researchSNP) {
    researchSNP = await syncSNPFromNCBI(snp.rsid);
  }
  
  if (!researchSNP) {
    return null;
  }
  
  const [clinvarRecords, relatedPapers, gwasStudies] = await Promise.all([
    getClinVarForSNP(snp.rsid),
    getPapersForSNP(snp.rsid),
    getGWASStudiesForSNP(snp.rsid),
  ]);
  
  if (clinvarRecords.length === 0) {
    const newClinvar = await syncClinVarForSNP(snp.rsid);
    clinvarRecords.push(...newClinvar);
  }
  
  if (relatedPapers.length === 0) {
    const newPapers = await syncPubMedPapersForSNP(snp.rsid, 5);
    relatedPapers.push(...newPapers);
  }
  
  let significance: GeneticVariant['significance'] = 'uncertain';
  const pathogenicRecords = clinvarRecords.filter(r => 
    r.clinicalSignificance === 'pathogenic' || r.clinicalSignificance === 'likely_pathogenic'
  );
  const benignRecords = clinvarRecords.filter(r => 
    r.clinicalSignificance === 'benign' || r.clinicalSignificance === 'likely_benign'
  );
  
  if (pathogenicRecords.length > 0) {
    significance = 'pathogenic';
  } else if (benignRecords.length > 0) {
    significance = 'benign';
  }
  
  let impact = 1;
  if (pathogenicRecords.some(r => r.clinicalSignificance === 'pathogenic')) {
    impact = 5;
  } else if (pathogenicRecords.length > 0) {
    impact = 4;
  } else if (gwasStudies.some(s => s.pValue < 5e-8)) {
    impact = 3;
  }
  
  let category = 'unknown';
  if (gwasStudies.length > 0) {
    const traits = gwasStudies.map(s => s.trait.toLowerCase());
    if (traits.some(t => t.includes('drug') || t.includes('medication'))) {
      category = 'drug_response';
    } else if (traits.some(t => t.includes('weight') || t.includes('obesity'))) {
      category = 'nutrition';
    } else if (traits.some(t => t.includes('exercise') || t.includes('muscle'))) {
      category = 'fitness';
    } else if (traits.some(t => t.includes('disease') || t.includes('cancer'))) {
      category = 'disease_risk';
    }
  }
  
  const variant: EnhancedVariant = {
    snp,
    gene: researchSNP.geneSymbol || 'Unknown',
    impact,
    category: category as any,
    significance,
    description: researchSNP.geneName || `Variant in ${researchSNP.geneSymbol || 'unknown gene'}`,
    recommendations: [],
    studies: relatedPapers.map(p => ({
      id: p.pmid,
      title: p.title,
      authors: p.authors,
      journal: p.journal,
      year: p.publicationDate?.getFullYear() || 0,
      pmid: p.pmid,
    })),
    clinvarRecords,
    relatedPapers,
    gwasStudies,
  };
  
  return variant;
}

export async function performEnhancedAnalysis(
  userSNPs: SNP[],
  options: { minImpact?: number } = {}
): Promise<{
  variants: EnhancedVariant[];
  summary: {
    totalAnalyzed: number;
    significantVariants: number;
    pathogenicVariants: number;
    categories: Record<string, number>;
  };
}> {
  const variants: EnhancedVariant[] = [];
  const minImpact = options.minImpact || 1;
  
  console.log(`Starting enhanced analysis of ${userSNPs.length} SNPs...`);
  
  for (let i = 0; i < userSNPs.length; i++) {
    const snp = userSNPs[i];
    
    if (i % 100 === 0) {
      console.log(`Analyzed ${i}/${userSNPs.length} SNPs...`);
    }
    
    try {
      const variant = await analyzeSNPAgainstResearch(snp);
      if (variant && variant.impact >= minImpact) {
        variants.push(variant);
      }
    } catch (error) {
      console.warn(`Failed to analyze ${snp.rsid}:`, error);
    }
  }
  
  variants.sort((a, b) => b.impact - a.impact);
  
  const summary = {
    totalAnalyzed: userSNPs.length,
    significantVariants: variants.length,
    pathogenicVariants: variants.filter(v => v.significance === 'pathogenic').length,
    categories: variants.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
  
  return { variants, summary };
}
