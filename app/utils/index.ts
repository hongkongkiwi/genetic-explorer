/**
 * Utilities Module
 */

// Shared utilities
export { cn } from './shared/cn';
export { env, isProduction, isDevelopment, isTest, validateEnv, getPublicEnv } from './shared/env';
export {
  performanceMonitor,
  mark,
  measure,
  createLazyLoader,
  prefetchOnHover,
  useRenderTime,
} from './shared/performance';
export {
  apiCache,
  dedupeRequest,
  requestThrottler,
  debounce,
  throttle,
  cachedFetch,
  prefetch,
  createOptimisticUpdate,
} from './shared/api-cache';

// Genome utilities
export {
  parseGeneticData,
  validateGenomeData,
  detectSource,
  getSNPsByRegion,
  findSNP,
  getSNPsWithGenotype,
  getGenomeStats,
  type ParseResult,
} from './genome/parser';

export {
  calculateQualityMetrics,
  compareGenomeQuality,
  getQualitySummary,
  formatQualityComparison,
  type GenomeQualityMetrics,
  type QualityComparison,
} from './genome/quality';

export {
  detectCompression,
  detectDnaFormat,
  validateFileSize,
  validateFileExtension,
  estimateSnpCount,
  validateDnaContent,
  validateDnaFile,
  getFormatDisplayName,
  getCompressionDisplayName,
  needsDecompression,
  getFileTypeInfo,
  type DnaFileFormat,
  type CompressionFormat,
  type DnaFileValidation,
  type DnaFileInfo,
} from './genome/dna-validation';

export {
  decompressBuffer,
  detectCompressionType,
  validateFileMagic,
  validateGeneticContent,
  calculateChecksum,
  formatFileSize,
  getSupportedCompressionTypes,
  isCompressionSupported,
  getCompressionTypeName,
  getOriginalFilename,
  type CompressionType,
  type DecompressionResult,
} from './genome/file-compression';

// Privacy utilities
export {
  verifyOwnership,
  canAccessGenome,
  verifyGenomeAccess,
  getAccessibleGenomes,
  createUserFilteredQuery,
  createDeleteVerification,
  performSecureDelete,
  logDataAccess,
  requireResourceOwnership,
  requireGenomeAccess,
  type ResourceType,
  type DeleteVerification,
  type AccessAuditLog,
  DataAccessError,
} from './privacy/access-control';

export {
  SENSITIVITY_CATEGORIES,
  SHARE_LEVELS,
  SENSITIVE_DATA_DISCLAIMER,
  getSensitiveDataSettings,
  saveSensitiveDataSettings,
  agreeToDisclaimer,
  revokeDisclaimer,
  canViewSensitivityLevel,
  filterSNPsBySensitivity,
  getPrivacySettingsSchema,
  type SensitivityLevel,
  type SensitivityCategory,
  type SensitiveDataSettings,
  type ShareLevel,
  type FilteredSNP,
  type PrivacySettingsSchema,
} from './privacy/sensitive-data';

export {
  exportUserData,
  exportUserDataAsZip,
  deleteAllUserData,
} from './privacy/data-export';

export {
  logDataAccess as logPrivacyDataAccess,
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
  type AccessLogEntry,
  type NotificationSettings,
  type ShareLimits,
  type CategoryShareSettings,
  type AnonymizedResearchData,
} from './privacy/features';

// Identity utilities
export {
  IDENTITY_SNPS,
  MIN_REQUIRED_SNPS,
  verifyIdentity,
  getDangerZoneConfig,
  formatIdentityReport,
  genotypesMatch,
  type IdentityMatchLevel,
  type IdentityVerificationResult,
} from './identity/verification';

export {
  SIGNUP_ENV_VARS,
  getSignupConfig,
  clearSignupConfigCache,
  canSignUp,
  validateSignupEmail,
  canSignUpWithPassword,
  canSignUpWithOAuth,
  validateInviteToken,
  isAdminApprovalRequired,
  getSignupRateLimit,
  getSignupConfigSummary,
  hasActiveRestrictions,
  type SignupConfig,
  type SignupValidationResult,
} from './identity/signup-restrictions';

// Relatives utilities
export {
  findRelatives,
  calculateSharedDNA,
  identifyIBDSegments,
  predictRelationship,
  calculateCentimorgans,
  compareGenomes,
  determineSide,
  estimateGenerations,
  filterMatchesByRelationship,
  getCloseFamilyMatches,
  getDistantMatches,
} from './relatives/matching';

// Reports utilities
export {
  generateDoctorReport,
  formatDoctorReportForPrint,
  formatReportForExport,
  type DoctorReportData,
  type ClinicalFinding,
  type PharmacogenomicFinding,
  type CarrierFinding,
  type FollowUpRecommendation,
  type ExportFormat,
} from './reports/doctor';

export {
  generateReportHTML,
  generatePDF,
  downloadPDF,
  printToPDF,
  generateShareableSummary,
  exportReportJSON,
  downloadReportJSON,
  generatePDFOnServer,
} from './reports/pdf';

// Sharing utilities
export {
  SHARE_TYPES,
  createSharePermission,
  getUserShares,
  getReceivedShares,
  getAccessibleData,
  getFilteredSharedData,
  revokeShare,
  findFamilyMatches,
  type ShareType,
  type ShareTypeConfig,
  type SharePermission,
  type GeneticMatch,
} from './sharing/advanced';

// Platform utilities
export {
  generateGenomeEmbedding,
  generateSNPEmbedding,
  indexGenomeInVectorDB,
  findSimilarGenomes,
  removeGenomeFromVectorDB,
  indexSNPsInVectorDB,
  findSimilarSNPs,
  searchResearchBySemanticQuery,
  generateTextEmbedding,
  onGenomeUploaded,
  onResearchUpdated,
  reindexAllGenomes,
  reindexAllSNPs,
  getVectorStats,
} from './genome/vector-search';

export {
  initializeChangelogDatabase,
  addChangelogEntry,
  getRecentChangelog,
  getChangelogForSNPs,
  createUserNotification,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  getMajorUpdatesForUser,
  updateLastRead,
  generateChangelogSummary,
  type SNPChangelogEntry,
  type UserSnpUpdate,
} from './platform/snp-changelog';

export {
  getZillizConfig,
  isZillizConfigured,
} from './platform/zilliz-config';

// Logging utilities
export {
  logger,
  createChildLogger,
  createComponentLogger,
  createSessionLogger,
  createRequestLogger,
  logSecurityEvent,
  logAuditEvent,
  logPerformanceMetric,
  logError,
  getLoggingStatus,
  flushLogs,
} from './logging';
