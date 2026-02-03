/**
 * Zilliz Cloud Client for Vector Search
 *
 * Zilliz Cloud Free Tier:
 * - 5 GB storage (~1M vectors at 768 dimensions)
 * - 2.5M vCUs per month
 * - Up to 5 collections
 *
 * Docs: https://docs.zilliz.com/docs
 */

import { Client, DataType } from '@zilliz/milvus-client-sdk';

// Vector dimension for genetic embeddings
export const VECTOR_DIMENSION = 384;

// Collection names
export const COLLECTIONS = {
  SNP_EMBEDDINGS: 'snp_embeddings',
  GENOME_EMBEDDINGS: 'genome_embeddings',
  PHENOTYPE_EMBEDDINGS: 'phenotype_embeddings',
} as const;

// Type definitions
export interface VectorSearchResult {
  id: string;
  score: number;
  payload?: Record<string, unknown>;
}

export interface GenomeVector {
  genomeId: string;
  embedding: number[];
  metadata: {
    filename: string;
    source: string;
    snpCount: number;
    uploadDate: string;
  };
}

export interface SNPVector {
  rsid: string;
  embedding: number[];
  metadata: {
    gene: string | null;
    chromosome: string;
    position: number;
    clinicalImpact: string;
    category: string;
  };
}

// Singleton client instance
let client: Client | null = null;
let isInitialized = false;

/**
 * Initialize Zilliz client with environment variables
 *
 * Required environment variables:
 * - ZILLIZ_ENDPOINT: Your Zilliz cluster endpoint (e.g., https://xxxxx.cluster.zilliz.com)
 * - ZILLIZ_TOKEN: Your Zilliz API token
 */
export async function getZillizClient(): Promise<Client> {
  if (client) {
    return client;
  }

  const endpoint = process.env.ZILLIZ_ENDPOINT;
  const token = process.env.ZILLIZ_TOKEN;

  if (!endpoint || !token) {
    throw new Error(
      'Zilliz environment variables not configured. Please set ZILLIZ_ENDPOINT and ZILLIZ_TOKEN.'
    );
  }

  client = new Client({
    address: endpoint,
    token,
  });

  return client;
}

/**
 * Check if Zilliz is configured and available
 */
