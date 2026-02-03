import { describe, it, expect } from 'vitest';
import type { GenomeData } from '~/types/genetics';
import type { CarrierResult, PartnerCarrierResult } from '~/types/carrier';
import { InheritancePattern } from '~/types/carrier';
import {
  analyzeCarrierStatus,
  checkCondition,
  isPathogenicVariant,
  getCarrierRisk,
  getRecommendations,
  calculateCombinedRisk,
  generateCarrierReport,
  filterCarrierResults,
  getCarrierResultsSummary,
  exportResultsToJSON,
  isRelevantForCarrierScreening,
  getAllCarrierSNPs,
} from './carrierAnalysis';
import {
  getConditionById,
  CARRIER_CONDITIONS,
} from '~/data/carrierConditions';

// ============================================
// Mock Data Generators
// ============================================

/**
 * Creates a mock genome with specified SNPs
 */
const createMockGenome = (snps: Array<{ rsid: string; genotype: string }>): GenomeData => ({
  id: 'test-genome-1',
  userId: 'user-1',
  filename: 'test.txt',
  source: '23andme',
  snpCount: snps.length,
  processedAt: new Date('2024-01-01'),
  snps: snps.map(s => ({
    rsid: s.rsid,
    chromosome: '1',
    position: 1000000,
    genotype: s.genotype,
  })),
});

/**
 * Creates an empty genome with no SNPs
 */
const createEmptyGenome = (): GenomeData => ({
  id: 'empty-genome',
  userId: 'user-1',
  filename: 'empty.txt',
  source: '23andme',
  snpCount: 0,
  processedAt: new Date('2024-01-01'),
  snps: [],
});

// ============================================
// Mock Genomes for Different Carrier Statuses
// ============================================

const mockGenomes = {
  // Cystic Fibrosis carrier (heterozygous for ΔF508 - rs113993960)
  // CT genotype indicates carrier status for this variant
  cfCarrier: createMockGenome([
    { rsid: 'rs113993960', genotype: 'CT' },
  ]),

  // Cystic Fibrosis affected (homozygous for ΔF508)
  // TT genotype indicates affected status (autosomal recessive)
  cfAffected: createMockGenome([
    { rsid: 'rs113993960', genotype: 'TT' },
  ]),

  // Cystic Fibrosis compound heterozygote (two different variants)
  cfCompoundHeterozygote: createMockGenome([
    { rsid: 'rs113993960', genotype: 'CT' }, // ΔF508
    { rsid: 'rs75527207', genotype: 'AG' }, // G551D
  ]),

  // Sickle Cell carrier (heterozygous for HbS - rs334)
  // AT genotype indicates sickle cell trait (carrier)
  sickleCellCarrier: createMockGenome([
    { rsid: 'rs334', genotype: 'AT' },
  ]),

  // Sickle Cell affected (homozygous for HbS)
  // TT genotype indicates sickle cell disease
  sickleCellAffected: createMockGenome([
    { rsid: 'rs334', genotype: 'TT' },
  ]),

  // Tay-Sachs carrier (heterozygous for 4bp insertion)
  // CT genotype indicates carrier status
  taySachsCarrier: createMockGenome([
    { rsid: 'rs76173980', genotype: 'CT' },
  ]),

  // BRCA1 positive (pathogenic variant)
  // AG genotype for BRCA1 185delAG variant
  brca1Positive: createMockGenome([
    { rsid: 'rs80357906', genotype: 'AG' },
  ]),

  // BRCA2 positive (pathogenic variant)
  // AT genotype for BRCA2 6174delT variant
  brca2Positive: createMockGenome([
    { rsid: 'rs80359550', genotype: 'AT' },
  ]),

  // G6PD deficiency carrier (X-linked recessive)
  // CT genotype indicates carrier status (for females)
  g6pdCarrier: createMockGenome([
    { rsid: 'rs1050829', genotype: 'CT' },
  ]),

  // Normal genome (no pathogenic variants)
  // Normal genotypes that don't match any pathogenic variants
  normal: createMockGenome([
    { rsid: 'rs113993960', genotype: 'CC' }, // Normal for CF
    { rsid: 'rs334', genotype: 'AA' }, // Normal for sickle cell
    { rsid: 'rs76173980', genotype: 'CC' }, // Normal for Tay-Sachs
    { rsid: 'rs80357906', genotype: 'AA' }, // Normal for BRCA1
    { rsid: 'rs1050829', genotype: 'CC' }, // Normal for G6PD
  ]),

  // Empty genome (no relevant SNPs tested)
  empty: createEmptyGenome(),

  // Multiple carrier conditions
  multipleCarriers: createMockGenome([
    { rsid: 'rs113993960', genotype: 'CT' }, // CF carrier
    { rsid: 'rs334', genotype: 'AT' }, // Sickle cell carrier
    { rsid: 'rs76173980', genotype: 'CT' }, // Tay-Sachs carrier
  ]),

  // Hereditary hemochromatosis carrier (C282Y heterozygous)
  hemochromatosisCarrier: createMockGenome([
    { rsid: 'rs1800562', genotype: 'AG' },
  ]),

  // Hereditary hemochromatosis affected (C282Y homozygous)
  hemochromatosisAffected: createMockGenome([
    { rsid: 'rs1800562', genotype: 'GG' },
  ]),

  // Alpha-1 Antitrypsin deficiency carrier (Z allele)
  alpha1Carrier: createMockGenome([
    { rsid: 'rs28929474', genotype: 'CT' },
  ]),
};

