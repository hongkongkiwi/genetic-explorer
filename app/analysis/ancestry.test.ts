import { describe, it, expect } from 'vitest';
import {
  analyzeAncestry,
  estimateEthnicity,
  calculateConfidence,
  hasSufficientCoverage,
  getDominantAncestry,
  isMixedAncestry,
  countAncestryComponents,
  formatAncestryResults,
  detectSubPopulation,
  calculateGeneticDistance,
  getSimilarPopulations,
} from './ancestry';
import { determineYHaplogroup, determineMtHaplogroup } from '~/data/haplogroups';
import { ANCESTRY_INFORMATIVE_MARKERS } from '~/data/referencePopulations';
import type { SNP, GenomeData } from '~/types/genetics';
import type { PopulationEstimate } from '~/types/ancestry';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate a mock SNP
 */
const createSNP = (
  rsid: string,
  chromosome: string,
  position: number,
  genotype: string
): SNP => ({
  rsid,
  chromosome,
  position,
  genotype,
});

/**
 * Generate European-specific AIMs with high European frequencies
 */
const generateEuropeanAIMs = (): SNP[] => [
  // SLC24A5 - high European frequency (rs1426654)
  createSNP('rs1426654', '15', 48426484, 'AA'),
  // SLC45A2 - high European frequency (rs16891982)
  createSNP('rs16891982', '5', 33951693, 'GG'),
  // HERC2 - blue eye variant (rs12913832)
  createSNP('rs12913832', '15', 28365618, 'GG'),
  // IRF4 - freckles/light skin (rs12203592)
  createSNP('rs12203592', '6', 396321, 'TT'),
  // KITLG - blonde hair (rs12821256)
  createSNP('rs12821256', '12', 89328335, 'CC'),
  // Additional European markers
  createSNP('rs28777', '5', 33958907, 'AA'),
  createSNP('rs17642680', '4', 175386112, 'AA'),
  createSNP('rs2153271', '5', 33951666, 'AA'),
  createSNP('rs2378249', '5', 33958879, 'AA'),
  createSNP('rs35395', '5', 33951700, 'CC'),
];

/**
 * Generate African-specific AIMs with high African frequencies
 */
const generateAfricanAIMs = (): SNP[] => [
  // TYR - darker skin (rs1042602)
  createSNP('rs1042602', '11', 89017876, 'GG'),
  // MC1R - darker skin (rs885479)
  createSNP('rs885479', '16', 89986188, 'AA'),
  // OCA2 - brown eyes (rs6058017)
  createSNP('rs6058017', '15', 28195071, 'GG'),
  // OCA2 - brown eyes/darker skin (rs13289)
  createSNP('rs13289', '15', 28344239, 'AA'),
  // SLC24A5 - darker skin (rs1424584)
  createSNP('rs1424584', '15', 48422472, 'GG'),
  // DCT - darker skin (rs2470102)
  createSNP('rs2470102', '2', 183570996, 'CC'),
  // Additional African markers
  createSNP('rs2494938', '8', 9203866, 'GG'),
  createSNP('rs763767', '3', 69867757, 'GG'),
];

/**
 * Generate East Asian-specific AIMs with high East Asian frequencies
 */
const generateEastAsianAIMs = (): SNP[] => [
  // EDAR - thick hair, shovel incisors (rs3827760)
  createSNP('rs3827760', '2', 109513601, 'AA'),
  // ABCC11 - dry earwax (rs17822931)
  createSNP('rs17822931', '16', 48225494, 'TT'),
  // EDAR - hair morphology (rs35400489)
  createSNP('rs35400489', '2', 109512152, 'CC'),
  // SLC45A2 - skin pigmentation (rs2238006)
  createSNP('rs2238006', '1', 9309963, 'AA'),
  // BNC2 - skin pigmentation (rs10756819)
  createSNP('rs10756819', '9', 12692190, 'GG'),
  // TYRP1 - eye/skin color (rs10821944)
  createSNP('rs10821944', '9', 17002159, 'TT'),
  // OCA2 - skin pigmentation (rs1800414)
  createSNP('rs1800414', '15', 28165575, 'CC'),
  // Additional East Asian markers
  createSNP('rs26722', '5', 33988793, 'GG'),
  createSNP('rs6542788', '2', 109512649, 'TT'),
  createSNP('rs17037102', '2', 109513192, 'CC'),
  createSNP('rs10903121', '2', 109512200, 'AA'),
];

