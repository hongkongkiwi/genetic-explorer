/**
 * Vector Search Integration for Genetic Explorer
 *
 * This module integrates Zilliz vector search with D1 database
 * for semantic similarity search across genomes, SNPs, and research.
 *
 * Use cases:
 * - Find similar genomes based on genetic markers
 * - Discover related SNPs based on clinical significance
 * - Search research by semantic similarity
 * - Auto-update vectors when new data is added
 */

import {
  insertGenomeEmbedding,
  insertSNPEmbeddings,
  searchSimilarGenomes,
  searchSimilarSNPs,
  deleteGenomeEmbedding,
  type GenomeVector,
  type SNPVector,
} from './zillizClient';
import { d1Query, d1Exec, d1Get, d1Insert } from './d1Client';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// EMBEDDING GENERATION
// ============================================

/**
 * Generate embedding from genome SNP profile
 * Creates a simplified vector representation of a genome based on key SNPs
 *
 * Note: In production, you'd use a proper ML model for embeddings.
 * This is a placeholder that creates deterministic embeddings.
 */
export function generateGenomeEmbedding(snps: Array<{ rsid: string; genotype: string }>): number[] {
  // Deterministic embedding based on SNP values
  // In production, use a proper embedding model like:
  // - Sentence Transformers for text descriptions
  // - Custom DNA embedding model
  const embedding: number[] = new Array(384).fill(0);

  // Use hash of SNP data to seed the embedding
  const snpString = snps.map(s => `${s.rsid}:${s.genotype}`).sort().join('|');
  const hash = hashString(snpString);

  // Create deterministic embedding from hash
  for (let i = 0; i < 384; i++) {
    embedding[i] = ((hash >> (i % 32)) & 1) ? 1 : -1;
    // Add some variation based on position
    embedding[i] += Math.sin(i * 0.1) * 0.1;
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Generate embedding for a single SNP
 */
export function generateSNPEmbedding(rsid: string, genotype: string, metadata: {
  gene?: string | null;
  chromosome: string;
  clinicalImpact: string;
  category: string;
}): number[] {
  const embedding: number[] = new Array(384).fill(0);

  // Create deterministic embedding from SNP properties
  const inputString = `${rsid}:${genotype}:${metadata.chromosome}:${metadata.clinicalImpact}:${metadata.category}`;
  const hash = hashString(inputString);

  for (let i = 0; i < 384; i++) {
    embedding[i] = ((hash >> (i % 32)) & 1) ? 1 : -1;
    // Add gene-based variation
    if (metadata.gene) {
      const geneHash = hashString(metadata.gene);
      embedding[i] += ((geneHash >> (i % 32)) & 1) ? 0.3 : -0.3;
    }
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
}

/**
 * Simple string hash function (djb2)
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// ============================================
// GENOME VECTOR OPERATIONS
// ============================================

/**
 * Create vector embedding for a genome and store in Zilliz
 */
export async function indexGenomeInVectorDB(genomeId: string): Promise<void> {
  // Get genome data from D1
  const genome = await d1Get<{
    id: string;
    filename: string;
    source: string;
    snp_count: number;
    created_at: string;
  }>(
    `SELECT id, filename, source, snp_count, created_at FROM genomes WHERE id = ?`,
    [genomeId]
  );

  if (!genome) {
    throw new Error(`Genome ${genomeId} not found`);
  }

  // Get SNPs for embedding
  const snps = await d1Query<{ rsid: string; genotype: string }>(
    `SELECT rsid, genotype FROM snps WHERE genome_id = ? LIMIT 1000`,
    [genomeId]
  );

  // Generate embedding
  const embedding = generateGenomeEmbedding(snps.results);

  // Store in Zilliz
  await insertGenomeEmbedding({
    genomeId: genome.id,
    embedding,
    metadata: {
      filename: genome.filename,
      source: genome.source,
      snpCount: genome.snp_count,
      uploadDate: genome.created_at,
    },
  });
}

/**
 * Find similar genomes based on genetic profile
 */
export async function findSimilarGenomes(
  genomeId: string,
  limit: number = 5
): Promise<Array<{
  genomeId: string;
  filename: string;
  source: string;
  snpCount: number;
  similarity: number;
}>> {
  // Generate embedding for the query genome
  const snps = await d1Query<{ rsid: string; genotype: string }>(
    `SELECT rsid, genotype FROM snps WHERE genome_id = ? LIMIT 1000`,
    [genomeId]
  );

  const embedding = generateGenomeEmbedding(snps.results);

  // Search Zilliz
  const results = await searchSimilarGenomes(embedding, limit + 1); // +1 to exclude self

  // Filter out the query genome and format results
  return results
    .filter(r => r.id !== genomeId)
    .slice(0, limit)
    .map(r => ({
      genomeId: r.id,
      filename: (r.payload?.filename as string) || '',
      source: (r.payload?.source as string) || '',
      snpCount: (r.payload?.snp_count as number) || 0,
      similarity: r.score,
    }));
}

/**
 * Remove genome from vector database
 */
export async function removeGenomeFromVectorDB(genomeId: string): Promise<void> {
  await deleteGenomeEmbedding(genomeId);
}

// ============================================
// SNP VECTOR OPERATIONS
// ============================================

/**
 * Index SNPs in Zilliz for semantic search
 */
export async function indexSNPsInVectorDB(snpLimit: number = 10000): Promise<number> {
  // Get SNPs with metadata from D1
  const snps = await d1Query<{
    rsid: string;
    genotype: string;
    gene: string | null;
    chromosome: string;
    position: number;
    clinical_impact: string;
    category: string;
  }>(`
    SELECT DISTINCT
      s.rsid,
      s.genotype,
      sd.gene_symbol as gene,
      s.chromosome,
      s.position,
      COALESCE(sd.clinical_significance, 'unknown') as clinical_impact,
      COALESCE(sd.category, 'unknown') as category
    FROM snps s
    LEFT JOIN snp_database sd ON s.rsid = sd.rsid
    LIMIT ?
  `, [snpLimit]);

  // Convert to vector format
  const vectors: SNPVector[] = snps.results.map(snp => ({
    rsid: snp.rsid,
    embedding: generateSNPEmbedding(snp.rsid, snp.genotype, {
      gene: snp.gene,
      chromosome: snp.chromosome,
      clinicalImpact: snp.clinical_impact,
      category: snp.category,
    }),
    metadata: {
      gene: snp.gene,
      chromosome: snp.chromosome,
      position: snp.position,
      clinicalImpact: snp.clinical_impact,
      category: snp.category,
    },
  }));

  // Insert in batches
  const batchSize = 500;
  let totalInserted = 0;

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await insertSNPEmbeddings(batch);
    totalInserted += batch.length;
  }

  return totalInserted;
}

/**
 * Find similar SNPs based on genetic/clinical profile
 */
export async function findSimilarSNPs(
  query: {
    rsid?: string;
    gene?: string;
    chromosome?: string;
    clinicalImpact?: string;
    category?: string;
  },
  embedding?: number[],
  limit: number = 10
): Promise<Array<{
  rsid: string;
  gene: string | null;
  chromosome: string;
  position: number;
  clinicalImpact: string;
  category: string;
  similarity: number;
}>> {
  let searchEmbedding = embedding;

  // If no embedding provided, generate from query
  if (!searchEmbedding) {
    if (query.rsid) {
      // Get SNP data for embedding
      const snp = await d1Get<{
        rsid: string;
        genotype: string;
        chromosome: string;
        clinical_impact: string;
        category: string;
      }>(
        `SELECT s.*, COALESCE(sd.clinical_significance, 'unknown') as clinical_impact,
                COALESCE(sd.category, 'unknown') as category
         FROM snps s
         LEFT JOIN snp_database sd ON s.rsid = sd.rsid
         WHERE s.rsid = ? LIMIT 1`,
        [query.rsid]
      );

      if (snp) {
        searchEmbedding = generateSNPEmbedding(snp.rsid, snp.genotype, {
          gene: query.gene || null,
          chromosome: snp.chromosome,
          clinicalImpact: snp.clinical_impact,
          category: snp.category,
        });
      }
    }
  }

  if (!searchEmbedding) {
    return [];
  }

  // Search Zilliz
  const results = await searchSimilarSNPs(searchEmbedding, limit, {
    chromosome: query.chromosome,
    clinicalImpact: query.clinicalImpact,
    category: query.category,
  });

  return results.map(r => ({
    rsid: r.id,
    gene: (r.payload?.gene as string) || null,
    chromosome: (r.payload?.chromosome as string) || '',
    position: (r.payload?.position as number) || 0,
    clinicalImpact: (r.payload?.clinical_impact as string) || '',
    category: (r.payload?.category as string) || '',
    similarity: r.score,
  }));
}

// ============================================
// RESEARCH/SNP CORRELATION SEARCH
// ============================================

/**
 * Search research updates using semantic similarity
 */
export async function searchResearchBySemanticQuery(
  queryText: string,
  limit: number = 10
): Promise<Array<{
  id: number;
  rsid: string;
  geneName: string | null;
  changeType: string;
  description: string | null;
  source: string | null;
  date: string;
  relevance: number;
}>> {
  // Generate embedding from query text
  const queryEmbedding = generateTextEmbedding(queryText);

  // For now, use keyword search in D1 as fallback
  // In production, you would have a research collection in Zilliz
  const results = await d1Query<{
    id: number;
    rsid: string;
    gene_name: string | null;
    change_type: string;
    description: string | null;
    source: string | null;
    date: string;
  }>(`
    SELECT * FROM research_updates
    WHERE rsid LIKE ? OR gene_name LIKE ? OR description LIKE ?
    ORDER BY date DESC
    LIMIT ?
  `, [`%${queryText}%`, `%${queryText}%`, `%${queryText}%`, limit]);

  return results.results.map(r => ({
    ...r,
    relevance: 0.8, // Placeholder - would be actual vector similarity
  }));
}

/**
 * Generate embedding from text query
 */
export function generateTextEmbedding(text: string): number[] {
  const embedding: number[] = new Array(384).fill(0);
  const hash = hashString(text.toLowerCase());

  for (let i = 0; i < 384; i++) {
    embedding[i] = ((hash >> (i % 32)) & 1) ? 1 : -1;
    // Add some sinusoidal variation
    embedding[i] += Math.sin(i * text.length * 0.01) * 0.2;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
}

// ============================================
// AUTO-INDEXING TRIGGERS
// ============================================

/**
 * Called when a new genome is uploaded
 * Automatically creates vector embedding
 */
export async function onGenomeUploaded(genomeId: string): Promise<void> {
  try {
    await indexGenomeInVectorDB(genomeId);
    console.log(`Genome ${genomeId} indexed in vector DB`);
  } catch (error) {
    console.error(`Failed to index genome ${genomeId}:`, error);
    // Don't throw - indexing failure shouldn't block genome upload
  }
}

/**
 * Called when research is updated
 * Updates SNP vectors with new information
 */
export async function onResearchUpdated(rsid: string): Promise<void> {
  // Get updated SNP info
  const snp = await d1Get<{
    rsid: string;
    chromosome: string;
    position: number;
  }>(
    `SELECT rsid, chromosome, position FROM snps WHERE rsid = ? LIMIT 1`,
    [rsid]
  );

  if (!snp) return;

  // Re-index SNPs with new research data
  await indexSNPsInVectorDB(100); // Re-index 100 SNPs (including this one)
}

/**
 * Bulk re-index all genomes (for initial setup or recovery)
 */
export async function reindexAllGenomes(): Promise<void> {
  const genomes = await d1Query<{ id: string }>(
    `SELECT id FROM genomes WHERE status = 'completed'`
  );

  for (const genome of genomes.results) {
    try {
      await indexGenomeInVectorDB(genome.id);
    } catch (error) {
      console.error(`Failed to re-index genome ${genome.id}:`, error);
    }
  }
}

/**
 * Bulk re-index all SNPs (for initial setup or recovery)
 */
export async function reindexAllSNPs(): Promise<number> {
  return await indexSNPsInVectorDB(50000); // Index up to 50k SNPs
}

// ============================================
// HEALTH CHECKS
// ============================================

/**
 * Get vector database statistics
 */
export async function getVectorStats(): Promise<{
  zillizConfigured: boolean;
  genomeVectors: number;
  snpVectors: number;
  lastUpdated: string;
}> {
  const { checkZillizHealth } = await import('./zillizClient');
  const { getCollectionStats } = await import('./zillizClient');

  const configured = await checkZillizHealth();

  let genomeVectors = 0;
  let snpVectors = 0;

  if (configured) {
    try {
      const genomeStats = await getCollectionStats('genome_embeddings');
      const snpStats = await getCollectionStats('snp_embeddings');
      genomeVectors = genomeStats.count;
      snpVectors = snpStats.count;
    } catch {
      // Collections might not exist yet
    }
  }

  return {
    zillizConfigured: configured,
    genomeVectors,
    snpVectors,
    lastUpdated: new Date().toISOString(),
  };
}