// ============================================
// Tests for analyzeCarrierStatus()
// ============================================

describe('analyzeCarrierStatus', () => {
  it('should analyze genome against all conditions in database', () => {
    const results = analyzeCarrierStatus(mockGenomes.normal);

    expect(results).toHaveLength(CARRIER_CONDITIONS.length);
  });

  it('should identify carrier status correctly', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);

    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    expect(cfResult).toBeDefined();
    expect(cfResult?.status).toBe('carrier');
    expect(cfResult?.variantsFound).toHaveLength(1);
    expect(cfResult?.variantsFound[0].id).toBe('deltaF508');
  });

  it('should identify affected status (homozygous)', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfAffected);

    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    expect(cfResult).toBeDefined();
    expect(cfResult?.status).toBe('affected');
    expect(cfResult?.variantsFound).toHaveLength(1);
  });

  it('should identify compound heterozygote as affected', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCompoundHeterozygote);

    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    expect(cfResult).toBeDefined();
    expect(cfResult?.status).toBe('affected');
    expect(cfResult?.variantsFound.length).toBeGreaterThanOrEqual(2);
  });

  it('should identify not-carrier status', () => {
    const results = analyzeCarrierStatus(mockGenomes.normal);

    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    expect(cfResult).toBeDefined();
    expect(cfResult?.status).toBe('not_carrier');
  });

  it('should flag pathogenic variants', () => {
    const results = analyzeCarrierStatus(mockGenomes.brca1Positive);

    const brcaResult = results.find(r => r.condition.id === 'brca1_brca2_syndrome');
    expect(brcaResult).toBeDefined();
    expect(brcaResult?.variantsFound).toHaveLength(1);
    expect(brcaResult?.variantsFound[0].id).toBe('BRCA1_185delAG');
  });

  it('should sort results by urgency and severity', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);

    // Results should be sorted with urgent findings first
    const urgencyOrder = { immediate: 0, high: 1, moderate: 2, low: 3, none: 4 };
    
    for (let i = 1; i < results.length; i++) {
      const prevUrgency = urgencyOrder[results[i - 1].urgency];
      const currUrgency = urgencyOrder[results[i].urgency];
      expect(prevUrgency).toBeLessThanOrEqual(currUrgency);
    }
  });

  it('should generate user genotypes for each condition', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);

    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    expect(cfResult?.userGenotypes).toHaveLength(1);
    expect(cfResult?.userGenotypes[0].rsid).toBe('rs113993960');
    expect(cfResult?.userGenotypes[0].genotype).toBe('CT');
  });

  it('should handle empty genome data', () => {
    const results = analyzeCarrierStatus(mockGenomes.empty);

    // All conditions should be marked as not_tested
    const notTestedResults = results.filter(r => r.status === 'not_tested');
    expect(notTestedResults.length).toBeGreaterThan(0);
  });

  it('should analyze multiple carrier conditions', () => {
    const results = analyzeCarrierStatus(mockGenomes.multipleCarriers);

    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    const sickleCellResult = results.find(r => r.condition.id === 'sickle_cell_anemia');
    const taySachsResult = results.find(r => r.condition.id === 'tay_sachs_disease');

    expect(cfResult?.status).toBe('carrier');
    expect(sickleCellResult?.status).toBe('carrier');
    expect(taySachsResult?.status).toBe('carrier');
  });
});

