/**
 * Comprehensive Genetic Analysis Engine
 * 
 * Matches user SNPs against comprehensive database
 * Generates detailed health reports with AI insights
 */

import type { SNP, GenomeData, HealthReport, ReportSection } from '~/types/genetics';
import { logger } from '~/utils/logger';

// Local type for RiskAssessment
interface RiskAssessment {
  condition: string;
  riskLevel: 'high' | 'moderate' | 'low' | 'protective';
  description: string;
  associatedVariants: string[];
  preventionStrategies: string[];
}
import { getSNPInfo, MASTER_SNP_DATABASE, getDatabaseSummary } from '~/data/allSNPs';
import { generateAIHealthReport, generateDrugGuidance } from './ai';

export interface AnalyzedVariant {
  rsid: string;
  gene: string;
  geneName: string;
  chromosome: string;
  position: number;
  userGenotype: string;
  category: string;
  impact: string;
  description: string;
  clinicalSignificance: string;
  conditions: string[];
  recommendations: string[];
  evidenceLevel: string;
  affectedDrugs?: string[];
  magnitude: 'Normal' | 'Low' | 'Moderate' | 'High' | 'Very High';
}

export interface AnalysisSummary {
  totalVariantsAnalyzed: number;
  significantVariants: number;
  highImpactVariants: number;
  categories: Record<string, number>;
  drugMetabolism: Array<{
    gene: string;
    phenotype: string;
    affectedDrugs: string[];
  }>;
  diseaseRisks: RiskAssessment[];
  protectiveFactors: AnalyzedVariant[];
}

/**
 * Analyze user's genome against comprehensive database
 */
export async function analyzeGenomeComprehensive(
  genome: GenomeData
): Promise<{
  variants: AnalyzedVariant[];
  summary: AnalysisSummary;
  report: HealthReport;
}> {
  logger.analysis(`Analyzing genome ${genome.id} with ${genome.snps.length} SNPs`);

  const analyzedVariants: AnalyzedVariant[] = [];
  const drugMetabolismGenes: Map<string, { phenotype: string; affectedDrugs: string[] }> = new Map();

  // Match each user SNP against our database
  for (const userSnp of genome.snps) {
    const snpInfo = getSNPInfo(userSnp.rsid);
    
    if (!snpInfo) {
      // SNP not in our database - skip for now
      continue;
    }

    // Determine genotype effect
    const genotypeEffect = snpInfo.genotypes?.[userSnp.genotype];
    const magnitude = genotypeEffect?.magnitude || 'Normal';

    // Skip variants with no significant effect
    if (magnitude === 'Normal' && snpInfo.impact !== 'High' && snpInfo.impact !== 'Very High') {
      continue;
    }

    const variant: AnalyzedVariant = {
      rsid: userSnp.rsid,
      gene: snpInfo.gene,
      geneName: snpInfo.geneName || snpInfo.gene,
      chromosome: userSnp.chromosome,
      position: userSnp.position,
      userGenotype: userSnp.genotype,
      category: snpInfo.category,
      impact: snpInfo.impact,
      description: snpInfo.description,
      clinicalSignificance: snpInfo.clinicalSignificance || 'Unknown',
      conditions: snpInfo.conditions || [],
      recommendations: snpInfo.recommendations || [],
      evidenceLevel: snpInfo.evidenceLevel || 'Limited',
      affectedDrugs: snpInfo.affectedDrugs as string[],
      magnitude: magnitude as AnalyzedVariant['magnitude'],
    };

    analyzedVariants.push(variant);

    // Track drug metabolism genes
    if (snpInfo.category === 'Drug Metabolism' && snpInfo.gene.startsWith('CYP')) {
      const phenotype = determinePhenotype(snpInfo.gene, userSnp.genotype);
      drugMetabolismGenes.set(snpInfo.gene, {
        phenotype,
        affectedDrugs: snpInfo.affectedDrugs?.map(d => d.drug) || [],
      });
    }
  }

  // Sort by impact
  analyzedVariants.sort((a, b) => {
    const impactOrder = { 'Very High': 4, 'High': 3, 'Moderate': 2, 'Low': 1, 'Normal': 0 };
    return (impactOrder[b.impact as keyof typeof impactOrder] || 0) - 
           (impactOrder[a.impact as keyof typeof impactOrder] || 0);
  });

  // Build summary
  const summary = buildAnalysisSummary(analyzedVariants, drugMetabolismGenes);

  // Generate AI-enhanced report
  const report = await generateFullReport(genome, analyzedVariants, summary);

  return {
    variants: analyzedVariants,
    summary,
    report,
  };
}

