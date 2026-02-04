/**
 * Genetic Analysis Module
 */

export {
  analyzeAncestry,
  estimateEthnicity,
  calculateConfidence,
  detectSubPopulation,
  getDominantAncestry,
  isMixedAncestry,
  countAncestryComponents,
  formatAncestryResults,
  calculateGeneticDistance,
  getSimilarPopulations,
  hasSufficientCoverage,
} from './ancestry';

export type {
  AncestryResult,
  PopulationEstimate,
  YHaplogroupResult,
  MtHaplogroupResult,
  AIM,
  PopulationGroup,
  ConfidenceLevel,
} from '~/types/ancestry';

export {
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
} from './carrier';

export type {
  CarrierResult,
  CarrierCondition,
  CarrierStatus,
} from '~/types/carrier';

export {
  getUserGenotype,
  findGenotypeMapping,
  calculateTraitConfidence,
  getTraitResult,
  analyzeTraits,
  getCategoryTraits,
  analyzeCategoryTraits,
  generateTraitsReport,
  compareTraits,
  getAnalysisStats,
  formatConfidence,
  getConfidenceColor,
  getShareableTraitData,
  filterTraitResults,
} from './traits';

export type {
  Trait,
  TraitCategory,
  TraitResult,
  ConfidenceLevel as TraitConfidenceLevel,
} from '~/types/traits';

export {
  generateHealthReport,
  generateDiseaseRiskAssessment,
  generateActionableProtocol,
  generateFullReport,
} from './llm';

// Note: generateActionableProtocol returns a complex inline type

export {
  generateAIHealthReport,
  generateDrugGuidance,
} from './ai';

export {
  analyzeGenomeComprehensive,
  generateQuickSummary,
} from './comprehensive';

export type {
  AnalyzedVariant,
  AnalysisSummary,
} from './comprehensive';