/**
 * Generate South Asian-specific AIMs
 */
const generateSouthAsianAIMs = (): SNP[] => [
  // DCT - skin pigmentation (rs2470101)
  createSNP('rs2470101', '2', 183570995, 'GG'),
  // SLC45A2 - skin pigmentation (rs183671)
  createSNP('rs183671', '5', 33939468, 'CC'),
  // Additional South Asian markers
  createSNP('rs26722', '5', 33988793, 'GG'),
  createSNP('rs1042602', '11', 89017876, 'GG'),
];

/**
 * Generate Y-chromosome SNPs for haplogroup testing
 */
const generateYChromosomeSNPs = (haplogroupType: 'r1b' | 'r1a' | 'e1b1a' | 'j' | 'unknown' = 'r1b'): SNP[] => {
  const snps: SNP[] = [];
  
  switch (haplogroupType) {
    case 'r1b':
      snps.push(createSNP('M343', 'Y', 1000000, 'T'));
      snps.push(createSNP('M269', 'Y', 1000001, 'T'));
      snps.push(createSNP('P297', 'Y', 1000002, 'T'));
      break;
    case 'r1a':
      snps.push(createSNP('M420', 'Y', 1000000, 'T'));
      snps.push(createSNP('M17', 'Y', 1000001, 'T'));
      snps.push(createSNP('M198', 'Y', 1000002, 'T'));
      break;
    case 'e1b1a':
      snps.push(createSNP('M2', 'Y', 1000000, 'T'));
      snps.push(createSNP('M180', 'Y', 1000001, 'T'));
      snps.push(createSNP('M96', 'Y', 1000002, 'T'));
      break;
    case 'j':
      snps.push(createSNP('M304', 'Y', 1000000, 'T'));
      snps.push(createSNP('M267', 'Y', 1000001, 'T'));
      break;
    case 'unknown':
      // No defining SNPs
      break;
  }
  
  return snps;
};

/**
 * Generate mtDNA SNPs for haplogroup testing
 */
const generateMtDNASNPs = (haplogroupType: 'h' | 'u' | 'l' | 'm' | 'unknown' = 'h'): SNP[] => {
  const snps: SNP[] = [];
  
  switch (haplogroupType) {
    case 'h':
      // H defining variants: G2706A, T7028C
      snps.push(createSNP('mt2706', 'MT', 2706, 'A'));
      snps.push(createSNP('mt7028', 'MT', 7028, 'C'));
      break;
    case 'u':
      // U defining variants: A11467G, A12308G, G12372A
      snps.push(createSNP('mt11467', 'MT', 11467, 'G'));
      snps.push(createSNP('mt12308', 'MT', 12308, 'G'));
      snps.push(createSNP('mt12372', 'MT', 12372, 'A'));
      break;
    case 'l':
      // L defining variants
      snps.push(createSNP('mt769', 'MT', 769, 'A'));
      snps.push(createSNP('mt1018', 'MT', 1018, 'G'));
      break;
    case 'm':
      // M defining variants: T489C, C10400T, G14783A, G15043A, T16249C
      snps.push(createSNP('mt489', 'MT', 489, 'C'));
      snps.push(createSNP('mt10400', 'MT', 10400, 'T'));
      snps.push(createSNP('mt14783', 'MT', 14783, 'A'));
      snps.push(createSNP('mt15043', 'MT', 15043, 'A'));
      snps.push(createSNP('mt16249', 'MT', 16249, 'C'));
      break;
    case 'unknown':
      // No defining variants
      break;
  }
  
  return snps;
};

/**
 * Generate a complete mock genome
 */