// ============================================
// Tests for checkCondition()
// ============================================

describe('checkCondition', () => {
  it('should detect Cystic Fibrosis carrier (rs113993960)', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const result = checkCondition(mockGenomes.cfCarrier, cfCondition);

    expect(result.status).toBe('carrier');
    expect(result.variantsFound).toHaveLength(1);
    expect(result.variantsFound[0].rsid).toBe('rs113993960');
    expect(result.userGenotypes).toContainEqual({ rsid: 'rs113993960', genotype: 'CT' });
  });

  it('should detect Sickle Cell carrier (rs334)', () => {
    const sickleCellCondition = getConditionById('sickle_cell_anemia')!;
    const result = checkCondition(mockGenomes.sickleCellCarrier, sickleCellCondition);

    expect(result.status).toBe('carrier');
    expect(result.variantsFound).toHaveLength(1);
    expect(result.variantsFound[0].rsid).toBe('rs334');
  });

  it('should detect Tay-Sachs carrier', () => {
    const taySachsCondition = getConditionById('tay_sachs_disease')!;
    const result = checkCondition(mockGenomes.taySachsCarrier, taySachsCondition);

    expect(result.status).toBe('carrier');
    expect(result.variantsFound).toHaveLength(1);
    expect(result.variantsFound[0].rsid).toBe('rs76173980');
  });

  it('should detect BRCA1 pathogenic variant', () => {
    const brcaCondition = getConditionById('brca1_brca2_syndrome')!;
    const result = checkCondition(mockGenomes.brca1Positive, brcaCondition);

    // BRCA is autosomal dominant, so one variant = affected
    expect(result.status).toBe('affected');
    expect(result.variantsFound).toHaveLength(1);
    expect(result.variantsFound[0].id).toBe('BRCA1_185delAG');
    expect(result.counselingRecommended).toBe(true);
  });

  it('should detect G6PD deficiency', () => {
    const g6pdCondition = getConditionById('g6pd_deficiency')!;
    const result = checkCondition(mockGenomes.g6pdCarrier, g6pdCondition);

    expect(result.status).toBe('carrier');
    expect(result.variantsFound).toHaveLength(1);
    expect(result.variantsFound[0].rsid).toBe('rs1050829');
  });

  it('should return not-carrier for normal genotypes', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const result = checkCondition(mockGenomes.normal, cfCondition);

    expect(result.status).toBe('not_carrier');
    expect(result.variantsFound).toHaveLength(0);
  });

  it('should generate appropriate explanation', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const result = checkCondition(mockGenomes.cfCarrier, cfCondition);

    expect(result.explanation).toContain('carrier');
    expect(result.explanation).toContain('CFTR');
    expect(result.explanation).toContain('pathogenic variant');
  });

  it('should calculate offspring risk', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const result = checkCondition(mockGenomes.cfCarrier, cfCondition);

    expect(result.riskToOffspring).toBe('depends_on_partner');
    expect(result.riskExplanation).toContain('25%');
  });

  it('should determine appropriate urgency level', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const carrierResult = checkCondition(mockGenomes.cfCarrier, cfCondition);
    const affectedResult = checkCondition(mockGenomes.cfAffected, cfCondition);

    // CF is critical severity, so carriers get 'moderate' urgency
    expect(carrierResult.urgency).toBe('moderate');
    expect(affectedResult.urgency).toBe('immediate');
  });
});

// ============================================
// Tests for isPathogenicVariant()
// ============================================

describe('isPathogenicVariant', () => {
  it('should return true for pathogenic variants', () => {
    // CF ΔF508 pathogenic genotypes are CT and TT
    expect(isPathogenicVariant('CT', ['CT', 'TT'])).toBe(true);
    expect(isPathogenicVariant('TT', ['CT', 'TT'])).toBe(true);
  });

  it('should return false for benign variants', () => {
    // CC is the normal genotype for CF ΔF508
    expect(isPathogenicVariant('CC', ['CT', 'TT'])).toBe(false);
  });

  it('should handle heterozygous carriers', () => {
    // Sickle cell carrier (AT)
    expect(isPathogenicVariant('AT', ['AT', 'TT'])).toBe(true);
    // Normal (AA)
    expect(isPathogenicVariant('AA', ['AT', 'TT'])).toBe(false);
  });

  it('should normalize genotype ordering', () => {
    // TC should match CT (normalized)
    expect(isPathogenicVariant('TC', ['CT', 'TT'])).toBe(true);
    // GT should match TG (normalized)
    expect(isPathogenicVariant('GT', ['TG', 'TT'])).toBe(true);
  });

  it('should handle case insensitivity', () => {
    expect(isPathogenicVariant('ct', ['CT', 'TT'])).toBe(true);
    expect(isPathogenicVariant('Ct', ['CT', 'TT'])).toBe(true);
  });

  it('should handle homozygous affected status', () => {
    // Sickle cell disease (TT)
    expect(isPathogenicVariant('TT', ['AT', 'TT'])).toBe(true);
  });
});

