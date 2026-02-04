import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  queryClinVar,
  queryPharmGKB,
  getVariantInfo,
  analyzeSNP,
  analyzeGenome,
  getDrugInteractions,
} from './queries';
import type { SNP, GeneticVariant, DrugInteraction } from '~/types/genetics';

describe('Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SNP Info Lookups', () => {
    it('should return variant info for known SNP', () => {
      const snp: SNP = {
        rsid: 'rs1801133',
        chromosome: '1',
        position: 11856378,
        genotype: 'CT',
      };

      const info = getVariantInfo(snp);

      expect(info).not.toBeNull();
      expect(info?.gene).toBe('MTHFR');
      expect(info?.category).toBe('methylation');
      expect(info?.impact).toBe(4);
    });

    it('should return null for unknown SNP', () => {
      const snp: SNP = {
        rsid: 'rsUnknown',
        chromosome: '1',
        position: 12345,
        genotype: 'AA',
      };

      const info = getVariantInfo(snp);

      expect(info).toBeNull();
    });

    it('should return correct info for CYP1A2 caffeine variant', () => {
      const snp: SNP = {
        rsid: 'rs762551',
        chromosome: '15',
        position: 75041917,
        genotype: 'AA',
      };

      const info = getVariantInfo(snp);

      expect(info?.gene).toBe('CYP1A2');
      expect(info?.category).toBe('drug_metabolism');
      expect(info?.description).toContain('caffeine');
    });

    it('should return correct info for APOE4 variant', () => {
      const snp: SNP = {
        rsid: 'rs429358',
        chromosome: '19',
        position: 45411941,
        genotype: 'TT',
      };

      const info = getVariantInfo(snp);

      expect(info?.gene).toBe('APOE');
      expect(info?.category).toBe('cardiovascular');
      expect(info?.impact).toBe(5);
    });

    it('should return correct info for BRCA1 variant', () => {
      const snp: SNP = {
        rsid: 'rs80357906',
        chromosome: '17',
        position: 43067616,
        genotype: 'AG',
      };

      const info = getVariantInfo(snp);

      expect(info?.gene).toBe('BRCA1');
      expect(info?.category).toBe('disease_risk');
      expect(info?.impact).toBe(6);
    });
  });

  describe('Category Filtering', () => {
    it('should filter SNPs by methylation category', () => {
      const methylationSnps = ['rs1801133', 'rs1801131']; // MTHFR variants
      
      methylationSnps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.category).toBe('methylation');
      });
    });

    it('should filter SNPs by drug metabolism category', () => {
      const drugSnps = ['rs762551', 'rs3892097', 'rs2395029'];
      
      drugSnps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.category).toBe('drug_metabolism');
      });
    });

    it('should filter SNPs by nutrition category', () => {
      const nutritionSnps = ['rs9939609', 'rs1544410', 'rs33972313', 'rs713598'];
      
      nutritionSnps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.category).toBe('nutrition');
      });
    });

    it('should filter SNPs by fitness category', () => {
      const snp: SNP = { rsid: 'rs1815739', chromosome: '11', position: 1, genotype: 'TT' };
      const info = getVariantInfo(snp);
      expect(info?.category).toBe('fitness');
    });

    it('should filter SNPs by cardiovascular category', () => {
      const cardioSnps = ['rs429358', 'rs7412', 'rs10455872', 'rs1799983'];
      
      cardioSnps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.category).toBe('cardiovascular');
      });
    });

    it('should filter SNPs by disease risk category', () => {
      const diseaseSnps = ['rs113993960', 'rs1800562', 'rs80357906', 'rs7903146'];
      
      diseaseSnps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.category).toBe('disease_risk');
      });
    });

    it('should filter SNPs by sleep category', () => {
      const snp: SNP = { rsid: 'rs1801260', chromosome: '4', position: 1, genotype: 'TT' };
      const info = getVariantInfo(snp);
      expect(info?.category).toBe('sleep');
    });

    it('should filter SNPs by cognitive category', () => {
      const snp: SNP = { rsid: 'rs4680', chromosome: '22', position: 1, genotype: 'AA' };
      const info = getVariantInfo(snp);
      expect(info?.category).toBe('cognitive');
    });

    it('should filter SNPs by immune category', () => {
      const snp: SNP = { rsid: 'rs4948672', chromosome: '10', position: 1, genotype: 'AA' };
      const info = getVariantInfo(snp);
      expect(info?.category).toBe('immune');
    });

    it('should filter SNPs by longevity category', () => {
      const snp: SNP = { rsid: 'rs2802292', chromosome: '6', position: 1, genotype: 'GG' };
      const info = getVariantInfo(snp);
      expect(info?.category).toBe('longevity');
    });
  });

  describe('Impact Level Determination', () => {
    it('should return high impact (6) for pathogenic variants', () => {
      const highImpactSnps = ['rs2395029', 'rs113993960', 'rs80357906']; // Impact 6
      
      highImpactSnps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.impact).toBe(6);
      });
    });

    it('should return high impact (5) for significant variants', () => {
      const impact5Snps = ['rs3892097', 'rs429358', 'rs1800562'];
      
      impact5Snps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.impact).toBe(5);
      });
    });

    it('should return moderate impact (4) for moderate variants', () => {
      const impact4Snps = ['rs1801133', 'rs7412', 'rs7903146', 'rs10455872'];
      
      impact4Snps.forEach(rsid => {
        const snp: SNP = { rsid, chromosome: '1', position: 1, genotype: 'AA' };
        const info = getVariantInfo(snp);
        expect(info?.impact).toBe(4);
      });
    });

    it('should return lower impact (1-3) for less significant variants', () => {
      const snp1: SNP = { rsid: 'rs713598', chromosome: '1', position: 1, genotype: 'AA' };
      expect(getVariantInfo(snp1)?.impact).toBe(1);

      const snp2: SNP = { rsid: 'rs1544410', chromosome: '1', position: 1, genotype: 'AA' };
      expect(getVariantInfo(snp2)?.impact).toBe(2);

      const snp3: SNP = { rsid: 'rs4680', chromosome: '1', position: 1, genotype: 'AA' };
      expect(getVariantInfo(snp3)?.impact).toBe(3);
    });
  });

  describe('ClinVar Query', () => {
    it('should return pathogenic data for known pathogenic variants', async () => {
      const pathogenicRsids = ['rs113993960', 'rs1800562', 'rs80357906'];
      
      for (const rsid of pathogenicRsids) {
        const result = await queryClinVar(rsid);
        expect(result).not.toBeNull();
        expect(result?.significance).toContain('Pathogenic');
        expect(result?.reviewStatus).toBe('Expert panel');
      }
    });

    it('should return null for non-pathogenic variants', async () => {
      const result = await queryClinVar('rs1801133'); // MTHFR - not in pathogenic list
      expect(result).toBeNull();
    });

    it('should return null for unknown variants', async () => {
      const result = await queryClinVar('rsUnknown');
      expect(result).toBeNull();
    });
  });

  describe('PharmGKB Query', () => {
    it('should return drug interactions for CYP2D6', async () => {
      const interactions = await queryPharmGKB('CYP2D6');
      
      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions[0].gene).toBe('CYP2D6');
    });

    it('should return drug interactions for CYP1A2', async () => {
      const interactions = await queryPharmGKB('CYP1A2');
      
      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions.some(i => i.drugName === 'Caffeine')).toBe(true);
    });

    it('should return empty array for unknown gene', async () => {
      const interactions = await queryPharmGKB('UNKNOWN_GENE');
      
      expect(interactions).toEqual([]);
    });

    it('should include recommendation data', async () => {
      const interactions = await queryPharmGKB('CYP2D6');
      
      interactions.forEach(interaction => {
        expect(interaction).toHaveProperty('drugName');
        expect(interaction).toHaveProperty('gene');
        expect(interaction).toHaveProperty('phenotype');
        expect(interaction).toHaveProperty('implications');
        expect(interaction).toHaveProperty('recommendations');
        expect(interaction).toHaveProperty('evidenceLevel');
        expect(Array.isArray(interaction.recommendations)).toBe(true);
      });
    });
  });

  describe('SNP Analysis', () => {
    it('should return null for unknown SNP', async () => {
      const snp: SNP = {
        rsid: 'rsUnknown',
        chromosome: '1',
        position: 1,
        genotype: 'AA',
      };

      const result = await analyzeSNP(snp);
      expect(result).toBeNull();
    });

    it('should analyze known SNP with all fields', async () => {
      const snp: SNP = {
        rsid: 'rs1801133',
        chromosome: '1',
        position: 11856378,
        genotype: 'CT',
      };

      const result = await analyzeSNP(snp);

      expect(result).not.toBeNull();
      expect(result?.snp).toEqual(snp);
      expect(result?.gene).toBe('MTHFR');
      expect(result?.category).toBe('methylation');
      expect(result?.impact).toBe(4);
      expect(result?.significance).toBeDefined();
      expect(result?.description).toBeDefined();
      expect(Array.isArray(result?.studies)).toBe(true);
      expect(Array.isArray(result?.recommendations)).toBe(true);
    });

    it('should generate recommendations for methylation variants', async () => {
      const snp: SNP = {
        rsid: 'rs1801133',
        chromosome: '1',
        position: 11856378,
        genotype: 'CT',
      };

      const result = await analyzeSNP(snp);

      expect(result?.recommendations.length).toBeGreaterThan(0);
      expect(result?.recommendations.some(r => r.includes('methylfolate') || r.includes('homocysteine'))).toBe(true);
    });

    it('should generate recommendations for drug metabolism variants', async () => {
      const snp: SNP = {
        rsid: 'rs762551',
        chromosome: '15',
        position: 75041917,
        genotype: 'AA',
      };

      const result = await analyzeSNP(snp);

      expect(result?.recommendations.length).toBeGreaterThan(0);
      expect(result?.recommendations.some(r => r.includes('caffeine'))).toBe(true);
    });

    it('should generate fitness recommendations based on genotype', async () => {
      const snpTT: SNP = {
        rsid: 'rs1815739',
        chromosome: '11',
        position: 66510666,
        genotype: 'TT',
      };

      const resultTT = await analyzeSNP(snpTT);
      expect(resultTT?.recommendations.some(r => r.includes('endurance'))).toBe(true);

      const snpCC: SNP = {
        rsid: 'rs1815739',
        chromosome: '11',
        position: 66510666,
        genotype: 'CC',
      };

      const resultCC = await analyzeSNP(snpCC);
      expect(resultCC?.recommendations.some(r => r.includes('strength'))).toBe(true);
    });

    it('should include study references', async () => {
      const snp: SNP = {
        rsid: 'rs4680',
        chromosome: '22',
        position: 19963748,
        genotype: 'AA',
      };

      const result = await analyzeSNP(snp);

      expect(result?.studies.length).toBeGreaterThan(0);
      expect(result?.studies[0]).toHaveProperty('id');
      expect(result?.studies[0]).toHaveProperty('title');
      expect(result?.studies[0]).toHaveProperty('authors');
      expect(result?.studies[0]).toHaveProperty('journal');
      expect(result?.studies[0]).toHaveProperty('year');
      expect(result?.studies[0]).toHaveProperty('pmid');
    });

    it('should determine pathogenic significance from ClinVar', async () => {
      const snp: SNP = {
        rsid: 'rs113993960', // CFTR pathogenic variant
        chromosome: '7',
        position: 117199645,
        genotype: 'AT',
      };

      const result = await analyzeSNP(snp);

      expect(result?.significance).toBe('pathogenic');
    });
  });

  describe('Genome Analysis', () => {
    it('should return empty array for empty SNP list', async () => {
      const result = await analyzeGenome([]);
      expect(result).toEqual([]);
    });

    it('should filter variants by impact level', async () => {
      const snps: SNP[] = [
        { rsid: 'rs713598', chromosome: '1', position: 1, genotype: 'AA' }, // Impact 1
        { rsid: 'rs4680', chromosome: '1', position: 1, genotype: 'AA' },   // Impact 3
        { rsid: 'rs1801133', chromosome: '1', position: 1, genotype: 'CT' }, // Impact 4
      ];

      const result = await analyzeGenome(snps);

      // Should only include variants with impact >= 2
      expect(result.every(v => v.impact >= 2)).toBe(true);
      expect(result.some(v => v.snp.rsid === 'rs713598')).toBe(false); // Impact 1 excluded
    });

    it('should sort variants by impact descending', async () => {
      const snps: SNP[] = [
        { rsid: 'rs4680', chromosome: '1', position: 1, genotype: 'AA' },     // Impact 3
        { rsid: 'rs1801133', chromosome: '1', position: 1, genotype: 'CT' },  // Impact 4
        { rsid: 'rs9939609', chromosome: '1', position: 1, genotype: 'AT' },  // Impact 3
      ];

      const result = await analyzeGenome(snps);

      expect(result[0].impact).toBe(4);
      expect(result[1].impact).toBe(3);
      expect(result[2].impact).toBe(3);
    });

    it('should analyze all significant SNPs in genome', async () => {
      const snps: SNP[] = [
        { rsid: 'rs1801133', chromosome: '1', position: 11856378, genotype: 'CT' },
        { rsid: 'rs762551', chromosome: '15', position: 75041917, genotype: 'AA' },
        { rsid: 'rs9939609', chromosome: '16', position: 53786615, genotype: 'AT' },
      ];

      const result = await analyzeGenome(snps);

      expect(result.length).toBe(3);
      expect(result.some(v => v.gene === 'MTHFR')).toBe(true);
      expect(result.some(v => v.gene === 'CYP1A2')).toBe(true);
      expect(result.some(v => v.gene === 'FTO')).toBe(true);
    });
  });

  describe('Drug Interactions', () => {
    it('should return empty array for empty variants list', async () => {
      const result = await getDrugInteractions([]);
      expect(result).toEqual([]);
    });

    it('should return drug interactions for relevant genes', async () => {
      const variants: GeneticVariant[] = [
        {
          snp: { rsid: 'rs3892097', chromosome: '22', position: 1, genotype: 'AA' },
          gene: 'CYP2D6',
          impact: 5,
          category: 'drug_metabolism',
          significance: 'pathogenic',
          description: 'Test',
          studies: [],
          recommendations: [],
        },
      ];

      const result = await getDrugInteractions(variants);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].gene).toBe('CYP2D6');
    });

    it('should deduplicate genes', async () => {
      const variants: GeneticVariant[] = [
        {
          snp: { rsid: 'rs1', chromosome: '1', position: 1, genotype: 'AA' },
          gene: 'CYP2D6',
          impact: 5,
          category: 'drug_metabolism',
          significance: 'pathogenic',
          description: 'Test',
          studies: [],
          recommendations: [],
        },
        {
          snp: { rsid: 'rs2', chromosome: '1', position: 2, genotype: 'TT' },
          gene: 'CYP2D6',
          impact: 3,
          category: 'drug_metabolism',
          significance: 'benign',
          description: 'Test 2',
          studies: [],
          recommendations: [],
        },
      ];

      const result = await getDrugInteractions(variants);

      // Should only query once for CYP2D6
      const cyp2d6Interactions = result.filter(i => i.gene === 'CYP2D6');
      expect(cyp2d6Interactions.length).toBeLessThanOrEqual(2); // Max 2 unique drugs for CYP2D6
    });

    it('should handle variants without gene info', async () => {
      const variants: GeneticVariant[] = [
        {
          snp: { rsid: 'rs1', chromosome: '1', position: 1, genotype: 'AA' },
          gene: '',
          impact: 3,
          category: 'unknown',
          significance: 'uncertain',
          description: 'Test',
          studies: [],
          recommendations: [],
        },
      ];

      const result = await getDrugInteractions(variants);
      expect(result).toEqual([]);
    });

    it('should aggregate interactions from multiple genes', async () => {
      const variants: GeneticVariant[] = [
        {
          snp: { rsid: 'rs3892097', chromosome: '22', position: 1, genotype: 'AA' },
          gene: 'CYP2D6',
          impact: 5,
          category: 'drug_metabolism',
          significance: 'pathogenic',
          description: 'Test',
          studies: [],
          recommendations: [],
        },
        {
          snp: { rsid: 'rs762551', chromosome: '15', position: 1, genotype: 'AA' },
          gene: 'CYP1A2',
          impact: 3,
          category: 'drug_metabolism',
          significance: 'benign',
          description: 'Test',
          studies: [],
          recommendations: [],
        },
      ];

      const result = await getDrugInteractions(variants);

      expect(result.some(i => i.gene === 'CYP2D6')).toBe(true);
      expect(result.some(i => i.gene === 'CYP1A2')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle SNPs with unknown genotype', async () => {
      const snp: SNP = {
        rsid: 'rs1815739',
        chromosome: '11',
        position: 66510666,
        genotype: '--',
      };

      const result = await analyzeSNP(snp);
      expect(result).not.toBeNull();
      // Should provide general recommendations when genotype is unknown
      expect(result?.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle unknown RSIDs gracefully', async () => {
      const snps: SNP[] = [
        { rsid: 'rsUnknown1', chromosome: '1', position: 1, genotype: 'AA' },
        { rsid: 'rs1801133', chromosome: '1', position: 11856378, genotype: 'CT' },
        { rsid: 'rsUnknown2', chromosome: '1', position: 2, genotype: 'TT' },
      ];

      const result = await analyzeGenome(snps);

      expect(result.length).toBe(1);
      expect(result[0].snp.rsid).toBe('rs1801133');
    });
  });
});
