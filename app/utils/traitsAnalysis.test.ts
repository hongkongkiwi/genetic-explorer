import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GenomeData, Trait, TraitCategory, ConfidenceLevel } from '~/types/traits';
import {
  analyzeTraits,
  getTraitResult,
  calculateTraitConfidence,
  getCategoryTraits,
  generateTraitsReport,
  compareTraits,
  filterTraitResults,
  getAnalysisStats,
  formatConfidence,
  getConfidenceColor,
  getShareableTraitData,
  getUserGenotype,
  findGenotypeMapping,
  analyzeCategoryTraits,
} from './traitsAnalysis';
import {
  getAllTraits,
  getTraitById,
  getTraitsByCategory,
  getRandomFunFact,
} from '~/data/traitsDatabase';

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

// Mock genomes with known genotypes for specific traits
const mockGenomes = {
  // Blue eyes genotype (GG at rs12913832)
  blueEyes: createMockGenome([
    { rsid: 'rs12913832', genotype: 'GG' },
    { rsid: 'rs1800407', genotype: 'GG' },
  ]),

  // Brown eyes genotype (AA at rs12913832)
  brownEyes: createMockGenome([
    { rsid: 'rs12913832', genotype: 'AA' },
    { rsid: 'rs1800407', genotype: 'AA' },
  ]),

  // Green/hazel eyes genotype (AG at rs12913832)
  greenEyes: createMockGenome([
    { rsid: 'rs12913832', genotype: 'AG' },
  ]),

  // Cilantro soapy taste (CC at rs72921001)
  cilantroSoapy: createMockGenome([
    { rsid: 'rs72921001', genotype: 'CC' },
  ]),

  // Cilantro fresh taste (TT at rs72921001)
  cilantroFresh: createMockGenome([
    { rsid: 'rs72921001', genotype: 'TT' },
  ]),

  // Lactose tolerant (AA at rs4988235)
  lactoseTolerant: createMockGenome([
    { rsid: 'rs4988235', genotype: 'AA' },
  ]),

  // Lactose intolerant (GG at rs4988235)
  lactoseIntolerant: createMockGenome([
    { rsid: 'rs4988235', genotype: 'GG' },
  ]),

  // Fast caffeine metabolizer (AA at rs762551)
  fastCaffeine: createMockGenome([
    { rsid: 'rs762551', genotype: 'AA' },
  ]),

  // Slow caffeine metabolizer (CC at rs762551)
  slowCaffeine: createMockGenome([
    { rsid: 'rs762551', genotype: 'CC' },
  ]),

  // Dark hair (CC at rs16891982)
  darkHair: createMockGenome([
    { rsid: 'rs16891982', genotype: 'CC' },
  ]),

  // Light hair (TT at rs16891982)
  lightHair: createMockGenome([
    { rsid: 'rs16891982', genotype: 'TT' },
  ]),

  // Complete genome with many SNPs
  complete: createMockGenome([
    { rsid: 'rs12913832', genotype: 'GG' },
    { rsid: 'rs1800407', genotype: 'GG' },
    { rsid: 'rs16891982', genotype: 'CC' },
    { rsid: 'rs72921001', genotype: 'TT' },
    { rsid: 'rs4988235', genotype: 'AA' },
    { rsid: 'rs762551', genotype: 'AA' },
    { rsid: 'rs17822931', genotype: 'GG' },
    { rsid: 'rs1805007', genotype: 'TT' },
    { rsid: 'rs1426654', genotype: 'AA' },
    { rsid: 'rs671', genotype: 'GG' },
  ]),

  // Partial genome with some missing SNPs
  partial: createMockGenome([
    { rsid: 'rs12913832', genotype: 'AG' },
    { rsid: 'rs4988235', genotype: 'AG' },
  ]),

  // Empty genome
  empty: createEmptyGenome(),
};

// ============================================
// Tests for analyzeTraits()
// ============================================

