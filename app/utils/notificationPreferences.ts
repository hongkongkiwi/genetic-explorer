/**
 * Notification Preferences
 * 
 * Manages user notification preferences with the following rules:
 * - Critical security notifications CANNOT be disabled
 * - Users can control marketing emails
 * - Users can control non-critical notifications
 */

import { getDb } from './database';

// Notification categories
export type NotificationCategory = 
  | 'security_critical'    // Cannot be disabled
  | 'security_alerts'      // Can be disabled (non-critical security)
  | 'account_activity'     // Login, password changes, etc.
  | 'product_updates'      // New features, improvements
  | 'marketing'            // Promotional emails
  | 'research_updates'     // New genetic research
  | 'family_sharing'       // Sharing invitations, updates
  | 'system'               // System maintenance, outages
  | 'digest';              // Weekly/monthly summaries

// Channel types
export type NotificationChannel = 'email' | 'push' | 'in_app';

// Preference for a single category
export interface CategoryPreference {
  enabled: boolean;
  channels: NotificationChannel[];
}

// All user preferences
export interface NotificationPreferences {
  userId: string;
  categories: Record<NotificationCategory, CategoryPreference>;
  updatedAt: string;
}

// Default preferences for new users
export const DEFAULT_PREFERENCES: Record<NotificationCategory, CategoryPreference> = {
  security_critical: {
    enabled: true,
    channels: ['email', 'in_app'],
  },
  security_alerts: {
    enabled: true,
    channels: ['email', 'in_app'],
  },
  account_activity: {
    enabled: true,
    channels: ['email', 'in_app'],
  },
  product_updates: {
    enabled: true,
    channels: ['email', 'in_app'],
  },
  marketing: {
    enabled: false, // Opt-in for marketing
    channels: ['email'],
  },
  research_updates: {
    enabled: true,
    channels: ['email'],
  },
  family_sharing: {
    enabled: true,
    channels: ['email', 'in_app'],
  },
  system: {
    enabled: true,
    channels: ['email', 'in_app'],
  },
  digest: {
    enabled: false,
    channels: ['email'],
  },
};

// Categories that CANNOT be disabled (critical security)
export const MANDATORY_CATEGORIES: NotificationCategory[] = ['security_critical'];

// Event to category mapping
export const EVENT_CATEGORIES: Record<string, NotificationCategory> = {
  // Security Critical (Cannot disable)
  'login_new_device': 'security_critical',
  'password_changed': 'security_critical',
  'email_changed': 'security_critical',
  '2fa_disabled': 'security_critical',
  '2fa_disabled_with_delay': 'security_critical',
  'password_reset_completed': 'security_critical',
  
  // Security Alerts (Can disable)
  'login_suspicious': 'security_alerts',
  'session_terminated': 'security_alerts',
  'all_sessions_terminated': 'security_alerts',
  'account_locked': 'security_alerts',
  'password_reset_requested': 'security_alerts',
  
  // Account Activity
  'user_registered': 'account_activity',
  'user_login': 'account_activity',
  'user_logout': 'account_activity',
  'terms_accepted': 'account_activity',
  
  // 2FA Related
  '2fa_enabled': 'account_activity',
  '2fa_setup_started': 'account_activity',
  'backup_codes_regenerated': 'account_activity',
  
  // Product Updates
  'new_feature': 'product_updates',
  'feature_announcement': 'product_updates',
  
  // Marketing
  'promotional': 'marketing',
  'newsletter': 'marketing',
  'special_offer': 'marketing',
  
  // Research Updates
  'snp_update': 'research_updates',
  'new_research': 'research_updates',
  'report_updated': 'research_updates',
  
  // Family Sharing
  'sharing_invite_received': 'family_sharing',
  'sharing_invite_accepted': 'family_sharing',
  'sharing_permission_changed': 'family_sharing',
  
  // System
  'maintenance_scheduled': 'system',
  'maintenance_completed': 'system',
  'system_outage': 'system',
};