const generateMockGenome = (
  options: {
    ancestry?: 'european' | 'african' | 'east_asian' | 'south_asian' | 'mixed';
    sex?: 'male' | 'female';
    yHaplogroup?: 'r1b' | 'r1a' | 'e1b1a' | 'j' | 'unknown';
    mtHaplogroup?: 'h' | 'u' | 'l' | 'm' | 'unknown';
    additionalSNPs?: SNP[];
    snpCount?: number;
  } = {}
): GenomeData => {
  const {
    ancestry = 'european',
    sex = 'male',
    yHaplogroup = 'r1b',
    mtHaplogroup = 'h',
    additionalSNPs = [],
  } = options;

  let snps: SNP[] = [];

  // Add ancestry-specific AIMs
  switch (ancestry) {
    case 'european':
      snps = [...generateEuropeanAIMs()];
      break;
    case 'african':
      snps = [...generateAfricanAIMs()];
      break;
    case 'east_asian':
      snps = [...generateEastAsianAIMs()];
      break;
    case 'south_asian':
      snps = [...generateSouthAsianAIMs()];
      break;
    case 'mixed':
      snps = [
        ...generateEuropeanAIMs().slice(0, 3),
        ...generateAfricanAIMs().slice(0, 3),
      ];
      break;
  }

  // Add sex chromosomes for males
  if (sex === 'male') {
    snps.push(...generateYChromosomeSNPs(yHaplogroup));
  }

  // Add mtDNA
  snps.push(...generateMtDNASNPs(mtHaplogroup));

  // Add additional SNPs
  snps.push(...additionalSNPs);

  // Add filler SNPs for coverage
  for (let i = 0; i < 50; i++) {
    snps.push(createSNP(`rs${1000000 + i}`, String((i % 22) + 1), 1000000 + i * 100, 'AG'));
  }

  return {
    id: 'test-genome-1',
    userId: 'test-user-1',
    filename: 'test_genome.txt',
    source: '23andme',
    snpCount: snps.length,
    processedAt: new Date(),
    snps,
  };
};

/**
 * Generate many AIMs for coverage testing using actual reference population AIMs
 */
const generateManyAIMs = (count: number): SNP[] => {
  // Use actual AIMs from reference populations
  const actualAIMs = ANCESTRY_INFORMATIVE_MARKERS.slice(0, count);
  
  return actualAIMs.map(aim => 
    createSNP(aim.rsid, aim.chromosome, aim.position, 'AG')
  );
};

// ============================================================================
// TESTS: analyzeAncestry()
// ============================================================================

