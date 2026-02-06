/**
 * Carrier Status Analysis Utility
 * 
 * Functions for analyzing genetic data to determine carrier status
 * for various genetic conditions.
 * 
 * IMPORTANT: This is for educational purposes only and should not
 * replace professional medical advice or clinical genetic testing.
 */

import crypto from 'crypto';
import type { 
  GenomeData, 
  SNP 
} from '~/types/genetics';
import type { 
  CarrierCondition, 
  CarrierResult, 
  CarrierReport,
  CarrierStatus,
  OffspringRisk,
  PathogenicVariant,
  PartnerCarrierResult,
  CombinedCarrierRisk,
  CarrierFilterOptions,
} from '~/types/carrier';
import { InheritancePattern } from '~/types/carrier';
import { 
  CARRIER_CONDITIONS, 
  CARRIER_DISCLAIMER,
  getConditionById 
} from '~/data/carrierConditions';

/**
 * Analyze genome data for all carrier conditions
 */
export function analyzeCarrierStatus(genome: GenomeData): CarrierResult[] {
  const results: CarrierResult[] = [];
  
  for (const condition of CARRIER_CONDITIONS) {
    const result = checkCondition(genome, condition);
    results.push(result);
  }
  
  return results.sort((a, b) => {
    // Sort by urgency first
    const urgencyOrder = { immediate: 0, high: 1, moderate: 2, low: 3, none: 4 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    // Then by severity
    const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    if (severityOrder[a.condition.severity] !== severityOrder[b.condition.severity]) {
      return severityOrder[a.condition.severity] - severityOrder[b.condition.severity];
    }
    return 0;
  });
}

/**
 * Check a specific condition against genome data
 */
export function checkCondition(genome: GenomeData, condition: CarrierCondition): CarrierResult {
  const userGenotypes: Array<{ rsid: string; genotype: string }> = [];
  const variantsFound: PathogenicVariant[] = [];
  
  // Check all associated SNPs
  for (const rsid of condition.associatedSNPs) {
    const snp = genome.snps.find(s => s.rsid === rsid);
    if (snp) {
      userGenotypes.push({ rsid, genotype: snp.genotype });
      
      // Check if this genotype matches any pathogenic variant
      for (const variant of condition.pathogenicVariants) {
        if (variant.rsid === rsid && isPathogenicVariant(snp.genotype, variant.pathogenicGenotypes)) {
          if (!variantsFound.find(v => v.id === variant.id)) {
            variantsFound.push(variant);
          }
        }
      }
    }
  }
  
  // Determine carrier status based on inheritance pattern and variants found
  const status = determineCarrierStatus(condition, variantsFound, userGenotypes);
  
  // Calculate offspring risk
  const { risk: riskToOffspring, explanation: riskExplanation } = calculateOffspringRisk(
    condition, 
    status, 
    variantsFound
  );
  
  // Generate explanation
  const explanation = generateExplanation(condition, status, variantsFound, userGenotypes);
  
  // Get recommendations
  const recommendations = getRecommendations({
    condition,
    status,
    variantsFound,
    userGenotypes,
    explanation,
    riskToOffspring,
    riskExplanation,
    recommendations: [],
    resources: condition.resources,
    analyzedAt: new Date(),
    counselingRecommended: false,
    urgency: 'none',
  });
  
  // Determine if counseling is recommended
  const counselingRecommended = shouldRecommendCounseling(condition, status);
  
  // Determine urgency
  const urgency = determineUrgency(condition, status);
  
  return {
    condition,
    status,
    variantsFound,
    userGenotypes,
    explanation,
    riskToOffspring,
    riskExplanation,
    recommendations,
    resources: condition.resources,
    analyzedAt: new Date(),
    counselingRecommended,
    urgency,
  };
}

/**
 * Check if a user genotype matches pathogenic variants
 */
export function isPathogenicVariant(userGenotype: string, pathogenicVariants: string[]): boolean {
  // Normalize genotype (order doesn't matter for heterozygous)
  const normalized = normalizeGenotype(userGenotype);
  
  return pathogenicVariants.some(variant => {
    const normalizedVariant = normalizeGenotype(variant);
    return normalized === normalizedVariant;
  });
}

/**
 * Normalize genotype for comparison (handle order and case)
 */
function normalizeGenotype(genotype: string): string {
  if (!genotype || genotype.length !== 2) return genotype.toUpperCase();
  
  const alleles = genotype.toUpperCase().split('').sort();
  return alleles.join('');
}

/**
 * Determine carrier status based on condition and variants found
 */
function determineCarrierStatus(
  condition: CarrierCondition,
  variantsFound: PathogenicVariant[],
  userGenotypes: Array<{ rsid: string; genotype: string }>
): CarrierStatus {
  // If no SNPs tested for this condition
  if (userGenotypes.length === 0) {
    return 'not_tested';
  }
  
  const hasPathogenicVariant = variantsFound.length > 0;
  
  switch (condition.inheritance) {
    case InheritancePattern.AUTOSOMAL_RECESSIVE:
      // For recessive, one variant = carrier, two different variants = compound heterozygote (affected)
      if (hasPathogenicVariant) {
        // Check if homozygous for same variant or compound heterozygote
        const homozygousVariants = variantsFound.filter(v => {
          const genotype = userGenotypes.find(g => g.rsid === v.rsid)?.genotype;
          return genotype && isHomozygous(genotype);
        });
        
        if (homozygousVariants.length > 0) {
          return 'affected';
        }
        
        // Check for compound heterozygosity (two different variants)
        const uniqueVariants = new Set(variantsFound.map(v => v.id));
        if (uniqueVariants.size >= 2) {
          return 'affected';
        }
        
        return 'carrier';
      }
      return 'not_carrier';
      
    case InheritancePattern.AUTOSOMAL_DOMINANT:
      // For dominant, one variant = affected (usually)
      return hasPathogenicVariant ? 'affected' : 'not_carrier';
      
    case InheritancePattern.X_LINKED_RECESSIVE:
      // For X-linked, males with variant = affected, females with one variant = carrier
      // Note: We don't have sex information here, so we report based on typical patterns
      return hasPathogenicVariant ? 'carrier' : 'not_carrier';
      
    case InheritancePattern.X_LINKED_DOMINANT:
      return hasPathogenicVariant ? 'affected' : 'not_carrier';
      
    default:
      return hasPathogenicVariant ? 'carrier' : 'not_carrier';
  }
}

/**
 * Check if genotype is homozygous
 */
function isHomozygous(genotype: string): boolean {
  if (!genotype || genotype.length !== 2) return false;
  return genotype[0] === genotype[1];
}

/**
 * Calculate risk to offspring
 */
function calculateOffspringRisk(
  condition: CarrierCondition,
  status: CarrierStatus,
  variantsFound: PathogenicVariant[]
): { risk: OffspringRisk; explanation: string } {
  switch (condition.inheritance) {
    case InheritancePattern.AUTOSOMAL_RECESSIVE:
      if (status === 'not_carrier') {
        return {
          risk: 'negligible',
          explanation: `You are not a carrier of ${condition.name}. Your children cannot inherit this condition from you, regardless of your partner's status.`
        };
      } else if (status === 'carrier') {
        return {
          risk: 'depends_on_partner',
          explanation: `You are a carrier of ${condition.name}. If your partner is also a carrier, there is a 25% chance with each pregnancy of having an affected child, and a 50% chance of having a carrier child.`
        };
      } else if (status === 'affected') {
        return {
          risk: 'high',
          explanation: `You are affected with ${condition.name}. All of your children will be carriers. If your partner is also a carrier, there is a 50% chance with each pregnancy of having an affected child.`
        };
      }
      break;
      
    case InheritancePattern.AUTOSOMAL_DOMINANT:
      if (status === 'affected') {
        return {
          risk: 'high',
          explanation: `You have ${condition.name} (autosomal dominant). There is a 50% chance with each pregnancy of passing this condition to your child.`
        };
      } else {
        return {
          risk: 'negligible',
          explanation: `You do not have ${condition.name}. Your children cannot inherit this condition from you.`
        };
      }
      
    case InheritancePattern.X_LINKED_RECESSIVE:
      if (status === 'carrier') {
        return {
          risk: 'depends_on_partner',
          explanation: `You are a carrier of ${condition.name} (X-linked). Your sons have a 50% chance of being affected, and your daughters have a 50% chance of being carriers.`
        };
      } else if (status === 'affected') {
        return {
          risk: 'high',
          explanation: `You are affected with ${condition.name}. All of your sons will be unaffected carriers (if male), and all of your daughters will be carriers (if female).`
        };
      } else {
        return {
          risk: 'negligible',
          explanation: `You are not a carrier of ${condition.name}.`
        };
      }
      
    case InheritancePattern.X_LINKED_DOMINANT:
      if (status === 'affected') {
        return {
          risk: 'high',
          explanation: `You have ${condition.name} (X-linked dominant). There is a 50% chance with each pregnancy of passing this condition to your child, regardless of sex.`
        };
      } else {
        return {
          risk: 'negligible',
          explanation: `You do not have ${condition.name}.`
        };
      }
      
    default:
      return {
        risk: 'low',
        explanation: 'Risk assessment for this inheritance pattern requires genetic counseling.'
      };
  }
  
  return {
    risk: 'low',
    explanation: 'Unable to determine risk. Please consult a genetic counselor.'
  };
}

/**
 * Generate explanation text for carrier result
 */
function generateExplanation(
  condition: CarrierCondition,
  status: CarrierStatus,
  variantsFound: PathogenicVariant[],
  userGenotypes: Array<{ rsid: string; genotype: string }>
): string {
  const variantNames = variantsFound.map(v => v.name).join(', ');
  
  switch (status) {
    case 'carrier':
      return `You carry one pathogenic variant${variantsFound.length > 1 ? 's' : ''} (${variantNames}) in the ${condition.gene} gene. As a carrier, you typically will not develop symptoms of ${condition.name}, but you can pass the variant to your children.`;
      
    case 'affected':
      return `Based on your genetic results, you have two pathogenic variants${variantsFound.length > 0 ? ` (${variantNames})` : ''} in the ${condition.gene} gene. This indicates you may be affected with ${condition.name}. Please consult with a specialist immediately for clinical evaluation.`;
      
    case 'not_carrier':
      return `Your genetic analysis did not identify any of the tested pathogenic variants in the ${condition.gene} gene associated with ${condition.name}. You are unlikely to be a carrier of this condition.`;
      
    case 'uncertain':
      return `Your genetic results for ${condition.name} are inconclusive. Some variants of uncertain significance were detected. Further clinical testing may be needed.`;
      
    case 'not_tested':
      return `Your genome data does not include the specific genetic markers (SNPs) needed to determine carrier status for ${condition.name}. Additional testing may be required.`;
      
    default:
      return 'Unable to generate explanation. Please consult a genetic counselor.';
  }
}

/**
 * Get risk level from carrier result
 */
export function getCarrierRisk(result: CarrierResult): 'high' | 'low' | 'not_a_carrier' {
  if (result.status === 'not_carrier') {
    return 'not_a_carrier';
  }
  
  if (result.status === 'affected' || result.condition.severity === 'critical') {
    return 'high';
  }
  
  if (result.status === 'carrier' && result.riskToOffspring === 'depends_on_partner') {
    return 'low'; // Risk depends on partner, so individual risk is low
  }
  
  return 'low';
}

/**
 * Get recommendations based on carrier result
 */
export function getRecommendations(result: CarrierResult): string[] {
  const recommendations: string[] = [];
  
  // Base recommendations based on status
  switch (result.status) {
    case 'carrier':
      recommendations.push(
        'Consider genetic counseling to understand your results and family planning options',
        'If planning a family, your partner should also be screened for this condition',
        'Inform your siblings that they may also be carriers and should consider testing',
        'Keep a copy of your genetic results for your medical records'
      );
      
      // Add condition-specific recommendations
      if (result.condition.id === 'brca1_brca2_syndrome') {
        recommendations.push(
          'Schedule an appointment with a high-risk breast cancer clinic',
          'Discuss enhanced screening protocols with your doctor',
          'Consider risk-reducing strategies with your healthcare provider'
        );
      }
      
      if (result.condition.id === 'hereditary_hemochromatosis') {
        recommendations.push(
          'Have your ferritin and transferrin saturation levels checked regularly',
          'Avoid iron supplements and vitamin C supplements',
          'Limit alcohol consumption'
        );
      }
      
      if (result.condition.id === 'g6pd_deficiency') {
        recommendations.push(
          'Avoid fava beans and certain medications that can trigger hemolysis',
          'Carry a medical alert card or bracelet',
          'Inform all healthcare providers of your G6PD status'
        );
      }
      break;
      
    case 'affected':
      recommendations.push(
        'URGENT: Contact a specialist immediately for clinical evaluation',
        'Genetic counseling is strongly recommended',
        'Family members should be offered testing',
        'Join a patient support group for your condition'
      );
      break;
      
    case 'not_carrier':
      recommendations.push(
        'No specific action needed for this condition',
        'Continue with routine medical care',
        'Remember that not all variants may have been tested - this is a screening test, not diagnostic'
      );
      break;
      
    case 'not_tested':
      recommendations.push(
        'Consider additional genetic testing if carrier status for this condition is important',
        'Discuss with a genetic counselor if you have a family history of this condition'
      );
      break;
      
    case 'uncertain':
      recommendations.push(
        'Consult with a genetic counselor about variants of uncertain significance',
        'Consider additional testing or family studies'
      );
      break;
  }
  
  // Add condition-specific treatment recommendations
  if (result.condition.treatments && result.condition.treatments.length > 0) {
    recommendations.push(
      `Available treatments for ${result.condition.name}: ${result.condition.treatments.slice(0, 3).join(', ')}`
    );
  }
  
  // Add screening recommendations
  if (result.condition.prenatalTestingAvailable) {
    recommendations.push('Prenatal testing is available for this condition if planning a pregnancy');
  }
  
  if (result.condition.newbornScreeningAvailable) {
    recommendations.push('Newborn screening can detect this condition in newborns');
  }
  
  return recommendations;
}

/**
 * Determine if genetic counseling is recommended
 */
function shouldRecommendCounseling(condition: CarrierCondition, status: CarrierStatus): boolean {
  if (status === 'affected') return true;
  if (status === 'uncertain') return true;
  if (condition.severity === 'critical') return true;
  if (status === 'carrier' && condition.severity === 'high') return true;
  // BRCA1/BRCA2 carriers should also get counseling due to cancer risk implications
  if (condition.id === 'brca1_brca2_syndrome') return true;
  return false;
}

/**
 * Determine urgency level for result
 */
function determineUrgency(
  condition: CarrierCondition, 
  status: CarrierStatus
): 'immediate' | 'high' | 'moderate' | 'low' | 'none' {
  if (status === 'affected' && condition.severity === 'critical') {
    return 'immediate';
  }
  if (status === 'affected' && condition.severity === 'high') {
    return 'high';
  }
  if (status === 'carrier' && condition.severity === 'critical') {
    return 'moderate';
  }
  if (status === 'carrier') {
    return 'low';
  }
  if (status === 'uncertain') {
    return 'moderate';
  }
  return 'none';
}

/**
 * Calculate combined risk for couple screening
 */
export function calculateCombinedRisk(
  userResult: CarrierResult,
  partnerResult: PartnerCarrierResult
): CombinedCarrierRisk {
  const isUserCarrier = userResult.status === 'carrier';
  const isPartnerCarrier = partnerResult.isCarrier;
  
  let childRisk = 0;
  let explanation = '';
  let recommendations: string[] = [];
  let prenatalOptions: string[] = [];
  
  if (userResult.condition.inheritance === InheritancePattern.AUTOSOMAL_RECESSIVE) {
    if (!isUserCarrier && !isPartnerCarrier) {
      childRisk = 0;
      explanation = 'Neither you nor your partner are carriers. Your children will not inherit this condition.';
      recommendations = ['No specific action needed for this condition.'];
    } else if (isUserCarrier && !isPartnerCarrier) {
      childRisk = 0;
      explanation = 'Only one parent is a carrier. Your children will have a 50% chance of being carriers, but will not be affected.';
      recommendations = ['Your children should consider carrier testing when they are adults.'];
    } else if (!isUserCarrier && isPartnerCarrier) {
      childRisk = 0;
      explanation = 'Only your partner is a carrier. Your children will have a 50% chance of being carriers, but will not be affected.';
      recommendations = ['Your children should consider carrier testing when they are adults.'];
    } else {
      childRisk = 0.25;
      explanation = 'Both parents are carriers. With each pregnancy, there is a 25% chance of having an affected child, 50% chance of having a carrier child, and 25% chance of having a non-carrier child.';
      recommendations = [
        'URGENT: Consult with a reproductive genetic counselor before conception',
        'Discuss preimplantation genetic diagnosis (PGD) options',
        'Consider prenatal diagnostic testing (CVS or amniocentesis)',
        'Explore adoption or donor gametes as alternatives'
      ];
      prenatalOptions = [
        'Chorionic Villus Sampling (CVS) at 10-13 weeks',
        'Amniocentesis at 15-20 weeks',
        'Preimplantation Genetic Diagnosis (PGD) with IVF',
        'Non-invasive prenatal testing (screening only)'
      ];
    }
  } else if (userResult.condition.inheritance === InheritancePattern.AUTOSOMAL_DOMINANT) {
    if (userResult.status === 'affected') {
      childRisk = 0.5;
      explanation = 'There is a 50% chance with each pregnancy of passing this condition to your child.';
      recommendations = [
        'Genetic counseling is strongly recommended',
        'Consider prenatal or preimplantation genetic diagnosis',
        'Discuss the condition with your children when they are old enough'
      ];
    }
  } else if (userResult.condition.inheritance === InheritancePattern.X_LINKED_RECESSIVE) {
    if (isUserCarrier && isPartnerCarrier) {
      childRisk = 0.25;
      explanation = 'With each pregnancy, there is a 25% chance of having an affected son, 25% chance of having a carrier daughter, 25% chance of having an unaffected son, and 25% chance of having a non-carrier daughter.';
    }
  }
  
  return {
    condition: userResult.condition,
    userStatus: userResult.status,
    partnerStatus: partnerResult.isCarrier ? 'carrier' : 'not_carrier',
    childRisk,
    explanation,
    recommendations,
    prenatalOptions,
  };
}

/**
 * Generate complete carrier report
 */
export function generateCarrierReport(
  genome: GenomeData,
  userId: string
): CarrierReport {
  const results = analyzeCarrierStatus(genome);
  const analyzedAt = new Date();
  
  const carrierCount = results.filter(r => r.status === 'carrier').length;
  const affectedCount = results.filter(r => r.status === 'affected').length;
  const uncertainCount = results.filter(r => r.status === 'uncertain').length;
  const notCarrierCount = results.filter(r => r.status === 'not_carrier').length;
  const notTestedCount = results.filter(r => r.status === 'not_tested').length;
  
  const criticalFindings = results.filter(r => 
    r.status === 'affected' || (r.status === 'carrier' && r.condition.severity === 'critical')
  );
  
  const counselingRecommended = results.filter(r => r.counselingRecommended);
  
  const conditionsByCategory: Record<string, number> = {};
  results.forEach(r => {
    conditionsByCategory[r.condition.category] = (conditionsByCategory[r.condition.category] || 0) + 1;
  });
  
  // Generate overall recommendations
  const overallRecommendations: string[] = [];
  
  if (carrierCount > 0) {
    overallRecommendations.push(
      `You are a carrier for ${carrierCount} condition${carrierCount > 1 ? 's' : ''}. Consider sharing this information with family members who may also be carriers.`,
      'If planning a family, discuss carrier screening with your partner.'
    );
  }
  
  if (affectedCount > 0) {
    overallRecommendations.push(
      'URGENT: You have genetic variants indicating you may be affected with one or more conditions. Please consult with a specialist immediately.',
      'Contact your healthcare provider to discuss your results and next steps.'
    );
  }
  
  if (counselingRecommended.length > 0) {
    overallRecommendations.push(
      `Genetic counseling is recommended for ${counselingRecommended.length} finding${counselingRecommended.length > 1 ? 's' : ''}.`
    );
  }
  
  if (notTestedCount > 0) {
    overallRecommendations.push(
      `${notTestedCount} condition${notTestedCount > 1 ? 's' : ''} could not be fully assessed with your current genetic data. Consider additional testing if clinically indicated.`
    );
  }
  
  // Generate next steps
  const nextSteps: string[] = [];
  
  if (criticalFindings.length > 0) {
    nextSteps.push(
      'Schedule an appointment with a genetic counselor within 2 weeks',
      'Contact your primary care physician to discuss your results',
      'Consider specialist referrals as indicated in individual results'
    );
  } else if (carrierCount > 0) {
    nextSteps.push(
      'Schedule a genetic counseling appointment when convenient',
      'Discuss family planning considerations with your partner',
      'Share relevant results with siblings who may also be carriers'
    );
  } else {
    nextSteps.push(
      'Continue with routine medical care',
      'Keep your genetic results for future reference',
      'Remember that this screening may not detect all variants'
    );
  }
  
  return {
    id: generateReportId(),
    genomeId: genome.id,
    userId,
    generatedAt: analyzedAt,
    version: '1.0.0',
    summary: {
      totalConditionsTested: results.length,
      carrierCount,
      affectedCount,
      uncertainCount,
      notCarrierCount,
      highRiskConditions: results.filter(r => r.condition.severity === 'critical').length,
      moderateRiskConditions: results.filter(r => r.condition.severity === 'high').length,
      conditionsByCategory,
    },
    results,
    criticalFindings,
    counselingRecommended,
    recommendations: overallRecommendations,
    disclaimer: CARRIER_DISCLAIMER,
    nextSteps,
  };
}

/**
 * Filter carrier results
 */
/**
 * Filter carrier results
 */
export function filterCarrierResults(
  results: CarrierResult[],
  filters: CarrierFilterOptions
): CarrierResult[] {
  return results.filter(result => {
    if (filters.status && !filters.status.includes(result.status)) {
      return false;
    }
    
    if (filters.severity && !filters.severity.includes(result.condition.severity)) {
      return false;
    }
    
    if (filters.inheritance && !filters.inheritance.includes(result.condition.inheritance)) {
      return false;
    }
    
    if (filters.category && !filters.category.includes(result.condition.category)) {
      return false;
    }
    
    if (filters.counselingRequired !== undefined) {
      if (result.counselingRecommended !== filters.counselingRequired) {
        return false;
      }
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matches = 
        result.condition.name.toLowerCase().includes(search) ||
        result.condition.gene.toLowerCase().includes(search) ||
        result.condition.description.toLowerCase().includes(search) ||
        result.condition.category.toLowerCase().includes(search);
      if (!matches) return false;
    }
    
    return true;
  });
}

/**
 * Get summary statistics for results
 */
export function getCarrierResultsSummary(results: CarrierResult[]) {
  const byStatus: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byUrgency: Record<string, number> = {};
  
  results.forEach(r => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    bySeverity[r.condition.severity] = (bySeverity[r.condition.severity] || 0) + 1;
    byCategory[r.condition.category] = (byCategory[r.condition.category] || 0) + 1;
    byUrgency[r.urgency] = (byUrgency[r.urgency] || 0) + 1;
  });
  
  return {
    total: results.length,
    byStatus,
    bySeverity,
    byCategory,
    byUrgency,
    requiresAttention: results.filter(r => 
      r.status === 'affected' || r.counselingRecommended
    ).length,
  };
}

/**
 * Generate unique report ID
 */
function generateReportId(): string {
  return `CR-${Date.now()}-${crypto.randomUUID().replace(/-/g, '').substring(0, 9)}`;
}

/**
 * Export results to JSON format
 */
export function exportResultsToJSON(results: CarrierResult[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalResults: results.length,
    results: results.map(r => ({
      condition: r.condition.name,
      gene: r.condition.gene,
      status: r.status,
      severity: r.condition.severity,
      variantsFound: r.variantsFound.map(v => v.name),
      riskToOffspring: r.riskToOffspring,
      counselingRecommended: r.counselingRecommended,
      urgency: r.urgency,
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Check if a specific SNP is relevant for carrier screening
 */
export function isRelevantForCarrierScreening(rsid: string): boolean {
  return CARRIER_CONDITIONS.some(c => c.associatedSNPs.includes(rsid));
}

/**
 * Get all relevant SNPs for carrier screening
 */
export function getAllCarrierSNPs(): string[] {
  const snps = new Set<string>();
  CARRIER_CONDITIONS.forEach(c => {
    c.associatedSNPs.forEach(snp => snps.add(snp));
  });
  return Array.from(snps);
}
