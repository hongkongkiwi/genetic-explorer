/**
 * Database Row Types
 * 
 * Type definitions for database query results.
 * These represent the raw row structure returned by better-sqlite3.
 */

// ============================================================================
// Core Entity Rows
// ============================================================================

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  display_name: string | null;
  is_active: number;
  is_email_verified: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  two_factor_enabled: number;
  two_factor_secret_encrypted: string | null;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  bio: string | null;
  birth_date: string | null;
  sex: string | null;
  ancestry: string | null;
  timezone: string | null;
  notification_preferences: string;
  privacy_settings: string;
  created_at: string;
  updated_at: string;
}

export interface GenomeRow {
  id: string;
  user_id: string;
  name: string;
  file_name: string | null;
  file_path: string | null;
  file_size: number;
  file_hash: string | null;
  snp_count: number;
  status: 'processing' | 'ready' | 'error';
  processing_error: string | null;
  is_public: number;
  created_at: string;
  updated_at: string;
}

export interface SnpRow {
  id: number;
  genome_id: string;
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string | null;
  genotype_encrypted: string | null;
  is_encrypted: number;
  confidence: number | null;
}

export interface ReportRow {
  id: string;
  user_id: string;
  genome_id: string;
  type: string;
  title: string;
  summary: string | null;
  details: string | null;
  status: 'pending' | 'processing' | 'complete' | 'error';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ============================================================================
// Sharing & Permissions
// ============================================================================

export interface SharingPermissionRow {
  id: string;
  owner_id: string;
  shared_with_id: string;
  genome_id: string | null;
  permission_level: 'view' | 'download' | 'manage';
  status: 'active' | 'revoked' | 'expired';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharingInviteRow {
  id: string;
  owner_id: string;
  email: string;
  token: string;
  genome_id: string | null;
  permission_level: 'view' | 'download' | 'manage';
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}

// ============================================================================
// Authentication & Sessions
// ============================================================================

export interface SessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  last_used_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface EmailVerificationRow {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export interface PasswordResetRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

export interface OAuthAccountRow {
  id: string;
  user_id: string;
  provider: string;
  provider_id: string;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupCodeRow {
  id: number;
  user_id: string;
  code_hash: string;
  code_encrypted: string | null;
  used_at: string | null;
  created_at: string;
}

// ============================================================================
// Activity & Audit
// ============================================================================

export interface ActivityLogRow {
  id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================================================
// Favorites & Preferences
// ============================================================================

export interface SnpFavoriteRow {
  rsid: string;
  user_id: string;
  note: string | null;
  created_at: string;
}

export interface RelativeMatchingPreferenceRow {
  id: string;
  user_id: string;
  enabled: number;
  is_opted_in?: number;
  match_radius: string | null;
  min_shared_dna_cm: number;
  max_results: number;
  show_real_name?: number;
  allow_contact?: number;
  show_ancestry?: number;
  share_ethnicity?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Key Rotation & Security
// ============================================================================

export interface UserKeyVersionRow {
  user_id: string;
  key_version: number;
  rotated_at: string;
}

export interface KeyRotationJobRow {
  id: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  total_items: number;
  processed_items: number;
  failed_items: number;
  old_key_version: number;
  new_key_version: number;
  error: string | null;
}

// ============================================================================
// Data Export Rows (GDPR)
// ============================================================================

export interface UserExportRow {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_login_at: string | null;
  email_verified: number;
}

export interface ProfileExportRow {
  bio: string | null;
  birth_date: string | null;
  sex: string | null;
  ancestry: string | null;
  timezone: string | null;
  privacy_settings: string;
  notification_preferences: string;
}

export interface GenomeExportRow {
  id: string;
  filename: string;
  source: string;
  snp_count: number;
  processed_at: string;
  status: string;
}

export interface SnpExportRow {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string | null;
}

export interface ReportExportRow {
  id: string;
  genome_id: string;
  report_type: string;
  generated_at: string;
  content: string;
}

export interface ActivityLogExportRow {
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  created_at: string;
}

export interface SharingPermissionExportRow {
  permission_level: string;
  status: string;
  created_at: string;
  shared_with_email: string | null;
}

export interface NotificationExportRow {
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface SnpFavoriteExportRow {
  rsid: string;
  notes: string | null;
  created_at: string;
}

// ============================================================================
// Privacy & Consent
// ============================================================================

export interface ConsentRecordRow {
  id: string;
  user_id: string;
  purpose: string;
  granted: number;
  granted_at: string;
  withdrawn_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface DataRetentionPolicyRow {
  id: string;
  user_id: string;
  data_type: string;
  retention_days: number | null;
  auto_delete: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Sharing Audit & Privacy
// ============================================================================

export interface SharingAuditLogRow {
  id: string;
  permission_id: string;
  permissionId?: string;
  viewer_id: string;
  viewerId?: string;
  action: string;
  data_type: string;
  dataType?: string;
  items_accessed: number;
  itemsAccessed?: number;
  ip_address: string | null;
  ipAddress?: string | null;
  user_agent: string | null;
  userAgent?: string | null;
  created_at: string;
  timestamp?: string;
}

export interface UserPrivacySettingsRow {
  user_id: string;
  share_anonymized_data: number;
  allow_family_sharing: number;
  auto_expiry_days: number | null;
  download_notifications: number;
  access_alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface SharingPermissionDetailedRow {
  id: string;
  can_view: number;
  can_download: number;
  can_share: number;
  expires_at: string | null;
  grace_period_hours: number | null;
  status: string;
  grace_until: string | null;
  max_views: number | null;
  max_downloads: number | null;
}

export interface SensitiveDataSettingsRow {
  show_sensitive_data: number;
  disclaimer_agreed_at: string | null;
  default_share_level: string;
  confirm_before_viewing: number;
}

export interface SharingCategorySettingRow {
  category_id: string;
  shared: number;
  min_sensitivity_level: number | null;
}

// ============================================================================
// Advanced Sharing
// ============================================================================

export interface SharePermissionRow {
  id: string;
  userId: string;
  sharedWithId: string | null;
  sharedWithEmail: string | null;
  shareType: string;
  genomeId: string | null;
  sensitivityLevel: string;
  includeRawData: number;
  allowMatching: number;
  canDownload: number;
  canShare: number;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShareMatchCheckRow {
  can_match: number;
}

// ============================================================================
// Legacy Database Query Result Rows
// ============================================================================

export interface UserByEmailRow {
  id: string;
  email: string;
  password_hash: string | null;
  display_name: string | null;
  is_active: number;
  email_verified: number;
  two_factor_enabled: number;
  two_factor_secret_encrypted: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface EmailVerificationTokenRow {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

export interface SharingInviteTokenRow {
  id: string;
  owner_id: string;
  email: string;
  invite_token: string;
  genome_id: string | null;
  permission_level: 'view' | 'download' | 'manage';
  status: string;
  expires_at: string;
  created_at: string;
  owner_email?: string;
  owner_name?: string | null;
}

export interface SharingInviteForListRow {
  id: string;
  owner_id: string;
  shared_with_id: string | null;
  email: string;
  genome_id: string | null;
  permission_level: 'view' | 'download' | 'manage';
  status: string;
  expires_at: string;
  created_at: string;
  message?: string;
  owner_email?: string;
  owner_name?: string | null;
  genome_nickname?: string | null;
}

export interface ApiKeyRow {
  id: string;
  name: string;
  key_hash: string;
  scopes: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
  link: string | null;
}

export interface TraitFavoriteRow {
  id: string;
  user_id: string;
  trait_id: string;
  created_at: string;
}

export interface UserStatsRow {
  genome_count: number;
  snp_count: number;
  report_count: number;
}

export interface UserSessionRow {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  last_active_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface UserActivityRow {
  id: number;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  created_at: string;
}

// For generic queries that just need an id
export interface GenomeIdRow {
  id: string;
  user_id: string;
  genome_id: string;
  ethnicity_json?: string;
  y_haplogroup?: string;
  mt_haplogroup?: string;
  confidence?: number;
  analyzed_at?: string;
  traits_json?: string;
  results_json?: string;
  has_pathogenic_variants?: number;
  counseling_recommended?: number;
}

export interface TraitFavoriteFullRow {
  id: string;
  user_id: string;
  trait_id: string;
  is_visible: number;
  share_with_family: number;
  created_at: string;
  updated_at: string;
}

export interface RelativeMatchRow {
  id: string;
  user_id: string;
  match_user_id: string;
  target_user_id: string;
  shared_dna_percentage: number;
  relationship_type: string;
  relationship_prediction: string;
  shared_segments_json: string;
  ibd_segments_json: string;
  is_hidden: number;
  can_contact: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerSharingRow {
  user_id: string;
  partner_email: string;
  shared_at: string;
  access_token: string;
  expires_at: string;
  accessed_at: string | null;
  scopes: string;
}

export interface RelativeMatchingPreferenceFullRow extends RelativeMatchingPreferenceRow {
  is_opted_in: number;
  show_real_name: number;
  allow_contact: number;
  show_ancestry: number;
  share_ethnicity: number;
}

// Partial row types for specific queries
export interface UserBasicRow {
  id: string;
  email: string;
  password_hash?: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_active: number;
  email_verified: number;
  // OAuth fields
  user_id?: string;
  provider?: string;
  provider_id?: string;
  name?: string;
  avatar_url?: string;
}

export interface ProfileBasicRow {
  id: string;
  user_id: string;
  bio: string | null;
  birth_date: string | null;
  sex: string | null;
  ancestry: string | null;
  timezone: string | null;
  privacy_settings: string;
  notification_preferences: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Platform
// ============================================================================

export interface SnpChangelogRow {
  id: string;
  rsid: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  change_reason: string | null;
  changed_at: string;
  changed_by: string | null;
}

export interface SnpChangelogEntryRow {
  id: number;
  rsid: string;
  change_type: string;
  change_description: string;
  old_value: string | null;
  new_value: string | null;
  related_pmid: string | null;
  related_title: string | null;
  related_journal: string | null;
  created_at: string;
  is_major_update: number;
}

export interface SnpUpdateNotificationRow {
  id: string;
  rsid: string;
  change_type: string;
  description: string;
  impact: string;
  action_recommended: string | null;
  related_pmid: string | null;
  related_title: string | null;
  related_journal: string | null;
  related_year: number | null;
  date: string;
  is_read: number;
  is_dismissed: number;
}

export interface UserSnpRow {
  rsid: string;
  genotype: string;
}

// ============================================================================
// Count & Summary Rows
// ============================================================================

export interface CountRow {
  count: number;
}

export interface IdRow {
  id: string;
}

export interface PermissionLevelRow {
  permission_level: 'view' | 'download' | 'manage';
}

export interface GenomeStatsRow {
  genome_count: number;
  snp_count: number;
  report_count: number;
}