// ============================================
// Tests for getCarrierRisk()
// ============================================

describe('getCarrierRisk', () => {
  it('should return "high" for pathogenic homozygous', () => {
    const mockResult: Partial<CarrierResult> = {
      status: 'affected',
      condition: {
        id: 'cystic_fibrosis',
        severity: 'critical',
      } as CarrierResult['condition'],
    };

    expect(getCarrierRisk(mockResult as CarrierResult)).toBe('high');
  });

  it('should return "high" for critical severity conditions', () => {
    const mockResult: Partial<CarrierResult> = {
      status: 'carrier',
      condition: {
        id: 'cystic_fibrosis',
        severity: 'critical',
      } as CarrierResult['condition'],
      riskToOffspring: 'depends_on_partner',
    };

    expect(getCarrierRisk(mockResult as CarrierResult)).toBe('high');
  });

  it('should return "low" for carrier', () => {
    const mockResult: Partial<CarrierResult> = {
      status: 'carrier',
      condition: {
        id: 'cystic_fibrosis',
        severity: 'high',
      } as CarrierResult['condition'],
      riskToOffspring: 'depends_on_partner',
    };

    expect(getCarrierRisk(mockResult as CarrierResult)).toBe('low');
  });

  it('should return "not_a_carrier" for normal', () => {
    const mockResult: Partial<CarrierResult> = {
      status: 'not_carrier',
      condition: {
        id: 'cystic_fibrosis',
        severity: 'critical',
      } as CarrierResult['condition'],
    };

    expect(getCarrierRisk(mockResult as CarrierResult)).toBe('not_a_carrier');
  });

  it('should return "high" for not_tested with critical severity', () => {
    // getCarrierRisk checks severity when status is not 'not_carrier'
    const mockResult: Partial<CarrierResult> = {
      status: 'not_tested',
      condition: {
        id: 'cystic_fibrosis',
        severity: 'critical',
      } as CarrierResult['condition'],
    };

    expect(getCarrierRisk(mockResult as CarrierResult)).toBe('high');
  });
});

// ============================================
// Tests for getRecommendations()
// ============================================

describe('getRecommendations', () => {
  it('should return genetic counseling for high risk', () => {
    const results = analyzeCarrierStatus(mockGenomes.brca1Positive);
    const brcaResult = results.find(r => r.condition.id === 'brca1_brca2_syndrome')!;

    const recommendations = getRecommendations(brcaResult);

    expect(recommendations.some(r => r.toLowerCase().includes('counseling'))).toBe(true);
    expect(recommendations.some(r => r.toLowerCase().includes('specialist') || r.toLowerCase().includes('clinic'))).toBe(true);
  });

  it('should return partner screening for carriers', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis')!;

    const recommendations = getRecommendations(cfResult);

    expect(recommendations.some(r => r.toLowerCase().includes('partner'))).toBe(true);
    expect(recommendations.some(r => r.toLowerCase().includes('screen'))).toBe(true);
  });

  it('should include condition-specific recommendations for G6PD', () => {
    const results = analyzeCarrierStatus(mockGenomes.g6pdCarrier);
    const g6pdResult = results.find(r => r.condition.id === 'g6pd_deficiency')!;

    const recommendations = getRecommendations(g6pdResult);

    expect(recommendations.some(r => r.toLowerCase().includes('fava'))).toBe(true);
  });

  it('should include condition-specific recommendations for hemochromatosis', () => {
    const results = analyzeCarrierStatus(mockGenomes.hemochromatosisCarrier);
    const hemoResult = results.find(r => r.condition.id === 'hereditary_hemochromatosis')!;

    const recommendations = getRecommendations(hemoResult);

    expect(recommendations.some(r => r.toLowerCase().includes('ferritin'))).toBe(true);
  });

  it('should return urgent recommendations for affected status', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfAffected);
    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis')!;

    const recommendations = getRecommendations(cfResult);

    expect(recommendations.some(r => r.toLowerCase().includes('urgent'))).toBe(true);
    expect(recommendations.some(r => r.toLowerCase().includes('specialist'))).toBe(true);
  });

  it('should include prenatal testing recommendations when available', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis')!;

    const recommendations = getRecommendations(cfResult);

    expect(recommendations.some(r => r.toLowerCase().includes('prenatal'))).toBe(true);
  });

  it('should include newborn screening recommendations when available', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis')!;

    const recommendations = getRecommendations(cfResult);

    expect(recommendations.some(r => r.toLowerCase().includes('newborn'))).toBe(true);
  });

  it('should return appropriate recommendations for not_carrier status', () => {
    const results = analyzeCarrierStatus(mockGenomes.normal);
    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis')!;

    const recommendations = getRecommendations(cfResult);

    expect(recommendations.some(r => r.toLowerCase().includes('no specific action'))).toBe(true);
    expect(recommendations.some(r => r.toLowerCase().includes('routine'))).toBe(true);
  });
});

