// Genetic Data Types

export interface SNP {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
  gene?: string;
}

export interface GenomeData {
  id: string;
  userId: string;
  filename: string;
  source: '23andme' | 'ancestry' | 'myheritage' | 'other';
  snpCount: number;
  processedAt: Date;
  snps: SNP[];
}

// Comprehensive SNP Database Types

export interface SNPInfo {
  rsid: string;
  gene: string;
  geneName?: string;
  chromosome?: string;
  position?: number;
  category: string;
  impact: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Normal' | 'Protective';
  description: string;
  genotypes?: Record<string, { effect: string; magnitude: string }>;
  clinicalSignificance?: string;
  conditions?: string[];
  recommendations?: string[];
  affectedDrugs?: Array<{ drug: string; effect: string }> | string[];
  populationFrequency?: Record<string, number>;
  evidenceLevel?: 'Very Strong' | 'Strong' | 'Moderate' | 'Limited' | 'Weak';
  pubmedIds?: string[];
}

// Analysis Types

export type ImpactLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface GeneticVariant {
  snp: SNP;
  gene: string;
  impact: ImpactLevel;
  category: VariantCategory;
  significance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign' | 'protective';
  description: string;
  studies: StudyReference[];
  recommendations?: string[];
}

export type VariantCategory = 
  | 'drug_metabolism'
  | 'methylation'
  | 'nutrition'
  | 'fitness'
  | 'cardiovascular'
  | 'sleep'
  | 'disease_risk'
  | 'carrier_status'
  | 'immune'
  | 'cognitive'
  | 'longevity'
  | 'Mental Health'
  | 'Drug Metabolism'
  | 'Methylation'
  | 'Cardiovascular'
  | 'Nutrition'
  | 'Fitness'
  | 'Immune System'
  | 'Disease Risk'
  | 'Hormonal';

export interface StudyReference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  url?: string;
}

export interface DrugInteraction {
  drugName: string;
  gene: string;
  phenotype: string;
  activityScore?: string;
  implications: string;
  recommendations: string[];
  evidenceLevel: 'strong' | 'moderate' | 'weak';
}

export interface DiseaseRisk {
  condition: string;
  riskLevel: 'high' | 'moderate' | 'low' | 'protective';
  variants?: GeneticVariant[];
  lifetimeRisk?: string;
  relativeRisk?: number;
  preventionStrategies?: string[];
  description?: string;
  associatedVariants?: string[];
}

export interface HealthRecommendation {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  supportingVariants: string[];
  scientificBasis: string;
}

export interface ActionableProtocol {
  summary: string;
  criticalFindings: HealthRecommendation[];
  dailyProtocol: {
    morning: ProtocolItem[];
    midday: ProtocolItem[];
    evening: ProtocolItem[];
  };
  dietaryFramework: DietaryFramework;
  exerciseProtocol: ExerciseProtocol;
  supplements: SupplementRecommendation[];
  lifestyle: LifestyleRecommendation[];
}

export interface ProtocolItem {
  time: string;
  activity: string;
  rationale: string;
  relatedGenes: string[];
}

export interface DietaryFramework {
  type: string;
  description: string;
  foodsToEmphasize: string[];
  foodsToLimit: string[];
  macronutrientRatios?: {
    carbs: number;
    protein: number;
    fats: number;
  };
  mealTiming?: string;
}

export interface ExerciseProtocol {
  recommendedTypes: string[];
  intensity: 'low' | 'moderate' | 'high' | 'mixed';
  frequency: string;
  duration: string;
  geneticAdvantages: string[];
  considerations: string[];
}

export interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  form?: string;
  rationale: string;
  relatedGenes: string[];
  priority: 'essential' | 'recommended' | 'optional';
}

export interface LifestyleRecommendation {
  area: string;
  recommendation: string;
  rationale: string;
  relatedVariants: string[];
}

// Report Types

export interface ReportSection {
  id: string;
  type: 'overview' | 'finding' | 'drug' | 'risk' | 'protocol' | 'variants';
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  actionItems?: string[];
  details?: any[];
  risks?: DiseaseRisk[];
  protocol?: {
    supplements?: string[];
    diet?: string[];
    lifestyle?: string[];
    monitoring?: string[];
  };
  variants?: Array<{
    rsid: string;
    gene: string;
    genotype: string;
    impact: string;
    description?: string;
    evidence?: string;
  }>;
}

export interface HealthReport {
  id: string;
  genomeId: string;
  generatedAt: Date;
  reportType: string;
  version: string;
  summary: {
    totalVariants: number;
    highImpact: number;
    categories: Record<string, number>;
    topFindings: string[];
  };
  sections: ReportSection[];
  actionableProtocol: {
    supplements: string[];
    diet: string[];
    lifestyle: string[];
    monitoring: string[];
  };
  executiveSummary: string;
  diseaseRisks: DiseaseRisk[];
  drugMetabolism: Array<{
    category?: string;
    drugs: string[];
    guidance: string;
  }>;
  keyFindings: string[];
}

export interface AnalysisReport {
  id: string;
  genomeId: string;
  generatedAt: Date;
  geneticReport: {
    totalVariants: number;
    significantVariants: GeneticVariant[];
    categories: Record<VariantCategory, GeneticVariant[]>;
  };
  diseaseRiskReport: {
    highRiskConditions: DiseaseRisk[];
    moderateRiskConditions: DiseaseRisk[];
    protectiveFactors: DiseaseRisk[];
    carrierStatuses: DiseaseRisk[];
  };
  actionableProtocol: ActionableProtocol;
  drugInteractions: DrugInteraction[];
  rawAnalysis: string;
}

// API Response Types

export interface AnalysisProgress {
  stage: 'uploading' | 'parsing' | 'querying_databases' | 'analyzing' | 'generating_report' | 'complete';
  progress: number;
  message: string;
  details?: string;
}

export interface DatabaseQuery {
  source: 'clinvar' | 'pharmgkb' | 'dbsnp' | 'gwascatalog';
  snpId: string;
  data: unknown;
  timestamp: Date;
}

// Upload Types

export interface UploadResult {
  genomeId: string;
  filename: string;
  source: string;
  snpCount: number;
  compressionType: string | null;
}