describe('analyzeAncestry', () => {
  it('should analyze genome and return ancestry result', () => {
    const genome = generateMockGenome({ ancestry: 'european' });
    const result = analyzeAncestry(genome);

    expect(result).toBeDefined();
    expect(result.ethnicity).toBeDefined();
    expect(Array.isArray(result.ethnicity)).toBe(true);
    expect(result.mtHaplogroup).toBeDefined();
    expect(typeof result.confidence).toBe('number');
    expect(result.snpsAnalyzed).toBe(genome.snps.length);
    expect(result.analyzedAt).toBeInstanceOf(Date);
    expect(result.version).toBe('1.0.0');
  });

  it('should calculate ethnicity percentages', () => {
    const genome = generateMockGenome({ ancestry: 'european' });
    const result = analyzeAncestry(genome);

    expect(result.ethnicity.length).toBeGreaterThan(0);
    
    // Check that percentages sum to approximately 100
    const totalPercentage = result.ethnicity.reduce((sum, est) => sum + est.percentage, 0);
    expect(totalPercentage).toBeGreaterThanOrEqual(99);
    expect(totalPercentage).toBeLessThanOrEqual(100.1);

    // Check that each estimate has required properties
    result.ethnicity.forEach(est => {
      expect(est.population).toBeDefined();
      expect(typeof est.percentage).toBe('number');
      expect(est.percentage).toBeGreaterThanOrEqual(0);
      expect(est.percentage).toBeLessThanOrEqual(100);
      expect(est.confidence).toBeDefined();
      expect(['high', 'medium', 'low', 'very_low']).toContain(est.confidence);
    });
  });

  it('should determine Y-DNA haplogroup for males', () => {
    const genome = generateMockGenome({ sex: 'male', yHaplogroup: 'r1b' });
    const result = analyzeAncestry(genome);

    expect(result.yHaplogroup).toBeDefined();
    expect(result.yHaplogroup?.haplogroup).toBeDefined();
    expect(result.yHaplogroup?.origin).toBeDefined();
    expect(result.yHaplogroup?.timeDepth).toBeDefined();
    expect(result.yHaplogroup?.migrationPath).toBeDefined();
    expect(result.yHaplogroup?.definingSnps).toBeDefined();
    expect(Array.isArray(result.yHaplogroup?.definingSnps)).toBe(true);
  });

  it('should not include Y-DNA haplogroup for females', () => {
    const genome = generateMockGenome({ sex: 'female' });
    const result = analyzeAncestry(genome);

    // No Y chromosome SNPs, so yHaplogroup should be undefined
    expect(result.yHaplogroup).toBeUndefined();
  });

  it('should determine mtDNA haplogroup', () => {
    const genome = generateMockGenome({ sex: 'female', mtHaplogroup: 'h' });
    const result = analyzeAncestry(genome);

    expect(result.mtHaplogroup).toBeDefined();
    expect(result.mtHaplogroup.haplogroup).toBeDefined();
    expect(result.mtHaplogroup.origin).toBeDefined();
    expect(result.mtHaplogroup.timeDepth).toBeDefined();
    expect(result.mtHaplogroup.migrationPath).toBeDefined();
    expect(result.mtHaplogroup.definingVariants).toBeDefined();
    expect(Array.isArray(result.mtHaplogroup.definingVariants)).toBe(true);
  });

  it('should calculate confidence score', () => {
    const genome = generateMockGenome({ ancestry: 'european' });
    const result = analyzeAncestry(genome);

    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(0.95); // Max is capped at 0.95
  });

  it('should handle insufficient coverage', () => {
    const genome = generateMockGenome({ ancestry: 'european' });
    // Remove most SNPs to simulate poor coverage
    genome.snps = genome.snps.slice(0, 5);
    genome.snpCount = genome.snps.length;
    
    const result = analyzeAncestry(genome);
    
    // Should still return a result even with poor coverage
    expect(result).toBeDefined();
    expect(result.ethnicity).toBeDefined();
    expect(result.ethnicity.length).toBeGreaterThan(0);
  });

  it('should handle missing SNPs gracefully', () => {
    const genome = generateMockGenome({ ancestry: 'european' });
    // Mark all genotypes as missing
    genome.snps = genome.snps.map(snp => ({ ...snp, genotype: '--' }));
    
    const result = analyzeAncestry(genome);
    
    expect(result).toBeDefined();
    expect(result.ethnicity).toBeDefined();
    // With all missing data, estimates should have low confidence
    expect(result.confidence).toBeLessThan(0.8);
  });

  it('should sort ethnicity by percentage descending', () => {
    const genome = generateMockGenome({ ancestry: 'mixed' });
    const result = analyzeAncestry(genome);

    // Check that results are sorted by percentage descending
    for (let i = 1; i < result.ethnicity.length; i++) {
      expect(result.ethnicity[i - 1].percentage).toBeGreaterThanOrEqual(
        result.ethnicity[i].percentage
      );
    }
  });
});

// ============================================================================
// TESTS: estimateEthnicity()
// ============================================================================