// ============================================
// Tests for calculateCombinedRisk()
// ============================================

describe('calculateCombinedRisk', () => {
  it('should calculate 25% risk for two carriers (autosomal recessive)', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const userResult = checkCondition(mockGenomes.cfCarrier, cfCondition);
    
    const partnerResult: PartnerCarrierResult = {
      conditionId: 'cystic_fibrosis',
      isCarrier: true,
    };

    const combinedRisk = calculateCombinedRisk(userResult, partnerResult);

    expect(combinedRisk.childRisk).toBe(0.25);
    expect(combinedRisk.explanation).toContain('25%');
    expect(combinedRisk.recommendations.some(r => r.toLowerCase().includes('urgent'))).toBe(true);
  });

  it('should calculate 0% risk when only one parent is carrier', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const userResult = checkCondition(mockGenomes.cfCarrier, cfCondition);
    
    const partnerResult: PartnerCarrierResult = {
      conditionId: 'cystic_fibrosis',
      isCarrier: false,
    };

    const combinedRisk = calculateCombinedRisk(userResult, partnerResult);

    expect(combinedRisk.childRisk).toBe(0);
    expect(combinedRisk.explanation).toContain('50% chance of being carriers');
  });

  it('should calculate 0% risk when neither parent is carrier', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const userResult = checkCondition(mockGenomes.normal, cfCondition);
    
    const partnerResult: PartnerCarrierResult = {
      conditionId: 'cystic_fibrosis',
      isCarrier: false,
    };

    const combinedRisk = calculateCombinedRisk(userResult, partnerResult);

    expect(combinedRisk.childRisk).toBe(0);
    expect(combinedRisk.explanation).toContain('Neither');
  });

  it('should handle autosomal dominant conditions', () => {
    const brcaCondition = getConditionById('brca1_brca2_syndrome')!;
    const userResult = checkCondition(mockGenomes.brca1Positive, brcaCondition);
    
    const partnerResult: PartnerCarrierResult = {
      conditionId: 'brca1_brca2_syndrome',
      isCarrier: false,
    };

    const combinedRisk = calculateCombinedRisk(userResult, partnerResult);

    expect(combinedRisk.childRisk).toBe(0.5);
    expect(combinedRisk.explanation).toContain('50%');
  });

  it('should handle X-linked recessive conditions', () => {
    const g6pdCondition = getConditionById('g6pd_deficiency')!;
    const userResult = checkCondition(mockGenomes.g6pdCarrier, g6pdCondition);
    
    const partnerResult: PartnerCarrierResult = {
      conditionId: 'g6pd_deficiency',
      isCarrier: true,
    };

    const combinedRisk = calculateCombinedRisk(userResult, partnerResult);

    // For X-linked recessive with both carriers
    expect(combinedRisk.childRisk).toBe(0.25);
  });

  it('should include prenatal options for high-risk combinations', () => {
    const cfCondition = getConditionById('cystic_fibrosis')!;
    const userResult = checkCondition(mockGenomes.cfCarrier, cfCondition);
    
    const partnerResult: PartnerCarrierResult = {
      conditionId: 'cystic_fibrosis',
      isCarrier: true,
    };

    const combinedRisk = calculateCombinedRisk(userResult, partnerResult);

    expect(combinedRisk.prenatalOptions.length).toBeGreaterThan(0);
    expect(combinedRisk.prenatalOptions.some(o => o.toLowerCase().includes('cvs'))).toBe(true);
    expect(combinedRisk.prenatalOptions.some(o => o.toLowerCase().includes('amniocentesis'))).toBe(true);
  });
});

