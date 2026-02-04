#!/bin/bash
set -e

echo "=== Genetic Explorer Refactoring Script ==="
echo ""

# Step 1: Create directory structure
echo "Step 1: Creating directory structure..."
mkdir -p app/{auth,security,email,analysis} 
mkdir -p app/db
mkdir -p app/utils/{genome,privacy,research,identity,relatives,reports,sharing,logging,platform,shared}
mkdir -p app/components/layout 
mkdir -p app/components/features/{ancestry,carrier,genome,relatives,traits}
echo "✅ Directories created"

# Step 2: Move auth files
echo "Step 2: Moving auth files..."
mv app/utils/auth.ts app/auth/auth-core.ts
mv app/utils/oauth.ts app/auth/oauth.ts 2>/dev/null || echo "oauth.ts not found, skipping"
mv app/utils/passkey.ts app/auth/passkey.ts 2>/dev/null || echo "passkey.ts not found, skipping"
mv app/utils/twoFactor.ts app/auth/two-factor.ts 2>/dev/null || echo "twoFactor.ts not found, skipping"
mv app/utils/magicLink.ts app/auth/magic-link.ts 2>/dev/null || echo "magicLink.ts not found, skipping"
mv app/utils/auth.test.ts app/auth/index.test.ts 2>/dev/null || echo "auth.test.ts not found, skipping"
echo "✅ Auth files moved"

# Step 3: Move security files
echo "Step 3: Moving security files..."
mv app/utils/encryption.ts app/security/encryption.ts
mv app/utils/csrf.ts app/security/csrf.ts
mv app/utils/rateLimit.ts app/security/rate-limit.ts
mv app/utils/security.ts app/security/security-core.ts 2>/dev/null || echo "security.ts not found, skipping"
mv app/utils/csrf.test.ts app/security/csrf.test.ts 2>/dev/null || echo "csrf.test.ts not found, skipping"
mv app/utils/encryption.test.ts app/security/encryption.test.ts 2>/dev/null || echo "encryption.test.ts not found, skipping"
mv app/utils/rateLimit.test.ts app/security/rate-limit.test.ts 2>/dev/null || echo "rateLimit.test.ts not found, skipping"
mv app/utils/security.test.ts app/security/index.test.ts 2>/dev/null || echo "security.test.ts not found, skipping"
echo "✅ Security files moved"

# Step 4: Move email files
echo "Step 4: Moving email files..."
mv app/utils/email.ts app/email/index.ts
mv app/utils/email.test.ts app/email/index.test.ts 2>/dev/null || echo "email.test.ts not found, skipping"
echo "✅ Email files moved"

# Step 5: Move analysis files
echo "Step 5: Moving analysis files..."
mv app/utils/ancestryAnalysis.ts app/analysis/ancestry.ts
mv app/utils/carrierAnalysis.ts app/analysis/carrier.ts
mv app/utils/traitsAnalysis.ts app/analysis/traits.ts
mv app/utils/llmAnalysis.ts app/analysis/llm.ts
mv app/utils/aiAnalysis.ts app/analysis/ai.ts
mv app/utils/comprehensiveAnalysis.ts app/analysis/comprehensive.ts
mv app/utils/enhancedAnalysis.ts app/analysis/enhanced.ts
mv app/utils/ancestryAnalysis.test.ts app/analysis/ancestry.test.ts 2>/dev/null || echo "ancestryAnalysis.test.ts not found, skipping"
mv app/utils/carrierAnalysis.test.ts app/analysis/carrier.test.ts 2>/dev/null || echo "carrierAnalysis.test.ts not found, skipping"
mv app/utils/traitsAnalysis.test.ts app/analysis/traits.test.ts 2>/dev/null || echo "traitsAnalysis.test.ts not found, skipping"
echo "✅ Analysis files moved"

