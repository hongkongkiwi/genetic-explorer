import type { 
  SNP, 
  GeneticVariant, 
  DrugInteraction, 
  ActionableProtocol,
  HealthRecommendation,
  AnalysisReport 
} from '~/types/genetics';

// Mock LLM analysis - In production, this would call OpenAI/Anthropic APIs

interface LLMContext {
  variants: GeneticVariant[];
  drugInteractions: DrugInteraction[];
  snpCount: number;
}

/**
 * Generate comprehensive health report using LLM
 */
export async function generateHealthReport(context: LLMContext): Promise<{
  summary: string;
  categories: Record<string, string>;
}> {
  const { variants, snpCount } = context;

  // Group variants by category
  const byCategory: Record<string, GeneticVariant[]> = {};
  for (const v of variants) {
    if (!byCategory[v.category]) byCategory[v.category] = [];
    byCategory[v.category].push(v);
  }

  // Generate category summaries
  const categories: Record<string, string> = {};

  for (const [category, catVariants] of Object.entries(byCategory)) {
    categories[category] = generateCategorySummary(category, catVariants);
  }

  return {
    summary: `Analysis of ${snpCount.toLocaleString()} SNPs identified ${variants.length} significant variants across ${Object.keys(byCategory).length} health categories.`,
    categories,
  };
}

function generateCategorySummary(category: string, variants: GeneticVariant[]): string {
  const summaries: Record<string, string> = {
    methylation: `Key methylation variants identified in ${variants.map(v => v.gene).join(', ')}. These affect folate metabolism and detoxification processes.`,
    drug_metabolism: `Pharmacogenomic variants detected in ${variants.map(v => v.gene).join(', ')}. These affect how you process medications including caffeine and common drugs.`,
    nutrition: `Nutrigenomic variants found in ${variants.map(v => v.gene).join(', ')}. These influence your response to different nutrients and dietary patterns.`,
    fitness: `Athletic performance variants identified in ${variants.map(v => v.gene).join(', ')}. These provide insights into your optimal exercise types.`,
    cardiovascular: `Cardiovascular risk variants detected in ${variants.map(v => v.gene).join(', ')}. Monitoring and prevention strategies recommended.`,
    sleep: `Circadian rhythm variants found in ${variants.map(v => v.gene).join(', ')}. These affect your natural sleep-wake patterns.`,
    disease_risk: `Disease-associated variants identified. Regular screening and preventive measures recommended.`,
    cognitive: `Cognitive function variants detected in ${variants.map(v => v.gene).join(', ')}. These affect neurotransmitter function.`,
    immune: `Immune system variants identified. These affect inflammatory responses.`,
    longevity: `Longevity-associated variants found. These may contribute to healthy aging.`,
  };

  return summaries[category] || `${variants.length} significant variants identified in ${category}.`;
}

/**
 * Generate disease risk assessment
 */