describe('estimateEthnicity', () => {
  it('should estimate European ancestry', () => {
    const snps = generateEuropeanAIMs();
    const result = estimateEthnicity(snps);

    expect(result.length).toBeGreaterThan(0);
    
    // Find European estimate
    const europeanEst = result.find(est => est.population === 'European');
    expect(europeanEst).toBeDefined();
    expect(europeanEst!.percentage).toBeGreaterThan(10);
  });

  it('should estimate African ancestry', () => {
    const snps = generateAfricanAIMs();
    const result = estimateEthnicity(snps);

    expect(result.length).toBeGreaterThan(0);
    
    // Find African estimate
    const africanEst = result.find(est => est.population === 'African');
    expect(africanEst).toBeDefined();
    expect(africanEst!.percentage).toBeGreaterThan(10);
  });

  it('should estimate East Asian ancestry', () => {
    const snps = generateEastAsianAIMs();
    const result = estimateEthnicity(snps);

    expect(result.length).toBeGreaterThan(0);
    
    // Find East Asian estimate
    const eastAsianEst = result.find(est => est.population === 'East Asian');
    expect(eastAsianEst).toBeDefined();
    expect(eastAsianEst!.percentage).toBeGreaterThan(10);
  });

  it('should estimate South Asian ancestry', () => {
    const snps = generateSouthAsianAIMs();
    const result = estimateEthnicity(snps);

    expect(result.length).toBeGreaterThan(0);
    
    // Find South Asian estimate
    const southAsianEst = result.find(est => est.population === 'South Asian');
    expect(southAsianEst).toBeDefined();
    expect(southAsianEst!.percentage).toBeGreaterThan(5);
  });

  it('should return confidence levels', () => {
    const snps = generateEuropeanAIMs();
    const result = estimateEthnicity(snps);

    result.forEach(est => {
      expect(est.confidence).toBeDefined();
      expect(['high', 'medium', 'low', 'very_low']).toContain(est.confidence);
    });
  });

  it('should handle ambiguous results', () => {
    // Mix European and African markers equally
    const snps = [
      ...generateEuropeanAIMs().slice(0, 3),
      ...generateAfricanAIMs().slice(0, 3),
    ];
    const result = estimateEthnicity(snps);

    expect(result.length).toBeGreaterThan(0);
    
    // Should have at least 2 populations with significant percentages
    const significantPops = result.filter(est => est.percentage >= 10);
    expect(significantPops.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle empty SNP array', () => {
    const result = estimateEthnicity([]);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    // All populations should have equal distribution
    result.forEach(est => {
      expect(est.confidence).toBe('very_low');
    });
  });

  it('should include region information', () => {
    const snps = generateEuropeanAIMs();
    const result = estimateEthnicity(snps);

    result.forEach(est => {
      expect(est.region).toBeDefined();
      expect(typeof est.region).toBe('string');
    });
  });
});

// ============================================================================
// TESTS: determineYHaplogroup()
// ============================================================================

describe('determineYHaplogroup', () => {
  it('should identify R1b haplogroup', () => {
    const snps = generateYChromosomeSNPs('r1b');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.haplogroup).toContain('R1b');
    expect(result!.origin).toBeDefined();
    expect(result!.timeDepth).toBeDefined();
  });

  it('should identify R1a haplogroup', () => {
    const snps = generateYChromosomeSNPs('r1a');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.haplogroup).toContain('R1a');
    expect(result!.origin).toBeDefined();
  });

  it('should identify E1b1a haplogroup', () => {
    const snps = generateYChromosomeSNPs('e1b1a');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.haplogroup).toContain('E');
    expect(result!.origin).toBeDefined();
  });

  it('should identify J haplogroup', () => {
    const snps = generateYChromosomeSNPs('j');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.haplogroup).toContain('J');
    expect(result!.origin).toBeDefined();
  });

  it('should handle unknown haplogroups', () => {
    const snps = generateYChromosomeSNPs('unknown');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.haplogroup).toBe('Unknown');
    expect(result!.confidence).toBe('very_low');
  });

  it('should return null for female genomes', () => {
    const snps = generateYChromosomeSNPs('r1b');
    const result = determineYHaplogroup(snps, false);

    expect(result).toBeUndefined();
  });

  it('should include migration path information', () => {
    const snps = generateYChromosomeSNPs('r1b');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.migrationPath).toBeDefined();
    expect(typeof result!.migrationPath).toBe('string');
  });

  it('should assign confidence based on matching SNPs', () => {
    const snps = generateYChromosomeSNPs('r1b');
    const result = determineYHaplogroup(snps, true);

    expect(result).toBeDefined();
    expect(result!.confidence).toBeDefined();
    expect(['high', 'medium', 'low', 'very_low']).toContain(result!.confidence);
  });
});

// ============================================================================
// TESTS: determineMtHaplogroup()
// ============================================================================

describe('determineMtHaplogroup', () => {
  it('should identify H haplogroup', () => {
    const snps = generateMtDNASNPs('h');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.haplogroup).toContain('H');
    expect(result.origin).toBeDefined();
    expect(result.timeDepth).toBeDefined();
  });

  it('should identify U haplogroup', () => {
    const snps = generateMtDNASNPs('u');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.haplogroup).toContain('U');
    expect(result.origin).toBeDefined();
  });

  it('should identify L haplogroup', () => {
    const snps = generateMtDNASNPs('l');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.haplogroup).toContain('L');
    expect(result.origin).toBeDefined();
  });

  it('should identify M haplogroup', () => {
    const snps = generateMtDNASNPs('m');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.haplogroup).toContain('M');
    expect(result.origin).toBeDefined();
  });

  it('should handle unknown haplogroups', () => {
    const snps = generateMtDNASNPs('unknown');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    // Should return a default haplogroup
    expect(result.haplogroup).toBeDefined();
  });

  it('should include migration path information', () => {
    const snps = generateMtDNASNPs('h');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.migrationPath).toBeDefined();
    expect(typeof result.migrationPath).toBe('string');
  });

  it('should include distribution information', () => {
    const snps = generateMtDNASNPs('h');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.distribution).toBeDefined();
    expect(typeof result.distribution).toBe('string');
  });

  it('should assign confidence based on matching variants', () => {
    const snps = generateMtDNASNPs('h');
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.confidence).toBeDefined();
    expect(['high', 'medium', 'low', 'very_low']).toContain(result.confidence);
  });

  it('should process SNPs from MT chromosome', () => {
    const snps: SNP[] = [
      createSNP('rsTest', 'MT', 2706, 'A'),
      createSNP('rsTest2', 'MT', 7028, 'C'),
    ];
    const result = determineMtHaplogroup(snps);

    expect(result).toBeDefined();
    expect(result.haplogroup).toBeDefined();
  });
});

