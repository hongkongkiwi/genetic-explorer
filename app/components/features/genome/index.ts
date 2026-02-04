/**
 * Chromosome Browser Components
 * 
 * Export all chromosome visualization components for easy importing.
 * 
 * @example
 * ```tsx
 * import { ChromosomeBrowser, ChromosomeVisualizer, ChromosomeLegend } from '~/components/chromosome';
 * ```
 */

export { ChromosomeBrowser } from '../ChromosomeBrowser';
export { ChromosomeVisualizer } from '../ChromosomeVisualizer';
export { ChromosomeLegend, MiniLegend } from '../ChromosomeLegend';

// Re-export data and types
export {
  CHROMOSOMES,
  CHROMOSOME_LENGTHS,
  CENTROMERE_POSITIONS,
  SNP_CATEGORIES,
  STAIN_COLORS,
  getChromosome,
  getCategoryColor,
  getCategoryLabel,
  getCategoryIcon,
  formatBasePairs,
  getCytogeneticPosition,
  getBandForPosition,
  getStainColor,
  positionToPercent,
  percentToPosition,
} from '~/data/chromosomeData';

export type {
  ChromosomeInfo,
  CytogeneticBand,
  CompareMode,
  ViewState,
} from '~/data/chromosomeData';