export async function generateDiseaseRiskAssessment(variants: GeneticVariant[]): Promise<{
  highRisk: { condition: string; variants: string[]; risk: string }[];
  moderateRisk: { condition: string; variants: string[]; risk: string }[];
  protective: { condition: string; variants: string[]; benefit: string }[];
  carriers: { condition: string; gene: string; implications: string[] }[];
}> {
  const highRisk: { condition: string; variants: string[]; risk: string }[] = [];
  const moderateRisk: { condition: string; variants: string[]; risk: string }[] = [];
  const protective: { condition: string; variants: string[]; benefit: string }[] = [];
  const carriers: { condition: string; gene: string; implications: string[] }[] = [];

  for (const variant of variants) {
    if (variant.significance === 'pathogenic' || variant.significance === 'likely_pathogenic') {
      if (variant.gene === 'CFTR' && variant.snp.genotype !== 'AA') {
        carriers.push({
          condition: 'Cystic Fibrosis',
          gene: 'CFTR',
          implications: [
            '10% reduced lung function possible',
            '2-3x increased pancreatitis risk',
            'Higher prevalence of chronic rhinosinusitis',
            'Possible male fertility effects',
            'Recommend genetic counseling before having children',
          ],
        });
      }
      if (variant.gene === 'HFE') {
        highRisk.push({
          condition: 'Hereditary Hemochromatosis',
          variants: [variant.snp.rsid],
          risk: 'Significantly elevated risk if homozygous',
        });
      }
      if (variant.gene === 'BRCA1' || variant.gene === 'BRCA2') {
        highRisk.push({
          condition: `${variant.gene}-related Cancer Risk`,
          variants: [variant.snp.rsid],
          risk: 'Significantly elevated breast/ovarian cancer risk',
        });
      }
    }

    if (variant.category === 'cardiovascular' && variant.impact >= 3) {
      moderateRisk.push({
        condition: 'Cardiovascular Disease',
        variants: [variant.snp.rsid],
        risk: 'Moderately elevated risk based on genetic profile',
      });
    }

    if (variant.significance === 'protective') {
      protective.push({
        condition: `${variant.gene} Protection`,
        variants: [variant.snp.rsid],
        benefit: variant.description,
      });
    }
  }

  // Add common risk assessments
  const diabetesVariants = variants.filter(v => v.gene === 'TCF7L2');
  if (diabetesVariants.length > 0) {
    moderateRisk.push({
      condition: 'Type 2 Diabetes',
      variants: diabetesVariants.map(v => v.snp.rsid),
      risk: '1.4x increased risk with TCF7L2 variants',
    });
  }

  return { highRisk, moderateRisk, protective, carriers };
}

/**
 * Generate actionable health protocol
 */
