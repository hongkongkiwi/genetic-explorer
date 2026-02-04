import type { SNP, GeneticVariant, DrugInteraction, StudyReference } from '~/types/genetics';

// Known SNPs database - In production, this would query actual APIs
// These are well-known SNPs with established research

const KNOWN_SNPS: Record<string, Partial<GeneticVariant>> = {
  // MTHFR - Methylation
  'rs1801133': {
    gene: 'MTHFR',
    category: 'methylation',
    impact: 4,
    description: 'MTHFR C677T variant affects folate metabolism and methylation processes.',
  },
  'rs1801131': {
    gene: 'MTHFR',
    category: 'methylation',
    impact: 3,
    description: 'MTHFR A1298C variant affects methylation and neurotransmitter synthesis.',
  },
  
  // CYP1A2 - Caffeine metabolism
  'rs762551': {
    gene: 'CYP1A2',
    category: 'drug_metabolism',
    impact: 3,
    description: 'CYP1A2 variant affects caffeine metabolism speed.',
  },
  
  // CYP2D6 - Drug metabolism
  'rs3892097': {
    gene: 'CYP2D6',
    category: 'drug_metabolism',
    impact: 5,
    description: 'CYP2D6 poor metabolizer variant affects many medications.',
  },
  
  // FTO - Weight/obesity
  'rs9939609': {
    gene: 'FTO',
    category: 'nutrition',
    impact: 3,
    description: 'FTO variant associated with obesity risk and weight management.',
  },
  
  // ACTN3 - Athletic performance
  'rs1815739': {
    gene: 'ACTN3',
    category: 'fitness',
    impact: 3,
    description: 'ACTN3 R577X variant affects fast-twitch muscle fibers and sprint ability.',
  },
  
  // APOE - Cardiovascular/Alzheimer\'s
  'rs429358': {
    gene: 'APOE',
    category: 'cardiovascular',
    impact: 5,
    description: 'APOE4 variant associated with Alzheimer\'s and cardiovascular disease risk.',
  },
  'rs7412': {
    gene: 'APOE',
    category: 'cardiovascular',
    impact: 4,
    description: 'APOE variant affecting lipid metabolism and cardiovascular risk.',
  },
  
  // HLA-B*5701 - Drug hypersensitivity
  'rs2395029': {
    gene: 'HLA-B',
    category: 'drug_metabolism',
    impact: 6,
    description: 'HLA-B*5701 associated with abacavir hypersensitivity.',
  },
  
  // CFTR - Cystic Fibrosis
  'rs113993960': {
    gene: 'CFTR',
    category: 'disease_risk',
    impact: 6,
    description: 'CFTR ΔF508 is the most common cystic fibrosis mutation.',
  },
  
  // HFE - Hemochromatosis
  'rs1800562': {
    gene: 'HFE',
    category: 'disease_risk',
    impact: 5,
    description: 'HFE C282Y variant associated with hereditary hemochromatosis.',
  },
  
  // BRCA1/2 - Cancer risk
  'rs80357906': {
    gene: 'BRCA1',
    category: 'disease_risk',
    impact: 6,
    description: 'BRCA1 pathogenic variant significantly increases breast/ovarian cancer risk.',
  },
  
  // COMT - Dopamine metabolism
  'rs4680': {
    gene: 'COMT',
    category: 'cognitive',
    impact: 3,
    description: 'COMT Val158Met affects dopamine breakdown and stress response.',
  },
  
  // VDR - Vitamin D
  'rs1544410': {
    gene: 'VDR',
    category: 'nutrition',
    impact: 2,
    description: 'VDR BsmI variant affects vitamin D receptor function.',
  },
  
  // CLOCK - Circadian rhythm
  'rs1801260': {
    gene: 'CLOCK',
    category: 'sleep',
    impact: 3,
    description: 'CLOCK 3111T/C affects circadian rhythm and sleep patterns.',
  },
  
  // TCF7L2 - Type 2 diabetes
  'rs7903146': {
    gene: 'TCF7L2',
    category: 'disease_risk',
    impact: 4,
    description: 'TCF7L2 variant is one of the strongest genetic risk factors for type 2 diabetes.',
  },
  
  // Lp(a) - Cardiovascular
  'rs10455872': {
    gene: 'LPA',
    category: 'cardiovascular',
    impact: 4,
    description: 'LPA variant associated with elevated lipoprotein(a) and cardiovascular risk.',
  },
  
  // ALOX5 - Inflammation
  'rs4948672': {
    gene: 'ALOX5',
    category: 'immune',
    impact: 2,
    description: 'ALOX5 variant affects inflammatory response.',
  },
  
  // NOS3 - Nitric oxide / blood pressure
  'rs1799983': {
    gene: 'NOS3',
    category: 'cardiovascular',
    impact: 3,
    description: 'NOS3 Glu298Asp affects nitric oxide production and blood pressure.',
  },
  
  // SLC23A1 - Vitamin C transport
  'rs33972313': {
    gene: 'SLC23A1',
    category: 'nutrition',
    impact: 2,
    description: 'SLC23A1 affects vitamin C absorption and transport.',
  },
  
  // TAS2R38 - Bitter taste
  'rs713598': {
    gene: 'TAS2R38',
    category: 'nutrition',
    impact: 1,
    description: 'TAS2R38 determines bitter taste perception (PTC/PROP).',
  },
  
  // FOXO3 - Longevity
  'rs2802292': {
    gene: 'FOXO3',
    category: 'longevity',
    impact: 3,
    description: 'FOXO3 variant associated with longevity and healthy aging.',
  },
};