/**
 * Determine drug metabolism phenotype
 */
function determinePhenotype(gene: string, genotype: string): string {
  const phenotypeMap: Record<string, Record<string, string>> = {
    'CYP2D6': {
      'AA': 'Poor metabolizer',
      'AC': 'Intermediate metabolizer',
      'CC': 'Normal metabolizer',
    },
    'CYP2C19': {
      'AA': 'Poor metabolizer',
      'AG': 'Intermediate metabolizer',
      'GG': 'Normal metabolizer',
    },
    'CYP1A2': {
      'AA': 'Slow metabolizer',
      'AC': 'Intermediate',
      'CC': 'Fast metabolizer',
    },
  };

  return phenotypeMap[gene]?.[genotype] || 'Unknown';
}

/**
 * Build analysis summary
 */
function buildAnalysisSummary(
  variants: AnalyzedVariant[],
  drugGenes: Map<string, { phenotype: string; affectedDrugs: string[] }>
): AnalysisSummary {
  // Count by category
  const categories: Record<string, number> = {};
  for (const v of variants) {
    categories[v.category] = (categories[v.category] || 0) + 1;
  }

  // Count high impact
  const highImpact = variants.filter(v => 
    v.impact === 'High' || v.impact === 'Very High'
  ).length;

  // Drug metabolism summary
  const drugMetabolism = Array.from(drugGenes.entries()).map(([gene, data]) => ({
    gene,
    phenotype: data.phenotype,
    affectedDrugs: data.affectedDrugs,
  }));

  // Disease risks
  const diseaseRisks = calculateDiseaseRisks(variants);

  // Protective factors
  const protectiveFactors = variants.filter(v => 
    v.clinicalSignificance.toLowerCase().includes('protective')
  );

  return {
    totalVariantsAnalyzed: Object.keys(MASTER_SNP_DATABASE).length,
    significantVariants: variants.length,
    highImpactVariants: highImpact,
    categories,
    drugMetabolism,
    diseaseRisks,
    protectiveFactors,
  };
}

/**
 * Calculate disease risk assessments
 */
function calculateDiseaseRisks(variants: AnalyzedVariant[]): RiskAssessment[] {
  const risks: RiskAssessment[] = [];

  // Group variants by condition
  const conditionVariants: Record<string, AnalyzedVariant[]> = {};
  
  for (const variant of variants) {
    for (const condition of variant.conditions) {
      if (!conditionVariants[condition]) {
        conditionVariants[condition] = [];
      }
      conditionVariants[condition].push(variant);
    }
  }

  // Create risk assessments
  for (const [condition, vars] of Object.entries(conditionVariants)) {
    const maxImpact = vars.reduce((max, v) => {
      const order = { 'Very High': 4, 'High': 3, 'Moderate': 2, 'Low': 1, 'Normal': 0 };
      return Math.max(max, order[v.impact as keyof typeof order] || 0);
    }, 0);

    const riskLevel: RiskAssessment['riskLevel'] = maxImpact >= 4 ? 'high' : maxImpact >= 3 ? 'moderate' : 'low';
    
    risks.push({
      condition,
      riskLevel,
      description: `${vars.length} genetic variant${vars.length > 1 ? 's' : ''} associated with this condition.`,
      associatedVariants: vars.map(v => v.rsid),
      preventionStrategies: vars.flatMap(v => v.recommendations).slice(0, 5),
    });
  }

  // Sort by risk level
  const riskOrder = { high: 3, moderate: 2, low: 1, protective: 0 };
  risks.sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel]);

  return risks;
}

/**
 * Generate comprehensive health report
 */
