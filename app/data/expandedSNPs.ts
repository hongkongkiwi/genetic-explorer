/**
 * Expanded SNP Database
 * Additional SNPs for comprehensive coverage
 */

import type { SNPInfo } from '~/types/genetics';

export const EXPANDED_SNP_DATABASE: Record<string, SNPInfo> = {
  // CYP450 variants
  'rs12248560': {
    rsid: 'rs12248560',
    gene: 'CYP2C19',
    geneName: 'Cytochrome P450 2C19',
    chromosome: '10',
    position: 96522460,
    category: 'Drug Metabolism',
    impact: 'Moderate',
    description: 'CYP2C19*17 - ultra-rapid metabolizer variant.',
    recommendations: ['May need higher doses of certain medications'],
    evidenceLevel: 'Moderate',
  },

  'rs28371706': {
    rsid: 'rs28371706',
    gene: 'CYP3A4',
    geneName: 'Cytochrome P450 3A4',
    chromosome: '7',
    position: 99758242,
    category: 'Drug Metabolism',
    impact: 'Moderate',
    description: 'CYP3A4*22 - reduced enzyme activity.',
    recommendations: ['Start statins at lower doses'],
    evidenceLevel: 'Moderate',
  },

  // Vitamin D
  'rs2282679': {
    rsid: 'rs2282679',
    gene: 'GC',
    geneName: 'Vitamin D Binding Protein',
    chromosome: '4',
    position: 71727762,
    category: 'Nutrition',
    impact: 'Moderate',
    description: 'Affects vitamin D levels and transport.',
    recommendations: ['Monitor 25(OH)D levels', 'May need higher supplementation'],
    evidenceLevel: 'Strong',
  },

  // Lactose intolerance
  'rs4988235': {
    rsid: 'rs4988235',
    gene: 'MCM6',
    geneName: 'Minichromosome Maintenance 6',
    chromosome: '2',
    position: 136608646,
    category: 'Nutrition',
    impact: 'Moderate',
    description: 'Lactase persistence variant.',
    recommendations: ['TT genotype: Lactose intolerant, avoid dairy or use lactase'],
    evidenceLevel: 'Very Strong',
  },

  // Celiac disease
  'rs2187668': {
    rsid: 'rs2187668',
    gene: 'HLA-DQA1',
    geneName: 'HLA-DQA1',
    chromosome: '6',
    position: 32605684,
    category: 'Immune System',
    impact: 'High',
    description: 'Strongly associated with celiac disease.',
    recommendations: ['If positive: Consider celiac testing before gluten-free diet'],
    evidenceLevel: 'Very Strong',
  },

  // Iron
  'rs1799945': {
    rsid: 'rs1799945',
    gene: 'HFE',
    geneName: 'Homeostatic Iron Regulator',
    chromosome: '6',
    position: 26091151,
    category: 'Disease Risk',
    impact: 'Moderate',
    description: 'HFE H63D variant - hemochromatosis.',
    recommendations: ['Monitor ferritin levels'],
    evidenceLevel: 'Strong',
  },

  // Caffeine metabolism
  'rs1272044': {
    rsid: 'rs1272044',
    gene: 'CYP1A2',
    geneName: 'Cytochrome P450 1A2',
    chromosome: '15',
    position: 75041798,
    category: 'Drug Metabolism',
    impact: 'Low',
    description: 'Additional CYP1A2 variant affecting caffeine.',
    recommendations: ['Consider with rs762551 for full picture'],
    evidenceLevel: 'Moderate',
  },

  // Sleep
  'rs3027399': {
    rsid: 'rs3027399',
    gene: 'PER2',
    geneName: 'Period Circadian Regulator 2',
    chromosome: '2',
    position: 238411139,
    category: 'Sleep',
    impact: 'Moderate',
    description: 'Affects circadian rhythm and sleep timing.',
    recommendations: ['Maintain consistent sleep schedule', 'Consider morning light exposure'],
    evidenceLevel: 'Moderate',
  },

  // Melatonin
  'rs10830963': {
    rsid: 'rs10830963',
    gene: 'MTNR1B',
    geneName: 'Melatonin Receptor 1B',
    chromosome: '11',
    position: 92708856,
    category: 'Sleep',
    impact: 'Moderate',
    description: 'Affects glucose regulation and melatonin response.',
    recommendations: ['May affect glucose tolerance', 'Consider melatonin timing'],
    evidenceLevel: 'Strong',
  },

  // Additional MTHFR
  'rs17367504': {
    rsid: 'rs17367504',
    gene: 'MTHFR',
    geneName: 'Methylenetetrahydrofolate Reductase',
    chromosome: '1',
    position: 11856380,
    category: 'Methylation',
    impact: 'Low',
    description: 'Additional MTHFR variant.',
    recommendations: ['Consider with C677T and A1298C'],
    evidenceLevel: 'Limited',
  },

  // BDNF
  'rs11030104': {
    rsid: 'rs11030104',
    gene: 'BDNF',
    geneName: 'Brain-Derived Neurotrophic Factor',
    chromosome: '11',
    position: 27679990,
    category: 'Mental Health',
    impact: 'Low',
    description: 'BDNF variant affecting neuroplasticity.',
    recommendations: ['Exercise to increase BDNF'],
    evidenceLevel: 'Moderate',
  },

  // Dopamine
  'rs1800955': {
    rsid: 'rs1800955',
    gene: 'DRD4',
    geneName: 'Dopamine Receptor D4',
    chromosome: '11',
    position: 637011,
    category: 'Mental Health',
    impact: 'Low',
    description: 'Novelty seeking and ADHD association.',
    recommendations: ['May affect reward sensitivity'],
    evidenceLevel: 'Moderate',
  },

  // Serotonin
  'rs6313': {
    rsid: 'rs6313',
    gene: 'HTR2A',
    geneName: '5-Hydroxytryptamine Receptor 2A',
    chromosome: '13',
    position: 47469781,
    category: 'Mental Health',
    impact: 'Moderate',
    description: 'Serotonin receptor variant affecting antidepressant response.',
    recommendations: ['May affect SSRI response'],
    evidenceLevel: 'Moderate',
  },

  // Alzheimer's risk
  'rs3818361': {
    rsid: 'rs3818361',
    gene: 'CR1',
    geneName: 'Complement C3b/C4b Receptor 1',
    chromosome: '1',
    position: 207714199,
    category: 'Disease Risk',
    impact: 'Moderate',
    description: 'Alzheimer disease risk variant.',
    recommendations: ['Optimize cardiovascular health', 'Consider Mediterranean diet'],
    evidenceLevel: 'Strong',
  },

  // Parkinson's
  'rs356220': {
    rsid: 'rs356220',
    gene: 'SNCA',
    geneName: 'Synuclein Alpha',
    chromosome: '4',
    position: 89828154,
    category: 'Disease Risk',
    impact: 'Moderate',
    description: 'Parkinson disease risk variant.',
    recommendations: ['Avoid pesticides and solvents', 'Exercise regularly'],
    evidenceLevel: 'Strong',
  },

  // Macular degeneration
  'rs10490924': {
    rsid: 'rs10490924',
    gene: 'ARMS2',
    geneName: 'Age-Related Maculopathy Susceptibility 2',
    chromosome: '10',
    position: 124220532,
    category: 'Disease Risk',
    impact: 'High',
    description: 'Age-related macular degeneration risk.',
    recommendations: ['Regular eye exams', 'AREDS2 formula supplementation', 'Stop smoking'],
    evidenceLevel: 'Very Strong',
  },

  // CFH
  'rs1061170': {
    rsid: 'rs1061170',
    gene: 'CFH',
    geneName: 'Complement Factor H',
    chromosome: '1',
    position: 196659237,
    category: 'Disease Risk',
    impact: 'High',
    description: 'Age-related macular degeneration risk.',
    recommendations: ['AREDS2 supplementation', 'Regular ophthalmology visits'],
    evidenceLevel: 'Very Strong',
  },

  // Additional diabetes
  'rs5219': {
    rsid: 'rs5219',
    gene: 'KCNJ11',
    geneName: 'Potassium Inwardly Rectifying Channel Subfamily J Member 11',
    chromosome: '11',
    position: 17388025,
    category: 'Disease Risk',
    impact: 'Moderate',
    description: 'Type 2 diabetes risk and sulfonylurea response.',
    recommendations: ['Monitor glucose', 'May respond well to sulfonylureas'],
    evidenceLevel: 'Strong',
  },

  // SLC30A8 - diabetes
  'rs13266634': {
    rsid: 'rs13266634',
    gene: 'SLC30A8',
    geneName: 'Solute Carrier Family 30 Member 8',
    chromosome: '8',
    position: 118184783,
    category: 'Disease Risk',
    impact: 'Moderate',
    description: 'Type 2 diabetes risk variant.',
    recommendations: ['Maintain healthy weight', 'Regular glucose monitoring'],
    evidenceLevel: 'Strong',
  },

  // FTO additional
  'rs1558902': {
    rsid: 'rs1558902',
    gene: 'FTO',
    geneName: 'Fat Mass and Obesity Associated',
    chromosome: '16',
    position: 53786614,
    category: 'Nutrition',
    impact: 'Moderate',
    description: 'Obesity risk variant near FTO.',
    recommendations: ['High protein diet', 'Regular exercise'],
    evidenceLevel: 'Strong',
  },

  // MC4R - obesity
  'rs17782313': {
    rsid: 'rs17782313',
    gene: 'MC4R',
    geneName: 'Melanocortin 4 Receptor',
    chromosome: '18',
    position: 60162664,
    category: 'Nutrition',
    impact: 'Moderate',
    description: 'Obesity and satiety regulation.',
    recommendations: ['May have increased appetite', 'Portion control important'],
    evidenceLevel: 'Strong',
  },

  // SH2B1 - obesity
  'rs7498665': {
    rsid: 'rs7498665',
    gene: 'SH2B1',
    geneName: 'SH2 Domain Containing 1',
    chromosome: '16',
    position: 28799894,
    category: 'Nutrition',
    impact: 'Moderate',
    description: 'Obesity risk and insulin signaling.',
    recommendations: ['Monitor insulin sensitivity'],
    evidenceLevel: 'Strong',
  },

  // NPY - appetite
  'rs16147': {
    rsid: 'rs16147',
    gene: 'NPY',
    geneName: 'Neuropeptide Y',
    chromosome: '7',
    position: 28773109,
    category: 'Nutrition',
    impact: 'Low',
    description: 'Appetite regulation and stress response.',
    recommendations: ['Stress management important'],
    evidenceLevel: 'Moderate',
  },

  // Additional ACTN3
  'rs1815739': {
    rsid: 'rs1815739',
    gene: 'ACTN3',
    geneName: 'Alpha-Actinin-3',
    chromosome: '11',
    position: 66560646,
    category: 'Fitness',
    impact: 'Moderate',
    description: 'R577X - affects power vs endurance.',
    recommendations: ['CC: Power sports', 'TT: Endurance sports'],
    evidenceLevel: 'Strong',
  },

  // ACE - endurance
  'rs1799752': {
    rsid: 'rs1799752',
    gene: 'ACE',
    geneName: 'Angiotensin I Converting Enzyme',
    chromosome: '17',
    position: 61554422,
    category: 'Fitness',
    impact: 'Moderate',
    description: 'ACE I/D variant affects endurance and strength.',
    recommendations: ['I allele: Endurance advantage', 'D allele: Strength advantage'],
    evidenceLevel: 'Moderate',
  },

  // Additional VDR
  'rs7975232': {
    rsid: 'rs7975232',
    gene: 'VDR',
    geneName: 'Vitamin D Receptor',
    chromosome: '12',
    position: 48241250,
    category: 'Nutrition',
    impact: 'Low',
    description: 'Additional VDR variant.',
    recommendations: ['Consider with other VDR variants'],
    evidenceLevel: 'Moderate',
  },

  // COMT additional
  'rs4633': {
    rsid: 'rs4633',
    gene: 'COMT',
    geneName: 'Catechol-O-Methyltransferase',
    chromosome: '22',
    position: 19951272,
    category: 'Mental Health',
    impact: 'Low',
    description: 'Additional COMT variant.',
    recommendations: ['Consider with rs4680'],
    evidenceLevel: 'Moderate',
  },
};

// Merge with comprehensive database
export const FULL_SNP_DATABASE: Record<string, SNPInfo> = {
  ...require('./comprehensiveSNPs').COMPREHENSIVE_SNP_DATABASE,
  ...EXPANDED_SNP_DATABASE,
};

export const TOTAL_EXPANDED_SNPS = Object.keys(FULL_SNP_DATABASE).length;

export function getExpandedSNPInfo(rsid: string): SNPInfo | null {
  return FULL_SNP_DATABASE[rsid] || null;
}
