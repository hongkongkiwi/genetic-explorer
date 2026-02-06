/**
 * Database Utilities
 * 
 * Re-exports from the db module for convenience.
 * @deprecated Use '~/db' instead
 */

'use server';

// Re-export all database functions from the db module
export {
  getDb,
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
  saveEncryptedDataKey,
  loadEncryptedDataKey,
  createIndexes,
  analyzeTables,
  rebuildIndexes,
  runMigrations,
  getDatabase,
} from '~/db';

// Re-export types
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
} from '~/db';

// Store password reset token
export function storePasswordResetToken(userId: string, token: string, expiresAt: Date): void {
  const { getDb } = require('~/db');
  const db = getDb();
  db.prepare(`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET token = ?, expires_at = ?
  `).run(userId, token, expiresAt.toISOString(), token, expiresAt.toISOString());
}
