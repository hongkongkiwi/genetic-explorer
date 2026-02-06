/**
 * Carrier Status Analysis
 * 
 * Analyzes genome for carrier status of genetic conditions.
 */

import type { SNP } from '~/types/genetics';
import { findSNP } from './genome/parser';

export interface CarrierCondition {
  id: string;
  name: string;
  description: string;
  gene: string;
  inheritance: 'autosomal_recessive' | 'autosomal_dominant' | 'x_linked';
  severity: 'mild' | 'moderate' | 'severe';
  category?: string;
  prevalence: string;
  snps: Array<{
    rsid: string;
    pathogenicAlleles: string[];
    benignAlleles?: string[];
  }>;
  medicalSignificance: string;
  actionItems: string[];
}

export interface CarrierResult {
  condition: CarrierCondition;
  status: 'carrier' | 'affected' | 'not_carrier' | 'unknown';
  genotype: string | null;
  riskLevel: 'high' | 'moderate' | 'low';
  details: string;
  recommendations: string[];
  // Extended properties for API compatibility
  variantsFound: Array<{
    id: string;
    name: string;
    rsid: string;
  }>;
  riskToOffspring: string;
  riskExplanation: string;
  counselingRecommended: boolean;
  urgency: 'immediate' | 'high' | 'moderate' | 'low';
}

export interface CarrierReport {
  results: CarrierResult[];
  summary: {
    totalConditions: number;
    carrierCount: number;
    affectedCount: number;
    unknownCount: number;
    highRiskConditions: number;
    // Extended properties for API compatibility
    totalConditionsTested?: number;
    notCarrierCount?: number;
    moderateRiskConditions?: number;
    conditionsByCategory?: Record<string, number>;
    byStatus?: Record<string, number>;
    requiresAttention?: boolean;
  };
  generalRecommendations: string[];
  // Extended properties for API compatibility
  criticalFindings?: CarrierResult[];
  recommendations?: string[];
  nextSteps?: string[];
  disclaimer?: string;
  id?: string;
  generatedAt?: string;
}

// Medical condition database - well-established pathogenic variants
const CARRIER_CONDITIONS: CarrierCondition[] = [
  {
    id: 'cystic-fibrosis',
    name: 'Cystic Fibrosis',
    description: 'Affects the lungs and digestive system. Carriers are typically asymptomatic.',
    gene: 'CFTR',
    inheritance: 'autosomal_recessive',
    severity: 'severe',
    category: 'respiratory',
    prevalence: '1 in 25 people of European descent are carriers',
    snps: [
      { rsid: 'rs113993960', pathogenicAlleles: ['ΔF508'] },
      { rsid: 'rs199473708', pathogenicAlleles: ['G542X'] },
    ],
    medicalSignificance: 'High - two carrier parents have 25% chance of affected child',
    actionItems: [
      'Partner testing recommended if planning pregnancy',
      'Genetic counseling for family planning',
      'Inform family members they may be carriers',
    ],
  },
  {
    id: 'sickle-cell',
    name: 'Sickle Cell Trait',
    description: 'Affects red blood cells. Carriers usually have no symptoms but may experience issues at high altitude.',
    gene: 'HBB',
    inheritance: 'autosomal_recessive',
    severity: 'moderate',
    category: 'hematologic',
    prevalence: '1 in 13 African Americans are carriers',
    snps: [
      { rsid: 'rs334', pathogenicAlleles: ['A', 'T'] },
    ],
    medicalSignificance: 'High in certain populations; provides malaria resistance',
    actionItems: [
      'Avoid extreme physical exertion at high altitude',
      'Partner testing if planning pregnancy',
      'Consider prenatal testing options',
    ],
  },
  {
    id: 'tay-sachs',
    name: 'Tay-Sachs Disease',
    description: 'Progressive nervous system disorder. Carriers are asymptomatic.',
    gene: 'HEXA',
    inheritance: 'autosomal_recessive',
    severity: 'severe',
    category: 'neurological',
    prevalence: '1 in 27 Ashkenazi Jewish people are carriers',
    snps: [
      { rsid: 'rs76173977', pathogenicAlleles: ['T'] },
    ],
    medicalSignificance: 'High severity - affected children typically do not survive past age 5',
    actionItems: [
      'Essential partner screening before pregnancy',
      'Consider preimplantation genetic diagnosis',
      'Prenatal testing available',
    ],
  },
  {
    id: 'alpha-1-antitrypsin',
    name: 'Alpha-1 Antitrypsin Deficiency',
    description: 'Can cause lung and liver disease. Some carriers may have reduced enzyme levels.',
    gene: 'SERPINA1',
    inheritance: 'autosomal_recessive',
    severity: 'moderate',
    category: 'respiratory',
    prevalence: '1 in 25 people are carriers',
    snps: [
      { rsid: 'rs28929474', pathogenicAlleles: ['T'] },
    ],
    medicalSignificance: 'Moderate - carriers may have slightly reduced lung function',
    actionItems: [
      'Avoid smoking and secondhand smoke',
      'Inform anesthesiologist before surgery',
      'Regular lung function monitoring if symptoms develop',
    ],
  },
  {
    id: 'hemochromatosis',
    name: 'Hereditary Hemochromatosis',
    description: 'Iron overload disorder. Carriers typically have no symptoms.',
    gene: 'HFE',
    inheritance: 'autosomal_recessive',
    severity: 'mild',
    category: 'metabolic',
    prevalence: '1 in 10 people of Northern European descent carry one variant',
    snps: [
      { rsid: 'rs1800562', pathogenicAlleles: ['A'] }, // C282Y
      { rsid: 'rs1799945', pathogenicAlleles: ['G'] }, // H63D
    ],
    medicalSignificance: 'Low-Moderate - C282Y homozygotes at risk; carriers typically unaffected',
    actionItems: [
      'Avoid iron supplements unless prescribed',
      'Regular iron level monitoring not needed for carriers',
      'Inform family members about testing',
    ],
  },
  {
    id: 'factor-v-leiden',
    name: 'Factor V Leiden Thrombophilia',
    description: 'Increased blood clot risk. Heterozygotes have 5x increased risk.',
    gene: 'F5',
    inheritance: 'autosomal_dominant',
    severity: 'moderate',
    category: 'hematologic',
    prevalence: '1 in 25 people of European descent are carriers',
    snps: [
      { rsid: 'rs6025', pathogenicAlleles: ['T'] },
    ],
    medicalSignificance: 'Moderate - increased risk of deep vein thrombosis',
    actionItems: [
      'Avoid prolonged immobility',
      'Stay hydrated during long flights',
      'Inform doctors before surgery or pregnancy',
      'Consider compression stockings for travel',
    ],
  },
  {
    id: 'mthfr-c677t',
    name: 'MTHFR C677T Variant',
    description: 'Affects folate metabolism. Common variant with mild effects in carriers.',
    gene: 'MTHFR',
    inheritance: 'autosomal_recessive',
    severity: 'mild',
    category: 'metabolic',
    prevalence: '~40% of population carries one variant',
    snps: [
      { rsid: 'rs1801133', pathogenicAlleles: ['T'] },
    ],
    medicalSignificance: 'Low - carriers may benefit from methylated folate supplements',
    actionItems: [
      'Ensure adequate folate intake',
      'Consider L-methylfolate supplements',
      'Monitor homocysteine levels if concerned',
    ],
  },
];

