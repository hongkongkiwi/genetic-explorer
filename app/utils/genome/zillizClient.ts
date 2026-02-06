/**
 * Zilliz Client - Vector Search for Genomes
 * 
 * Integrates with Zilliz Cloud for vector similarity search.
 */

export interface ZillizConfig {
  endpoint: string;
  apiKey: string;
  collection: string;
}

export interface GenomeVector {
  id: string;
  genomeId: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface SNPVector {
  id: string;
  rsid: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface CollectionStats {
  count: number;
  exists: boolean;
}

// Configuration from environment
const ZILLIZ_CONFIG: ZillizConfig = {
  endpoint: process.env.ZILLIZ_ENDPOINT || '',
  apiKey: process.env.ZILLIZ_API_KEY || '',
  collection: process.env.ZILLIZ_COLLECTION || 'genome_embeddings',
};

/**
 * Check if Zilliz is configured
 */
export function isZillizConfigured(): boolean {
  return !!ZILLIZ_CONFIG.endpoint && !!ZILLIZ_CONFIG.apiKey;
}

/**
 * Make authenticated request to Zilliz API
 */
async function zillizRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: Record<string, unknown>
): Promise<T | null> {
  if (!isZillizConfigured()) {
    return null;
  }

  try {
    const response = await fetch(`${ZILLIZ_CONFIG.endpoint}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${ZILLIZ_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Zilliz] API error:', error);
      return null;
    }

    return await response.json() as T;
  } catch (error) {
    console.error('[Zilliz] Request error:', error);
    return null;
  }
}

/**
 * Insert genome embedding
 */
export async function insertGenomeEmbedding(vector: GenomeVector): Promise<void> {
  await zillizRequest('/v1/vector/insert', 'POST', {
    collectionName: ZILLIZ_CONFIG.collection,
    data: [{
      id: vector.id,
      vector: vector.embedding,
      genomeId: vector.genomeId,
      ...vector.metadata,
    }],
  });
}

/**
 * Insert SNP embeddings
 */
export async function insertSNPEmbeddings(vectors: SNPVector[]): Promise<void> {
  if (vectors.length === 0) return;

  await zillizRequest('/v1/vector/insert', 'POST', {
    collectionName: 'snp_embeddings',
    data: vectors.map(v => ({
      id: v.id,
      vector: v.embedding,
      rsid: v.rsid,
      ...v.metadata,
    })),
  });
}

/**
 * Search similar genomes
 */
export async function searchSimilarGenomes(
  vector: number[],
  topK: number = 5
): Promise<Array<{ id: string; score: number }>> {
  const result = await zillizRequest<{
    data: Array<{ id: string; distance: number }>;
  }>('/v1/vector/search', 'POST', {
    collectionName: ZILLIZ_CONFIG.collection,
    vector,
    topK,
  });

  if (!result?.data) {
    return [];
  }

  return result.data.map(item => ({
    id: item.id,
    score: 1 - item.distance, // Convert distance to similarity score
  }));
}

/**
 * Search similar SNPs
 */
export async function searchSimilarSNPs(
  vector: number[],
  topK: number = 10
): Promise<Array<{ id: string; score: number }>> {
  const result = await zillizRequest<{
    data: Array<{ id: string; distance: number }>;
  }>('/v1/vector/search', 'POST', {
    collectionName: 'snp_embeddings',
    vector,
    topK,
  });

  if (!result?.data) {
    return [];
  }

  return result.data.map(item => ({
    id: item.id,
    score: 1 - item.distance,
  }));
}

/**
 * Delete genome embedding
 */
export async function deleteGenomeEmbedding(genomeId: string): Promise<void> {
  await zillizRequest('/v1/vector/delete', 'POST', {
    collectionName: ZILLIZ_CONFIG.collection,
    filter: `genomeId == "${genomeId}"`,
  });
}

/**
 * Check Zilliz health
 */
export async function checkZillizHealth(): Promise<boolean> {
  if (!isZillizConfigured()) {
    return false;
  }

  try {
    const response = await fetch(`${ZILLIZ_CONFIG.endpoint}/v1/vector/collections`, {
      headers: {
        'Authorization': `Bearer ${ZILLIZ_CONFIG.apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(collection: string): Promise<CollectionStats> {
  const result = await zillizRequest<{
    data: { rowCount: number };
  }>('/v1/vector/collections/describe', 'POST', {
    collectionName: collection,
  });

  return {
    count: result?.data?.rowCount || 0,
    exists: !!result,
  };
}

/**
 * Create Zilliz client instance
 */
export function createZillizClient(config: ZillizConfig): ZillizClient {
  return new ZillizClient(config);
}

export class ZillizClient {
  private config: ZillizConfig;

  constructor(config: ZillizConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // Connection is stateless via HTTP API
  }

  async disconnect(): Promise<void> {
    // No persistent connection to close
  }

  async search(vector: number[], topK: number): Promise<Array<{ id: string; score: number }>> {
    return searchSimilarGenomes(vector, topK);
  }

  async insert(data: Record<string, unknown>): Promise<void> {
    await zillizRequest('/v1/vector/insert', 'POST', {
      collectionName: this.config.collection,
      data: [data],
    });
  }
}
