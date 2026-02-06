/**
 * Notification Preferences
 */

export type NotificationCategory = 'security' | 'updates' | 'marketing' | 'research';

export interface CategoryPreference {
  channels: string[];
  email?: boolean;
  push?: boolean;
  in_app?: boolean;
}

export interface NotificationPreferences {
  categories: Record<NotificationCategory, CategoryPreference>;
  updatedAt?: string;
}

export function getNotificationPreferences(_userId: string): NotificationPreferences {
  return {
    categories: {
      security: { channels: ['email', 'push'] },
      updates: { channels: ['email'] },
      marketing: { channels: [] },
      research: { channels: ['email'] },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function updateNotificationPreferences(
  _userId: string,
  categories: Record<NotificationCategory, Partial<CategoryPreference>>
): { success: boolean; error?: string } {
  console.log('Updating notification preferences:', categories);
  return { success: true };
}

export function getPreferenceOptions(): Array<{
  category: NotificationCategory;
  label: string;
  description: string;
}> {
  return [
    { category: 'security', label: 'Security', description: 'Security alerts and notifications' },
    { category: 'updates', label: 'Product Updates', description: 'New features and improvements' },
    { category: 'marketing', label: 'Marketing', description: 'Promotional offers and news' },
    { category: 'research', label: 'Research', description: 'Research updates and opportunities' },
  ];
}

export function unsubscribeFromMarketing(_userId: string): { success: boolean } {
  return { success: true };
}

export function isSubscribedToMarketing(_userId: string): boolean {
  return true;
}
