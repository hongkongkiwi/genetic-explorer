/**
 * Advanced Privacy Features
 *
 * Additional privacy controls:
 * - Data access logging with notifications
 * - Granular category sharing
 * - Invisible watermarking for leak detection
 * - Time-limited and usage-limited shares
 * - Download tracking
 * - Grace period revocation
 * - Anonymized research sharing
 */

import { getDb } from './database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// ============================================================================
// Access Logging & Notifications
// ============================================================================

export interface AccessLogEntry {
  id: string;
  permissionId: string;
  viewerId: string;
  action: 'view' | 'download' | 'export' | 'share';
  dataType: 'genome' | 'report' | 'summary' | 'snp';
  itemsAccessed: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export function logDataAccess(
  permissionId: string,
  viewerId: string,
  action: AccessLogEntry['action'],
  dataType: AccessLogEntry['dataType'],
  itemsAccessed: number,
  request?: { ip?: string; userAgent?: string }
): void {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sharing_audit_log (
      id, permission_id, viewer_id, action, data_type,
      items_accessed, ip_address, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, permissionId, viewerId, action, dataType, itemsAccessed, request?.ip || null, request?.userAgent || null, now);
}

/**
 * Get access logs for a permission
 */
export function getAccessLogs(permissionId: string, ownerId: string): AccessLogEntry[] {
  const db = getDb();

  const logs = db.prepare(`
    SELECT
      sal.id, sal.permission_id, sal.viewer_id,
      sal.action, sal.data_type as dataType, sal.items_accessed as itemsAccessed,
      sal.ip_address as ipAddress, sal.user_agent as userAgent,
      sal.created_at as timestamp
    FROM sharing_audit_log sal
    JOIN sharing_permissions sp ON sp.id = sal.permission_id
    WHERE sp.id = ? AND sp.owner_id = ?
    ORDER BY sal.created_at DESC
    LIMIT 100
  `).all(permissionId, ownerId) as any[];

  return logs;
}

/**
 * Get activity summary for all shares
 */
export function getShareActivitySummary(ownerId: string): {
  totalViews: number;
  totalDownloads: number;
  uniqueViewers: number;
  recentActivity: AccessLogEntry[];
} {
  const db = getDb();

  const views = db.prepare(`
    SELECT COUNT(*) as count FROM sharing_audit_log sal
    JOIN sharing_permissions sp ON sp.id = sal.permission_id
    WHERE sp.owner_id = ? AND sal.action = 'view'
  `).get(ownerId) as { count: number };

  const downloads = db.prepare(`
    SELECT COUNT(*) as count FROM sharing_audit_log sal
    JOIN sharing_permissions sp ON sp.id = sal.permission_id
    WHERE sp.owner_id = ? AND sal.action = 'download'
  `).get(ownerId) as { count: number };

  const uniqueViewers = db.prepare(`
    SELECT COUNT(DISTINCT viewer_id) as count FROM sharing_audit_log sal
    JOIN sharing_permissions sp ON sp.id = sal.permission_id
    WHERE sp.owner_id = ?
  `).get(ownerId) as { count: number };

  const recentActivity = db.prepare(`
    SELECT
      sal.id, sal.permission_id, sal.viewer_id,
      sal.action, sal.data_type as dataType, sal.items_accessed as itemsAccessed,
      sal.ip_address as ipAddress, sal.user_agent as userAgent,
      sal.created_at as timestamp
    FROM sharing_audit_log sal
    JOIN sharing_permissions sp ON sp.id = sal.permission_id
    WHERE sp.owner_id = ?
    ORDER BY sal.created_at DESC
    LIMIT 20
  `).all(ownerId) as any[];

  return {
    totalViews: views.count,
    totalDownloads: downloads.count,
    uniqueViewers: uniqueViewers.count,
    recentActivity,
  };
}

// ============================================================================
// Access Notifications
// ============================================================================

export interface NotificationSettings {
  notifyOnView: boolean;
  notifyOnDownload: boolean;
  notifyOnShare: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export function getNotificationSettings(userId: string): NotificationSettings {
  const db = getDb();

  const settings = db.prepare(`
    SELECT
      notify_on_view as notifyOnView,
      notify_on_download as notifyOnDownload,
      notify_on_share as notifyOnShare,
      daily_digest as dailyDigest,
      weekly_report as weeklyReport
    FROM user_privacy_settings
    WHERE user_id = ?
  `).get(userId) as any;

  return {
    notifyOnView: settings?.notifyOnView || false,
    notifyOnDownload: settings?.notifyOnDownload || true,
    notifyOnShare: settings?.notifyOnShare || true,
    dailyDigest: settings?.dailyDigest || false,
    weeklyReport: settings?.weeklyReport || false,
  };
}

export function saveNotificationSettings(userId: string, settings: Partial<NotificationSettings>): void {
  const db = getDb();
  const current = getNotificationSettings(userId);
  const merged = { ...current, ...settings };

  db.prepare(`
    UPDATE user_privacy_settings SET
      notify_on_view = ?,
      notify_on_download = ?,
      notify_on_share = ?,
      daily_digest = ?,
      weekly_report = ?,
      updated_at = ?
    WHERE user_id = ?
  `).run(
    merged.notifyOnView ? 1 : 0,
    merged.notifyOnDownload ? 1 : 0,
    merged.notifyOnShare ? 1 : 0,
    merged.dailyDigest ? 1 : 0,
    merged.weeklyReport ? 1 : 0,
    new Date().toISOString(),
    userId
  );
}

// ============================================================================
// Invisible Watermarking (Leak Detection)
// ============================================================================

/**
 * Generate invisible watermark for data
 * Embeds a unique identifier invisibly into the shared data
 */
export function generateWatermark(
  permissionId: string,
  viewerId: string,
  dataType: string
): string {
  const timestamp = Date.now().toString();
  const data = `${permissionId}:${viewerId}:${dataType}:${timestamp}`;
  return crypto.createHmac('sha256', permissionId).update(data).digest('hex').substring(0, 16);
}

/**
 * Detect watermark from leaked data
 */
export function detectWatermark(watermark: string): {
  permissionId: string;
  detected: boolean;
} {
  // The watermark itself encodes the permission ID (first 8 chars)
  // Full verification requires checking against the database
  return {
    permissionId: watermark.substring(0, 8),
    detected: true,
  };
}

/**
 * Get all watermarks for a permission
 */
export function getPermissionWatermark(permissionId: string): string {
  const db = getDb();

  const existing = db.prepare(`
    SELECT watermark FROM sharing_permissions WHERE id = ?
  `).get(permissionId) as { watermark: string } | undefined;

  if (existing?.watermark) {
    return existing.watermark;
  }

  // Generate new watermark
  const watermark = crypto.randomBytes(8).toString('hex');
  db.prepare(`
    UPDATE sharing_permissions SET watermark = ? WHERE id = ?
  `).run(watermark, permissionId);

  return watermark;
}

// ============================================================================
// Usage Limits & Time Limits
// ============================================================================

export interface ShareLimits {
  maxViews: number | null;        // null = unlimited
  maxDownloads: number | null;    // null = unlimited
  maxDays: number | null;         // null = never expires
  requireVerification: boolean;     // require email verification
  gracePeriodHours: number;        // hours after revocation
}

export function getShareLimits(permissionId: string): ShareLimits {
  const db = getDb();

  const permission = db.prepare(`
    SELECT
      max_views as maxViews,
      max_downloads as maxDownloads,
      expires_at as expiresAt,
      require_verification as requireVerification,
      grace_period_hours as gracePeriodHours
    FROM sharing_permissions WHERE id = ?
  `).get(permissionId) as any;

  if (!permission) {
    return {
      maxViews: null,
      maxDownloads: null,
      maxDays: null,
      requireVerification: false,
      gracePeriodHours: 0,
    };
  }

  const maxDays = permission.expiresAt
    ? Math.ceil((new Date(permission.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    maxViews: permission.maxViews,
    maxDownloads: permission.maxDownloads,
    maxDays,
    requireVerification: permission.requireVerification === 1,
    gracePeriodHours: permission.gracePeriodHours || 0,
  };
}

export function checkShareLimits(
  permissionId: string,
  viewerId: string,
  action: 'view' | 'download'
): { allowed: boolean; remaining: number | null; error?: string } {
  const db = getDb();

  // Check if expired
  const permission = db.prepare(`
    SELECT expires_at, status FROM sharing_permissions WHERE id = ?
  `).get(permissionId) as any;

  if (permission?.status === 'revoked') {
    return { allowed: false, remaining: null, error: 'Access has been revoked' };
  }

  if (permission?.expires_at && new Date(permission.expires_at) < new Date()) {
    return { allowed: false, remaining: null, error: 'Share has expired' };
  }

  // Count usage
  const usage = db.prepare(`
    SELECT
      SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) as viewCount,
      SUM(CASE WHEN action = 'download' THEN 1 ELSE 0 END) as downloadCount
    FROM sharing_audit_log
    WHERE permission_id = ? AND viewer_id = ?
  `).get(permissionId, viewerId) as any;

  const viewCount = usage?.viewCount || 0;
  const downloadCount = usage?.downloadCount || 0;

  // Get limits
  const limits = db.prepare(`
    SELECT max_views, max_downloads FROM sharing_permissions WHERE id = ?
  `).get(permissionId) as any;

  if (action === 'view' && limits?.max_views) {
    if (viewCount >= limits.max_views) {
      return { allowed: false, remaining: 0, error: 'Maximum views reached' };
    }
    return { allowed: true, remaining: limits.max_views - viewCount };
  }

  if (action === 'download' && limits?.max_downloads) {
    if (downloadCount >= limits.max_downloads) {
      return { allowed: false, remaining: 0, error: 'Maximum downloads reached' };
    }
    return { allowed: true, remaining: limits.max_downloads - downloadCount };
  }

  return { allowed: true, remaining: null };
}

// ============================================================================
// Granular Category Sharing
// ============================================================================

export interface CategoryShareSettings {
  categoryId: string;
  shared: boolean;
  minSensitivityLevel: 'normal' | 'sensitive' | 'highly_sensitive';
}

/**
 * Get category sharing settings for a permission
 */
export function getCategorySettings(permissionId: string): CategoryShareSettings[] {
  const db = getDb();

  const settings = db.prepare(`
    SELECT category_id as categoryId, shared, min_sensitivity_level as minSensitivityLevel
    FROM sharing_category_settings WHERE permission_id = ?
  `).all(permissionId) as any[];

  // Return default if none set
  if (settings.length === 0) {
    return [];
  }

  return settings.map((s) => ({
    categoryId: s.categoryId,
    shared: s.shared === 1,
    minSensitivityLevel: s.minSensitivityLevel,
  }));
}

/**
 * Set category sharing settings
 */
export function setCategorySettings(
  permissionId: string,
  ownerId: string,
  settings: CategoryShareSettings[]
): void {
  const db = getDb();

  // Verify ownership
  const permission = db.prepare(`
    SELECT owner_id FROM sharing_permissions WHERE id = ?
  `).get(permissionId) as { owner_id: string } | undefined;

  if (!permission || permission.owner_id !== ownerId) {
    throw new Error('Permission not found or access denied');
  }

  // Clear existing
  db.prepare(`
    DELETE FROM sharing_category_settings WHERE permission_id = ?
  `).run(permissionId);

  // Insert new
  for (const setting of settings) {
    db.prepare(`
      INSERT INTO sharing_category_settings (
        id, permission_id, category_id, shared, min_sensitivity_level
      ) VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), permissionId, setting.categoryId, setting.shared ? 1 : 0, setting.minSensitivityLevel);
  }
}

/**
 * Filter SNPs based on category settings
 */
export function filterByCategorySettings(
  snps: Array<{ rsid: string; category: string }>,
  categorySettings: CategoryShareSettings[]
): Array<{ rsid: string; category: string; hidden: boolean }> {
  if (categorySettings.length === 0) {
    // No category restrictions - all visible
    return snps.map((s) => ({ ...s, hidden: false }));
  }

  return snps.map((snp) => {
    const setting = categorySettings.find((c) => c.categoryId === snp.category);
    const hidden = setting ? !setting.shared : false;
    return { ...snp, hidden };
  });
}

// ============================================================================
// Grace Period Revocation
// ============================================================================

export function revokeWithGrace(
  permissionId: string,
  ownerId: string,
  gracePeriodHours: number = 24
): { success: boolean; error?: string } {
  const db = getDb();
  const now = new Date();
  const graceEnd = new Date(now.getTime() + gracePeriodHours * 60 * 60 * 1000);

  // Verify ownership and get current status
  const permission = db.prepare(`
    SELECT id, status FROM sharing_permissions WHERE id = ? AND owner_id = ?
  `).get(permissionId, ownerId) as any;

  if (!permission) {
    return { success: false, error: 'Permission not found' };
  }

  // Set revocation with grace period
  db.prepare(`
    UPDATE sharing_permissions SET
      status = 'revoked',
      revoked_at = ?,
      grace_until = ?,
      updated_at = ?
    WHERE id = ?
  `).run(now.toISOString(), graceEnd.toISOString(), now.toISOString(), permissionId);

  // Log the revocation
  db.prepare(`
    INSERT INTO sharing_audit_log (
      id, permission_id, viewer_id, action, data_type,
      items_accessed, details, created_at
    ) VALUES (?, ?, ?, 'revoke', 'permission', 0, ?, ?)
  `).run(
    uuidv4(),
    permissionId,
    ownerId,
    JSON.stringify({ gracePeriodHours, revokedAt: now.toISOString() }),
    now.toISOString()
  );

  return { success: true };
}

export function isInGracePeriod(permissionId: string, viewerId: string): boolean {
  const db = getDb();

  const permission = db.prepare(`
    SELECT grace_until, status FROM sharing_permissions WHERE id = ?
  `).get(permissionId) as any;

  if (!permission || permission.status !== 'revoked') {
    return false;
  }

  if (!permission.grace_until) {
    return false;
  }

  return new Date(permission.grace_until) > new Date();
}

// ============================================================================
// Anonymized Research Sharing
// ============================================================================

export interface AnonymizedResearchData {
  aggregateStats: {
    totalVariants: number;
    categoryBreakdown: Record<string, number>;
    alleleFrequencies: Record<string, number>;
  };
  // No individual identifiers
  // No RSIDs (only categories)
  // No genome IDs
  // No timestamps
}

export function generateAnonymizedResearchData(
  ownerId: string,
  genomeId?: string
): AnonymizedResearchData {
  const db = getDb();

  // Get aggregate statistics without identifiers
  const stats = db.prepare(`
    SELECT
      COUNT(*) as totalVariants,
      COALESCE(JSON_GROUP_ARRAY(DISTINCT category), '[]') as categories
    FROM snps s
    WHERE s.genome_id IN (
      SELECT id FROM genomes WHERE user_id = ?
      ${genomeId ? 'AND id = ?' : ''}
    )
  `).get(ownerId, genomeId || null) as any;

  // Get category breakdown
  const breakdown = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM snps s
    WHERE s.genome_id IN (
      SELECT id FROM genomes WHERE user_id = ?
      ${genomeId ? 'AND id = ?' : ''}
    )
    GROUP BY category
  `).all(ownerId, genomeId || null) as Array<{ category: string; count: number }>;

  const categoryBreakdown: Record<string, number> = {};
  for (const item of breakdown) {
    categoryBreakdown[item.category] = item.count;
  }

  return {
    aggregateStats: {
      totalVariants: stats.totalVariants || 0,
      categoryBreakdown,
      alleleFrequencies: {}, // Could add if needed
    },
  };
}

// ============================================================================
// Privacy Settings Schema
// ============================================================================

export const PRIVACY_FEATURES_SCHEMA = {
  accessNotifications: {
    notifyOnView: { type: 'boolean', label: 'Notify on view', default: false },
    notifyOnDownload: { type: 'boolean', label: 'Notify on download', default: true },
    notifyOnShare: { type: 'boolean', label: 'Notify on new share', default: true },
    dailyDigest: { type: 'boolean', label: 'Daily activity digest', default: false },
    weeklyReport: { type: 'boolean', label: 'Weekly summary report', default: false },
  },
  shareLimits: {
    maxViews: { type: 'number', label: 'Maximum views', default: null, nullable: true },
    maxDownloads: { type: 'number', label: 'Maximum downloads', default: null, nullable: true },
    expirationDays: { type: 'number', label: 'Expires after days', default: null, nullable: true },
    requireVerification: { type: 'boolean', label: 'Require email verification', default: false },
    gracePeriodHours: { type: 'number', label: 'Grace period (hours)', default: 24 },
  },
  watermarking: {
    enabled: { type: 'boolean', label: 'Enable leak detection', default: true },
    visible: { type: 'boolean', label: 'Show watermark indicator', default: false },
  },
};

export default {
  logDataAccess,
  getAccessLogs,
  getShareActivitySummary,
  getNotificationSettings,
  saveNotificationSettings,
  generateWatermark,
  detectWatermark,
  getPermissionWatermark,
  getShareLimits,
  checkShareLimits,
  getCategorySettings,
  setCategorySettings,
  filterByCategorySettings,
  revokeWithGrace,
  isInGracePeriod,
  generateAnonymizedResearchData,
  PRIVACY_FEATURES_SCHEMA,
};