async function generateFullReport(
  genome: GenomeData,
  variants: AnalyzedVariant[],
  summary: AnalysisSummary
): Promise<HealthReport> {
  const reportId = `report-${Date.now()}-${genome.id.substring(0, 8)}`;

  // Generate AI insights
  const aiInput = {
    userSnps: genome.snps,
    significantVariants: variants.map(v => ({
      rsid: v.rsid,
      gene: v.gene,
      genotype: v.userGenotype,
      impact: v.impact,
      description: v.description,
      recommendations: v.recommendations,
    })),
    categories: summary.categories,
    drugInteractions: summary.drugMetabolism.map(d => `${d.gene}: ${d.phenotype}`),
  };

  const aiInsights = await generateAIHealthReport(aiInput);

  // Generate drug guidance
  const drugGuidance = await generateDrugGuidance(summary.drugMetabolism);

  // Build report sections
  const sections: ReportSection[] = [
    // Executive Summary
    {
      id: 'executive-summary',
      type: 'overview',
      title: 'Executive Summary',
      content: aiInsights.executiveSummary,
      priority: 'critical',
      icon: 'clipboard',
    },

    // Key Findings
    ...aiInsights.sections.map((s, idx) => ({
      id: `ai-insight-${idx}`,
      type: 'finding' as const,
      title: s.title,
      content: s.content,
      priority: s.priority as 'critical' | 'high' | 'medium' | 'low',
      icon: 'activity',
      actionItems: s.actionItems,
    })),

    // Drug Metabolism
    {
      id: 'drug-metabolism',
      type: 'drug',
      title: 'Pharmacogenomics',
      content: drugGuidance.summary,
      priority: 'high',
      icon: 'pill',
      details: drugGuidance.drugSpecific,
    },

    // Disease Risks
    {
      id: 'disease-risks',
      type: 'risk',
      title: 'Disease Risk Assessment',
      content: `Based on ${summary.diseaseRisks.length} genetic associations.`,
      priority: 'high',
      icon: 'shield',
      risks: summary.diseaseRisks,
    },

    // Personalized Protocol
    {
      id: 'protocol',
      type: 'protocol',
      title: 'Your Personalized Health Protocol',
      content: 'Evidence-based recommendations tailored to your genetic profile.',
      priority: 'high',
      icon: 'heart',
      protocol: aiInsights.personalizedProtocol,
    },

    // Variant Details
    {
      id: 'variants',
      type: 'variants',
      title: 'Genetic Variants Detected',
      content: `Complete list of ${variants.length} significant variants from your analysis.`,
      priority: 'low',
      icon: 'dna',
      variants: variants.map(v => ({
        rsid: v.rsid,
        gene: v.gene,
        genotype: v.userGenotype,
        impact: v.impact,
        description: v.description,
        evidence: v.evidenceLevel,
      })),
    },
  ];

  return {
    id: reportId,
    genomeId: genome.id,
    generatedAt: new Date(),
    reportType: 'comprehensive',
    version: '2.0',
    summary: {
      totalVariants: summary.significantVariants,
      highImpact: summary.highImpactVariants,
      categories: summary.categories,
      topFindings: variants
        .filter(v => v.impact === 'High' || v.impact === 'Very High')
        .slice(0, 5)
        .map(v => `${v.gene} (${v.rsid}): ${v.description}`),
    },
    sections,
    actionableProtocol: aiInsights.personalizedProtocol,
    executiveSummary: aiInsights.executiveSummary,
    diseaseRisks: summary.diseaseRisks,
    drugMetabolism: drugGuidance.drugSpecific,
    keyFindings: aiInsights.sections.map(s => s.content).slice(0, 3),
  };
}

/**
 * Generate quick summary for dashboard
 */
export function generateQuickSummary(genome: GenomeData): {
  highlights: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  topCategory: string;
} {
  // Match SNPs
  const matches = genome.snps
    .map(snp => ({ snp, info: getSNPInfo(snp.rsid) }))
    .filter(({ info }) => info && (info.impact === 'High' || info.impact === 'Very High'));

  // Determine risk level
  const hasPathogenic = matches.some(({ info }) => 
    info?.clinicalSignificance?.toLowerCase().includes('pathogenic')
  );
  const hasHighImpact = matches.length > 3;
  
  const riskLevel = hasPathogenic ? 'high' : hasHighImpact ? 'moderate' : 'low';

  // Find top category
  const categoryCounts: Record<string, number> = {};
  for (const { info } of matches) {
    if (info) {
      categoryCounts[info.category] = (categoryCounts[info.category] || 0) + 1;
    }
  }
  
  const topCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';

  // Generate highlights
  const highlights = matches
    .slice(0, 3)
    .map(({ info }) => `${info?.gene}: ${info?.description.substring(0, 60)}...`);

  return {
    highlights: highlights.length > 0 ? highlights : ['No major variants detected'],
    riskLevel,
    topCategory,
  };
}
