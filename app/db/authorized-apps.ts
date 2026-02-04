/**
 * Authorized Applications Module
 *
 * Manages API tokens for authorized applications (MCP server, CLI, etc.)
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getDb } from './connection';

export interface AuthorizedApplication {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  tokenPrefix: string;
  permissions: string[];
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

export interface CreateAuthorizedAppInput {
  name: string;
  description?: string;
  permissions?: string[];
  expiresAt?: Date | null;
}

export interface TokenResult {
  id: string;
  token: string; // Only returned once on creation
  tokenPrefix: string;
  name: string;
  permissions: string[];
}

// Permission constants
export const PERMISSIONS = {
  GENOME_READ: 'genome:read',
  GENOME_WRITE: 'genome:write',
  HEALTH_READ: 'health:read',
  HEALTH_WRITE: 'health:write',
  ANCESTRY_READ: 'ancestry:read',
  CARRIER_READ: 'carrier:read',
  RELATIVES_READ: 'relatives:read',
  REPORTS_READ: 'reports:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const SALT_LENGTH = 32;

/**
 * Create a new authorized application token
 */
export function createAuthorizedApp(
  userId: string,
  input: CreateAuthorizedAppInput
): TokenResult {
  const db = getDb();
  const id = uuidv4();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenPrefix = token.substring(0, 8);
  const now = new Date().toISOString();

  // Hash the token for storage
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const tokenHash = crypto.scryptSync(token, salt, 64).toString('hex') + ':' + salt;

  // Default permissions
  const permissions = input.permissions || [
    PERMISSIONS.GENOME_READ,
    PERMISSIONS.HEALTH_READ,
    PERMISSIONS.ANCESTRY_READ,
  ];

  db.prepare(`
    INSERT INTO authorized_applications (id, user_id, name, description, token_hash, token_prefix, permissions, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    input.name,
    input.description || null,
    tokenHash,
    tokenPrefix,
    JSON.stringify(permissions),
    now,
    input.expiresAt?.toISOString() || null
  );

  return {
    id,
    token,
    tokenPrefix,
    name: input.name,
    permissions,
  };
}

/**
 * Get all authorized applications for a user
 */
export function getUserAuthorizedApps(userId: string): AuthorizedApplication[] {
  const db = getDb();
  const results = db.prepare(`
    SELECT id, user_id, name, description, token_prefix, permissions, created_at, last_used_at, expires_at
    FROM authorized_applications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  return results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    tokenPrefix: row.token_prefix,
    permissions: JSON.parse(row.permissions || '[]'),
    createdAt: new Date(row.created_at),
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
  }));
}

/**
 * Get an authorized application by ID
 */
export function getAuthorizedAppById(id: string): AuthorizedApplication | null {
  const db = getDb();
  const result = db.prepare(`
    SELECT id, user_id, name, description, token_prefix, permissions, created_at, last_used_at, expires_at
    FROM authorized_applications
    WHERE id = ?
  `).get(id) as any | undefined;

  if (!result) return null;

  return {
    id: result.id,
    userId: result.user_id,
    name: result.name,
    description: result.description,
    tokenPrefix: result.token_prefix,
    permissions: JSON.parse(result.permissions || '[]'),
    createdAt: new Date(result.created_at),
    lastUsedAt: result.last_used_at ? new Date(result.last_used_at) : null,
    expiresAt: result.expires_at ? new Date(result.expires_at) : null,
  };
}

/**
 * Validate a token and return the application if valid
 */
export function validateToken(
  token: string
): (AuthorizedApplication & { user: { id: string; email: string } }) | null {
  const db = getDb();

  // Hash the provided token and search for match
  const prefix = token.substring(0, 8);
  const candidates = db.prepare(`
    SELECT id, user_id, name, description, token_hash, token_prefix, permissions, created_at, last_used_at, expires_at
    FROM authorized_applications
    WHERE token_prefix = ?
  `).all(prefix) as any[];

  for (const candidate of candidates) {
    const [hash, salt] = candidate.token_hash.split(':');
    const computedHash = crypto.scryptSync(token, salt, 64).toString('hex');

    if (hash === computedHash) {
      // Check expiration
      if (candidate.expires_at && new Date(candidate.expires_at) < new Date()) {
        return null;
      }

      // Update last_used_at
      db.prepare(`
        UPDATE authorized_applications
        SET last_used_at = datetime('now')
        WHERE id = ?
      `).run(candidate.id);

      // Get user email
      const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(candidate.user_id) as any;

      return {
        id: candidate.id,
        userId: candidate.user_id,
        name: candidate.name,
        description: candidate.description,
        tokenPrefix: candidate.token_prefix,
        permissions: JSON.parse(candidate.permissions || '[]'),
        createdAt: new Date(candidate.created_at),
        lastUsedAt: new Date(),
        expiresAt: candidate.expires_at ? new Date(candidate.expires_at) : null,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    }
  }

  return null;
}

/**
 * Delete an authorized application (revoke token)
 */
export function deleteAuthorizedApp(id: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM authorized_applications
    WHERE id = ? AND user_id = ?
  `).run(id, userId);

  return result.changes > 0;
}

/**
 * Rotate (regenerate) a token for an existing authorized app
 */
export function rotateToken(
  id: string,
  userId: string
): TokenResult | null {
  const db = getDb();

  // Verify the app exists and belongs to user
  const app = getAuthorizedAppById(id);
  if (!app || app.userId !== userId) {
    return null;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenPrefix = token.substring(0, 8);
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const tokenHash = crypto.scryptSync(token, salt, 64).toString('hex') + ':' + salt;

  db.prepare(`
    UPDATE authorized_applications
    SET token_hash = ?, token_prefix = ?, last_used_at = NULL
    WHERE id = ? AND user_id = ?
  `).run(tokenHash, tokenPrefix, id, userId);

  return {
    id,
    token,
    tokenPrefix,
    name: app.name,
    permissions: app.permissions,
  };
}

/**
 * Update permissions for an authorized app
 */
export function updateAppPermissions(
  id: string,
  userId: string,
  permissions: string[]
): boolean {
  const db = getDb();

  const result = db.prepare(`
    UPDATE authorized_applications
    SET permissions = ?
    WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(permissions), id, userId);

  return result.changes > 0;
}

/**
 * Check if a permission is granted
 */
export function hasPermission(app: AuthorizedApplication, permission: string): boolean {
  return app.permissions.includes(permission);
}

/**
 * Clean up expired tokens (for maintenance)
 */
export function cleanupExpiredTokens(): number {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM authorized_applications
    WHERE expires_at IS NOT NULL AND expires_at < datetime('now')
  `).run();

  return result.changes;
}