const DRUG_INTERACTIONS: Record<string, DrugInteraction[]> = {
  'CYP2D6': [
    {
      drugName: 'Codeine',
      gene: 'CYP2D6',
      phenotype: 'Poor metabolizer',
      implications: 'Reduced analgesic effect from codeine',
      recommendations: ['Consider alternative analgesics', 'Avoid tramadol'],
      evidenceLevel: 'strong',
    },
    {
      drugName: 'Metoprolol',
      gene: 'CYP2D6',
      phenotype: 'Poor metabolizer',
      implications: 'Increased beta-blocker exposure',
      recommendations: ['Consider lower starting dose', 'Monitor heart rate'],
      evidenceLevel: 'moderate',
    },
  ],
  'CYP1A2': [
    {
      drugName: 'Caffeine',
      gene: 'CYP1A2',
      phenotype: 'Slow metabolizer',
      implications: 'Increased caffeine half-life, higher risk of anxiety/insomnia',
      recommendations: ['Limit caffeine to <100mg/day', 'Avoid caffeine after noon'],
      evidenceLevel: 'strong',
    },
    {
      drugName: 'Clopidogrel',
      gene: 'CYP2C19',
      phenotype: 'Intermediate metabolizer',
      implications: 'Reduced antiplatelet effect',
      recommendations: ['Consider alternative antiplatelet', 'Monitor platelet function'],
      evidenceLevel: 'strong',
    },
  ],
  'SLCO1B1': [
    {
      drugName: 'Simvastatin',
      gene: 'SLCO1B1',
      phenotype: 'Reduced function',
      implications: 'Increased risk of myopathy',
      recommendations: ['Consider lower dose', 'Use alternative statin', 'Monitor CK levels'],
      evidenceLevel: 'strong',
    },
  ],
};

/**
 * Query ClinVar-like database for variant significance
 */
export async function queryClinVar(snpId: string): Promise<{
  significance: string;
  conditions: string[];
  reviewStatus: string;
} | null> {
  // In production, this would call the actual ClinVar API
  // For now, return mock data for known pathogenic variants
  
  const pathogenicVariants = [
    'rs113993960', // CFTR
    'rs1800562',   // HFE
    'rs80357906',  // BRCA1
    'rs11571707',  // BRCA2
    'rs28933368',  // TP53
  ];

  if (pathogenicVariants.includes(snpId)) {
    return {
      significance: 'Pathogenic/Likely pathogenic',
      conditions: ['See gene-specific analysis'],
      reviewStatus: 'Expert panel',
    };
  }

  return null;
}

/**
 * Query PharmGKB-like database for drug interactions
 */
export async function queryPharmGKB(geneSymbol: string): Promise<DrugInteraction[]> {
  return DRUG_INTERACTIONS[geneSymbol] || [];
}

/**
 * Get variant information for a SNP
 */
export function getVariantInfo(snp: SNP): Partial<GeneticVariant> | null {
  return KNOWN_SNPS[snp.rsid] || null;
}

/**
 * Analyze a SNP and return full variant information
 */
