/**
 * Genome Coverage Calculation Tests
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateGenomeCoverage, 
  getGenomeHeatmap, 
  formatCoverage,
  formatNumber,
  CHROMOSOME_SIZES,
  GENOME_STATS 
} from './genomeCoverage';
import type { SNP } from './genomeParser';

describe('Genome Coverage', () => {
  const createSnp = (rsid: string, chromosome: string, position: number): SNP => ({
    rsid,
    chromosome,
    position,
    genotype: 'AT',
  });

  describe('calculateGenomeCoverage', () => {
    it('should calculate coverage for 23andMe-like data', () => {
      const snps: SNP[] = [];
      
      // Simulate 640K SNPs (23andMe v5)
      for (let i = 0; i < 640000; i++) {
        const chr = (i % 22) + 1;
        const position = Math.floor(Math.random() * CHROMOSOME_SIZES[chr.toString()]);
        snps.push(createSnp(`rs${i}`, chr.toString(), position));
      }

      const coverage = calculateGenomeCoverage(snps);
      
      expect(coverage.snps.total).toBe(640000);
      expect(coverage.overall.percentage).toBeGreaterThan(0);
      expect(coverage.overall.percentage).toBeLessThan(1);
      expect(coverage.chromosomes.length).toBeGreaterThan(20);
    });

    it('should calculate coverage for whole genome', () => {
      const snps: SNP[] = [];
      
      // Simulate WGS (6B SNPs would be too many, simulate with high density)
      for (let chr = 1; chr <= 22; chr++) {
        const chrSize = CHROMOSOME_SIZES[chr.toString()];
        const density = 0.001; // 1 SNP per 1000bp
        const numSnps = Math.floor(chrSize * density);
        
        for (let i = 0; i < numSnps; i++) {
          snps.push(createSnp(`chr${chr}_${i}`, chr.toString(), i * 1000));
        }
      }

      const coverage = calculateGenomeCoverage(snps);
      
      expect(coverage.overall.percentage).toBeGreaterThan(50);
      expect(coverage.overall.grade).toBe('excellent');
    });

    it('should handle empty SNP array', () => {
      const coverage = calculateGenomeCoverage([]);
      
      expect(coverage.snps.total).toBe(0);
      expect(coverage.overall.grade).toBe('limited');
    });

    it('should calculate chromosome coverage correctly', () => {
      const snps: SNP[] = [];
      
      // Add SNPs only to chromosome 1
      for (let i = 0; i < 100000; i++) {
        snps.push(createSnp(`rs${i}`, '1', i * 1000));
      }

      const coverage = calculateGenomeCoverage(snps);
      
      const chr1 = coverage.chromosomes.find(c => c.name === '1');
      expect(chr1).toBeDefined();
      expect(chr1!.snpCount).toBe(100000);
      expect(chr1!.coverage).toBeGreaterThan(0);
    });

    it('should detect clinical SNPs', () => {
      const snps: SNP[] = [
        createSnp('rs429358', '19', 45411941), // APOE4
        createSnp('rs7412', '19', 45412079),   // APOE
        createSnp('rs1801133', '1', 11856378), // MTHFR
        createSnp('rs6025', '1', 169519049),   // Factor V Leiden
      ];

      const coverage = calculateGenomeCoverage(snps);
      
      expect(coverage.clinical.clinicalSnpsPresent).toBeGreaterThan(0);
    });

    it('should detect ancestry markers', () => {
      const snps: SNP[] = [
        createSnp('rs1426654', '15', 48426484),
        createSnp('rs16891982', '5', 33951693),
        createSnp('rs1834640', '2', 108892337),
      ];

      const coverage = calculateGenomeCoverage(snps);
      
      expect(coverage.ancestry.informativeMarkers).toBeGreaterThan(0);
    });

    it('should generate recommendations for low coverage', () => {
      const snps: SNP[] = [];
      // Only 1000 SNPs - very low coverage
      for (let i = 0; i < 1000; i++) {
        snps.push(createSnp(`rs${i}`, '1', i * 10000));
      }

      const coverage = calculateGenomeCoverage(snps);
      
      expect(coverage.recommendations.length).toBeGreaterThan(0);
      expect(coverage.recommendations.some(r => r.includes('upgrade'))).toBe(true);
    });
  });

  describe('getGenomeHeatmap', () => {
    it('should generate heatmap for all chromosomes', () => {
      const snps: SNP[] = [];
      
      // Add SNPs across chromosomes
      for (let chr = 1; chr <= 22; chr++) {
        for (let i = 0; i < 1000; i++) {
          snps.push(createSnp(`rs${chr}_${i}`, chr.toString(), i * 1000));
        }
      }

      const heatmap = getGenomeHeatmap(snps);
      
      expect(heatmap.length).toBe(Object.keys(CHROMOSOME_SIZES).length);
      expect(heatmap.every(h => h.chromosome && h.coverage >= 0 && h.color)).toBe(true);
    });

    it('should color chromosomes based on coverage', () => {
      const snps: SNP[] = [];
      
      // High coverage on chr 1
      for (let i = 0; i < 500000; i++) {
        snps.push(createSnp(`rs1_${i}`, '1', i * 100));
      }
      
      // No coverage on chr 2
      // (no SNPs added)

      const heatmap = getGenomeHeatmap(snps);
      
      const chr1 = heatmap.find(h => h.chromosome === '1');
      const chr2 = heatmap.find(h => h.chromosome === '2');
      
      expect(chr1!.color).toBe('#22c55e'); // green-500 (excellent)
      expect(chr2!.color).toBe('#ef4444'); // red-500 (minimal)
    });
  });

  describe('formatCoverage', () => {
    it('should format very small percentages', () => {
      expect(formatCoverage(0.001)).toBe('0.10%');
      expect(formatCoverage(0.0001)).toBe('0.01%');
    });

    it('should format normal percentages', () => {
      expect(formatCoverage(0.02)).toBe('0.02%');
      expect(formatCoverage(50)).toBe('50.00%');
      expect(formatCoverage(99.9)).toBe('99.90%');
    });
  });

  describe('formatNumber', () => {
    it('should format with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(640000)).toBe('640,000');
    });
  });
});