// Human-readable category names
export const CATEGORY_NAMES: Record<NotificationCategory, string> = {
  security_critical: 'Critical Security Alerts',
  security_alerts: 'Security Notifications',
  account_activity: 'Account Activity',
  product_updates: 'Product Updates',
  marketing: 'Marketing & Promotions',
  research_updates: 'Research Updates',
  family_sharing: 'Family Sharing',
  system: 'System Notifications',
  digest: 'Summary Digests',
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS: Record<NotificationCategory, string> = {
  security_critical: 'Critical security alerts that cannot be disabled (e.g., password changes, new device logins)',
  security_alerts: 'Non-critical security notifications (e.g., suspicious login attempts)',
  account_activity: 'Notifications about your account activity (e.g., successful logins)',
  product_updates: 'New features, improvements, and product announcements',
  marketing: 'Promotional emails, special offers, and newsletters',
  research_updates: 'Updates about new genetic research and SNP information',
  family_sharing: 'Invitations and updates related to family genome sharing',
  system: 'System maintenance, outages, and technical notifications',
  digest: 'Periodic summaries of your account activity',
};

/**
 * Initialize notification preferences tables
 */
export function initNotificationPreferencesTables(): void {
  const db = getDb();

  // User notification preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id TEXT PRIMARY KEY,
      preferences TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id)`);
}

/**
 * Get user's notification preferences
 */
export function getNotificationPreferences(userId: string): NotificationPreferences {
  const db = getDb();

  const row = db.prepare(`
    SELECT 
      preferences,
      updated_at
    FROM notification_preferences
    WHERE user_id = ?
  `).get(userId) as {
    preferences: string;
    updated_at: string;
  } | undefined;

  if (!row) {
    // Return defaults if no preferences exist
    return {
      userId,
      categories: { ...DEFAULT_PREFERENCES },
      updatedAt: new Date().toISOString(),
    };
  }

  const parsedPrefs = JSON.parse(row.preferences) as Record<NotificationCategory, CategoryPreference>;

  return {
    userId,
    categories: {
      ...DEFAULT_PREFERENCES,
      ...parsedPrefs,
      // Ensure critical categories are always enabled
      security_critical: { ...DEFAULT_PREFERENCES.security_critical },
    },
    updatedAt: row.updated_at,
  };
}

/**
 * Update user's notification preferences
 */
export function updateNotificationPreferences(
  userId: string,
  updates: Partial<Record<NotificationCategory, Partial<CategoryPreference>>>
): { success: boolean; error?: string } {
  try {
    const db = getDb();

    // Get current preferences
    const current = getNotificationPreferences(userId);

    // Merge updates
    const newCategories = { ...current.categories };
    
    for (const [category, prefs] of Object.entries(updates)) {
      const cat = category as NotificationCategory;
      
      // Prevent disabling mandatory categories
      if (MANDATORY_CATEGORIES.includes(cat)) {
        continue; // Skip updates to mandatory categories
      }

      if (newCategories[cat]) {
        newCategories[cat] = {
          ...newCategories[cat],
          ...prefs,
        };
      }
    }

    // Insert or update
    db.prepare(`
      INSERT INTO notification_preferences (
        user_id, preferences, updated_at
      )
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        preferences = excluded.preferences,
        updated_at = datetime('now')
    `).run(
      userId,
      JSON.stringify(newCategories)
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: 'Failed to update preferences' };
  }
}

/**
 * Check if a notification should be sent based on user preferences
 */
export function shouldSendNotification(
  userId: string,
  eventType: string,
  channel: NotificationChannel = 'email'
): {
  shouldSend: boolean;
  category: NotificationCategory;
  reason?: string;
} {
  // Get category for this event
  const category = EVENT_CATEGORIES[eventType] || 'system';
  
  // Get user preferences
  const prefs = getNotificationPreferences(userId);
  const categoryPref = prefs.categories[category];

  // Mandatory categories always send
  if (MANDATORY_CATEGORIES.includes(category)) {
    return { shouldSend: true, category };
  }

  // Check if category is enabled
  if (!categoryPref?.enabled) {
    return { 
      shouldSend: false, 
      category, 
      reason: 'Category disabled by user' 
    };
  }

  // Check if channel is enabled for this category
  if (!categoryPref.channels.includes(channel)) {
    return { 
      shouldSend: false, 
      category, 
      reason: 'Channel disabled for this category' 
    };
  }

  return { shouldSend: true, category };
}

/**
 * Get all available preference options for the UI
 */
export function getPreferenceOptions(): Array<{
  category: NotificationCategory;
  name: string;
  description: string;
  mandatory: boolean;
  channels: NotificationChannel[];
}> {
  return Object.entries(CATEGORY_NAMES).map(([category, name]) => ({
    category: category as NotificationCategory,
    name,
    description: CATEGORY_DESCRIPTIONS[category as NotificationCategory],
    mandatory: MANDATORY_CATEGORIES.includes(category as NotificationCategory),
    channels: ['email', 'push', 'in_app'],
  }));
}

/**
 * Initialize default preferences for a new user
 */
export function initializeDefaultPreferences(userId: string): void {
  const db = getDb();
  
  db.prepare(`
    INSERT OR IGNORE INTO notification_preferences (user_id, preferences, updated_at)
    VALUES (?, ?, datetime('now'))
  `).run(userId, JSON.stringify(DEFAULT_PREFERENCES));
}

/**
 * Unsubscribe user from marketing emails (one-click unsubscribe)
 */
export function unsubscribeFromMarketing(userId: string): boolean {
  try {
    const prefs = getNotificationPreferences(userId);
    
    prefs.categories.marketing = {
      ...prefs.categories.marketing,
      enabled: false,
    };

    const result = updateNotificationPreferences(userId, { marketing: prefs.categories.marketing });
    return result.success;
  } catch (error) {
    console.error('Error unsubscribing from marketing:', error);
    return false;
  }
}

/**
 * Check if user is subscribed to marketing
 */
export function isSubscribedToMarketing(userId: string): boolean {
  const prefs = getNotificationPreferences(userId);
  return prefs.categories.marketing?.enabled || false;
}