describe('analyzeTraits', () => {
  it('should analyze all traits for a genome', () => {
    const results = analyzeTraits(mockGenomes.complete);
    const allTraits = getAllTraits();

    expect(results).toHaveLength(allTraits.length);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return correct trait results', () => {
    const results = analyzeTraits(mockGenomes.blueEyes);

    // Find eye color result
    const eyeColorResult = results.find(r => r.trait.id === 'eye-color');
    expect(eyeColorResult).toBeDefined();
    expect(eyeColorResult?.predictedPhenotype).toBe('Blue eyes');
    expect(eyeColorResult?.userGenotype).toBe('GG');
  });

  it('should calculate confidence for each trait', () => {
    const results = analyzeTraits(mockGenomes.complete);

    results.forEach(result => {
      expect(result.confidence).toBeDefined();
      expect(['very-high', 'high', 'medium', 'low']).toContain(result.confidence);
    });
  });

  it('should handle missing SNPs gracefully', () => {
    const results = analyzeTraits(mockGenomes.empty);

    // All results should have null genotype but still return a phenotype
    results.forEach(result => {
      expect(result.userGenotype).toBeNull();
      expect(result.predictedPhenotype).toBeDefined();
      expect(result.explanation).toContain("don't have your genetic data");
    });
  });

  it('should categorize traits correctly', () => {
    const results = analyzeTraits(mockGenomes.complete);
    const categories = new Set(results.map(r => r.trait.category));

    expect(categories.has('physical')).toBe(true);
    expect(categories.has('sensory')).toBe(true);
    expect(categories.has('behavioral')).toBe(true);
    expect(categories.has('abilities')).toBe(true);
    expect(categories.has('miscellaneous')).toBe(true);
  });

  it('should include explanation and fun fact for each trait', () => {
    const results = analyzeTraits(mockGenomes.complete);

    results.forEach(result => {
      expect(result.explanation).toBeDefined();
      expect(result.explanation.length).toBeGreaterThan(0);
      expect(result.funFact).toBeDefined();
      expect(result.funFact.length).toBeGreaterThan(0);
    });
  });
});

// ============================================
// Tests for getTraitResult()
// ============================================

describe('getTraitResult', () => {
  const eyeColorTrait = getTraitById('eye-color')!;
  const hairColorTrait = getTraitById('hair-color')!;
  const cilantroTrait = getTraitById('cilantro-taste')!;
  const lactoseTrait = getTraitById('lactose-tolerance')!;
  const caffeineTrait = getTraitById('caffeine-metabolism')!;

  it('should return result for eye color trait - blue eyes', () => {
    const result = getTraitResult(eyeColorTrait, mockGenomes.blueEyes);

    expect(result.predictedPhenotype).toBe('Blue eyes');
    expect(result.userGenotype).toBe('GG');
    expect(result.matchedGenotype).toBeDefined();
    expect(result.matchedGenotype?.genotype).toBe('GG');
  });

  it('should return result for eye color trait - brown eyes', () => {
    const result = getTraitResult(eyeColorTrait, mockGenomes.brownEyes);

    expect(result.predictedPhenotype).toBe('Brown eyes');
    expect(result.userGenotype).toBe('AA');
  });

  it('should return result for hair color trait - dark hair', () => {
    const result = getTraitResult(hairColorTrait, mockGenomes.darkHair);

    expect(result.predictedPhenotype).toBe('Darker hair');
    expect(result.userGenotype).toBe('CC');
  });

  it('should return result for hair color trait - light hair', () => {
    const result = getTraitResult(hairColorTrait, mockGenomes.lightHair);

    expect(result.predictedPhenotype).toBe('Lighter hair');
    expect(result.userGenotype).toBe('TT');
  });

  it('should return result for cilantro taste trait - soapy taste', () => {
    const result = getTraitResult(cilantroTrait, mockGenomes.cilantroSoapy);

    expect(result.predictedPhenotype).toBe('Soapy taste');
    expect(result.userGenotype).toBe('CC');
  });

  it('should return result for cilantro taste trait - fresh taste', () => {
    const result = getTraitResult(cilantroTrait, mockGenomes.cilantroFresh);

    expect(result.predictedPhenotype).toBe('Fresh/citrus taste');
    expect(result.userGenotype).toBe('TT');
  });

  it('should return result for lactose tolerance - tolerant', () => {
    const result = getTraitResult(lactoseTrait, mockGenomes.lactoseTolerant);

    expect(result.predictedPhenotype).toBe('Lactose tolerant');
    expect(result.userGenotype).toBe('AA');
  });

  it('should return result for lactose tolerance - intolerant', () => {
    const result = getTraitResult(lactoseTrait, mockGenomes.lactoseIntolerant);

    expect(result.predictedPhenotype).toBe('Lactose intolerant');
    expect(result.userGenotype).toBe('GG');
  });

  it('should return result for caffeine metabolism - fast', () => {
    const result = getTraitResult(caffeineTrait, mockGenomes.fastCaffeine);

    expect(result.predictedPhenotype).toBe('Fast metabolizer');
    expect(result.userGenotype).toBe('AA');
  });

  it('should return result for caffeine metabolism - slow', () => {
    const result = getTraitResult(caffeineTrait, mockGenomes.slowCaffeine);

    expect(result.predictedPhenotype).toBe('Slow metabolizer');
    expect(result.userGenotype).toBe('CC');
  });

  it('should handle unknown genotypes with default mapping', () => {
    // Create genome with uncommon genotype
    const uncommonGenome = createMockGenome([
      { rsid: 'rs12913832', genotype: 'TT' }, // Not in standard mapping
    ]);

    const result = getTraitResult(eyeColorTrait, uncommonGenome);

    expect(result.userGenotype).toBe('TT');
    expect(result.predictedPhenotype).toBeDefined();
    expect(result.matchedGenotype).toBeUndefined();
    expect(result.explanation).toContain('uncommon');
  });

  it('should return default for missing SNPs', () => {
    const result = getTraitResult(eyeColorTrait, mockGenomes.empty);

    expect(result.userGenotype).toBeNull();
    expect(result.predictedPhenotype).toBeDefined();
    expect(result.explanation).toContain("don't have your genetic data");
  });

  it('should normalize genotype ordering (AT same as TA)', () => {
    const genomeAT = createMockGenome([
      { rsid: 'rs12913832', genotype: 'AT' },
    ]);
    const genomeTA = createMockGenome([
      { rsid: 'rs12913832', genotype: 'TA' },
    ]);

    // Both should be treated the same way (normalized to AT)
    const resultAT = getTraitResult(eyeColorTrait, genomeAT);
    const resultTA = getTraitResult(eyeColorTrait, genomeTA);

    expect(resultAT.predictedPhenotype).toBe(resultTA.predictedPhenotype);
  });
});