# Step 6: Move database files
echo "Step 6: Moving database files..."
mv app/utils/databaseIndexes.ts app/db/indexes.ts
mv app/utils/databaseMigrations.ts app/db/migrations.ts
mv app/utils/databaseQueries.ts app/db/queries.ts
mv app/utils/d1Schema.ts app/db/d1-schema.ts
mv app/utils/database.ts app/db/database-legacy.ts
mv app/utils/database.test.ts app/db/index.test.ts 2>/dev/null || echo "database.test.ts not found, skipping"
mv app/utils/databaseQueries.test.ts app/db/queries.test.ts 2>/dev/null || echo "databaseQueries.test.ts not found, skipping"
echo "✅ Database files moved"

# Step 7: Move utils subdirectories
echo "Step 7: Moving utils subdirectory files..."
mv app/utils/cn.ts app/utils/shared/cn.ts
mv app/utils/env.ts app/utils/shared/env.ts
mv app/utils/performance.ts app/utils/shared/performance.ts
mv app/utils/apiCache.ts app/utils/shared/api-cache.ts

mv app/utils/dnaValidation.ts app/utils/genome/dna-validation.ts
mv app/utils/fileCompression.ts app/utils/genome/file-compression.ts
mv app/utils/genomeParser.ts app/utils/genome/parser.ts
mv app/utils/genomeQuality.ts app/utils/genome/quality.ts
mv app/utils/vectorSearch.ts app/utils/genome/vector-search.ts
mv app/utils/dnaValidation.test.ts app/utils/genome/dna-validation.test.ts 2>/dev/null || echo "dnaValidation.test.ts not found, skipping"
mv app/utils/genomeParser.test.ts app/utils/genome/parser.test.ts 2>/dev/null || echo "genomeParser.test.ts not found, skipping"

mv app/utils/dataAccessControl.ts app/utils/privacy/access-control.ts
mv app/utils/sensitiveData.ts app/utils/privacy/sensitive-data.ts
mv app/utils/dataExport.ts app/utils/privacy/data-export.ts
mv app/utils/privacyFeatures.ts app/utils/privacy/features.ts

mv app/utils/researchDatabase.ts app/utils/research/database.ts
mv app/utils/researchSync.ts app/utils/research/sync.ts

mv app/utils/identityVerification.ts app/utils/identity/verification.ts
mv app/utils/signupRestrictions.ts app/utils/identity/signup-restrictions.ts
mv app/utils/identityVerification.test.ts app/utils/identity/verification.test.ts 2>/dev/null || echo "identityVerification.test.ts not found, skipping"

mv app/utils/relativeMatching.ts app/utils/relatives/matching.ts
mv app/utils/relativeMatching.test.ts app/utils/relatives/matching.test.ts 2>/dev/null || echo "relativeMatching.test.ts not found, skipping"

mv app/utils/doctorReport.ts app/utils/reports/doctor.ts
mv app/utils/pdfExport.ts app/utils/reports/pdf.ts

mv app/utils/advancedSharing.ts app/utils/sharing/advanced.ts

mv app/utils/logging.ts app/utils/logging/index.ts
mv app/utils/loggingIndex.ts app/utils/logging/exports.ts 2>/dev/null || echo "loggingIndex.ts not found, skipping"
mv app/utils/sentry.ts app/utils/logging/sentry.ts 2>/dev/null || echo "sentry.ts not found, skipping"

mv app/utils/snpChangelog.ts app/utils/platform/snp-changelog.ts
mv app/utils/zillizConfig.ts app/utils/platform/zilliz-config.ts

echo "✅ Utils subdirectory files moved"

# Step 8: Remove duplicate logger
echo "Step 8: Removing duplicate logger..."
rm -f app/utils/logger.ts
echo "✅ Duplicate logger removed"

# Step 9: Create barrel exports
echo "Step 9: Creating barrel exports..."

# Auth index
cat > app/auth/index.ts << 'EOF'
/**
 * Authentication Module
 */
export {
  requireAuth,
  getAuthUser,
  getCurrentUser,
  validateSession,
  logoutUser,
  generatePasswordResetToken,
  changePassword,
  type AuthResult,
  type RegisterData,
  type LoginData,
} from './auth-core';
EOF

# Security index  
cat > app/security/index.ts << 'EOF'
/**
 * Security Module
 */