export async function generateActionableProtocol(
  variants: GeneticVariant[],
  drugInteractions: DrugInteraction[]
): Promise<ActionableProtocol> {
  const criticalFindings: HealthRecommendation[] = [];
  const supplements: ActionableProtocol['supplements'] = [];
  const lifestyle: ActionableProtocol['lifestyle'] = [];

  // Analyze methylation
  const mthfrVariants = variants.filter(v => v.gene === 'MTHFR');
  if (mthfrVariants.length > 0) {
    criticalFindings.push({
      category: 'Methylation',
      priority: 'high',
      title: 'MTHFR Methylation Support Needed',
      description: 'You have MTHFR variants that affect folate metabolism and methylation processes.',
      actionItems: [
        'Take methylfolate (5-MTHF) 400-800mcg daily',
        'Monitor homocysteine levels annually',
        'Ensure adequate B12 (methylcobalamin) intake',
        'Avoid folic acid (synthetic form)',
      ],
      supportingVariants: mthfrVariants.map(v => v.snp.rsid),
      scientificBasis: 'MTHFR variants reduce enzyme activity by 30-70%, impairing folate metabolism.',
    });

    supplements.push({
      name: 'Methylfolate (5-MTHF)',
      dosage: '400-800 mcg',
      timing: 'Morning with food',
      form: 'Quatrefolic or Metafolin',
      rationale: 'Bypasses MTHFR enzyme deficiency for proper methylation',
      relatedGenes: ['MTHFR'],
      priority: 'essential',
    });
  }

  // Analyze caffeine metabolism
  const cyp1a2Variants = variants.filter(v => v.gene === 'CYP1A2');
  if (cyp1a2Variants.some(v => v.snp.genotype === 'AA')) {
    criticalFindings.push({
      category: 'Drug Metabolism',
      priority: 'high',
      title: 'Slow Caffeine Metabolizer',
      description: 'You metabolize caffeine slowly, leading to prolonged effects on sleep and anxiety.',
      actionItems: [
        'Limit caffeine to <100mg/day (about 1 cup coffee)',
        'No caffeine after 10 AM',
        'Consider green tea (L-theanine helps offset jitteriness)',
        'Avoid energy drinks completely',
      ],
      supportingVariants: cyp1a2Variants.map(v => v.snp.rsid),
      scientificBasis: 'CYP1A2 AA genotype results in 4x slower caffeine clearance.',
    });

    lifestyle.push({
      area: 'Caffeine Consumption',
      recommendation: 'Strictly limit caffeine intake and avoid after morning hours',
      rationale: 'Slow caffeine metabolism leads to sleep disruption and anxiety',
      relatedVariants: cyp1a2Variants.map(v => v.snp.rsid),
    });
  }

  // Analyze APOE
  const apoeVariants = variants.filter(v => v.gene === 'APOE');
  if (apoeVariants.length > 0) {
    const isE4 = apoeVariants.some(v => v.snp.rsid === 'rs429358');
    if (isE4) {
      criticalFindings.push({
        category: 'Cardiovascular & Cognitive',
        priority: 'critical',
        title: 'APOE4 Variant Present',
        description: 'APOE4 is associated with increased cardiovascular disease and Alzheimer\'s risk.',
        actionItems: [
          'Follow Mediterranean diet strictly',
          'Optimize sleep quality (critical for brain health)',
          'Regular cardiovascular screening',
          'Consider cognitive testing baseline',
          'Maintain healthy cholesterol levels',
        ],
        supportingVariants: apoeVariants.map(v => v.snp.rsid),
        scientificBasis: 'APOE4 carriers have 3-15x increased Alzheimer\'s risk and elevated cardiovascular risk.',
      });

      supplements.push({
        name: 'Omega-3 Fish Oil (DHA/EPA)',
        dosage: '2000-3000 mg combined EPA+DHA',
        timing: 'With meals, divided doses',
        rationale: 'APOE4 carriers benefit more from omega-3 for brain and heart health',
        relatedGenes: ['APOE'],
        priority: 'essential',
      });
    }
  }

  // Analyze ACTN3 for fitness
  const actn3Variants = variants.filter(v => v.gene === 'ACTN3');
  if (actn3Variants.length > 0) {
    const isXX = actn3Variants.some(v => v.snp.genotype === 'TT');
    if (isXX) {
      lifestyle.push({
        area: 'Exercise',
        recommendation: 'Focus on endurance activities rather than power sports',
        rationale: 'ACTN3 XX genotype means less fast-twitch muscle fiber protein',
        relatedVariants: actn3Variants.map(v => v.snp.rsid),
      });
    }
  }

  // Analyze FTO for weight management
  const ftoVariants = variants.filter(v => v.gene === 'FTO');
  if (ftoVariants.length > 0) {
    criticalFindings.push({
      category: 'Weight Management',
      priority: 'medium',
      title: 'FTO Variant - Obesity Risk Factor',
      description: 'FTO variant is associated with increased appetite and obesity risk.',
      actionItems: [
        'Focus on high-protein diet for satiety',
        'Practice mindful eating',
        'Regular meal timing (avoid late eating)',
        'Emphasize portion control',
      ],
      supportingVariants: ftoVariants.map(v => v.snp.rsid),
      scientificBasis: 'FTO variants affect ghrelin levels and satiety signaling.',
    });
  }

  // Analyze vitamin D
  const vdrVariants = variants.filter(v => v.gene === 'VDR');
  if (vdrVariants.length > 0) {
    supplements.push({
      name: 'Vitamin D3',
      dosage: '2000-4000 IU',
      timing: 'Morning with fat-containing meal',
      rationale: 'VDR variants may reduce vitamin D receptor sensitivity',
      relatedGenes: ['VDR'],
      priority: 'recommended',
    });
  }

  // Analyze COMT for stress/cognitive
  const comtVariants = variants.filter(v => v.gene === 'COMT');
  if (comtVariants.some(v => v.snp.genotype === 'AA')) {
    criticalFindings.push({
      category: 'Stress Response',
      priority: 'medium',
      title: 'COMT Met/Met - Slow Dopamine Clearance',
      description: 'You have the "warrior" genotype with slower dopamine breakdown.',
      actionItems: [
        'May excel under pressure but recover slowly',
        'Practice stress management techniques',
        'Consider magnesium for COMT support',
        'Avoid excessive stimulants',
      ],
      supportingVariants: comtVariants.map(v => v.snp.rsid),
      scientificBasis: 'COMT Met/Met has 4x lower enzyme activity, leading to higher dopamine levels.',
    });

    supplements.push({
      name: 'Magnesium (Glycinate or Citrate)',
      dosage: '200-400 mg elemental',
      timing: 'Evening',
      rationale: 'Supports COMT enzyme function and stress recovery',
      relatedGenes: ['COMT'],
      priority: 'recommended',
    });
  }

  // Build daily protocol
  const morning: ActionableProtocol['dailyProtocol']['morning'] = [];
  const midday: ActionableProtocol['dailyProtocol']['midday'] = [];
  const evening: ActionableProtocol['dailyProtocol']['evening'] = [];

  // Morning items
  if (mthfrVariants.length > 0) {
    morning.push({
      time: 'With breakfast',
      activity: 'Take methylfolate and B-complex',
      rationale: 'Supports methylation throughout the day',
      relatedGenes: ['MTHFR'],
    });
  }

  if (cyp1a2Variants.some(v => v.snp.genotype === 'AA')) {
    morning.push({
      time: 'Before 10 AM only',
      activity: 'One cup of coffee max (or skip entirely)',
      rationale: 'Slow caffeine metabolism - early cutoff needed',
      relatedGenes: ['CYP1A2'],
    });
  } else {
    morning.push({
      time: 'Morning',
      activity: 'Normal caffeine consumption OK',
      rationale: 'Normal caffeine metabolism',
      relatedGenes: ['CYP1A2'],
    });
  }

  if (apoeVariants.length > 0) {
    morning.push({
      time: 'Morning',
      activity: 'Mediterranean-style breakfast with healthy fats',
      rationale: 'APOE4 benefits from omega-3 and healthy fats',
      relatedGenes: ['APOE'],
    });
  }

  // Midday items
  midday.push({
    time: 'Lunch',
    activity: 'Balanced meal with protein emphasis',
    rationale: 'Protein supports stable energy and neurotransmitter production',
    relatedGenes: variants.filter(v => v.category === 'nutrition').map(v => v.gene),
  });

  // Evening items
  evening.push({
    time: 'Evening',
    activity: 'Limit blue light exposure',
    rationale: 'Supports natural melatonin production',
    relatedGenes: variants.filter(v => v.category === 'sleep').map(v => v.gene),
  });

  if (comtVariants.length > 0) {
    evening.push({
      time: 'Before bed',
      activity: 'Magnesium supplementation',
      rationale: 'Supports COMT function and relaxation',
      relatedGenes: ['COMT'],
    });
  }

  return {
    summary: `Personalized protocol based on ${variants.length} significant genetic variants.`,
    criticalFindings,
    dailyProtocol: { morning, midday, evening },
    dietaryFramework: generateDietaryFramework(variants),
    exerciseProtocol: generateExerciseProtocol(variants),
    supplements: supplements.sort((a, b) => {
      const priorityOrder = { essential: 0, recommended: 1, optional: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    lifestyle,
  };
}

function generateDietaryFramework(variants: GeneticVariant[]): ActionableProtocol['dietaryFramework'] {
  const hasApoe4 = variants.some(v => v.gene === 'APOE' && v.snp.rsid === 'rs429358');
  const hasFto = variants.some(v => v.gene === 'FTO');
  // MTHFR check reserved for future dietary recommendations

  if (hasApoe4) {
    return {
      type: 'Mediterranean Diet (APOE-Optimized)',
      description: 'Emphasis on omega-3s, olive oil, and antioxidant-rich foods for brain health.',
      foodsToEmphasize: ['Fatty fish (salmon, sardines)', 'Extra virgin olive oil', 'Leafy greens', 'Nuts', 'Berries', 'Whole grains'],
      foodsToLimit: ['Saturated fats', 'Processed meats', 'Refined carbohydrates', 'Excessive alcohol'],
      macronutrientRatios: { carbs: 40, protein: 25, fats: 35 },
      mealTiming: 'Avoid late-night eating; maintain 12-hour overnight fast',
    };
  }

  if (hasFto) {
    return {
      type: 'High-Protein, Portion-Controlled Diet',
      description: 'Higher protein for satiety with careful portion control.',
      foodsToEmphasize: ['Lean proteins', 'Vegetables', 'Legumes', 'Whole grains', 'Healthy fats'],
      foodsToLimit: ['Processed snacks', 'Sugary beverages', 'Large portions', 'Late-night eating'],
      macronutrientRatios: { carbs: 35, protein: 30, fats: 35 },
      mealTiming: 'Regular meal times; avoid eating after 8 PM',
    };
  }

  return {
    type: 'Balanced Whole-Foods Diet',
    description: 'General healthy eating pattern with emphasis on nutrient density.',
    foodsToEmphasize: ['Vegetables', 'Fruits', 'Whole grains', 'Lean proteins', 'Healthy fats'],
    foodsToLimit: ['Processed foods', 'Added sugars', 'Excessive sodium', 'Trans fats'],
    macronutrientRatios: { carbs: 45, protein: 25, fats: 30 },
    mealTiming: 'Regular, balanced meals throughout the day',
  };
}

function generateExerciseProtocol(variants: GeneticVariant[]): ActionableProtocol['exerciseProtocol'] {
  const actn3 = variants.find(v => v.gene === 'ACTN3');
  const isEnduranceType = actn3?.snp.genotype === 'TT';

  if (isEnduranceType) {
    return {
      recommendedTypes: ['Running', 'Cycling', 'Swimming', 'Rowing', 'Triathlon'],
      intensity: 'moderate',
      frequency: '5-6 days per week',
      duration: '45-90 minutes',
      geneticAdvantages: ['Better endurance capacity', 'Efficient oxygen utilization', 'Good stamina'],
      considerations: ['May need more recovery between high-intensity sessions', 'Focus on volume over intensity'],
    };
  }

  return {
    recommendedTypes: ['Mixed training', 'HIIT', 'Strength training', 'Sports'],
    intensity: 'mixed',
    frequency: '4-5 days per week',
    duration: '45-60 minutes',
    geneticAdvantages: ['Good power output', 'Fast-twitch muscle response', 'Explosive strength potential'],
    considerations: ['Include both strength and cardio', 'Allow adequate recovery'],
  };
}

/**
 * Generate full analysis report
 */
export async function generateFullReport(
  snps: SNP[],
  variants: GeneticVariant[],
  drugInteractions: DrugInteraction[]
): Promise<AnalysisReport> {
  const healthReport = await generateHealthReport({ variants, drugInteractions, snpCount: snps.length });
  const diseaseRisk = await generateDiseaseRiskAssessment(variants);
  const actionableProtocol = await generateActionableProtocol(variants, drugInteractions);

  // Group variants by category
  const categories: Record<string, GeneticVariant[]> = {};
  for (const v of variants) {
    if (!categories[v.category]) categories[v.category] = [];
    categories[v.category].push(v);
  }

  return {
    id: `report-${Date.now()}`,
    genomeId: '',
    generatedAt: new Date(),
    geneticReport: {
      totalVariants: variants.length,
      significantVariants: variants.filter(v => v.impact >= 3),
      categories,
    },
    diseaseRiskReport: {
      highRiskConditions: diseaseRisk.highRisk.map(r => ({
        condition: r.condition,
        riskLevel: 'high',
        variants: variants.filter(v => r.variants.includes(v.snp.rsid)),
        preventionStrategies: [],
      })),
      moderateRiskConditions: diseaseRisk.moderateRisk.map(r => ({
        condition: r.condition,
        riskLevel: 'moderate',
        variants: variants.filter(v => r.variants.includes(v.snp.rsid)),
        preventionStrategies: [],
      })),
      protectiveFactors: diseaseRisk.protective.map(r => ({
        condition: r.condition,
        riskLevel: 'protective',
        variants: variants.filter(v => r.variants.includes(v.snp.rsid)),
      })),
      carrierStatuses: diseaseRisk.carriers.map(c => ({
        condition: c.condition,
        riskLevel: 'low',
        variants: variants.filter(v => v.gene === c.gene),
      })),
    },
    actionableProtocol,
    drugInteractions,
    rawAnalysis: JSON.stringify({ healthReport, diseaseRisk, actionableProtocol }, null, 2),
  };
}