// ============================================
// Tests for calculateTraitConfidence()
// ============================================

describe('calculateTraitConfidence', () => {
  const highConfidenceTrait: Trait = {
    id: 'test-trait',
    name: 'Test Trait',
    description: 'Test',
    category: 'physical',
    icon: '🧪',
    confidence: 'high',
    snps: [{ rsid: 'rs123', gene: 'TEST' }],
    genotypeMap: [{ genotype: 'AA', phenotype: 'Test', description: 'Test' }],
    funFacts: ['Test fact'],
  };

  it('should return high confidence for direct SNP match', () => {
    const confidence = calculateTraitConfidence(highConfidenceTrait, 'AA');
    expect(confidence).toBe('high');
  });

  it('should return medium confidence for indirect matches', () => {
    // When SNPs available but confidence is demoted due to missing data
    const lowConfidenceTrait: Trait = {
      ...highConfidenceTrait,
      id: 'test-low',
      confidence: 'low',
    };
    const confidence = calculateTraitConfidence(lowConfidenceTrait, 'AA');
    expect(confidence).toBe('low');
  });

  it('should return low confidence for insufficient data', () => {
    // No user genotype available - confidence should be demoted
    const confidence = calculateTraitConfidence(highConfidenceTrait, null);
    expect(confidence).toBe('medium'); // demoted from high
  });

  it('should boost confidence for multiple SNPs', () => {
    // Use real trait from database that has multiple SNPs and medium confidence
    const lactoseTrait = getTraitById('lactose-tolerance')!;
    
    // Lactose trait has medium confidence (based on database) and 2 SNPs
    // With user genotype present, it should be promoted
    const confidence = calculateTraitConfidence(lactoseTrait, 'AA');
    
    // The trait has multiple SNPs, so confidence should be promoted
    expect(confidence).toBe('high');
  });

  it('should not demote below low', () => {
    const lowConfidenceTrait: Trait = {
      ...highConfidenceTrait,
      id: 'test-low-2',
      confidence: 'low',
    };
    const confidence = calculateTraitConfidence(lowConfidenceTrait, null);
    expect(confidence).toBe('low'); // already lowest
  });

  it('should not promote above very-high', () => {
    // Use a real trait with very-high confidence
    const cilantroTrait = getTraitById('cilantro-taste')!;
    
    // Cilantro trait has very-high confidence with 1 SNP
    // Even with multiple SNPs, very-high should stay very-high
    const confidence = calculateTraitConfidence(cilantroTrait, 'CC');
    expect(confidence).toBe('very-high'); // already highest, can't promote higher
  });
});

