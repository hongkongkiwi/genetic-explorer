/**
 * Middleware to require genome upload for accessing certain features
 * 
 * Usage:
 * - In API routes: Check before processing request
 * - In React components: Redirect or show gate UI
 */

import { checkGenomeGate, GATED_FEATURES, type GatedFeature } from './genomeGate';
// Using native Response instead of json helper

/**
 * Result of genome requirement check
 */
export interface GenomeRequirementResult {
  allowed: boolean;
  response?: Response;
  error?: {
    code: string;
    message: string;
    redirectTo: string;
  };
}

/**
 * Check if user has genome and return appropriate response if not
 * For use in API routes
 */
export function requireGenome(
  userId: string,
  feature: GatedFeature
): GenomeRequirementResult {
  const gateResult = checkGenomeGate(userId, feature);
  
  if (gateResult.allowed) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    response: new Response(
      JSON.stringify({
        success: false,
        error: 'GENOME_REQUIRED',
        message: gateResult.reason,
        redirectTo: gateResult.redirectTo,
        feature,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    ),
    error: {
      code: 'GENOME_REQUIRED',
      message: gateResult.reason || 'This feature requires a genome upload',
      redirectTo: gateResult.redirectTo || '/upload',
    },
  };
}

/**
 * React hook result type
 */
export interface GenomeGateHookResult {
  isLoading: boolean;
  hasGenome: boolean | null;
  genomeCount: number;
  error: string | null;
  redirectTo: string;
}

/**
 * API endpoint paths that require genome upload
 */
export const GATED_API_ROUTES: Record<GatedFeature, string[]> = {
  [GATED_FEATURES.EXPLORER]: ['/api/genome/', '/api/snps/'],
  [GATED_FEATURES.HEALTH_REPORTS]: ['/api/reports/', '/api/health-report/'],
  [GATED_FEATURES.ANCESTRY]: ['/api/ancestry/'],
  [GATED_FEATURES.TRAITS]: ['/api/traits/'],
  [GATED_FEATURES.CARRIER]: ['/api/carrier/'],
  [GATED_FEATURES.RELATIVES]: ['/api/relatives/', '/api/relatives-matches/'],
  [GATED_FEATURES.SNP_SEARCH]: ['/api/search', '/api/snp/'],
  [GATED_FEATURES.COMPARISON]: ['/api/compare-genomes'],
  [GATED_FEATURES.EXPORT_DATA]: ['/api/export/', '/api/export-data'],
};

/**
 * Check if an API path requires genome upload
 */
export function pathRequiresGenome(path: string): {
  required: boolean;
  feature?: GatedFeature;
} {
  for (const [feature, paths] of Object.entries(GATED_API_ROUTES)) {
    if (paths.some(p => path.startsWith(p))) {
      return { required: true, feature: feature as GatedFeature };
    }
  }
  return { required: false };
}

/**
 * Route paths that are accessible without genome
 */
export const UNGATED_ROUTE_PATHS = [
  '/',
  '/login',
  '/register',
  '/upload',
  '/settings',
  '/profile',
  '/account',
  '/security',
  '/privacy',
  '/help',
  '/faq',
  '/about',
  '/contact',
  '/api/auth/',
  '/api/health',
  '/api/profile',
  '/api/csrf',
];

/**
 * Check if a route path is accessible without genome
 */
export function isUngatedPath(path: string): boolean {
  return UNGATED_ROUTE_PATHS.some(p => 
    path === p || path.startsWith(p + '/')
  );
}
