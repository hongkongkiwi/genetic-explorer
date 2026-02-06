/**
 * Database Module - Legacy Re-exports
 * 
 * This module re-exports from database-legacy.ts during the transition period.
 * The database is being refactored into domain-specific modules.
 * 
 * @server-only This module can only be used on the server.
 */

'use server';

export { getDb } from './database-legacy';

export type {
  SaveGenomeResult,
  SnpData,
  GenomeMetadata,
  User,
  UserProfile,
  SharingPermission,
  SharingInvite,
  UserSession,
  OAuthAccount,
  OAuthProfile,
  AncestryResult,
  AncestryMatch,
  TraitsResult,
  TraitPreference,
  CarrierResult,
  CarrierSharing,
} from './database-legacy';

export {
  saveGenome,
  getGenomeFile,
  verifyGenomeIntegrity,
  getGenome,
  getUserSNPs,
  getAllGenomes,
  deleteGenome,
  saveReport,
  getReport,
  getAllReports,
  getDatabaseStats,
  createUser,
  getUserByEmail,
  getUserById,
  updateUserLastLogin,
  updateUser,
  getUserProfile,
  updateUserProfile,
  createSharingPermission,
  createSharingInvite,
  getSharingInviteByToken,
  acceptSharingInvite,
  getSharedWithMe,
  getMyShares,
  revokeSharingPermission,
  createSession,
  getSessionByToken,
  deleteSession,
  deleteUserSessions,
  getUserSessions,
  logActivity,
  getUserActivity,
  saveTotpSecret,
  getTotpSecret,
  deleteTotpSecret,
  saveBackupCodes,
  getBackupCodesCount,
  verifyAndUseBackupCode,
  savePasskey,
  getPasskeys,
  getPasskey,
  updatePasskeyCounter,
  deletePasskey,
  deleteAllPasskeys,
  setTwoFactorEnabled,
  isTwoFactorEnabled,
  getTwoFactorStatus,
  getUserGenomes,
  getAccessibleGenomes,
  setPrimaryGenome,
  canAccessGenome,
  deleteAllUserGenomes,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  batchInsertSNPs,
  getSNPsPaginated,
  getDashboardStats,
  globalSearch,
  getUserByOAuth,
  getUserByEmailForOAuth,
  createOAuthUser,
  linkOAuthAccount,
  getOAuthAccount,
  getUserOAuthAccounts,
  unlinkOAuthAccount,
  updateUserAvatar,
  saveAncestryResult,
  getAncestryResult,
  getUserAncestryResults,
  saveAncestryMatch,
  getAncestryMatches,
  updateAncestryMatchStatus,
  saveTraitsResult,
  getTraitsResult,
  getUserTraitsResults,
  saveTraitPreference,
  getTraitPreferences,
  getTraitPreference,
  saveCarrierResult,
  getCarrierResult,
  getUserCarrierResults,
  shareCarrierResults,
  getCarrierSharingByToken,
  recordCarrierSharingAccess,
  deleteSystemSetting,
  saveEncryptedDataKey,
  loadEncryptedDataKey,
} from './database-legacy';

// Re-export from indexes and migrations
export { createIndexes, analyzeTables, rebuildIndexes } from './indexes';
export { runMigrations } from './migrations';

// Connection helpers - using legacy getDb for now
export {
  getDb as getDatabase,
} from './database-legacy';

// New domain-specific exports (for forward compatibility) - TODO: create these modules
// export * from './genomes';
// export * from './ancestry';
// export * from './carrier';
// export * from './traits';
// export * from './relatives';
// export * from './users';
// export * from './oauth';
// export * from './sharing';
// export * from './auth';
// export * from './health-profiles';
