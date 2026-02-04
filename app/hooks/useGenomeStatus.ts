import { useQuery } from '@tanstack/react-query';
import { useAuth } from '~/hooks/useAuth';

export interface GenomeStatus {
  hasGenome: boolean;
  genomeCount: number;
  primaryGenomeId: string | null;
  uploadPrompt: string;
  gatedFeatures: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  ungatedFeatures: string[];
}

interface GenomeStatusResponse {
  success: boolean;
  data: GenomeStatus;
}

/**
 * Hook to check user's genome upload status
 * Used to gate features and show upload prompts
 */
export function useGenomeStatus() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery<GenomeStatusResponse>({
    queryKey: ['genome-status'],
    queryFn: async () => {
      const response = await fetch('/api/user/genome-status');
      if (!response.ok) {
        throw new Error('Failed to fetch genome status');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const status = data?.data;

  return {
    isLoading,
    error,
    hasGenome: status?.hasGenome ?? false,
    genomeCount: status?.genomeCount ?? 0,
    primaryGenomeId: status?.primaryGenomeId ?? null,
    uploadPrompt: status?.uploadPrompt ?? '',
    gatedFeatures: status?.gatedFeatures ?? [],
    ungatedFeatures: status?.ungatedFeatures ?? [],
    isGated: !(status?.hasGenome ?? false),
  };
}

/**
 * Hook to check if a specific feature is accessible
 */
export function useFeatureAccess(featureId: string) {
  const { hasGenome, isLoading } = useGenomeStatus();

  // List of features that always require genome upload
  const gatedFeatureIds = [
    'genome-explorer',
    'health-reports',
    'ancestry-analysis',
    'traits-analysis',
    'carrier-screening',
    'relative-matching',
    'snp-search',
    'genome-comparison',
    'export-genetic-data',
  ];

  const requiresGenome = gatedFeatureIds.includes(featureId);
  const hasAccess = !requiresGenome || hasGenome;

  return {
    isLoading,
    hasAccess,
    requiresGenome,
    showGate: requiresGenome && !hasGenome && !isLoading,
  };
}