// ============================================
// Tests for generateCarrierReport()
// ============================================

describe('generateCarrierReport', () => {
  it('should generate complete report', () => {
    const report = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');

    expect(report.id).toBeDefined();
    expect(report.userId).toBe('user-123');
    expect(report.genomeId).toBe(mockGenomes.cfCarrier.id);
    expect(report.version).toBe('1.0.0');
    expect(report.generatedAt).toBeInstanceOf(Date);
  });

  it('should include summary statistics', () => {
    const report = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');

    expect(report.summary).toBeDefined();
    expect(report.summary.totalConditionsTested).toBe(CARRIER_CONDITIONS.length);
    expect(report.summary.carrierCount).toBeGreaterThanOrEqual(1);
    expect(typeof report.summary.conditionsByCategory).toBe('object');
  });

  it('should include all results', () => {
    const report = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');

    expect(report.results).toHaveLength(CARRIER_CONDITIONS.length);
  });

  it('should include counseling recommendations', () => {
    const report = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');

    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.recommendations.some(r => r.toLowerCase().includes('carrier'))).toBe(true);
  });

  it('should identify critical findings', () => {
    const report = generateCarrierReport(mockGenomes.cfAffected, 'user-123');

    expect(report.criticalFindings.length).toBeGreaterThan(0);
    expect(report.criticalFindings.some(f => f.condition.id === 'cystic_fibrosis')).toBe(true);
  });

  it('should include next steps', () => {
    const report = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');

    expect(report.nextSteps.length).toBeGreaterThan(0);
  });

  it('should include disclaimer', () => {
    const report = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');

    expect(report.disclaimer).toBeDefined();
    expect(report.disclaimer.length).toBeGreaterThan(0);
    expect(report.disclaimer).toContain('NOT a substitute');
  });

  it('should generate different next steps for affected vs carrier', () => {
    const carrierReport = generateCarrierReport(mockGenomes.cfCarrier, 'user-123');
    const affectedReport = generateCarrierReport(mockGenomes.cfAffected, 'user-123');

    // Affected report should have more urgent next steps
    expect(affectedReport.nextSteps.some(s => 
      s.toLowerCase().includes('urgent') || 
      s.toLowerCase().includes('immediately') ||
      s.toLowerCase().includes('specialist') ||
      s.toLowerCase().includes('physician')
    )).toBe(true);
  });

  it('should include results requiring counseling', () => {
    const report = generateCarrierReport(mockGenomes.brca1Positive, 'user-123');

    expect(report.counselingRecommended.length).toBeGreaterThan(0);
    expect(report.counselingRecommended.some(r => r.condition.id === 'brca1_brca2_syndrome')).toBe(true);
  });
});

// ============================================
// Tests for filterCarrierResults()
// ============================================