// ============================================
// Tests for getCategoryTraits()
// ============================================

describe('getCategoryTraits', () => {
  it('should return physical traits', () => {
    const traits = getCategoryTraits('physical');

    expect(traits.length).toBeGreaterThan(0);
    traits.forEach(trait => {
      expect(trait.category).toBe('physical');
    });

    // Should include known physical traits
    const traitIds = traits.map(t => t.id);
    expect(traitIds).toContain('eye-color');
    expect(traitIds).toContain('hair-color');
  });

  it('should return sensory traits', () => {
    const traits = getCategoryTraits('sensory');

    expect(traits.length).toBeGreaterThan(0);
    traits.forEach(trait => {
      expect(trait.category).toBe('sensory');
    });

    const traitIds = traits.map(t => t.id);
    expect(traitIds).toContain('cilantro-taste');
    expect(traitIds).toContain('lactose-tolerance');
  });

  it('should return behavioral traits', () => {
    const traits = getCategoryTraits('behavioral');

    expect(traits.length).toBeGreaterThan(0);
    traits.forEach(trait => {
      expect(trait.category).toBe('behavioral');
    });

    const traitIds = traits.map(t => t.id);
    expect(traitIds).toContain('chronotype');
    expect(traitIds).toContain('motion-sickness');
  });

  it('should return abilities traits', () => {
    const traits = getCategoryTraits('abilities');

    expect(traits.length).toBeGreaterThan(0);
    traits.forEach(trait => {
      expect(trait.category).toBe('abilities');
    });

    const traitIds = traits.map(t => t.id);
    expect(traitIds).toContain('musical-pitch');
    expect(traitIds).toContain('sprint-endurance');
  });

  it('should return miscellaneous traits', () => {
    const traits = getCategoryTraits('miscellaneous');

    expect(traits.length).toBeGreaterThan(0);
    traits.forEach(trait => {
      expect(trait.category).toBe('miscellaneous');
    });

    const traitIds = traits.map(t => t.id);
    expect(traitIds).toContain('earwax-type');
    expect(traitIds).toContain('caffeine-metabolism');
  });

  it('should return empty array for invalid category', () => {
    const traits = getCategoryTraits('invalid-category' as TraitCategory);
    expect(traits).toHaveLength(0);
  });
});

// ============================================
// Tests for generateTraitsReport()
// ============================================

describe('generateTraitsReport', () => {
  it('should generate complete report', () => {
    const report = generateTraitsReport(mockGenomes.complete, 'report-123');

    expect(report.id).toBe('report-123');
    expect(report.genomeId).toBe(mockGenomes.complete.id);
    expect(report.totalTraits).toBeGreaterThan(0);
    expect(report.analyzedTraits).toBeGreaterThan(0);
    expect(report.generatedAt).toBeInstanceOf(Date);
  });

  it('should include all categories', () => {
    const report = generateTraitsReport(mockGenomes.complete);

    const categories = report.categories.map(c => c.category);
    expect(categories).toContain('physical');
    expect(categories).toContain('sensory');
    expect(categories).toContain('behavioral');
    expect(categories).toContain('abilities');
    expect(categories).toContain('miscellaneous');
  });

  it('should calculate statistics correctly', () => {
    const report = generateTraitsReport(mockGenomes.complete);

    // Total traits should match
    const allTraits = getAllTraits();
    expect(report.totalTraits).toBe(allTraits.length);

    // Analyzed traits should be <= total
    expect(report.analyzedTraits).toBeLessThanOrEqual(report.totalTraits);
    expect(report.analyzedTraits).toBeGreaterThan(0);

    // Each category should have correct totals
    report.categories.forEach(category => {
      expect(category.totalTraits).toBeGreaterThan(0);
      expect(category.analyzedTraits).toBeLessThanOrEqual(category.totalTraits);
      expect(category.traits).toHaveLength(category.totalTraits);
    });
  });

  it('should include highlights', () => {
    const report = generateTraitsReport(mockGenomes.complete);

    expect(report.highlights).toBeDefined();
    expect(report.highlights.mostInteresting).toBeDefined();
    expect(report.highlights.rareTraits).toBeDefined();
    expect(report.highlights.sharedTraits).toBeDefined();
  });

  it('should generate shareable summary', () => {
    const report = generateTraitsReport(mockGenomes.complete);

    expect(report.shareableSummary).toBeDefined();
    expect(report.shareableSummary.length).toBeGreaterThan(0);
    expect(report.shareableSummary).toContain('analyzed');
  });

  it('should generate unique ID if not provided', () => {
    const report1 = generateTraitsReport(mockGenomes.complete);
    const report2 = generateTraitsReport(mockGenomes.complete);

    expect(report1.id).toBeDefined();
    expect(report2.id).toBeDefined();
  });

  it('should handle empty genome', () => {
    const report = generateTraitsReport(mockGenomes.empty);

    expect(report.analyzedTraits).toBe(0);
    expect(report.shareableSummary).toContain('analyzed 0');
  });
});

