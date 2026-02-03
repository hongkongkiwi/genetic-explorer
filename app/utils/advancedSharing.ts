/**
 * Advanced Sharing System
 *
 * Supports different sharing relationships:
 * - Family: Full access with genetic matching capabilities
 * - Friends: Limited access, no raw data
 * - Healthcare Provider: Clinical-grade data access
 * - Research: Anonymized aggregate data only
 *
 * Privacy: Shared users only see what you explicitly share
 */

import { getDb } from './database';
import { v4 as uuidv4 } from 'uuid';
import { SENSITIVITY_CATEGORIES, SHARE_LEVELS, SensitivityLevel } from './sensitiveData';

// ============================================================================
// Share Types
// ============================================================================

export type ShareType = 'family' | 'friend' | 'healthcare' | 'research' | 'public';

export interface ShareTypeConfig {
  type: ShareType;
  name: string;
  description: string;
  defaultLevel: SensitivityLevel;
  allowsRawData: boolean;
  allowsGeneticMatching: boolean;
  requiresApproval: boolean;
  expiresConfig: boolean;
  icon: string;
}

export const SHARE_TYPES: ShareTypeConfig[] = [
  {
    type: 'family',
    name: 'Family',
    description: 'Close family members. Enables genetic matching and relationship analysis.',
    defaultLevel: 'highly_sensitive',
    allowsRawData: true,
    allowsGeneticMatching: true,
    requiresApproval: false,
    expiresConfig: true,
    icon: '👨‍👩‍👧‍👦',
  },
  {
    type: 'friend',
    name: 'Friend',
    description: 'Friends and acquaintances. Limited access to summary information only.',
    defaultLevel: 'normal',
    allowsRawData: false,
    allowsGeneticMatching: false,
    requiresApproval: true,
    expiresConfig: true,
    icon: '👥',
  },
  {
    type: 'healthcare',
    name: 'Healthcare Provider',
    description: 'Doctors, genetic counselors, or medical professionals.',
    defaultLevel: 'highly_sensitive',
    allowsRawData: true,
    allowsGeneticMatching: false,
    requiresApproval: false,
    expiresConfig: true,
    icon: '👨‍⚕️',
  },
  {
    type: 'research',
    name: 'Research',
    description: 'Researchers or studies. Data is anonymized and aggregated.',
    defaultLevel: 'normal',
    allowsRawData: false,
    allowsGeneticMatching: false,
    requiresApproval: true,
    expiresConfig: true,
    icon: '🔬',
  },
  {
    type: 'public',
    name: 'Public',
    description: 'Anyone with the link. Completely anonymized.',
    defaultLevel: 'normal',
    allowsRawData: false,
    allowsGeneticMatching: false,
    requiresApproval: false,
    expiresConfig: true,
    icon: '🌐',
  },
];

// ============================================================================
// Share Permissions
// ============================================================================

export interface SharePermission {
  id: string;
  userId: string; // Owner
  sharedWithId: string | null; // null for public links
  shareType: ShareType;
  genomeId: string | null; // null for all genomes
  sensitivityLevel: SensitivityLevel;
  includeRawData: boolean;
  allowMatching: boolean;
  canDownload: boolean;
  canShare: boolean;
  status: 'active' | 'pending' | 'revoked' | 'expired';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Relationship metadata (for family)
  relationshipType?: string;
  relatedness?: number;
}

// ============================================================================
// Sharing API
// ============================================================================

/**
 * Create a share permission
 */
export function createSharePermission(
  ownerId: string,
  options: {
    shareType: ShareType;
    sharedWithEmail?: string;
    genomeId?: string;
    sensitivityLevel?: SensitivityLevel;
    includeRawData?: boolean;
    allowMatching?: boolean;
    expiresInDays?: number;
    relationshipType?: string;
  }
): { success: boolean; permission?: SharePermission; shareLink?: string; error?: string } {
  const db = getDb();
  const now = new Date().toISOString();
  const id = uuidv4();

  const shareTypeConfig = SHARE_TYPES.find((st) => st.type === options.shareType)!;
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // If sharing with email, look up or create pending user
  let sharedWithId: string | null = null;
  if (options.sharedWithEmail) {
    const sharedUser = db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).get(options.sharedWithEmail) as { id: string } | undefined;

    if (sharedUser) {
      sharedWithId = sharedUser.id;
    }
  }

  // Insert permission
  try {
    db.prepare(`
      INSERT INTO sharing_permissions (
        id, owner_id, shared_with_id, share_type, genome_id,
        sensitivity_level, include_raw_data, allow_matching,
        can_download, can_share, status, expires_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      ownerId,
      sharedWithId,
      options.shareType,
      options.genomeId || null,
      options.sensitivityLevel || shareTypeConfig.defaultLevel,
      options.includeRawData ?? shareTypeConfig.allowsRawData ? 1 : 0,
      options.allowMatching ?? shareTypeConfig.allowsGeneticMatching ? 1 : 0,
      0, // can_download - default false
      0, // can_share - default false
      sharedWithId ? 'active' : 'pending',
      expiresAt,
      now,
      now
    );

    // Create share link for non-user sharing
    let shareLink: string | undefined;
    if (!sharedWithId) {
      const linkId = uuidv4().substring(0, 8);
      db.prepare(`
        INSERT INTO sharing_links (id, permission_id, token, created_at, clicks, max_clicks)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(linkId, id, uuidv4(), now, options.shareType === 'public' ? 1000 : 50);

      shareLink = `/share/${linkId}`;
    }

    return {
      success: true,
      permission: {
        id,
        userId: ownerId,
        sharedWithId,
        shareType: options.shareType,
        genomeId: options.genomeId || null,
        sensitivityLevel: options.sensitivityLevel || shareTypeConfig.defaultLevel,
        includeRawData: options.includeRawData ?? shareTypeConfig.allowsRawData,
        allowMatching: options.allowMatching ?? shareTypeConfig.allowsGeneticMatching,
        canDownload: false,
        canShare: false,
        status: sharedWithId ? 'active' : 'pending',
        expiresAt,
        createdAt: now,
        updatedAt: now,
        relationshipType: options.relationshipType,
      },
      shareLink,
    };
  } catch (error) {
    return { success: false, error: 'Failed to create share permission' };
  }
}