describe('filterCarrierResults', () => {
  const results = analyzeCarrierStatus(mockGenomes.multipleCarriers);

  it('should filter by status', () => {
    const carrierResults = filterCarrierResults(results, { status: ['carrier'] });

    expect(carrierResults.every(r => r.status === 'carrier')).toBe(true);
    expect(carrierResults.length).toBeGreaterThan(0);
  });

  it('should filter by severity', () => {
    const criticalResults = filterCarrierResults(results, { severity: ['critical'] });

    expect(criticalResults.every(r => r.condition.severity === 'critical')).toBe(true);
  });

  it('should filter by inheritance pattern', () => {
    const recessiveResults = filterCarrierResults(results, { 
      inheritance: [InheritancePattern.AUTOSOMAL_RECESSIVE] 
    });

    expect(recessiveResults.every(r => r.condition.inheritance === InheritancePattern.AUTOSOMAL_RECESSIVE)).toBe(true);
  });

  it('should filter by category', () => {
    const hematologyResults = filterCarrierResults(results, { category: ['Hematology'] });

    expect(hematologyResults.every(r => r.condition.category === 'Hematology')).toBe(true);
  });

  it('should filter by counseling required', () => {
    const counselingResults = filterCarrierResults(results, { counselingRequired: true });

    expect(counselingResults.every(r => r.counselingRecommended)).toBe(true);
  });

  it('should filter by search term', () => {
    const searchResults = filterCarrierResults(results, { search: 'cystic' });

    expect(searchResults.some(r => r.condition.name.toLowerCase().includes('cystic'))).toBe(true);
  });

  it('should handle case-insensitive search', () => {
    const lowerResults = filterCarrierResults(results, { search: 'cystic' });
    const upperResults = filterCarrierResults(results, { search: 'CYSTIC' });

    expect(lowerResults.length).toBe(upperResults.length);
  });

  it('should combine multiple filters', () => {
    const filtered = filterCarrierResults(results, {
      status: ['carrier'],
      severity: ['critical'],
    });

    expect(filtered.every(r => r.status === 'carrier' && r.condition.severity === 'critical')).toBe(true);
  });

  it('should return empty array for no matches', () => {
    const filtered = filterCarrierResults(results, { search: 'xyznonexistent' });

    expect(filtered).toHaveLength(0);
  });
});

// ============================================
// Tests for getCarrierResultsSummary()
// ============================================

describe('getCarrierResultsSummary', () => {
  it('should calculate statistics correctly', () => {
    const results = analyzeCarrierStatus(mockGenomes.multipleCarriers);
    const stats = getCarrierResultsSummary(results);

    expect(stats.total).toBe(results.length);
    expect(stats.byStatus).toBeDefined();
    expect(stats.bySeverity).toBeDefined();
    expect(stats.byCategory).toBeDefined();
    expect(stats.byUrgency).toBeDefined();
    expect(stats.requiresAttention).toBeGreaterThanOrEqual(3); // At least 3 carriers
  });

  it('should count requires attention correctly', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfAffected);
    const stats = getCarrierResultsSummary(results);

    expect(stats.requiresAttention).toBeGreaterThan(0);
  });

  it('should return correct total count', () => {
    const results = analyzeCarrierStatus(mockGenomes.normal);
    const stats = getCarrierResultsSummary(results);

    expect(stats.total).toBe(CARRIER_CONDITIONS.length);
  });
});

// ============================================
// Tests for exportResultsToJSON()
// ============================================

describe('exportResultsToJSON', () => {
  it('should export results to JSON format', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const json = exportResultsToJSON(results);

    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should include required fields in export', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const json = exportResultsToJSON(results);
    const exported = JSON.parse(json);

    expect(exported.exportDate).toBeDefined();
    expect(exported.totalResults).toBe(results.length);
    expect(exported.results).toBeInstanceOf(Array);
    expect(exported.results[0]).toHaveProperty('condition');
    expect(exported.results[0]).toHaveProperty('status');
    expect(exported.results[0]).toHaveProperty('gene');
    expect(exported.results[0]).toHaveProperty('severity');
  });

  it('should format variant names correctly', () => {
    const results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const json = exportResultsToJSON(results);
    const exported = JSON.parse(json);

    const cfResult = exported.results.find((r: { condition: string }) => r.condition === 'Cystic Fibrosis');
    expect(cfResult).toBeDefined();
    expect(cfResult.variantsFound).toContain('ΔF508 (p.Phe508del)');
  });
});

// ============================================
// Tests for isRelevantForCarrierScreening()
// ============================================

describe('isRelevantForCarrierScreening', () => {
  it('should return true for relevant SNPs', () => {
    expect(isRelevantForCarrierScreening('rs113993960')).toBe(true); // CF
    expect(isRelevantForCarrierScreening('rs334')).toBe(true); // Sickle Cell
    expect(isRelevantForCarrierScreening('rs76173980')).toBe(true); // Tay-Sachs
    expect(isRelevantForCarrierScreening('rs80357906')).toBe(true); // BRCA1
  });

  it('should return false for irrelevant SNPs', () => {
    expect(isRelevantForCarrierScreening('rs999999999')).toBe(false);
    expect(isRelevantForCarrierScreening('rs12345678')).toBe(false);
  });
});

// ============================================
// Tests for getAllCarrierSNPs()
// ============================================

