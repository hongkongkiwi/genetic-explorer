/**
 * Data Access Control - Ensures User Data Segregation
 *
 * This module provides utilities for ensuring all data access
 * is properly filtered by user_id to maintain data isolation.
 *
 * Key principle: Every database query that accesses user data
 * MUST include a WHERE clause filtering by the authenticated user's ID.
 */

import { getDb, logActivity } from './database';
import { getAuthUser, requireAuth } from './auth';
import type { User } from './database';

// ============================================================================
// Access Control Errors
// ============================================================================

export class DataAccessError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND',
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(message);
    this.name = 'DataAccessError';
  }
}

// ============================================================================
// Resource Ownership Types
// ============================================================================

export type ResourceType =
  | 'genome'
  | 'report'
  | 'profile'
  | 'sharing_permission'
  | 'sharing_invite'
  | 'snp_favorite'
  | 'activity_log'
  | 'session'
  | 'oauth_account';

interface OwnershipCheck {
  resourceType: ResourceType;
  resourceId: string;
  userId: string;
  additionalOwnerId?: string; // For shared resources
}

// ============================================================================
// Ownership Verification Functions
// ============================================================================

/**
 * Verify that a user owns a specific resource
 * Throws DataAccessError if ownership is not confirmed
 */
export async function verifyOwnership(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<void> {
  const db = getDb();

  let query: string | null = null;
  let params: string[] = [];

  switch (resourceType) {
    case 'genome':
      query = 'SELECT id FROM genomes WHERE id = ? AND user_id = ?';
      params = [resourceId, userId];
      break;

    case 'report':
      query = 'SELECT id FROM reports WHERE id = ? AND user_id = ?';
      params = [resourceId, userId];
      break;

    case 'profile':
      query = 'SELECT id FROM profiles WHERE user_id = ?';
      params = [userId];
      break;

    case 'sharing_permission':
      // Owner can access, or shared user can access
      query = `
        SELECT id FROM sharing_permissions
        WHERE id = ? AND (owner_id = ? OR shared_with_id = ?)
      `;
      params = [resourceId, userId, userId];
      break;

    case 'sharing_invite':
      query = 'SELECT id FROM sharing_invites WHERE id = ? AND owner_id = ?';
      params = [resourceId, userId];
      break;

    case 'snp_favorite':
      query = 'SELECT rsid FROM snp_favorites WHERE rsid = ? AND user_id = ?';
      params = [resourceId, userId];
      break;

    case 'activity_log':
      // Users can only access their own activity
      query = 'SELECT id FROM activity_logs WHERE user_id = ?';
      params = [userId];
      break;

    case 'session':
      // Users can only access their own sessions
      query = 'SELECT id FROM sessions WHERE user_id = ?';
      params = [userId];
      break;

    case 'oauth_account':
      query = 'SELECT id FROM oauth_accounts WHERE user_id = ?';
      params = [userId];
      break;

    default:
      throw new DataAccessError(
        `Unknown resource type: ${resourceType}`,
        'FORBIDDEN',
        resourceType,
        resourceId
      );
  }

  if (!query) return;

  const result = db.prepare(query).get(...params) as any;

  if (!result) {
    throw new DataAccessError(
      `Access denied: You do not have permission to access this ${resourceType}`,
      'FORBIDDEN',
      resourceType,
      resourceId
    );
  }
}

/**
 * Check if user can access a genome (ownership or shared)
 */
export async function canAccessGenome(
  userId: string,
  genomeId: string
): Promise<{ canAccess: boolean; permissionLevel: 'owner' | 'view' | 'download' | 'manage' | null }> {
  const db = getDb();

  // Check ownership first
  const owner = db.prepare(`
    SELECT id FROM genomes WHERE id = ? AND user_id = ?
  `).get(genomeId, userId) as any;

  if (owner) {
    return { canAccess: true, permissionLevel: 'owner' };
  }

  // Check sharing permissions
  const shared = db.prepare(`
    SELECT permission_level FROM sharing_permissions
    WHERE genome_id = ? AND shared_with_id = ?
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).get(genomeId, userId) as any;

  if (shared) {
    return { canAccess: true, permissionLevel: shared.permission_level };
  }

  // Check if there's a global sharing permission (null genome_id)
  const globalShared = db.prepare(`
    SELECT permission_level FROM sharing_permissions
    WHERE genome_id IS NULL AND shared_with_id = ?
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).get(userId) as any;

  if (globalShared) {
    return { canAccess: true, permissionLevel: globalShared.permission_level };
  }

  return { canAccess: false, permissionLevel: null };
}

/**
 * Verify genome access and throw if not allowed
 */
export async function verifyGenomeAccess(
  userId: string,
  genomeId: string,
  requiredLevel: 'view' | 'download' | 'manage' = 'view'
): Promise<void> {
  const access = await canAccessGenome(userId, genomeId);

  if (!access.canAccess) {
    throw new DataAccessError(
      'Access denied: You do not have permission to access this genome',
      'FORBIDDEN',
      'genome',
      genomeId
    );
  }

  const levelHierarchy = ['view', 'download', 'manage'];
  const userLevelIndex = levelHierarchy.indexOf(access.permissionLevel || 'view');
  const requiredIndex = levelHierarchy.indexOf(requiredLevel);

  if (userLevelIndex < requiredIndex) {
    throw new DataAccessError(
      `Access denied: This action requires ${requiredLevel} permission`,
      'FORBIDDEN',
      'genome',
      genomeId
    );
  }
}

/**
 * Get all genomes a user can access (own + shared)
 */
export async function getAccessibleGenomes(userId: string): Promise<string[]> {
  const db = getDb();

  const owned = db.prepare(`
    SELECT id FROM genomes WHERE user_id = ?
  `).all(userId) as { id: string }[];

  const shared = db.prepare(`
    SELECT DISTINCT COALESCE(sp.genome_id, g.id) as id
    FROM sharing_permissions sp
    LEFT JOIN genomes g ON sp.genome_id = g.id OR sp.genome_id IS NULL
    WHERE sp.shared_with_id = ? AND sp.status = 'active'
    AND (sp.expires_at IS NULL OR sp.expires_at > datetime('now'))
  `).all(userId) as { id: string }[];

  const ownedIds = new Set(owned.map((g) => g.id));
  const sharedIds = new Set(shared.map((g) => g.id));

  // Combine and return unique IDs
  return [...ownedIds, ...sharedIds];
}

// ============================================================================
// Query Builders with Automatic User Filtering
// ============================================================================

/**
 * Get a filtered query wrapper that automatically adds user_id filter
 */
export function createUserFilteredQuery<T extends Record<string, any>>(
  tableName: string,
  idColumn: string
) {
  return {
    /**
     * Get single record by ID, ensuring user ownership
     */
    getById: (userId: string, id: string): T | null => {
      const db = getDb();
      const record = db.prepare(`
        SELECT * FROM ${tableName}
        WHERE ${idColumn} = ? AND user_id = ?
      `).get(id, userId) as T | undefined;
      return record || null;
    },

    /**
     * Get all records for a user
     */
    getAll: (userId: string, limit = 100): T[] => {
      const db = getDb();
      return db.prepare(`
        SELECT * FROM ${tableName}
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(userId, limit) as T[];
    },

    /**
     * Check if record exists and belongs to user
     */
    existsForUser: (userId: string, id: string): boolean => {
      const db = getDb();
      const result = db.prepare(`
        SELECT 1 FROM ${tableName}
        WHERE ${idColumn} = ? AND user_id = ?
      `).get(id, userId);
      return !!result;
    },

    /**
     * Delete record by ID, ensuring user ownership
     */
    deleteForUser: (userId: string, id: string): boolean => {
      const db = getDb();
      const result = db.prepare(`
        DELETE FROM ${tableName}
        WHERE ${idColumn} = ? AND user_id = ?
      `).run(id, userId);
      return result.changes > 0;
    },
  };
}

// ============================================================================
// Secure Delete with Verification
// ============================================================================

export interface DeleteVerification {
  userId: string;
  resourceType: ResourceType;
  resourceId: string;
  timestamp: number;
  signature?: string;
}

/**
 * Create a verified deletion context
 */
export function createDeleteVerification(
  userId: string,
  resourceType: ResourceType,
  resourceId: string
): DeleteVerification {
  return {
    userId,
    resourceType,
    resourceId,
    timestamp: Date.now(),
  };
}

/**
 * Verify and perform a secure deletion
 */
export async function performSecureDelete(
  verification: DeleteVerification
): Promise<{ success: boolean; error?: string }> {
  // Check timestamp (deletion must happen within 5 minutes)
  if (Date.now() - verification.timestamp > 5 * 60 * 1000) {
    return { success: false, error: 'Verification expired. Please try again.' };
  }

  // Verify ownership
  try {
    await verifyOwnership(
      verification.userId,
      verification.resourceType,
      verification.resourceId
    );
  } catch (error) {
    if (error instanceof DataAccessError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Access denied' };
  }

  // Perform deletion
  const db = getDb();
  let query: string;
  let params: string[];

  switch (verification.resourceType) {
    case 'genome':
      query = 'DELETE FROM genomes WHERE id = ? AND user_id = ?';
      break;
    case 'report':
      query = 'DELETE FROM reports WHERE id = ? AND user_id = ?';
      break;
    case 'activity_log':
      query = 'DELETE FROM activity_logs WHERE user_id = ?';
      params = [verification.userId];
      break;
    default:
      return { success: false, error: `Cannot delete ${verification.resourceType}` };
  }

  if (!params) params = [verification.resourceId, verification.userId];

  const result = db.prepare(query).run(...params);

  return { success: result.changes > 0 };
}

// ============================================================================
// Audit Logging for Data Access
// ============================================================================

export interface AccessAuditLog {
  userId: string;
  action: 'view' | 'export' | 'share' | 'delete' | 'modify';
  resourceType: ResourceType;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Log data access for audit purposes
 */
export function logDataAccess(audit: AccessAuditLog): void {
  logActivity(
    audit.userId,
    `data_access_${audit.action}`,
    audit.resourceType,
    audit.resourceId,
    audit.details,
    audit.ipAddress
  );
}

// ============================================================================
// Middleware Helpers for API Routes
// ============================================================================

/**
 * Require ownership check for a resource
 * Use this at the start of API handlers
 */
export async function requireResourceOwnership(
  request: Request,
  resourceType: ResourceType,
  resourceId: string
): Promise<{ userId: string }> {
  const auth = getAuthUser(request);
  if (!auth.user || !auth.token) {
    throw new DataAccessError('Authentication required', 'UNAUTHORIZED');
  }

  await verifyOwnership(auth.user.id, resourceType, resourceId);

  return { userId: auth.user.id };
}

/**
 * Require genome access check
 */
export async function requireGenomeAccess(
  request: Request,
  genomeId: string,
  requiredLevel: 'view' | 'download' | 'manage' = 'view'
): Promise<{ userId: string; permissionLevel: string }> {
  const auth = getAuthUser(request);
  if (!auth.user || !auth.token) {
    throw new DataAccessError('Authentication required', 'UNAUTHORIZED');
  }

  await verifyGenomeAccess(auth.user.id, genomeId, requiredLevel);

  const access = await canAccessGenome(auth.user.id, genomeId);

  return { userId: auth.user.id, permissionLevel: access.permissionLevel || 'view' };
}
