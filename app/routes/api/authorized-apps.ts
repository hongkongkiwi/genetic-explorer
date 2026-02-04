import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { getSessionUser } from '~/utils/auth';
import {
  createAuthorizedApp,
  getUserAuthorizedApps,
  getAuthorizedAppById,
  deleteAuthorizedApp,
  rotateToken,
  updateAppPermissions,
  PERMISSIONS,
  type Permission,
} from '~/db/authorized-apps';
import { logActivity } from '~/utils/database';
import { getClientIp } from '~/utils/shared';

// GET - List all authorized applications
export const APIRouteList = createAPIFileRoute('/api/authorized-apps')({
  GET: async ({ request }) => {
    try {
      const auth = getSessionUser(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const apps = getUserAuthorizedApps(auth.id);
      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'authorized_apps_listed', 'authorized_app', null, { count: apps.length }, ipAddress);

      return json({
        success: true,
        applications: apps.map((app) => ({
          id: app.id,
          name: app.name,
          description: app.description,
          tokenPrefix: app.tokenPrefix,
          permissions: app.permissions,
          createdAt: app.createdAt.toISOString(),
          lastUsedAt: app.lastUsedAt?.toISOString() || null,
          expiresAt: app.expiresAt?.toISOString() || null,
        })),
      });
    } catch (error) {
      console.error('List authorized apps error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// POST - Create a new authorized application
export const APIRouteCreate = createAPIFileRoute('/api/authorized-apps')({
  POST: async ({ request }) => {
    try {
      const auth = getSessionUser(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { name, description, permissions, expiresAt } = body;

      if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
        return json({ success: false, error: 'Name must be between 1 and 100 characters' }, { status: 400 });
      }

      let validPermissions: Permission[] | undefined;
      if (permissions) {
        if (!Array.isArray(permissions)) {
          return json({ success: false, error: 'Permissions must be an array' }, { status: 400 });
        }
        const allPermissions = Object.values(PERMISSIONS);
        validPermissions = permissions.filter((p: string) => allPermissions.includes(p as Permission));
        if (validPermissions.length !== permissions.length) {
          return json({ success: false, error: 'Invalid permissions specified' }, { status: 400 });
        }
      }

      let expiresAtDate: Date | null = null;
      if (expiresAt) {
        const parsed = new Date(expiresAt);
        if (isNaN(parsed.getTime()) || parsed <= new Date()) {
          return json({ success: false, error: 'Invalid expiration date' }, { status: 400 });
        }
        expiresAtDate = parsed;
      }

      const result = createAuthorizedApp(auth.id, { name, description, permissions: validPermissions, expiresAt: expiresAtDate });
      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'authorized_app_created', 'authorized_app', result.id, { name, permissions: result.permissions }, ipAddress);

      return json({
        success: true,
        application: {
          id: result.id,
          token: result.token,
          tokenPrefix: result.tokenPrefix,
          name: result.name,
          permissions: result.permissions,
        },
        message: 'Token created successfully. Copy it now - you will not be able to see it again.',
      });
    } catch (error) {
      console.error('Create authorized app error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// DELETE - Delete an authorized application
export const APIRouteDelete = createAPIFileRoute('/api/authorized-apps/$id')({
  DELETE: async ({ request, params }) => {
    try {
      const auth = getSessionUser(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const deleted = deleteAuthorizedApp(params.id, auth.id);
      if (!deleted) {
        return json({ success: false, error: 'Application not found' }, { status: 404 });
      }

      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'authorized_app_revoked', 'authorized_app', params.id, {}, ipAddress);

      return json({ success: true, message: 'Application authorization revoked' });
    } catch (error) {
      console.error('Delete authorized app error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});

// POST - Rotate token
export const APIRouteRotate = createAPIFileRoute('/api/authorized-apps/$id/rotate')({
  POST: async ({ request, params }) => {
    try {
      const auth = getSessionUser(request);
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      const result = rotateToken(params.id, auth.id);
      if (!result) {
        return json({ success: false, error: 'Application not found' }, { status: 404 });
      }

      const ipAddress = getClientIp(request);
      logActivity(auth.id, 'authorized_app_token_rotated', 'authorized_app', params.id, {}, ipAddress);

      return json({
        success: true,
        application: {
          id: result.id,
          token: result.token,
          tokenPrefix: result.tokenPrefix,
          name: result.name,
          permissions: result.permissions,
        },
        message: 'Token rotated successfully.',
      });
    } catch (error) {
      console.error('Rotate token error:', error);
      return json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
  },
});