describe('getAllCarrierSNPs', () => {
  it('should return all carrier-relevant SNPs', () => {
    const snps = getAllCarrierSNPs();

    expect(snps.length).toBeGreaterThan(0);
    expect(snps).toContain('rs113993960'); // CF
    expect(snps).toContain('rs334'); // Sickle Cell
    expect(snps).toContain('rs76173980'); // Tay-Sachs
  });

  it('should return unique SNPs only', () => {
    const snps = getAllCarrierSNPs();
    const uniqueSnps = new Set(snps);

    expect(snps.length).toBe(uniqueSnps.size);
  });
});

// ============================================
// Integration Tests
// ============================================

describe('Carrier Analysis Integration', () => {
  it('should handle complete workflow for carrier screening', () => {
    // Step 1: Analyze genome
    const results = analyzeCarrierStatus(mockGenomes.multipleCarriers);
    expect(results.length).toBe(CARRIER_CONDITIONS.length);

    // Step 2: Filter to carriers only
    const carriers = filterCarrierResults(results, { status: ['carrier'] });
    expect(carriers.length).toBeGreaterThanOrEqual(3);

    // Step 3: Generate summary
    const stats = getCarrierResultsSummary(results);
    expect(stats.byStatus['carrier']).toBeGreaterThanOrEqual(3);

    // Step 4: Generate report
    const report = generateCarrierReport(mockGenomes.multipleCarriers, 'user-123');
    expect(report.summary.carrierCount).toBeGreaterThanOrEqual(3);

    // Step 5: Export results
    const json = exportResultsToJSON(results);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should handle affected status workflow', () => {
    // Analyze affected genome
    const results = analyzeCarrierStatus(mockGenomes.cfAffected);
    
    // Find affected result
    const cfResult = results.find(r => r.condition.id === 'cystic_fibrosis');
    expect(cfResult?.status).toBe('affected');
    expect(cfResult?.urgency).toBe('immediate');
    expect(cfResult?.counselingRecommended).toBe(true);

    // Generate report
    const report = generateCarrierReport(mockGenomes.cfAffected, 'user-123');
    expect(report.criticalFindings.length).toBeGreaterThan(0);
    expect(report.recommendations.some(r => r.toLowerCase().includes('urgent'))).toBe(true);
  });

  it('should handle couple screening workflow', () => {
    // Analyze both partners
    const partner1Results = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const partner2Results = analyzeCarrierStatus(mockGenomes.cfCarrier);

    const partner1Cf = partner1Results.find(r => r.condition.id === 'cystic_fibrosis')!;
    const partner2Cf: PartnerCarrierResult = {
      conditionId: 'cystic_fibrosis',
      isCarrier: true,
    };

    // Calculate combined risk
    const combinedRisk = calculateCombinedRisk(partner1Cf, partner2Cf);
    expect(combinedRisk.childRisk).toBe(0.25);
    expect(combinedRisk.recommendations.length).toBeGreaterThan(0);
  });

  it('should handle X-linked inheritance correctly', () => {
    const results = analyzeCarrierStatus(mockGenomes.g6pdCarrier);
    
    const g6pdResult = results.find(r => r.condition.id === 'g6pd_deficiency');
    expect(g6pdResult).toBeDefined();
    expect(g6pdResult?.condition.inheritance).toBe(InheritancePattern.X_LINKED_RECESSIVE);
    expect(g6pdResult?.status).toBe('carrier');
  });

  it('should handle autosomal dominant inheritance correctly', () => {
    const results = analyzeCarrierStatus(mockGenomes.brca1Positive);
    
    const brcaResult = results.find(r => r.condition.id === 'brca1_brca2_syndrome');
    expect(brcaResult).toBeDefined();
    expect(brcaResult?.condition.inheritance).toBe(InheritancePattern.AUTOSOMAL_DOMINANT);
    expect(brcaResult?.status).toBe('affected');
  });

  it('should provide appropriate risk explanations', () => {
    const carrierResults = analyzeCarrierStatus(mockGenomes.cfCarrier);
    const normalResults = analyzeCarrierStatus(mockGenomes.normal);

    const carrierCf = carrierResults.find(r => r.condition.id === 'cystic_fibrosis')!;
    const normalCf = normalResults.find(r => r.condition.id === 'cystic_fibrosis')!;

    expect(carrierCf.riskExplanation).toContain('25%');
    expect(carrierCf.riskExplanation).toContain('partner');
    expect(normalCf.riskExplanation).toContain('not');
  });
});
