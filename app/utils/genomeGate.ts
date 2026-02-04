/**
 * Genome Gate - Controls access to features based on genome upload status
 * 
 * Users without genomes can:
 * - Manage account settings
 * - Update profile
 * - View dashboard (with prompts to upload)
 * - Access help/faq
 * 
 * Users with genomes can access all features including:
 * - Genome explorer
 * - Health reports
 * - Ancestry analysis
 * - Relative matching
 * - SNP search
 */

import { getDb } from './database';

export interface GenomeStatus {
  hasGenome: boolean;
  genomeCount: number;
  primaryGenomeId: string | null;
  uploadPrompt: string;
}

/**
 * Check if user has uploaded any genomes
 */
export function hasUploadedGenome(userId: string): boolean {
  const db = getDb();
  
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM genomes WHERE user_id = ?
  `).get(userId) as { count: number };
  
  return result.count > 0;
}

/**
 * Get detailed genome status for a user
 */
export function getGenomeStatus(userId: string): GenomeStatus {
  const db = getDb();
  
  const result = db.prepare(`
    SELECT 
      COUNT(*) as count,
      MAX(CASE WHEN is_primary = 1 THEN id END) as primary_genome_id
    FROM genomes 
    WHERE user_id = ?
  `).get(userId) as { count: number; primary_genome_id: string | null };
  
  const hasGenome = result.count > 0;
  
  return {
    hasGenome,
    genomeCount: result.count,
    primaryGenomeId: result.primary_genome_id,
    uploadPrompt: hasGenome 
      ? '' 
      : 'Upload your genome to unlock personalized genetic insights, health reports, and ancestry analysis.',
  };
}

/**
 * Get count of user's genomes
 */
export function getUserGenomeCount(userId: string): number {
  const db = getDb();
  
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM genomes WHERE user_id = ?
  `).get(userId) as { count: number };
  
  return result.count;
}

/**
 * Gated features that require genome upload
 */
export const GATED_FEATURES = {
  EXPLORER: 'genome-explorer',
  HEALTH_REPORTS: 'health-reports',
  ANCESTRY: 'ancestry-analysis',
  TRAITS: 'traits-analysis',
  CARRIER: 'carrier-screening',
  RELATIVES: 'relative-matching',
  SNP_SEARCH: 'snp-search',
  COMPARISON: 'genome-comparison',
  EXPORT_DATA: 'export-genetic-data',
} as const;

export type GatedFeature = typeof GATED_FEATURES[keyof typeof GATED_FEATURES];

/**
 * Check if a feature requires genome upload
 */
export function requiresGenome(feature: GatedFeature): boolean {
  return Object.values(GATED_FEATURES).includes(feature);
}

/**
 * Features accessible without genome upload
 */
export const UNGATED_FEATURES = [
  'account-settings',
  'profile',
  'security',
  'privacy-settings',
  'notifications',
  'billing',
  'help',
  'faq',
  'upload-genome',
];

/**
 * Middleware result for genome gate check
 */
export interface GenomeGateResult {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
}

/**
 * Check if user can access a gated feature
 */
export function checkGenomeGate(
  userId: string,
  feature: GatedFeature
): GenomeGateResult {
  const status = getGenomeStatus(userId);
  
  if (status.hasGenome) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    reason: `This feature requires a genome upload. ${status.uploadPrompt}`,
    redirectTo: '/upload',
  };
}

/**
 * Get list of gated features for display
 */
export function getGatedFeaturesList(): Array<{
  id: GatedFeature;
  name: string;
  description: string;
  icon: string;
}> {
  return [
    {
      id: GATED_FEATURES.EXPLORER,
      name: 'Genome Explorer',
      description: 'Browse and search your genetic variants',
      icon: 'Dna',
    },
    {
      id: GATED_FEATURES.HEALTH_REPORTS,
      name: 'Health Reports',
      description: 'Personalized health and wellness insights',
      icon: 'Heart',
    },
    {
      id: GATED_FEATURES.ANCESTRY,
      name: 'Ancestry Analysis',
      description: 'Discover your genetic heritage',
      icon: 'Globe',
    },
    {
      id: GATED_FEATURES.TRAITS,
      name: 'Traits Analysis',
      description: 'Understand your genetic traits',
      icon: 'User',
    },
    {
      id: GATED_FEATURES.CARRIER,
      name: 'Carrier Screening',
      description: 'Check for genetic carrier status',
      icon: 'Shield',
    },
    {
      id: GATED_FEATURES.RELATIVES,
      name: 'Relative Matching',
      description: 'Connect with genetic relatives',
      icon: 'Users',
    },
    {
      id: GATED_FEATURES.SNP_SEARCH,
      name: 'SNP Search',
      description: 'Search specific genetic variants',
      icon: 'Search',
    },
    {
      id: GATED_FEATURES.COMPARISON,
      name: 'Genome Comparison',
      description: 'Compare genomes with others',
      icon: 'GitCompare',
    },
    {
      id: GATED_FEATURES.EXPORT_DATA,
      name: 'Export Data',
      description: 'Download your genetic data',
      icon: 'Download',
    },
  ];
}
