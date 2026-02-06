/**
 * Data Access Control
 * 
 * Manages access permissions for genetic data and resources.
 */

import { getGenome, canAccessGenome as dbCanAccessGenome } from '~/db';

export class DataAccessError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'DataAccessError';
  }
}

/**
 * Verify if a user owns a resource
 */
export function verifyOwnership(
  userId: string,
  resourceId: string,
  resourceType: string
): { isOwner: boolean; error?: DataAccessError } {
  try {
    switch (resourceType) {
      case 'genome': {
        const genome = getGenome(resourceId);
        if (!genome) {
          return { isOwner: false, error: new DataAccessError('Resource not found', 'NOT_FOUND') };
        }
        // Check if genome belongs to user
        const isOwner = (genome as any).userId === userId || (genome as any).user_id === userId;
        return { isOwner };
      }
      
      default:
        return { isOwner: false, error: new DataAccessError('Unknown resource type', 'INVALID_TYPE') };
    }
  } catch (error) {
    return { isOwner: false, error: new DataAccessError('Verification failed', 'ERROR') };
  }
}

/**
 * Check if user can access a genome
 */
export function canAccessGenome(
  userId: string,
  genomeId: string
): { canAccess: boolean; permissionLevel: 'owner' | 'shared' | 'none'; error?: DataAccessError } {
  try {
    // Check database access
    const hasAccess = dbCanAccessGenome(userId, genomeId);
    
    if (!hasAccess) {
      return { canAccess: false, permissionLevel: 'none' };
    }
    
    // Check ownership
    const { isOwner } = verifyOwnership(userId, genomeId, 'genome');
    
    return {
      canAccess: true,
      permissionLevel: isOwner ? 'owner' : 'shared',
    };
  } catch (error) {
    return {
      canAccess: false,
      permissionLevel: 'none',
      error: new DataAccessError('Access check failed', 'ERROR'),
    };
  }
}

/**
 * Check general data access
 */
export function checkDataAccess(
  userId: string,
  resourceId: string
): { canAccess: boolean; permissionLevel: 'owner' | 'shared' | 'none' } {
  const result = canAccessGenome(userId, resourceId);
  return {
    canAccess: result.canAccess,
    permissionLevel: result.permissionLevel,
  };
}

/**
 * Require data access for a resource type
 * Throws if access is denied
 */
export function requireDataAccess(resourceType: string) {
  return {
    check: (userId: string, resourceId: string) => {
      const { canAccess, permissionLevel } = checkDataAccess(userId, resourceId);
      
      if (!canAccess) {
        throw new DataAccessError(
          `Access denied to ${resourceType}`,
          'ACCESS_DENIED'
        );
      }
      
      return { canAccess, permissionLevel };
    },
  };
}

/**
 * Middleware helper for API routes
 */
export function requireOwnership(userId: string, resourceId: string, resourceType: string): void {
  const { isOwner, error } = verifyOwnership(userId, resourceId, resourceType);
  
  if (error) {
    throw error;
  }
  
  if (!isOwner) {
    throw new DataAccessError('Ownership required', 'NOT_OWNER');
  }
}
