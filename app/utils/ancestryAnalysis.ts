/**
 * Ancestry Analysis Utilities
 * 
 * Re-exports from the analysis module for convenience.
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
} from '~/analysis/ancestry';

export type {
  AncestryResult,
  PopulationEstimate,
  YHaplogroupResult,
  MtHaplogroupResult,
  AIM,
  PopulationGroup,
  ConfidenceLevel,
} from '~/types/ancestry';