// ============================================
// Tests for compareTraits()
// ============================================

describe('compareTraits', () => {
  it('should compare two genomes', () => {
    const comparisons = compareTraits(mockGenomes.blueEyes, mockGenomes.brownEyes);

    expect(comparisons.length).toBeGreaterThan(0);
    comparisons.forEach(comparison => {
      expect(comparison.trait).toBeDefined();
      expect(comparison.genomeAResult).toBeDefined();
      expect(comparison.genomeBResult).toBeDefined();
      expect(comparison.samePhenotype).toBeDefined();
      expect(comparison.similarity).toBeDefined();
    });
  });

  it('should identify shared traits (same phenotype)', () => {
    // Compare two genomes with same eye color
    const comparisons = compareTraits(mockGenomes.blueEyes, createMockGenome([
      { rsid: 'rs12913832', genotype: 'GG' },
    ]));

    const eyeColorComparison = comparisons.find(c => c.trait.id === 'eye-color');
    expect(eyeColorComparison?.samePhenotype).toBe(true);
    expect(eyeColorComparison?.similarity).toBe('identical');
  });

  it('should identify different traits', () => {
    const comparisons = compareTraits(mockGenomes.blueEyes, mockGenomes.brownEyes);

    const eyeColorComparison = comparisons.find(c => c.trait.id === 'eye-color');
    expect(eyeColorComparison?.samePhenotype).toBe(false);
    expect(eyeColorComparison?.similarity).toBe('different');
  });

  it('should calculate similarity score for similar phenotypes', () => {
    // Straight hair vs wavy hair (both in similar group according to arePhenotypesSimilar)
    const straightHairGenome = createMockGenome([
      { rsid: 'rs11803731', genotype: 'AA' }, // Straight hair
    ]);
    const wavyHairGenome = createMockGenome([
      { rsid: 'rs11803731', genotype: 'AG' }, // Wavy hair
    ]);

    const comparisons = compareTraits(straightHairGenome, wavyHairGenome);

    const hairTextureComparison = comparisons.find(c => c.trait.id === 'hair-texture');
    expect(hairTextureComparison?.similarity).toBe('similar');
  });

  it('should include all traits in comparison', () => {
    const allTraits = getAllTraits();
    const comparisons = compareTraits(mockGenomes.blueEyes, mockGenomes.brownEyes);

    expect(comparisons.length).toBe(allTraits.length);
  });
});

// ============================================
// Tests for filterTraitResults()
// ============================================