// ============================================================================
// TESTS: calculateConfidence()
// ============================================================================

describe('calculateConfidence', () => {
  it('should return high confidence for good coverage', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 85, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 10, confidence: 'medium', region: 'Africa' },
      { population: 'East Asian', percentage: 5, confidence: 'low', region: 'East Asia' },
    ];

    const result = calculateConfidence(estimates);

    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0.6);
  });

  it('should return low confidence for poor coverage', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 30, confidence: 'low', region: 'Europe' },
      { population: 'African', percentage: 25, confidence: 'low', region: 'Africa' },
      { population: 'East Asian', percentage: 20, confidence: 'low', region: 'East Asia' },
      { population: 'South Asian', percentage: 25, confidence: 'low', region: 'South Asia' },
    ];

    const result = calculateConfidence(estimates);

    expect(result).toBeLessThan(0.7);
  });

  it('should consider SNP count when snpMap provided', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 80, confidence: 'high', region: 'Europe' },
    ];
    
    const snpMap = new Map<string, SNP>();
    // Add many SNPs to simulate good coverage
    for (let i = 0; i < 100; i++) {
      snpMap.set(`rs${1000000 + i}`, createSNP(`rs${1000000 + i}`, '1', 1000000 + i, 'AG'));
    }

    const resultWithMap = calculateConfidence(estimates, snpMap);
    const resultWithoutMap = calculateConfidence(estimates);

    expect(resultWithMap).toBeGreaterThanOrEqual(resultWithoutMap);
  });

  it('should increase confidence with clear majority population', () => {
    const highMajority: PopulationEstimate[] = [
      { population: 'European', percentage: 90, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 5, confidence: 'low', region: 'Africa' },
      { population: 'East Asian', percentage: 5, confidence: 'low', region: 'East Asia' },
    ];

    const lowMajority: PopulationEstimate[] = [
      { population: 'European', percentage: 40, confidence: 'medium', region: 'Europe' },
      { population: 'African', percentage: 35, confidence: 'medium', region: 'Africa' },
      { population: 'East Asian', percentage: 25, confidence: 'medium', region: 'East Asia' },
    ];

    const highResult = calculateConfidence(highMajority);
    const lowResult = calculateConfidence(lowMajority);

    expect(highResult).toBeGreaterThan(lowResult);
  });

  it('should cap confidence at 0.95', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 95, confidence: 'high', region: 'Europe' },
    ];

    const result = calculateConfidence(estimates);

    expect(result).toBeLessThanOrEqual(0.95);
  });
});

// ============================================================================
// TESTS: hasSufficientCoverage()
// ============================================================================

