import { queryOptions } from '@tanstack/react-query';

// Query keys factory for type-safe queries
export const queryKeys = {
  user: ['user'] as const,
  genomes: ['genomes'] as const,
  genome: (id: string) => ['genomes', id] as const,
  snps: (filters: Record<string, string | undefined>) => 
    ['snps', filters] as const,
  snp: (rsid: string) => ['snps', rsid] as const,
  reports: (genomeId?: string) => ['reports', genomeId] as const,
  report: (id: string) => ['reports', id] as const,
  reportCategories: ['report-categories'] as const,
  researchUpdates: ['research-updates'] as const,
  activityLog: (params?: { page?: number; limit?: number }) => 
    ['activity-log', params] as const,
  stats: ['stats'] as const,
  comparisons: ['comparisons'] as const,
  comparison: (id: string) => ['comparisons', id] as const,
  search: (query: string) => ['search', query] as const,
  snpFavorites: ['snp-favorites'] as const,
};

// User query options
export const userQueryOptions = queryOptions({
  queryKey: queryKeys.user,
  queryFn: async () => {
    const response = await fetch('/api/user');
    if (!response.ok) {
      if (response.status === 401) return null;
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: false,
});

// Genomes list query options
export const genomesQueryOptions = queryOptions({
  queryKey: queryKeys.genomes,
  queryFn: async () => {
    const response = await fetch('/api/genomes');
    if (!response.ok) throw new Error('Failed to fetch genomes');
    return response.json();
  },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
});

// Single genome query options
export const genomeQueryOptions = (id: string) => queryOptions({
  queryKey: queryKeys.genome(id),
  queryFn: async () => {
    const response = await fetch(`/api/genomes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch genome');
    return response.json();
  },
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
  enabled: !!id,
});

// SNPs query options with filters
export const snpsQueryOptions = (
  filters: {
    genomeId?: string;
    search?: string;
    category?: string;
    impact?: string;
    chromosome?: string;
    favoritesOnly?: boolean;
    sortBy?: string;
    sortDirection?: string;
    page?: number;
    limit?: number;
  } = {}
) => queryOptions({
  queryKey: queryKeys.snps(filters),
  queryFn: async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/snps?${params}`);
    if (!response.ok) throw new Error('Failed to fetch SNPs');
    return response.json();
  },
  staleTime: 30 * 1000, // 30 seconds - SNPs can change frequently
  gcTime: 2 * 60 * 1000,
  enabled: !!filters.genomeId,
});

// Single SNP query options
export const snpQueryOptions = (rsid: string) => queryOptions({
  queryKey: queryKeys.snp(rsid),
  queryFn: async () => {
    const response = await fetch(`/api/snps/${rsid}`);
    if (!response.ok) throw new Error('Failed to fetch SNP');
    return response.json();
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  enabled: !!rsid,
});

// Reports query options
export const reportsQueryOptions = (genomeId?: string) => queryOptions({
  queryKey: queryKeys.reports(genomeId),
  queryFn: async () => {
    const url = genomeId ? `/api/reports?genomeId=${genomeId}` : '/api/reports';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
});

// Single report query options
export const reportQueryOptions = (id: string) => queryOptions({
  queryKey: queryKeys.report(id),
  queryFn: async () => {
    const response = await fetch(`/api/reports/${id}`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  enabled: !!id,
});

// Report categories query options
export const reportCategoriesQueryOptions = queryOptions({
  queryKey: queryKeys.reportCategories,
  queryFn: async () => {
    const response = await fetch('/api/reports/categories');
    if (!response.ok) throw new Error('Failed to fetch report categories');
    return response.json();
  },
  staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
  gcTime: 30 * 60 * 1000,
});

// Research updates query options with caching
export const researchUpdatesQueryOptions = queryOptions({
  queryKey: queryKeys.researchUpdates,
  queryFn: async () => {
    const response = await fetch('/api/research-updates');
    if (!response.ok) throw new Error('Failed to fetch research updates');
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 15 * 60 * 1000, // 15 minutes
});

// Activity log query options
export const activityLogQueryOptions = (
  params: { page?: number; limit?: number } = {}
) => queryOptions({
  queryKey: queryKeys.activityLog(params),
  queryFn: async () => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    const url = `/api/activity-log${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch activity log');
    return response.json();
  },
  staleTime: 30 * 1000, // 30 seconds - activity changes frequently
  gcTime: 2 * 60 * 1000,
});

// Stats query options
export const statsQueryOptions = queryOptions({
  queryKey: queryKeys.stats,
  queryFn: async () => {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
  staleTime: 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000,
});

// Comparisons query options
export const comparisonsQueryOptions = queryOptions({
  queryKey: queryKeys.comparisons,
  queryFn: async () => {
    const response = await fetch('/api/comparisons');
    if (!response.ok) throw new Error('Failed to fetch comparisons');
    return response.json();
  },
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
});

// Single comparison query options
export const comparisonQueryOptions = (id: string) => queryOptions({
  queryKey: queryKeys.comparison(id),
  queryFn: async () => {
    const response = await fetch(`/api/comparisons/${id}`);
    if (!response.ok) throw new Error('Failed to fetch comparison');
    return response.json();
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  enabled: !!id,
});

// Global search query options
export const searchQueryOptions = (query: string) => queryOptions({
  queryKey: queryKeys.search(query),
  queryFn: async () => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search');
    return response.json();
  },
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
  enabled: query.length >= 2,
});

// SNP favorites query options
export const snpFavoritesQueryOptions = queryOptions({
  queryKey: queryKeys.snpFavorites,
  queryFn: async () => {
    const response = await fetch('/api/snp-favorites');
    if (!response.ok) throw new Error('Failed to fetch SNP favorites');
    return response.json();
  },
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
});

// Prefetch helpers for loaders
export const prefetchQueries = {
  dashboard: async (queryClient: any) => {
    await Promise.all([
      queryClient.prefetchQuery(userQueryOptions),
      queryClient.prefetchQuery(genomesQueryOptions),
      queryClient.prefetchQuery(statsQueryOptions),
      queryClient.prefetchQuery(activityLogQueryOptions({ limit: 5 })),
    ]);
  },

  explorer: async (queryClient: any, genomeId?: string) => {
    await Promise.all([
      queryClient.prefetchQuery(genomesQueryOptions),
      genomeId && queryClient.prefetchQuery(genomeQueryOptions(genomeId)),
    ].filter(Boolean));
  },

  reports: async (queryClient: any, genomeId?: string) => {
    await Promise.all([
      queryClient.prefetchQuery(reportsQueryOptions(genomeId)),
      queryClient.prefetchQuery(reportCategoriesQueryOptions),
    ]);
  },

  whatsNew: async (queryClient: any) => {
    await queryClient.prefetchQuery(researchUpdatesQueryOptions);
  },
};
