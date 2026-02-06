/**
 * Data Loaders for Static Data
 * 
 * Provides lazy loading of large static data files to reduce initial bundle size.
 * 
 * Usage:
 * ```typescript
 * const { GEOGRAPHIC_REGIONS } = await loadReferencePopulations();
 * const { ANCESTRY_INFORMATIVE_MARKERS } = await loadReferencePopulations();
 * ```
 */

import type { AIM, ReferencePopulation, PopulationGroup } from '~/types/ancestry';
import type { YHaplogroupDefinition, MtHaplogroupDefinition } from '~/types/ancestry';
import type { CarrierCondition } from '~/types/carrier';
import type { Trait } from '~/types/traits';

// Cache for loaded data
const dataCache = new Map<string, unknown>();

/**
 * Load reference populations data
 */
export async function loadReferencePopulations(): Promise<{
  GEOGRAPHIC_REGIONS: Record<PopulationGroup, {
    region: string;
    subRegions: string[];
    description: string;
    sampleSize: number;
  }>;
  ANCESTRY_INFORMATIVE_MARKERS: AIM[];
  REFERENCE_POPULATIONS: ReferencePopulation[];
  POPULATION_SPECIFIC_MARKERS: Record<PopulationGroup, string[]>;
  REFERENCE_DATA_SUMMARY: {
    totalAIMs: number;
    populations: number;
    totalSampleSize: number;
    averageInformativeness: number;
  };
}> {
  if (dataCache.has('referencePopulations')) {
    return dataCache.get('referencePopulations') as any;
  }
  
  // For now, still load from TypeScript module
  // TODO: Convert to JSON and load dynamically
  const data = await import('../referencePopulations');
  dataCache.set('referencePopulations', data);
  return data;
}

/**
 * Load haplogroups data
 */
export async function loadHaplogroups(): Promise<{
  Y_HAPLOGROUPS: Record<string, YHaplogroupDefinition>;
  MT_HAPLOGROUPS: Record<string, MtHaplogroupDefinition>;
}> {
  if (dataCache.has('haplogroups')) {
    return dataCache.get('haplogroups') as any;
  }
  
  const data = await import('../haplogroups');
  dataCache.set('haplogroups', data);
  return data;
}

/**
 * Load carrier conditions data
 */
export async function loadCarrierConditions(): Promise<{
  CARRIER_CONDITIONS: CarrierCondition[];
}> {
  if (dataCache.has('carrierConditions')) {
    return dataCache.get('carrierConditions') as any;
  }
  
  const data = await import('../carrierConditions');
  dataCache.set('carrierConditions', data);
  return data;
}

/**
 * Load traits database
 */
export async function loadTraitsDatabase(): Promise<{
  TRAITS_DATABASE: Record<string, Trait>;
}> {
  if (dataCache.has('traitsDatabase')) {
    return dataCache.get('traitsDatabase') as any;
  }
  
  const data = await import('../traitsDatabase');
  dataCache.set('traitsDatabase', data);
  return data;
}

/**
 * Clear data cache (useful for testing)
 */
export function clearDataCache(): void {
  dataCache.clear();
}

/**
 * Preload all data (use sparingly - only when needed)
 */
export async function preloadAllData(): Promise<void> {
  await Promise.all([
    loadReferencePopulations(),
    loadHaplogroups(),
    loadCarrierConditions(),
    loadTraitsDatabase(),
  ]);
}