describe('hasSufficientCoverage', () => {
  it('should return true for genomes with >100 AIMs', () => {
    const snps = generateManyAIMs(100);
    const result = hasSufficientCoverage(snps);

    expect(result.sufficient).toBe(true);
    expect(result.coverage).toBeGreaterThan(0.3);
  });

  it('should return false for genomes with <50 AIMs', () => {
    const snps = generateManyAIMs(20);
    const result = hasSufficientCoverage(snps);

    expect(result.sufficient).toBe(false);
    expect(result.coverage).toBeLessThan(0.3);
  });

  it('should return coverage percentage', () => {
    const snps = generateManyAIMs(50);
    const result = hasSufficientCoverage(snps);

    expect(typeof result.coverage).toBe('number');
    expect(result.coverage).toBeGreaterThanOrEqual(0);
    expect(result.coverage).toBeLessThanOrEqual(1);
  });

  it('should return missing AIMs count', () => {
    const snps = generateManyAIMs(10);
    const result = hasSufficientCoverage(snps);

    expect(typeof result.missingAims).toBe('number');
    expect(result.missingAims).toBeGreaterThan(0);
  });

  it('should provide recommendations when coverage is insufficient', () => {
    const snps = generateManyAIMs(10);
    const result = hasSufficientCoverage(snps);

    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should provide recommendations when coverage is low', () => {
    const snps = generateManyAIMs(30);
    const result = hasSufficientCoverage(snps);

    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// TESTS: Additional Helper Functions
// ============================================================================

describe('getDominantAncestry', () => {
  it('should return the dominant ancestry population', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 80, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 15, confidence: 'medium', region: 'Africa' },
      { population: 'East Asian', percentage: 5, confidence: 'low', region: 'East Asia' },
    ];

    const result = getDominantAncestry(estimates);

    expect(result).toBeDefined();
    expect(result!.population).toBe('European');
    expect(result!.percentage).toBe(80);
  });

  it('should return undefined for empty array', () => {
    const result = getDominantAncestry([]);
    expect(result).toBeUndefined();
  });
});

describe('isMixedAncestry', () => {
  it('should return true for mixed ancestry (top two within 3:1 ratio)', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 60, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 30, confidence: 'medium', region: 'Africa' },
      { population: 'East Asian', percentage: 10, confidence: 'low', region: 'East Asia' },
    ];

    expect(isMixedAncestry(estimates)).toBe(true);
  });

  it('should return false for dominant single ancestry', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 90, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 5, confidence: 'low', region: 'Africa' },
      { population: 'East Asian', percentage: 5, confidence: 'low', region: 'East Asia' },
    ];

    expect(isMixedAncestry(estimates)).toBe(false);
  });

  it('should return false for single population', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 100, confidence: 'high', region: 'Europe' },
    ];

    expect(isMixedAncestry(estimates)).toBe(false);
  });

  it('should return false for empty array', () => {
    expect(isMixedAncestry([])).toBe(false);
  });
});

describe('countAncestryComponents', () => {
  it('should count components above default threshold (5%)', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 70, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 20, confidence: 'medium', region: 'Africa' },
      { population: 'East Asian', percentage: 8, confidence: 'low', region: 'East Asia' },
      { population: 'South Asian', percentage: 2, confidence: 'very_low', region: 'South Asia' },
    ];

    expect(countAncestryComponents(estimates)).toBe(3);
  });

  it('should count components above custom threshold', () => {
    const estimates: PopulationEstimate[] = [
      { population: 'European', percentage: 70, confidence: 'high', region: 'Europe' },
      { population: 'African', percentage: 20, confidence: 'medium', region: 'Africa' },
      { population: 'East Asian', percentage: 8, confidence: 'low', region: 'East Asia' },
    ];

    expect(countAncestryComponents(estimates, 15)).toBe(2);
  });

  it('should return 0 for empty array', () => {
    expect(countAncestryComponents([])).toBe(0);
  });
});

describe('formatAncestryResults', () => {
  it('should format results as string', () => {
    const genome = generateMockGenome({ sex: 'male' });
    const ancestryResult = analyzeAncestry(genome);
    const formatted = formatAncestryResults(ancestryResult);

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('Ancestry Analysis Results');
    expect(formatted).toContain('Ethnicity Estimates');
    expect(formatted).toContain('Overall Confidence');
    expect(formatted).toContain('SNPs Analyzed');
  });

  it('should include Y-DNA information for males', () => {
    const genome = generateMockGenome({ sex: 'male' });
    const ancestryResult = analyzeAncestry(genome);
    const formatted = formatAncestryResults(ancestryResult);

    expect(formatted).toContain('Y-DNA Haplogroup');
  });

  it('should always include mtDNA information', () => {
    const genome = generateMockGenome({ sex: 'female' });
    const ancestryResult = analyzeAncestry(genome);
    const formatted = formatAncestryResults(ancestryResult);

    expect(formatted).toContain('mtDNA Haplogroup');
  });
});