export async function analyzeSNP(snp: SNP): Promise<GeneticVariant | null> {
  const baseInfo = getVariantInfo(snp);
  if (!baseInfo) return null;

  const clinvarData = await queryClinVar(snp.rsid);
  const drugInteractions = baseInfo.gene ? await queryPharmGKB(baseInfo.gene) : [];

  // Determine significance based on known data
  let significance: GeneticVariant['significance'] = 'uncertain';
  if (clinvarData?.significance.toLowerCase().includes('pathogenic')) {
    significance = 'pathogenic';
  } else if (clinvarData?.significance.toLowerCase().includes('benign')) {
    significance = 'benign';
  }

  // Create studies references
  const studies: StudyReference[] = [];
  if (baseInfo.gene) {
    studies.push({
      id: `study-${snp.rsid}`,
      title: `Genome-wide association study of ${baseInfo.gene} variants`,
      authors: ['Various'],
      journal: 'Nature Genetics',
      year: 2020,
      pmid: '00000000',
    });
  }

  return {
    snp,
    gene: baseInfo.gene || 'Unknown',
    impact: baseInfo.impact || 1,
    category: baseInfo.category || 'disease_risk',
    significance,
    description: baseInfo.description || '',
    studies,
    recommendations: generateRecommendations(baseInfo, snp),
  };
}

/**
 * Generate recommendations based on variant info
 */
function generateRecommendations(variant: Partial<GeneticVariant>, snp: SNP): string[] {
  const recommendations: string[] = [];

  switch (variant.category) {
    case 'methylation':
      if (variant.gene === 'MTHFR') {
        recommendations.push('Consider methylfolate supplementation');
        recommendations.push('Monitor homocysteine levels');
        recommendations.push('Ensure adequate B-vitamin intake');
      }
      break;
    case 'drug_metabolism':
      if (variant.gene === 'CYP1A2') {
        recommendations.push('Limit caffeine intake, especially after midday');
        recommendations.push('Consider caffeine-free alternatives');
      }
      break;
    case 'nutrition':
      if (variant.gene === 'FTO') {
        recommendations.push('Focus on portion control');
        recommendations.push('Regular exercise is especially important');
        recommendations.push('Consider higher protein intake');
      }
      break;
    case 'fitness':
      if (variant.gene === 'ACTN3') {
        if (snp.genotype === 'TT') {
          recommendations.push('Focus on endurance sports');
          recommendations.push('May have reduced power/sprint ability');
        } else {
          recommendations.push('Likely respond well to strength training');
          recommendations.push('May have advantage in power sports');
        }
      }
      break;
    case 'sleep':
      recommendations.push('Maintain consistent sleep schedule');
      recommendations.push('Consider circadian rhythm optimization');
      break;
  }

  return recommendations;
}

/**
 * Get all significant variants from a genome
 */
export async function analyzeGenome(snps: SNP[]): Promise<GeneticVariant[]> {
  const variants: GeneticVariant[] = [];

  // Analyze known SNPs
  for (const snp of snps) {
    const variant = await analyzeSNP(snp);
    if (variant && variant.impact >= 2) {
      variants.push(variant);
    }
  }

  // Sort by impact
  variants.sort((a, b) => b.impact - a.impact);

  return variants;
}

/**
 * Get drug interactions for a set of variants
 */
export async function getDrugInteractions(variants: GeneticVariant[]): Promise<DrugInteraction[]> {
  const interactions: DrugInteraction[] = [];
  const processedGenes = new Set<string>();

  for (const variant of variants) {
    if (variant.gene && !processedGenes.has(variant.gene)) {
      const geneInteractions = await queryPharmGKB(variant.gene);
      interactions.push(...geneInteractions);
      processedGenes.add(variant.gene);
    }
  }

  return interactions;
}


/**
 * Get SNPs for genome coverage calculation
 */
export function getGenomeCoverage(genomeId: string, userId: string): Array<{
  rsid: string;
  chromosome: string;
  position: number;
  genotype_encrypted: string;
}> | null {
  const { getDb } = require('./database');
  const db = getDb();
  
  // Verify ownership first
  const genome = db.prepare(
    'SELECT id FROM genomes WHERE id = ? AND user_id = ?'
  ).get(genomeId, userId);
  
  if (!genome) {
    return null;
  }
  
  const rows = db.prepare(
    'SELECT rsid, chromosome, position, genotype_encrypted FROM snps WHERE genome_id = ?'
  ).all(genomeId);
  
  return rows;
}
