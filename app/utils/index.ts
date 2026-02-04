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
export { cacheApiResponse, invalidateCache, getCacheStats } from './shared/api-cache';

// Genome utilities
export {
  parseGeneticData,
  validateGenomeData,
  detectGenomeFormat,
  type GenomeFormat,
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
  validateDnaSequence,
  checkSequenceQuality,
  detectContamination,
  type DnaValidationResult,
} from './genome/dna-validation';

export {
  compressFile,
  decompressFile,
  detectCompressionType,
  type CompressionType,
} from './genome/file-compression';

// Privacy utilities
export {
  applyDataAccessControl,
  checkDataPermission,
  type AccessControlRule,
} from './privacy/access-control';

export {
  sanitizeSensitiveData,
  maskGeneticData,
  type SanitizationOptions,
} from './privacy/sensitive-data';

export {
  exportUserData,
  deleteUserData,
  anonymizeData,
  type ExportOptions,
} from './privacy/data-export';

export {
  calculatePrivacyScore,
  getPrivacyRecommendations,
  type PrivacyScore,
} from './privacy/features';

// Research utilities
export {
  queryResearchDatabase,
  addResearchPaper,
  getSnpResearch,
  type ResearchQuery,
  type ResearchResult,
} from './research/database';

export {
  syncResearchUpdates,
  getLatestResearch,
  type ResearchSyncResult,
} from './research/sync';

// Identity utilities
export {
  verifyUserIdentity,
  checkIdentityDocuments,
  type IdentityVerificationResult,
} from './identity/verification';

export {
  checkSignupRestrictions,
  validateEmailDomain,
  isSignupDisabled,
  type SignupRestriction,
} from './identity/signup-restrictions';

// Relatives utilities
export {
  findDnaMatches,
  calculateRelationship,
  predictRelationshipType,
  type DnaMatch,
  type RelationshipPrediction,
} from './relatives/matching';

// Reports utilities
export {
  generateDoctorReport,
  formatMedicalReport,
  type DoctorReportOptions,
} from './reports/doctor';

export {
  exportPdfReport,
  generateReportPdf,
  type PdfExportOptions,
} from './reports/pdf';

// Sharing utilities
export {
  createAdvancedShare,
  validateSharePermissions,
  revokeAdvancedShare,
  type AdvancedShareOptions,
} from './sharing/advanced';

// Platform utilities
export {
  searchSimilarSnps,
  findSnpClusters,
  type VectorSearchResult,
} from './genome/vector-search';

export {
  getSnpChangelog,
  trackSnpChanges,
  type SnpChange,
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