/**
 * Get all share permissions for a user
 */
export function getUserShares(userId: string): SharePermission[] {
  const db = getDb();

  const shares = db.prepare(`
    SELECT
      sp.id, sp.owner_id as userId, sp.shared_with_id as sharedWithId,
      sp.share_type as shareType, sp.genome_id as genomeId,
      sp.sensitivity_level as sensitivityLevel,
      sp.include_raw_data as includeRawData,
      sp.allow_matching as allowMatching,
      sp.can_download as canDownload, sp.can_share as canShare,
      sp.status, sp.expires_at as expiresAt,
      sp.created_at as createdAt, sp.updated_at as updatedAt,
      u.email as sharedWithEmail
    FROM sharing_permissions sp
    LEFT JOIN users u ON u.id = sp.shared_with_id
    WHERE sp.owner_id = ?
    ORDER BY sp.created_at DESC
  `).all(userId) as any[];

  return shares.map((s) => ({
    ...s,
    sharedWithEmail: s.sharedWithEmail,
  }));
}

/**
 * Get shares received by a user
 */
export function getReceivedShares(userId: string): SharePermission[] {
  const db = getDb();

  const shares = db.prepare(`
    SELECT
      sp.id, sp.owner_id as userId, sp.shared_with_id as sharedWithId,
      sp.share_type as shareType, sp.genome_id as genomeId,
      sp.sensitivity_level as sensitivityLevel,
      sp.include_raw_data as includeRawData,
      sp.allow_matching as allowMatching,
      sp.can_download as canDownload, sp.can_share as canShare,
      sp.status, sp.expires_at as expiresAt,
      sp.created_at as createdAt, sp.updated_at as updatedAt,
      u.email as ownerEmail
    FROM sharing_permissions sp
    JOIN users u ON u.id = sp.owner_id
    WHERE sp.shared_with_id = ? AND sp.status = 'active'
    ORDER BY sp.created_at DESC
  `).all(userId) as any[];

  return shares.map((s) => ({
    ...s,
    ownerEmail: s.ownerEmail,
  }));
}

/**
 * Check what data a user can access
 */
export function getAccessibleData(
  viewerId: string,
  ownerId: string,
  genomeId?: string
): {
  canAccess: boolean;
  sensitivityLevel: SensitivityLevel;
  includeRawData: boolean;
  allowMatching: boolean;
  genomes: string[];
} {
  const db = getDb();

  // Check for direct share
  const share = db.prepare(`
    SELECT
      sensitivity_level as sensitivityLevel,
      include_raw_data as includeRawData,
      allow_matching as allowMatching,
      expires_at as expiresAt,
      status
    FROM sharing_permissions
    WHERE owner_id = ? AND shared_with_id = ?
    AND (genome_id = ? OR genome_id IS NULL)
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
    ORDER BY sensitivity_level DESC
    LIMIT 1
  `).get(ownerId, viewerId, genomeId || 'all') as any;

  if (share) {
    // Get accessible genomes
    const genomes = db.prepare(`
      SELECT DISTINCT g.id
      FROM genomes g
      LEFT JOIN sharing_permissions sp ON sp.genome_id = g.id OR sp.genome_id IS NULL
      WHERE g.user_id = ?
      AND (sp.shared_with_id = ? OR sp.shared_with_id IS NULL)
      AND (sp.expires_at IS NULL OR sp.expires_at > datetime('now'))
    `).all(ownerId, viewerId) as { id: string }[];

    return {
      canAccess: true,
      sensitivityLevel: share.sensitivityLevel as SensitivityLevel,
      includeRawData: share.includeRawData === 1,
      allowMatching: share.allowMatching === 1,
      genomes: genomes.map((g) => g.id),
    };
  }

  return {
    canAccess: false,
    sensitivityLevel: 'normal',
    includeRawData: false,
    allowMatching: false,
    genomes: [],
  };
}

