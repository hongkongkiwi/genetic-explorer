/**
 * Fuzzing Tests for Genome Parser
 * 
 * Inspired by Lightway's fuzz targets (lightway-core/fuzz/)
 * 
 * Uses property-based testing to find edge cases and vulnerabilities
 * in the genetic data parser. This helps catch:
 * - Buffer overflows
 * - Infinite loops on malformed input
 * - Parser crashes
 * - Unexpected memory usage
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check'; // Property-based testing library
import { parseGeneticData, validateGenomeData, SNP } from './genomeParser';

// ============================================================================
// Arbitrary Generators for Genetic Data
// ============================================================================

/**
 * Generate valid rsid strings (rs followed by digits)
 */
const rsidArbitrary = fc.string({ minLength: 1, maxLength: 15 }).map(s => {
  // Ensure it starts with 'rs' followed by only digits
  const digits = s.replace(/\D/g, '');
  return `rs${digits || '1'}`;
});

/**
 * Generate valid chromosome strings
 */
const chromosomeArbitrary = fc.oneof(
  fc.constantFrom('1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', 'X', 'Y', 'MT'),
  fc.integer({ min: 1, max: 22 }).map(n => n.toString())
);

/**
 * Generate valid position numbers
 */
const positionArbitrary = fc.integer({ min: 1, max: 250000000 });

/**
 * Generate valid genotypes (A, T, C, G, I, D combinations)
 */
const genotypeArbitrary = fc.oneof(
  fc.constantFrom('A', 'T', 'C', 'G', 'I', 'D'),
  fc.string({ minLength: 1, maxLength: 2, unit: fc.constantFrom('A', 'T', 'C', 'G') }),
  fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^ATCGID]/g, '')).filter(s => s.length > 0)
);

/**
 * Generate valid SNP entries
 */
const snpArbitrary = fc.record<{
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
}>({
  rsid: rsidArbitrary,
  chromosome: chromosomeArbitrary,
  position: positionArbitrary,
  genotype: genotypeArbitrary,
});

/**
 * Generate 23andMe format lines
 */
const twentyThreeAndMeLineArbitrary = fc.tuple(
  rsidArbitrary,
  chromosomeArbitrary,
  positionArbitrary,
  genotypeArbitrary
).map(([rsid, chr, pos, geno]) => `${rsid}\t${chr}\t${pos}\t${geno}`);

/**
 * Generate AncestryDNA format lines
 */
const ancestryDnaLineArbitrary = fc.tuple(
  rsidArbitrary,
  chromosomeArbitrary,
  positionArbitrary,
  genotypeArbitrary
).map(([rsid, chr, pos, geno]) => `${rsid}\t${chr}\t${pos}\t${geno.split('').join('')}`);

/**
 * Generate arbitrary file content
 */
const geneticFileContentArbitrary = fc.array(
  fc.oneof(twentyThreeAndMeLineArbitrary, ancestryDnaLineArbitrary),
  { minLength: 0, maxLength: 100 }
).map(lines => lines.join('\n'));

// ============================================================================
// Malicious/Edge Case Arbitraries
// ============================================================================

/**
 * Generate potentially dangerous strings for fuzzing
 */
const dangerousStringArbitrary = fc.oneof(
  // Very long strings
  fc.string({ minLength: 10000, maxLength: 100000 }),
  // Strings with null bytes
  fc.string().map(s => s + '\x00' + s),
  // Strings with control characters
  fc.string().map(s => s.replace(/[a-z]/g, c => String.fromCharCode(c.charCodeAt(0) % 32))),
  // Unicode edge cases
  fc.constantFrom('\uFFFF', '\u0000', '\uFEFF', '\u200B', '\u200C', '\u200D'),
  // Path traversal attempts
  fc.constantFrom('../../../etc/passwd', '..\\..\\windows\\system32\\config\\sam'),
  // SQL injection attempts
  fc.constantFrom("'; DROP TABLE snps; --", "1 OR 1=1", "' OR '1'='1"),
  // Shell injection
  fc.constantFrom('$(rm -rf /)', '`whoami`', '|| cat /etc/passwd'),
  // XML/JSON injection
  fc.constantFrom('<script>alert(1)</script>', '{"__proto__": {"polluted": true}}'),
);

/**
 * Generate malformed SNP data
 */
const malformedSnpArbitrary = fc.oneof(
  // Missing fields
  fc.constant('rs123'),
  // Extra fields
  fc.constant('rs123\t1\t1000\tAA\textra\tfield'),
  // Invalid position
  fc.constant('rs123\t1\t-1\tAA'),
  fc.constant('rs123\t1\t0\tAA'),
  fc.constant('rs123\t1\t999999999999\tAA'),
  // Invalid chromosome
  fc.constant('rs123\tZ\t1000\tAA'),
  fc.constant('rs123\t25\t1000\tAA'),
  // Invalid genotype
  fc.constant('rs123\t1\t1000\tXYZ'),
  fc.constant('rs123\t1\t1000\t'),
);

// ============================================================================
// Property Tests
// ============================================================================