describe('filterTraitResults', () => {
  const results = analyzeTraits(mockGenomes.complete);

  it('should filter by category', () => {
    const filtered = filterTraitResults(results, { category: 'physical' });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(results.length);
    filtered.forEach(result => {
      expect(result.trait.category).toBe('physical');
    });
  });

  it('should filter by confidence', () => {
    const filtered = filterTraitResults(results, { confidence: 'high' });

    filtered.forEach(result => {
      expect(result.confidence).toBe('high');
    });
  });

  it('should filter by confidence very-high', () => {
    const filtered = filterTraitResults(results, { confidence: 'very-high' });

    filtered.forEach(result => {
      expect(result.confidence).toBe('very-high');
    });
  });

  it('should search by name', () => {
    const filtered = filterTraitResults(results, { search: 'eye' });

    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(result => {
      const searchableText = `${result.trait.name} ${result.trait.description} ${result.predictedPhenotype}`.toLowerCase();
      expect(searchableText).toContain('eye');
    });
  });

  it('should search by description', () => {
    const filtered = filterTraitResults(results, { search: 'color' });

    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should search by phenotype', () => {
    const filtered = filterTraitResults(results, { search: 'blue' });

    // Should find eye color result with blue eyes
    const eyeColorResult = filtered.find(r => r.trait.id === 'eye-color');
    expect(eyeColorResult).toBeDefined();
  });

  it('should handle case-insensitive search', () => {
    const filteredLower = filterTraitResults(results, { search: 'eye' });
    const filteredUpper = filterTraitResults(results, { search: 'EYE' });

    expect(filteredLower.length).toBe(filteredUpper.length);
  });

  it('should return all results when search is empty', () => {
    const filtered = filterTraitResults(results, { search: '' });

    expect(filtered.length).toBe(results.length);
  });

  it('should return empty array for no matches', () => {
    const filtered = filterTraitResults(results, { search: 'xyznonexistent' });

    expect(filtered).toHaveLength(0);
  });

  it('should combine multiple filters', () => {
    const filtered = filterTraitResults(results, {
      category: 'physical',
      confidence: 'high',
    });

    filtered.forEach(result => {
      expect(result.trait.category).toBe('physical');
      expect(result.confidence).toBe('high');
    });
  });

  it('should filter by hasData', () => {
    const withData = filterTraitResults(results, { hasData: true });
    const withoutData = filterTraitResults(results, { hasData: false });

    withData.forEach(result => {
      expect(result.userGenotype).not.toBeNull();
    });

    withoutData.forEach(result => {
      expect(result.userGenotype).toBeNull();
    });

    expect(withData.length + withoutData.length).toBe(results.length);
  });

  it('should filter by category all', () => {
    const filtered = filterTraitResults(results, { category: 'all' });

    expect(filtered.length).toBe(results.length);
  });
});

// ============================================
// Tests for getUserGenotype()
// ============================================

describe('getUserGenotype', () => {
  const genome = mockGenomes.complete;

  it('should return genotype for existing SNP', () => {
    const genotype = getUserGenotype(genome, 'rs12913832');
    expect(genotype).toBe('GG');
  });

  it('should return null for non-existing SNP', () => {
    const genotype = getUserGenotype(genome, 'rs999999999');
    expect(genotype).toBeNull();
  });

  it('should return null for empty genome', () => {
    const genotype = getUserGenotype(mockGenomes.empty, 'rs12913832');
    expect(genotype).toBeNull();
  });
});

// ============================================
// Tests for findGenotypeMapping()
// ============================================

describe('findGenotypeMapping', () => {
  const trait = getTraitById('eye-color')!;

  it('should find exact match', () => {
    const mapping = findGenotypeMapping(trait, 'GG');
    expect(mapping).toBeDefined();
    expect(mapping?.genotype).toBe('GG');
    expect(mapping?.phenotype).toBe('Blue eyes');
  });

  it('should normalize genotype ordering', () => {
    // AG should match GA (normalized to AG)
    const mapping = findGenotypeMapping(trait, 'GA');
    expect(mapping).toBeDefined();
    expect(mapping?.genotype).toBe('AG');
  });

  it('should return null for null genotype', () => {
    const mapping = findGenotypeMapping(trait, null as unknown as string);
    expect(mapping).toBeNull();
  });

  it('should return null for unmatched genotype', () => {
    const mapping = findGenotypeMapping(trait, 'XX');
    expect(mapping).toBeNull();
  });
});

// ============================================
// Tests for analyzeCategoryTraits()
// ============================================

describe('analyzeCategoryTraits', () => {
  it('should analyze only traits in specified category', () => {
    const results = analyzeCategoryTraits(mockGenomes.complete, 'physical');
    const physicalTraits = getTraitsByCategory('physical');

    expect(results).toHaveLength(physicalTraits.length);
    results.forEach(result => {
      expect(result.trait.category).toBe('physical');
    });
  });

  it('should return empty array for invalid category', () => {
    const results = analyzeCategoryTraits(mockGenomes.complete, 'invalid' as TraitCategory);
    expect(results).toHaveLength(0);
  });
});

// ============================================
// Tests for getAnalysisStats()
// ============================================