/**
 * Get filtered data based on share permissions
 */
export function getFilteredSharedData(
  viewerId: string,
  ownerId: string,
  genomeId?: string
): {
  success: boolean;
  data?: any;
  error?: string;
} {
  const access = getAccessibleData(viewerId, ownerId, genomeId);

  if (!access.canAccess) {
    return { success: false, error: 'No access to this data' };
  }

  // Get genome data filtered by sensitivity level
  const { filterSNPsBySensitivity } = require('./sensitiveData');
  const { getGenome, getUserSNPs } = require('./database');

  const genomes = access.genomes.map((id) => {
    const genome = getGenome(id);
    if (!genome) return null;

    const snps = getUserSNPs(id);
    const filteredSnps = filterSNPsBySensitivity(snps, ownerId, false)
      .filter((s) => s.sensitivityLevel === 'normal' || access.sensitivityLevel === 'highly_sensitive' || (access.sensitivityLevel === 'sensitive' && s.sensitivityLevel !== 'highly_sensitive'))
      .map((s) => ({
        rsid: s.rsid,
        gene: s.gene,
        genotype: s.genotype,
      }));

    return {
      id: genome.id,
      filename: access.includeRawData ? genome.filename : undefined,
      source: genome.source,
      snpCount: filteredSnps.length,
      snps: access.includeRawData ? filteredSnps : filteredSnps.slice(0, 100),
    };
  }).filter(Boolean);

  return {
    success: true,
    data: {
      ownerId,
      sensitivityLevel: access.sensitivityLevel,
      includeRawData: access.includeRawData,
      genomes,
    },
  };
}

/**
 * Revoke a share permission
 */
export function revokeShare(permissionId: string, ownerId: string): boolean {
  const db = getDb();

  const result = db.prepare(`
    UPDATE sharing_permissions
    SET status = 'revoked', updated_at = ?
    WHERE id = ? AND owner_id = ?
  `).run(new Date().toISOString(), permissionId, ownerId);

  return result.changes > 0;
}

/**
 * Family genetic matching
 */
export interface GeneticMatch {
  sharedUserId: string;
  relationshipType: string;
  sharedSegments: number;
  totalSnpsShared: number;
  relatednessScore: number;
}

export function findFamilyMatches(
  userId: string,
  minSharedSnps: number = 1000
): GeneticMatch[] {
  const db = getDb();

  // Find users who share data with matching enabled
  const shares = db.prepare(`
    SELECT DISTINCT sp.owner_id as ownerId
    FROM sharing_permissions sp
    WHERE sp.shared_with_id = ?
    AND sp.share_type = 'family'
    AND sp.status = 'active'
    AND sp.allow_matching = 1
    AND (sp.expires_at IS NULL OR sp.expires_at > datetime('now'))
  `).all(userId) as { ownerId: string }[];

  const matches: GeneticMatch[] = [];

  for (const share of shares) {
    // Get shared SNP overlap
    const overlap = db.prepare(`
      SELECT
        COUNT(*) as sharedSnps,
        (
          SELECT COUNT(*) FROM snps s1
          WHERE s1.genome_id IN (SELECT id FROM genomes WHERE user_id = ?)
        ) as totalUserSnps,
        (
          SELECT COUNT(*) FROM snps s2
          WHERE s2.genome_id IN (SELECT id FROM genomes WHERE user_id = ?)
        ) as totalOtherSnps
      FROM snps s1
      WHERE s1.genome_id IN (SELECT id FROM genomes WHERE user_id = ?)
      AND EXISTS (
        SELECT 1 FROM snps s2
        WHERE s2.genome_id IN (SELECT id FROM genomes WHERE user_id = ?)
        AND s2.rsid = s1.rsid
        AND s2.genotype = s1.genotype
      )
    `).get(userId, share.ownerId, userId, share.ownerId) as any;

    if (overlap && overlap.sharedSnps >= minSharedSnps) {
      // Calculate relatedness score
      const minSnps = Math.min(overlap.totalUserSnps, overlap.totalOtherSnps);
      const relatedness = (overlap.sharedSnps / minSnps) * 100;

      // Infer relationship based on relatedness
      let relationshipType = 'relative';
      if (relatedness > 45) relationshipType = 'parent/child or sibling';
      else if (relatedness > 25) relationshipType = 'grandparent/grandchild';
      else if (relatedness > 15) relationshipType = 'uncle/aunt or niece/nephew';
      else if (relatedness > 10) relationshipType = 'cousin';
      else relationshipType = 'distant relative';

      matches.push({
        sharedUserId: share.ownerId,
        relationshipType,
        sharedSegments: overlap.sharedSnps,
        totalSnpsShared: overlap.sharedSnps,
        relatednessScore: relatedness,
      });
    }
  }

  return matches.sort((a, b) => b.relatednessScore - a.relatednessScore);
}

export default {
  SHARE_TYPES,
  createSharePermission,
  getUserShares,
  getReceivedShares,
  getAccessibleData,
  getFilteredSharedData,
  revokeShare,
  findFamilyMatches,
};