/**
 * Analyze genome for carrier status
 */
export function analyzeCarrierStatus(snps: SNP[]): CarrierReport {
  const results: CarrierResult[] = [];
  
  for (const condition of CARRIER_CONDITIONS) {
    const result = analyzeCondition(condition, snps);
    results.push(result);
  }
  
  // Calculate summary
  const carrierCount = results.filter(r => r.status === 'carrier').length;
  const affectedCount = results.filter(r => r.status === 'affected').length;
  const unknownCount = results.filter(r => r.status === 'unknown').length;
  const notCarrierCount = results.filter(r => r.status === 'not_carrier').length;
  const highRiskConditions = results.filter(r => 
    r.riskLevel === 'high' && r.status !== 'not_carrier'
  ).length;
  const moderateRiskConditions = results.filter(r => 
    r.riskLevel === 'moderate' && r.status === 'carrier'
  ).length;
  
  // Group by category
  const conditionsByCategory: Record<string, number> = {};
  for (const result of results) {
    if (result.status === 'carrier' || result.status === 'affected') {
      const cat = result.condition.severity;
      conditionsByCategory[cat] = (conditionsByCategory[cat] || 0) + 1;
    }
  }
  
  // Critical findings
  const criticalFindings = results.filter(r => 
    (r.status === 'carrier' || r.status === 'affected') && 
    r.condition.severity === 'severe'
  );
  
  return {
    results,
    summary: {
      totalConditions: CARRIER_CONDITIONS.length,
      carrierCount,
      affectedCount,
      unknownCount,
      notCarrierCount,
      highRiskConditions,
      moderateRiskConditions,
      totalConditionsTested: CARRIER_CONDITIONS.length,
      conditionsByCategory,
      byStatus: {
        carrier: carrierCount,
        affected: affectedCount,
        not_carrier: notCarrierCount,
        unknown: unknownCount,
      },
      requiresAttention: highRiskConditions > 0 || affectedCount > 0,
    },
    generalRecommendations: generateGeneralRecommendations(results),
    criticalFindings,
    recommendations: generateGeneralRecommendations(results),
    nextSteps: [
      'Discuss results with healthcare provider',
      'Consider genetic counseling for family planning',
      'Share results with family members who may be carriers',
    ],
    disclaimer: 'This report is for informational purposes only and does not constitute medical advice. Consult a healthcare provider for interpretation.',
    id: `carrier-${Date.now()}`,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Analyze a single condition
 */
function analyzeCondition(condition: CarrierCondition, snps: SNP[]): CarrierResult {
  let detectedSnp: SNP | null = null;
  let detectedVariant: CarrierCondition['snps'][0] | null = null;
  
  // Check each SNP for this condition
  for (const variant of condition.snps) {
    const snp = findSNP(snps, variant.rsid);
    if (snp) {
      detectedSnp = snp;
      detectedVariant = variant;
      break;
    }
  }
  
  if (!detectedSnp || !detectedVariant) {
    return {
      condition,
      status: 'unknown',
      genotype: null,
      riskLevel: 'low',
      details: `The genetic marker for ${condition.name} was not found in your data.`,
      recommendations: [
        'Consider clinical genetic testing for comprehensive screening',
        'Not all variants are included in consumer genetic tests',
      ],
      variantsFound: [],
      riskToOffspring: 'Unknown',
      riskExplanation: 'Genetic marker not found.',
      counselingRecommended: false,
      urgency: 'low',
    };
  }
  
  const genotype = detectedSnp.genotype;
  const alleles = genotype.split('');
  
  // Determine carrier status
  let status: CarrierResult['status'];
  let riskLevel: CarrierResult['riskLevel'];
  
  const hasPathogenic = alleles.some(a => 
    detectedVariant!.pathogenicAlleles.includes(a)
  );
  const isHomozygous = alleles.every(a => 
    detectedVariant!.pathogenicAlleles.includes(a)
  );
  
  if (condition.inheritance === 'autosomal_recessive') {
    if (isHomozygous) {
      status = 'affected';
      riskLevel = 'high';
    } else if (hasPathogenic) {
      status = 'carrier';
      riskLevel = condition.severity === 'severe' ? 'high' : 'moderate';
    } else {
      status = 'not_carrier';
      riskLevel = 'low';
    }
  } else if (condition.inheritance === 'autosomal_dominant') {
    if (hasPathogenic) {
      status = 'affected';
      riskLevel = 'high';
    } else {
      status = 'not_carrier';
      riskLevel = 'low';
    }
  } else {
    // X-linked - simplified (would need sex chromosome data)
    status = hasPathogenic ? 'carrier' : 'not_carrier';
    riskLevel = hasPathogenic ? 'moderate' : 'low';
  }
  
  // Generate details and recommendations
  const details = generateCarrierDetails(condition, status, genotype);
  const recommendations = getRecommendations(condition, status);
  
  // Calculate offspring risk
  let riskToOffspring: string;
  let riskExplanation: string;
  
  if (condition.inheritance === 'autosomal_recessive') {
    if (status === 'carrier') {
      riskToOffspring = '25% if partner is also carrier';
      riskExplanation = 'If your partner is also a carrier, there is a 25% chance with each pregnancy of having an affected child.';
    } else if (status === 'affected') {
      riskToOffspring = '100% of children will be carriers';
      riskExplanation = 'All your children will inherit one copy of the variant and be carriers.';
    } else {
      riskToOffspring = 'Negligible';
      riskExplanation = 'You do not carry the tested variants.';
    }
  } else if (condition.inheritance === 'autosomal_dominant') {
    if (status === 'affected') {
      riskToOffspring = '50%';
      riskExplanation = 'There is a 50% chance with each pregnancy of passing the variant to your child.';
    } else {
      riskToOffspring = 'Negligible';
      riskExplanation = 'You do not carry the tested variant.';
    }
  } else {
    riskToOffspring = 'Depends on partner';
    riskExplanation = 'Risk assessment requires partner genetic testing.';
  }
  
  // Determine urgency
  let urgency: CarrierResult['urgency'] = 'low';
  if (status === 'affected' && condition.severity === 'severe') {
    urgency = 'immediate';
  } else if (status === 'carrier' && condition.severity === 'severe') {
    urgency = 'high';
  } else if (status === 'carrier') {
    urgency = 'moderate';
  }
  
  return {
    condition,
    status,
    genotype,
    riskLevel,
    details,
    recommendations,
    variantsFound: detectedVariant ? [{
      id: detectedVariant.rsid,
      name: `${condition.gene} variant`,
      rsid: detectedVariant.rsid,
    }] : [],
    riskToOffspring,
    riskExplanation,
    counselingRecommended: status === 'carrier' || status === 'affected',
    urgency,
  };
}

/**
 * Generate detailed explanation
 */
function generateCarrierDetails(
  condition: CarrierCondition,
  status: CarrierResult['status'],
  genotype: string
): string {
  const baseText = {
    carrier: `You are a carrier of one variant for ${condition.name}. Carriers typically do not develop symptoms but can pass the variant to children.`,
    affected: `You have two variants for ${condition.name}. You may be affected by this condition or at increased risk. Consult a healthcare provider.`,
    not_carrier: `You do not appear to carry the common variants for ${condition.name} that were tested.`,
    unknown: 'Unable to determine carrier status from available data.',
  };
  
  let details = baseText[status];
  
  if (status === 'carrier' || status === 'affected') {
    details += `\n\nInheritance: ${condition.inheritance.replace('_', ' ')}`;
    details += `\nGene: ${condition.gene}`;
    details += `\nYour genotype: ${genotype}`;
  }
  
  return details;
}

/**
 * Get recommendations based on status
 */
function getRecommendations(
  condition: CarrierCondition,
  status: CarrierResult['status']
): string[] {
  if (status === 'not_carrier' || status === 'unknown') {
    return ['No specific actions needed based on this result.'];
  }
  
  return condition.actionItems;
}

/**
 * Generate general recommendations
 */
function generateGeneralRecommendations(results: CarrierResult[]): string[] {
  const recommendations: string[] = [];
  const carriers = results.filter(r => r.status === 'carrier');
  
  if (carriers.length > 0) {
    recommendations.push(
      `You are a carrier for ${carriers.length} condition(s). Consider partner testing if planning a family.`
    );
    recommendations.push(
      'Share carrier results with family members who may also be carriers.'
    );
  }
  
  const severe = results.filter(
    r => r.status === 'carrier' && r.condition.severity === 'severe'
  );
  
  if (severe.length > 0) {
    recommendations.push(
      'You carry variants for severe conditions. Genetic counseling is strongly recommended.'
    );
  }
  
  recommendations.push(
    'These results are for informational purposes. Consult a genetic counselor for medical advice.'
  );
  
  return recommendations;
}

/**
 * Get all available conditions
 */
export function getAllConditions(): CarrierCondition[] {
  return [...CARRIER_CONDITIONS];
}

/**
 * Get condition by ID
 */
export function getConditionById(id: string): CarrierCondition | undefined {
  return CARRIER_CONDITIONS.find(c => c.id === id);
}

/**
 * Check if someone is a carrier for a specific condition
 */
export function isCarrier(conditionId: string, snps: SNP[]): boolean {
  const condition = getConditionById(conditionId);
  if (!condition) return false;
  
  for (const variant of condition.snps) {
    const snp = findSNP(snps, variant.rsid);
    if (snp) {
      const alleles = snp.genotype.split('');
      const hasPathogenic = alleles.some(a => variant.pathogenicAlleles.includes(a));
      const isHomozygous = alleles.every(a => variant.pathogenicAlleles.includes(a));
      
      if (condition.inheritance === 'autosomal_recessive' && hasPathogenic && !isHomozygous) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Generate detailed carrier report (legacy compatibility)
 */
export function generateCarrierReport(snps: SNP[]): CarrierReport {
  return analyzeCarrierStatus(snps);
}

/**
 * Calculate combined risk for multiple conditions
 */
export function calculateCombinedRisk(results: CarrierResult[]): {
  overallRisk: 'low' | 'moderate' | 'high';
  carrierCount: number;
  affectedCount: number;
  atRiskConditions: string[];
} {
  const carriers = results.filter(r => r.status === 'carrier');
  const affected = results.filter(r => r.status === 'affected');
  const severeCarriers = carriers.filter(r => r.condition.severity === 'severe');
  
  let overallRisk: 'low' | 'moderate' | 'high' = 'low';
  if (affected.length > 0 || severeCarriers.length > 1) {
    overallRisk = 'high';
  } else if (carriers.length > 0) {
    overallRisk = 'moderate';
  }
  
  return {
    overallRisk,
    carrierCount: carriers.length,
    affectedCount: affected.length,
    atRiskConditions: carriers.map(r => r.condition.name),
  };
}

/**
 * Get summary of carrier results
 */
export function getCarrierResultsSummary(report: CarrierReport): {
  total: number;
  carriers: number;
  affected: number;
  notCarriers: number;
  unknown: number;
  byStatus: Record<string, number>;
  requiresAttention: boolean;
} {
  return {
    total: report.summary.totalConditions,
    carriers: report.summary.carrierCount,
    affected: report.summary.affectedCount,
    notCarriers: report.summary.notCarrierCount || 0,
    unknown: report.summary.unknownCount,
    byStatus: report.summary.byStatus || {
      carrier: report.summary.carrierCount,
      affected: report.summary.affectedCount,
      not_carrier: report.summary.notCarrierCount || 0,
      unknown: report.summary.unknownCount,
    },
    requiresAttention: report.summary.requiresAttention || false,
  };
}