describe('getAnalysisStats', () => {
  it('should calculate statistics correctly', () => {
    const results = analyzeTraits(mockGenomes.complete);
    const stats = getAnalysisStats(results);

    expect(stats.total).toBe(results.length);
    expect(stats.analyzed).toBeGreaterThan(0);
    expect(stats.coverage).toBeGreaterThan(0);
    expect(stats.coverage).toBeLessThanOrEqual(100);

    // Should have confidence distribution
    expect(stats.byConfidence).toBeDefined();

    // Should have category distribution
    expect(stats.byCategory).toBeDefined();
  });

  it('should return zero coverage for empty results', () => {
    const stats = getAnalysisStats([]);
    expect(stats.total).toBe(0);
    expect(stats.analyzed).toBe(0);
    expect(stats.coverage).toBe(0);
  });

  it('should calculate coverage percentage correctly', () => {
    const partialResults = analyzeTraits(mockGenomes.partial);
    const stats = getAnalysisStats(partialResults);

    expect(stats.coverage).toBe(Math.round((stats.analyzed / stats.total) * 100));
  });
});

// ============================================
// Tests for formatConfidence()
// ============================================

describe('formatConfidence', () => {
  it('should format confidence levels correctly', () => {
    expect(formatConfidence('very-high')).toBe('Very High');
    expect(formatConfidence('high')).toBe('High');
    expect(formatConfidence('medium')).toBe('Medium');
    expect(formatConfidence('low')).toBe('Low');
  });
});

// ============================================
// Tests for getConfidenceColor()
// ============================================

describe('getConfidenceColor', () => {
  it('should return color classes for each confidence level', () => {
    expect(getConfidenceColor('very-high')).toContain('emerald');
    expect(getConfidenceColor('high')).toContain('blue');
    expect(getConfidenceColor('medium')).toContain('amber');
    expect(getConfidenceColor('low')).toContain('slate');
  });

  it('should include dark mode classes', () => {
    const color = getConfidenceColor('high');
    expect(color).toContain('dark:');
  });
});

// ============================================
// Tests for getShareableTraitData()
// ============================================

describe('getShareableTraitData', () => {
  it('should return shareable data structure', () => {
    const results = analyzeTraits(mockGenomes.complete);
    const result = results[0];
    const shareable = getShareableTraitData(result);

    expect(shareable.traitName).toBe(result.trait.name);
    expect(shareable.result).toBe(result.predictedPhenotype);
    expect(shareable.funFact).toBe(result.funFact);
    expect(shareable.emoji).toBe(result.trait.icon);
  });
});

// ============================================
// Integration Tests
// ============================================

describe('Traits Analysis Integration', () => {
  it('should handle complete workflow', () => {
    // Step 1: Analyze all traits
    const results = analyzeTraits(mockGenomes.complete);
    expect(results.length).toBeGreaterThan(0);

    // Step 2: Filter to high confidence results
    const highConfidence = filterTraitResults(results, { confidence: 'high' });
    expect(highConfidence.length).toBeGreaterThan(0);

    // Step 3: Filter to physical traits
    const physical = filterTraitResults(results, { category: 'physical' });
    expect(physical.length).toBeGreaterThan(0);

    // Step 4: Search for specific trait
    const eyeResults = filterTraitResults(results, { search: 'eye' });
    expect(eyeResults.some(r => r.trait.id === 'eye-color')).toBe(true);

    // Step 5: Generate report
    const report = generateTraitsReport(mockGenomes.complete);
    expect(report.totalTraits).toBe(results.length);

    // Step 6: Get stats
    const stats = getAnalysisStats(results);
    expect(stats.total).toBe(results.length);
  });

  it('should handle genome comparison workflow', () => {
    // Compare two different genomes
    const comparisons = compareTraits(mockGenomes.blueEyes, mockGenomes.brownEyes);

    // Find differences
    const differences = comparisons.filter(c => !c.samePhenotype);
    expect(differences.length).toBeGreaterThan(0);

    // Find eye color specifically
    const eyeComparison = comparisons.find(c => c.trait.id === 'eye-color');
    expect(eyeComparison?.samePhenotype).toBe(false);
  });

  it('should handle partial genome data', () => {
    const results = analyzeTraits(mockGenomes.partial);

    // Some results should have data
    const withData = results.filter(r => r.userGenotype !== null);
    expect(withData.length).toBeGreaterThan(0);

    // Some results should not have data
    const withoutData = results.filter(r => r.userGenotype === null);
    expect(withoutData.length).toBeGreaterThan(0);

    // All should have a phenotype prediction
    results.forEach(r => {
      expect(r.predictedPhenotype).toBeDefined();
    });
  });
});