export {
  encrypt,
  decrypt,
  getUserEncryptionKey,
  encryptForUser,
  decryptForUser,
  encryptObject,
  decryptObject,
  generateSecureToken,
  generateSecurePassword,
  hashData,
  verifyHash,
  getEncryptionStatus,
  validateEncryptionConfig,
  rotateKey,
  type EncryptedData,
  type EncryptionStatus,
  type KeyRotationResult,
} from './encryption';

export {
  generateCsrfToken,
  validateCsrfToken,
  csrfProtection,
  getCsrfCookieOptions,
} from './csrf';

export {
  rateLimitByIp,
  rateLimitByUser,
  rateLimitAuth,
  rateLimitSensitive,
  getClientIp,
  createRateLimitHeaders,
  type RateLimitResult,
} from './rate-limit';

export {
  getSecurityHeaders,
  sanitizeInput,
  sanitizeFilename,
  generateNonce,
  getSecureCookieOptions,
  logSecurityEvent,
  detectSuspiciousActivity,
} from './security-core';
EOF

# Email index
cat > app/email/index.ts << 'EOF'
/**
 * Email Module
 */
export {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendSharingInvitation,
  type EmailOptions,
  type EmailResult,
} from './index';
EOF

# Analysis index
cat > app/analysis/index.ts << 'EOF'
/**
 * Genetic Analysis Module
 */
export {
  analyzeGenomeComprehensive,
  generateQuickSummary,
  type AnalyzedVariant,
  type AnalysisSummary,
} from './comprehensive';

export {
  analyzeAncestry,
  estimateEthnicity,
  calculateConfidence,
  type AncestryResult,
} from './ancestry';

export {
  analyzeCarrierStatus,
  checkCondition,
  type CarrierResult,
} from './carrier';

export {
  analyzeTraits,
  getTraitResult,
  calculateTraitConfidence,
  type Trait,
  type TraitCategory,
} from './traits';

export {
  generateActionableProtocol,
  type ActionableProtocol,
} from './llm';

export {
  generateAIHealthReport,
  generateDrugGuidance,
} from './ai';
EOF

echo "✅ Barrel exports created"

# Step 10: Update imports in moved files
echo "Step 10: Updating imports in moved files..."

# Fix auth imports
find app/auth -name "*.ts" -exec sed -i '' "s|from './database'|from '~/db'|g" {} \;
find app/auth -name "*.ts" -exec sed -i '' "s|from './encryption'|from '~/security'|g" {} \;

# Fix security imports  
find app/security -name "*.ts" -exec sed -i '' "s|from './database'|from '~/db'|g" {} \;

# Fix email imports
find app/email -name "*.ts" -exec sed -i '' "s|from './database'|from '~/db'|g" {} \;

# Fix analysis imports
find app/analysis -name "*.ts" -exec sed -i '' "s|from './database'|from '~/db'|g" {} \;
find app/analysis -name "*.ts" -exec sed -i '' "s|from './aiAnalysis'|from './ai'|g" {} \;
find app/analysis -name "*.ts" -exec sed -i '' "s|from './database'|from '~/db'|g" {} \;

# Fix db imports
find app/db -name "*.ts" -exec sed -i '' "s|from './encryption'|from '~/security'|g" {} \;

# Fix utils imports
find app/utils -name "*.ts" -exec sed -i '' "s|from './database'|from '~/db'|g" {} \;
find app/utils -name "*.ts" -exec sed -i '' "s|from './auth'|from '~/auth'|g" {} \;
find app/utils -name "*.ts" -exec sed -i '' "s|from './encryption'|from '~/security'|g" {} \;
find app/utils -name "*.ts" -exec sed -i '' "s|from '../encryption'|from '~/security'|g" {} \;

echo "✅ Imports updated"

# Step 11: Update main utils index
echo "Step 11: Creating main utils index..."
cat > app/utils/index.ts << 'EOF'
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
EOF

echo "✅ Utils index created"

echo ""
echo "=== Refactoring Complete! ==="
echo "Run 'npm run typecheck' to verify."
