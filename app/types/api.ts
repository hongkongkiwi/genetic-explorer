// API Request/Response Types - Strictly Typed

// Common API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Pagination Params
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

// Sorting Params
export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortDirection?: 'asc' | 'desc';
}

// Generic Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// Genome API Types
// ============================================

export interface Genome {
  id: string;
  filename: string;
  internalFilename: string;
  source: '23andme' | 'ancestry' | 'myheritage' | 'other';
  snpCount: number;
  storedSnps: number;
  fileSize: string;
  compressionType: 'gzip' | 'zip' | null;
  checksum: string;
  processedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  userId: string;
}

export interface GenomeListResponse {
  genomes: Genome[];
  stats: {
    totalGenomes: number;
    totalSNPs: number;
    totalReports: number;
    averageSnpsPerGenome: number;
  };
}

export interface GenomeUploadRequest {
  file: File;
}

export interface GenomeUploadResponse {
  genomeId: string;
  success: boolean;
  message?: string;
}

// ============================================
// SNP API Types
// ============================================

export type SNPImpact = 'high' | 'moderate' | 'low' | 'protective';
export type SNPCategory = 
  | 'Drug Response' 
  | 'Nutrition' 
  | 'Fitness' 
  | 'Disease Risk' 
  | 'Methylation'
  | 'Cardiovascular'
  | 'Immune System'
  | 'Cognitive';

export interface SNPResult {
  rsid: string;
  gene: string | null;
  chromosome: string;
  position: number;
  genotype: string;
  category: SNPCategory;
  clinicalImpact: SNPImpact;
  summary: string | null;
}

export interface SNPFilterParams extends PaginationParams, SortParams<'rsid' | 'gene' | 'chromosome' | 'category' | 'impact'> {
  genomeId: string;
  search?: string;
  category?: SNPCategory | 'all';
  impact?: SNPImpact | 'all';
  chromosome?: string | 'all';
  favoritesOnly?: boolean;
}

export interface SNPListResponse extends PaginatedResponse<SNPResult> {
  filters: {
    categories: SNPCategory[];
    chromosomes: string[];
    favoritesCount: number;
  };
}

export interface SNPFavorite {
  rsid: string;
  notes: string | null;
  addedAt: string;
}

export interface SNPUpdate {
  rsid: string;
  status: 'new' | 'research-updated' | 'evidence-upgraded' | 'recommendation-changed' | 'major-update';
  date: string;
}

// ============================================
// Report API Types
// ============================================

export interface Report {
  id: string;
  genomeId: string;
  genomeName?: string;
  reportType: string;
  generatedAt: string;
  status: 'pending' | 'completed' | 'error';
}

export interface ReportDetail extends Report {
  content: HealthReportContent;
}

export interface HealthReportContent {
  summary: {
    totalVariants: number;
    highImpact: number;
    categories: Record<string, number>;
  };
  executiveSummary: string;
  sections: ReportSection[];
  diseaseRisks: DiseaseRiskItem[];
  drugMetabolism: DrugMetabolismItem[];
}

export interface ReportSection {
  id: string;
  type: 'overview' | 'finding' | 'drug' | 'risk' | 'protocol' | 'variants';
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  actionItems?: string[];
}

export interface DiseaseRiskItem {
  condition: string;
  riskLevel: 'High' | 'Moderate' | 'Low' | 'Protective';
  description: string;
}

export interface DrugMetabolismItem {
  category: string;
  drugs: string[];
  guidance: string;
}

export interface ReportCompareRequest {
  genomeA: string;
  genomeB: string;
}

export interface ReportCompareResponse {
  sharedVariants: number;
  uniqueToA: number;
  uniqueToB: number;
  similarity: number;
  differences: GenomeDifference[];
}

export interface GenomeDifference {
  rsid: string;
  gene?: string;
  genomeA: {
    genotype: string;
    impact: string;
  };
  genomeB: {
    genotype: string;
    impact: string;
  };
  significance: 'high' | 'medium' | 'low';
}

// ============================================
// Dashboard API Types
// ============================================

export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface DashboardRequest {
  range: TimeRange;
}

export interface DashboardResponse {
  stats: {
    totalGenomes: number;
    totalReports: number;
    sharedWithMe: number;
    sharedByMe: number;
    recentUpdates: number;
  };
  recentGenomes: Array<{
    id: string;
    filename: string;
    snpCount: number;
    processedAt: string;
  }>;
  recentReports: Array<{
    id: string;
    genomeId: string;
    genomeName: string;
    generatedAt: string;
  }>;
  updates: Array<{
    id: string;
    type: 'new' | 'research-updated' | 'evidence-upgraded' | 'recommendation-changed' | 'major-update';
    title: string;
    description: string;
    rsid?: string;
    date: string;
    affectsUser: boolean;
  }>;
  recommendations: string[];
}

// ============================================
// Research API Types
// ============================================

export interface ResearchStats {
  snpCount: number;
  clinvarCount: number;
  paperCount: number;
  drugInteractionCount: number;
  geneCount: number;
  gwasCount: number;
  lastSyncBySource: Record<string, string>;
}

export interface ResearchUpdate {
  id: string;
  rsid?: string;
  gene?: string;
  changeType: 'new' | 'research_added' | 'recommendation_updated' | 'evidence_upgraded' | 'updated' | 'major_update';
  description: string;
  date: string;
  isMajor: boolean;
  affectsUserCount: number;
  papersAdded?: number;
}

export interface WhatsNewResponse {
  stats: {
    totalUpdates: number;
    thisMonth: number;
    newSnps: number;
    researchAdded: number;
    recommendationsUpdated: number;
    evidenceUpgraded: number;
  };
  changelog: ResearchUpdate[];
  lastUpdated: string;
}

// ============================================
// Search API Types
// ============================================

export type SearchResultType = 'genome' | 'snp' | 'report' | 'research' | 'user';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchRequest {
  q: string;
  limit?: number;
}

// ============================================
// User API Types
// ============================================

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  emailVerified: boolean;
}

export interface UserProfile {
  displayName: string;
  bio: string;
  birthDate: string;
  sex: 'male' | 'female' | 'other' | '';
  ancestry: string;
  timezone: string;
  privacySettings: {
    shareAnonymized: boolean;
    allowFamilySharing: boolean;
  };
}

export interface NotificationPreferences {
  email: {
    newFeatures: boolean;
    researchUpdates: boolean;
    sharingInvites: boolean;
    securityAlerts: boolean;
    reportReady: boolean;
  };
  inApp: {
    newFeatures: boolean;
    researchUpdates: boolean;
    sharingActivity: boolean;
    genomeAnalysisComplete: boolean;
  };
}

// ============================================
// Activity API Types
// ============================================

export type ActivityAction = 
  | 'user_registered'
  | 'user_login'
  | 'user_logout'
  | 'genome_uploaded'
  | 'genome_deleted'
  | 'genome_set_primary'
  | 'report_generated'
  | 'sharing_created'
  | 'sharing_revoked'
  | 'profile_updated';

export interface ActivityItem {
  id: number;
  action: ActivityAction;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST';
