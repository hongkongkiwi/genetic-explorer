// Central exports for utilities

// Database
export { db, getDatabase, type DatabaseInstance } from './database';
export { runMigrations } from './databaseMigrations';

// Performance
export { 
  performanceMonitor, 
  mark, 
  measure, 
  createLazyLoader, 
  prefetchOnHover,
} from './performance';

// React Query
export {
  queryKeys,
  userQueryOptions,
  genomesQueryOptions,
  genomeQueryOptions,
  snpsQueryOptions,
  snpQueryOptions,
  reportsQueryOptions,
  reportQueryOptions,
  reportCategoriesQueryOptions,
  researchUpdatesQueryOptions,
  activityLogQueryOptions,
  statsQueryOptions,
  comparisonsQueryOptions,
  comparisonQueryOptions,
  searchQueryOptions,
  snpFavoritesQueryOptions,
  prefetchQueries,
} from './queryOptions';

// Session
export { 
  sessionManager, 
  type SessionData, 
  type SessionContext,
} from './session';

// SNP Database
export {
  snpDatabase,
  type ParsedSNP,
  type SNPAnnotation,
  type CategoryDefinition,
  type ProcessingProgress,
} from './snpDatabase';

// VCF Parser
export {
  vcfParser,
  type VCFSample,
  type VCFVariant,
} from './vcfParser';