export async function isZillizConfigured(): Promise<boolean> {
  try {
    await getZillizClient();
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize Zilliz collections and indexes
 */
export async function initializeZilliz(): Promise<void> {
  if (isInitialized) return;

  try {
    const zilliz = await getZillizClient();

    // Create SNP embeddings collection
    await createCollectionIfNotExists(
      zilliz,
      COLLECTIONS.SNP_EMBEDDINGS,
      VECTOR_DIMENSION,
      [
        { name: 'rsid', dataType: DataType.VarChar, isPrimaryKey: true, maxLength: 20 },
        { name: 'gene', dataType: DataType.VarChar, maxLength: 50 },
        { name: 'chromosome', dataType: DataType.VarChar, maxLength: 5 },
        { name: 'position', dataType: DataType.Int64 },
        { name: 'clinical_impact', dataType: DataType.VarChar, maxLength: 50 },
        { name: 'category', dataType: DataType.VarChar, maxLength: 50 },
      ]
    );

    // Create genome embeddings collection
    await createCollectionIfNotExists(
      zilliz,
      COLLECTIONS.GENOME_EMBEDDINGS,
      VECTOR_DIMENSION,
      [
        { name: 'genome_id', dataType: DataType.VarChar, isPrimaryKey: true, maxLength: 50 },
        { name: 'filename', dataType: DataType.VarChar, maxLength: 255 },
        { name: 'source', dataType: DataType.VarChar, maxLength: 50 },
        { name: 'snp_count', dataType: DataType.Int64 },
        { name: 'upload_date', dataType: DataType.VarChar, maxLength: 50 },
      ]
    );

    // Create phenotype embeddings collection for disease/trait correlations
    await createCollectionIfNotExists(
      zilliz,
      COLLECTIONS.PHENOTYPE_EMBEDDINGS,
      VECTOR_DIMENSION,
      [
        { name: 'phenotype_id', dataType: DataType.VarChar, isPrimaryKey: true, maxLength: 50 },
        { name: 'name', dataType: DataType.VarChar, maxLength: 255 },
        { name: 'category', dataType: DataType.VarChar, maxLength: 100 },
        { name: 'description', dataType: DataType.VarChar, maxLength: 1000 },
      ]
    );

    isInitialized = true;
    console.log('Zilliz collections initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Zilliz:', error);
    throw error;
  }
}

/**
 * Helper to create collection if it doesn't exist
 */
async function createCollectionIfNotExists(
  zilliz: Client,
  collectionName: string,
  dimension: number,
  schemaFields: Array<{
    name: string;
    dataType: DataType;
    isPrimaryKey?: boolean;
    maxLength?: number;
  }>
): Promise<void> {
  try {
    // Check if collection exists
    const hasCollection = await zilliz.hasCollection({ collectionName });
    if (hasCollection) {
      console.log(`Collection ${collectionName} already exists`);
      return;
    }

    // Create collection with schema
    await zilliz.createCollection({
      collectionName,
      fields: [
        {
          name: 'vector',
          dataType: DataType.FloatVector,
          dim: dimension,
        },
        ...schemaFields,
      ],
    });

    // Create index for vector search
    await zilliz.createIndex({
      collectionName,
      fieldName: 'vector',
      indexName: 'vector_index',
      extraParams: {
        index_type: 'IVF_FLAT',
        metric_type: 'COSINE',
        params: JSON.stringify({ nlist: 100 }),
      },
    });

    // Load collection into memory for search
    await zilliz.loadCollection({ collectionName });

    console.log(`Collection ${collectionName} created successfully`);
  } catch (error) {
    console.error(`Failed to create collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Insert genome embedding into Zilliz
 */
export async function insertGenomeEmbedding(
  genomeVector: GenomeVector
): Promise<void> {
  const zilliz = await getZillizClient();

  await zilliz.upsert({
    collectionName: COLLECTIONS.GENOME_EMBEDDINGS,
    data: [
      {
        vector: genomeVector.embedding,
        genome_id: genomeVector.genomeId,
        filename: genomeVector.metadata.filename,
        source: genomeVector.metadata.source,
        snp_count: genomeVector.metadata.snpCount,
        upload_date: genomeVector.metadata.uploadDate,
      },
    ],
  });
}

/**
 * Insert SNP embeddings into Zilliz
 */
export async function insertSNPEmbeddings(
  snpVectors: SNPVector[]
): Promise<void> {
  if (snpVectors.length === 0) return;

  const zilliz = await getZillizClient();

  const data = snpVectors.map((snp) => ({
    vector: snp.embedding,
    rsid: snp.rsid,
    gene: snp.metadata.gene,
    chromosome: snp.metadata.chromosome,
    position: snp.metadata.position,
    clinical_impact: snp.metadata.clinicalImpact,
    category: snp.metadata.category,
  }));

  await zilliz.upsert({
    collectionName: COLLECTIONS.SNP_EMBEDDINGS,
    data,
  });
}

/**
 * Search for similar genomes based on embedding
 */
export async function searchSimilarGenomes(
  queryEmbedding: number[],
  limit: number = 5
): Promise<VectorSearchResult[]> {
  const zilliz = await getZillizClient();

  const results = await zilliz.search({
    collectionName: COLLECTIONS.GENOME_EMBEDDINGS,
    data: [queryEmbedding],
    limit,
    outputFields: ['genome_id', 'filename', 'source', 'snp_count', 'upload_date'],
  });

  return results.map((result) => ({
    id: result.id as string,
    score: result.score,
    payload: result.entity as Record<string, unknown>,
  }));
}

/**
 * Search for similar SNPs based on embedding
 */
export async function searchSimilarSNPs(
  queryEmbedding: number[],
  limit: number = 10,
  filter?: {
    chromosome?: string;
    clinicalImpact?: string;
    category?: string;
  }
): Promise<VectorSearchResult[]> {
  const zilliz = await getZillizClient();

  const exprParts: string[] = [];
  if (filter?.chromosome) exprParts.push(`chromosome == "${filter.chromosome}"`);
  if (filter?.clinicalImpact) exprParts.push(`clinical_impact == "${filter.clinicalImpact}"`);
  if (filter?.category) exprParts.push(`category == "${filter.category}"`);

  const results = await zilliz.search({
    collectionName: COLLECTIONS.SNP_EMBEDDINGS,
    data: [queryEmbedding],
    limit,
    filter: exprParts.join(' && '),
    outputFields: ['rsid', 'gene', 'chromosome', 'position', 'clinical_impact', 'category'],
  });

  return results.map((result) => ({
    id: result.id as string,
    score: result.score,
    payload: result.entity as Record<string, unknown>,
  }));
}

/**
 * Delete genome embedding
 */
export async function deleteGenomeEmbedding(genomeId: string): Promise<void> {
  const zilliz = await getZillizClient();

  await zilliz.delete({
    collectionName: COLLECTIONS.GENOME_EMBEDDINGS,
    filter: `genome_id == "${genomeId}"`,
  });
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(collectionName: string): Promise<{
  count: number;
  status: string;
}> {
  const zilliz = await getZillizClient();

  const stats = await zilliz.getCollectionStatistics({
    collectionName,
  });

  return {
    count: parseInt((stats as Record<string, unknown>).row_count as string) || 0,
    status: (stats as Record<string, unknown>).status as string,
  };
}

/**
 * Health check for Zilliz connection
 */
export async function checkZillizHealth(): Promise<boolean> {
  try {
    const zilliz = await getZillizClient();
    await zilliz.hasCollection({ collectionName: COLLECTIONS.SNP_EMBEDDINGS });
    return true;
  } catch {
    return false;
  }
}
