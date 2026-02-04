/**
 * Zilliz Configuration
 *
 * Environment variables needed for Zilliz Cloud:
 * - ZILLIZ_ENDPOINT: Your Zilliz cluster endpoint
 * - ZILLIZ_TOKEN: Your Zilliz API token
 *
 * Get these from: https://cloud.zilliz.com
 */

export interface ZillizConfig {
  endpoint: string;
  token: string;
  collectionPrefix: string;
  vectorDimension: number;
}

export function getZillizConfig(): ZillizConfig {
  const endpoint = process.env.ZILLIZ_ENDPOINT;
  const token = process.env.ZILLIZ_TOKEN;

  if (!endpoint || !token) {
    throw new Error(
      'Zilliz configuration missing. Please set ZILLIZ_ENDPOINT and ZILLIZ_TOKEN environment variables.'
    );
  }

  return {
    endpoint,
    token,
    collectionPrefix: 'genetic_explorer',
    vectorDimension: 384,
  };
}

export function isZillizConfigured(): boolean {
  return !!process.env.ZILLIZ_ENDPOINT && !!process.env.ZILLIZ_TOKEN;
}
