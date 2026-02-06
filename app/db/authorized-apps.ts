/**
 * Authorized Apps - stub implementation
 */
import { getDb } from './index';

export type Permission = string;

export const PERMISSIONS: Record<string, Permission> = {
  READ_GENOME: 'read:genome',
  WRITE_GENOME: 'write:genome',
  READ_REPORTS: 'read:reports',
  READ_PROFILE: 'read:profile',
};

export interface AuthorizedApp {
  id: string;
  userId: string;
  name: string;
  description?: string;
  appName: string;
  permissions: string[];
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  tokenPrefix: string;
}

export interface CreateAuthorizedAppResult extends AuthorizedApp {
  token: string;
}

export function getAuthorizedApps(_userId: string): AuthorizedApp[] {
  return [];
}

export function getUserAuthorizedApps(_userId: string): AuthorizedApp[] {
  return [];
}

export function getAuthorizedAppById(_id: string, _userId: string): AuthorizedApp | null {
  return null;
}

export function createAuthorizedApp(
  _userId: string,
  _data: { name: string; description?: string; permissions?: string[]; expiresAt?: Date | null }
): CreateAuthorizedAppResult {
  return {
    id: 'stub-id',
    userId: _userId,
    name: _data.name,
    description: _data.description,
    appName: _data.name,
    permissions: _data.permissions || [],
    createdAt: new Date(),
    tokenPrefix: 'stub',
    token: 'stub-token-' + crypto.randomUUID(),
  };
}

export function authorizeApp(
  _userId: string,
  _appName: string,
  _permissions: string[]
): AuthorizedApp {
  return {
    id: 'stub-id',
    userId: _userId,
    name: _appName,
    appName: _appName,
    permissions: _permissions,
    createdAt: new Date(),
    tokenPrefix: 'stub',
  };
}

export function deleteAuthorizedApp(_id: string, _userId: string): boolean {
  return true;
}

export function revokeAppAuthorization(_userId: string, _appId: string): boolean {
  return true;
}

export function rotateToken(_id: string, _userId: string): CreateAuthorizedAppResult | null {
  return {
    id: _id,
    userId: _userId,
    name: 'Rotated App',
    appName: 'Rotated App',
    permissions: [],
    createdAt: new Date(),
    tokenPrefix: 'stub',
    token: 'new-token-' + crypto.randomUUID(),
  };
}

export function updateAppPermissions(
  _id: string,
  _userId: string,
  _permissions: string[]
): boolean {
  return true;
}