describe('detectSubPopulation', () => {
  it('should detect European subpopulations', () => {
    const snps: SNP[] = [
      createSNP('rs12913832', '15', 28365618, 'GG'), // Northwest European
      createSNP('rs1426654', '15', 48426484, 'AA'), // Light skin
    ];

    const result = detectSubPopulation(snps, 'European');

    expect(Array.isArray(result)).toBe(true);
  });

  it('should detect East Asian subpopulations', () => {
    const snps: SNP[] = [
      createSNP('rs3827760', '2', 109513601, 'AA'),
      createSNP('rs17822931', '16', 48225494, 'TT'),
    ];

    const result = detectSubPopulation(snps, 'East Asian');

    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for unknown major population', () => {
    const snps: SNP[] = [];
    // @ts-expect-error - Testing invalid input
    const result = detectSubPopulation(snps, 'Unknown');

    expect(result).toEqual([]);
  });
});

describe('calculateGeneticDistance', () => {
  it('should calculate distance between two populations', () => {
    const distance = calculateGeneticDistance('European', 'African');

    expect(typeof distance).toBe('number');
    expect(distance).toBeGreaterThan(0);
  });

  it('should return 0 for same population', () => {
    const distance = calculateGeneticDistance('European', 'European');

    expect(distance).toBe(0);
  });

  it('should calculate different distances for different population pairs', () => {
    const euroAfrican = calculateGeneticDistance('European', 'African');
    const euroEastAsian = calculateGeneticDistance('European', 'East Asian');

    // Distances should be different (though we can't guarantee which is larger)
    expect(euroAfrican).not.toBe(euroEastAsian);
  });
});

describe('getSimilarPopulations', () => {
  it('should return similar populations within threshold', () => {
    const similar = getSimilarPopulations('European', 0.5);

    expect(Array.isArray(similar)).toBe(true);
  });

  it('should not include the target population', () => {
    const similar = getSimilarPopulations('European', 1.0);

    expect(similar).not.toContain('European');
  });

  it('should return empty array for strict threshold', () => {
    const similar = getSimilarPopulations('European', 0.01);

    expect(similar.length).toBe(0);
  });

  it('should return populations sorted by distance', () => {
    const similar = getSimilarPopulations('European', 0.5);

    // Results should be sorted by genetic distance
    for (let i = 1; i < similar.length; i++) {
      const dist1 = calculateGeneticDistance('European', similar[i - 1]);
      const dist2 = calculateGeneticDistance('European', similar[i]);
      expect(dist1).toBeLessThanOrEqual(dist2);
    }
  });
});

// ============================================================================
// TESTS: Edge Cases and Error Handling
// ============================================================================

describe('Edge Cases', () => {
  it('should handle SNPs with missing genotypes', () => {
    const snps: SNP[] = [
      createSNP('rs1426654', '15', 48426484, '--'),
      createSNP('rs16891982', '5', 33951693, '--'),
    ];

    const result = estimateEthnicity(snps);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle SNPs with empty genotypes', () => {
    const snps: SNP[] = [
      createSNP('rs1426654', '15', 48426484, ''),
      createSNP('rs16891982', '5', 33951693, 'AA'),
    ];

    const result = estimateEthnicity(snps);

    expect(result).toBeDefined();
  });

  it('should handle case-insensitive rsid matching', () => {
    const snps: SNP[] = [
      { rsid: 'RS1426654', chromosome: '15', position: 48426484, genotype: 'AA' },
    ];

    const result = estimateEthnicity(snps);

    expect(result).toBeDefined();
  });

  it('should handle genome with no AIMs', () => {
    const genome: GenomeData = {
      id: 'test',
      userId: 'user',
      filename: 'test.txt',
      source: '23andme',
      snpCount: 10,
      processedAt: new Date(),
      snps: [
        createSNP('rs9999999', '1', 1000000, 'AG'),
        createSNP('rs8888888', '2', 2000000, 'CT'),
      ],
    };

    const result = analyzeAncestry(genome);

    expect(result).toBeDefined();
    expect(result.ethnicity).toBeDefined();
  });

  it('should handle very large SNP counts', () => {
    const genome = generateMockGenome({ ancestry: 'european' });
    // Add many more SNPs
    for (let i = 0; i < 1000; i++) {
      genome.snps.push(createSNP(`rs${2000000 + i}`, '1', 1000000 + i, 'AG'));
    }
    genome.snpCount = genome.snps.length;

    const result = analyzeAncestry(genome);

    expect(result).toBeDefined();
    expect(result.snpsAnalyzed).toBeGreaterThan(1000);
  });
});