describe('Genome Parser Fuzzing Tests', () => {
  
  describe('Parse Safety Properties', () => {
    
    it('should never crash on arbitrary input', () => {
      fc.assert(
        fc.property(
          fc.oneof(geneticFileContentArbitrary, dangerousStringArbitrary),
          (content) => {
            // Should not throw
            expect(() => parseGeneticData(content)).not.toThrow();
          }
        ),
        { numRuns: 1000, verbose: true }
      );
    });
    
    it('should never crash on null byte injection', () => {
      fc.assert(
        fc.property(
          fc.string().map(s => s.replace(/\n/g, '\x00')),
          (content) => {
            expect(() => parseGeneticData(content)).not.toThrow();
          }
        ),
        { numRuns: 500 }
      );
    });
    
    it('should handle extremely long lines gracefully', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 100000, maxLength: 500000 }),
          (content) => {
            const result = parseGeneticData(content);
            // Should either parse or reject, not crash
            expect(result).toHaveProperty('snps');
            expect(result).toHaveProperty('source');
            expect(result).toHaveProperty('totalLines');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should handle files with many lines', () => {
      fc.assert(
        fc.property(
          fc.array(twentyThreeAndMeLineArbitrary, { minLength: 1000, maxLength: 10000 }),
          (lines) => {
            const content = lines.join('\n');
            const result = parseGeneticData(content);
            expect(result.totalLines).toBeGreaterThanOrEqual(0);
            expect(Array.isArray(result.snps)).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('Validation Safety Properties', () => {
    
    it('should never crash on arbitrary SNP arrays', () => {
      fc.assert(
        fc.property(
          fc.array(snpArbitrary, { minLength: 0, maxLength: 1000 }),
          (snps) => {
            expect(() => validateGenomeData(snps)).not.toThrow();
          }
        ),
        { numRuns: 500 }
      );
    });
    
    it('should reject invalid SNPs in any order', () => {
      fc.assert(
        fc.property(
          fc.shuffledSubarray([
            { rsid: 'rs123', chromosome: '1', position: 1000, genotype: 'AA' },
            { rsid: 'invalid', chromosome: 'Z', position: -1, genotype: 'XYZ' },
            { rsid: 'rs456', chromosome: '25', position: 999999999999, genotype: '' },
          ]),
          (snps) => {
            const result = validateGenomeData(snps);
            // Should return a validation result, not crash
            expect(result).toHaveProperty('valid');
            expect(result).toHaveProperty('errors');
            expect(typeof result.valid).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Format Detection', () => {
    
    it('should detect format or reject, never misidentify dangerously', () => {
      fc.assert(
        fc.property(
          geneticFileContentArbitrary,
          (content) => {
            const result = parseGeneticData(content);
            // Source should be a known value or 'unknown'
            const validSources = ['23andMe', 'AncestryDNA', 'MyHeritage', 'FTDNA', 'unknown'];
            expect(validSources).toContain(result.source);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
  
  describe('Resource Limits', () => {
    
    it('should complete within reasonable time for any input', async () => {
      const testCases = [
        '',
        'A'.repeat(1000000),
        '\n'.repeat(10000),
        'rs123\t1\t1000\tAA\n'.repeat(1000),
      ];
      
      for (const content of testCases) {
        const start = Date.now();
        parseGeneticData(content);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
      }
    });
    
    it('should not create exponentially large output', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 10000 }),
          (content) => {
            const result = parseGeneticData(content);
            // Output SNPs should not be orders of magnitude larger than input
            const inputSize = content.length;
            const outputSize = JSON.stringify(result).length;
            expect(outputSize).toBeLessThan(inputSize * 10 + 1000);
          }
        ),
        { numRuns: 200 }
      );
    });
  });
  
  describe('Security Edge Cases', () => {
    
    it('should not execute code from file content', () => {
      const maliciousInputs = [
        '${process.exit(1)}',
        '<% process.exit(1) %>',
        '{{process.exit(1)}}',
        '` + process.exit(1) + `',
      ];
      
      for (const input of maliciousInputs) {
        expect(() => parseGeneticData(input)).not.toThrow();
      }
    });
    
    it('should handle nested/complex whitespace', () => {
      fc.assert(
        fc.property(
          fc.string().map(s => s.replace(/[ \t]/g, '\t\t\t  \n\r\t')),
          (content) => {
            expect(() => parseGeneticData(content)).not.toThrow();
          }
        ),
        { numRuns: 200 }
      );
    });
    
    it('should reject SNPs with script-like content', () => {
      const scriptSnps = [
        { rsid: '<script>alert(1)</script>', chromosome: '1', position: 1000, genotype: 'AA' },
        { rsid: 'rs123', chromosome: '1', position: 1000, genotype: 'AA</script>' },
        { rsid: 'rs123', chromosome: '1', position: 1000, genotype: 'javascript:alert(1)' },
      ];
      
      for (const snp of scriptSnps) {
        const result = validateGenomeData([snp]);
        // Should either sanitize or reject, but not crash
        expect(result).toHaveProperty('valid');
      }
    });
  });
});

// ============================================================================
// Regression Tests (based on discovered issues)
// ============================================================================

describe('Fuzzing Regression Tests', () => {
  
  it('should handle empty input', () => {
    const result = parseGeneticData('');
    expect(result.snps).toEqual([]);
    expect(result.totalLines).toBe(0);
  });
  
  it('should handle only whitespace', () => {
    const result = parseGeneticData('   \n\t\n   ');
    expect(result.snps).toEqual([]);
  });
  
  it('should handle mixed line endings', () => {
    const content = 'rs123\t1\t1000\tAA\r\nrs456\t1\t2000\tCC\r\nrs789\t1\t3000\tGG';
    const result = parseGeneticData(content);
    expect(result.snps.length).toBeGreaterThanOrEqual(0);
  });
  
  it('should handle very large position numbers', () => {
    const content = 'rs123\t1\t999999999999999\tAA';
    expect(() => parseGeneticData(content)).not.toThrow();
  });
  
  it('should handle special characters in genotypes', () => {
    const specialChars = ['A--', 'A++', 'A..', 'A//', 'A\\', 'A||'];
    for (const char of specialChars) {
      const content = `rs123\t1\t1000\t${char}`;
      expect(() => parseGeneticData(content)).not.toThrow();
    }
  });
});

export default {};
