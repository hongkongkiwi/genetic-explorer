/**
 * Genomes Domain Queries
 * 
 * Genome data management, SNP storage, and analysis queries.
 */

import { getDb } from '../database-legacy';
import type { GenomeMetadata, SnpData } from './index';

export interface GenomeWithSNPs extends GenomeMetadata {
  snps?: SnpData[];
}

/**
 * Find genome by ID
 */
export function findGenomeById(id: string): GenomeMetadata | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM genomes WHERE id = ?').get(id) as GenomeMetadata | undefined;
}

/**
 * Get all genomes for a user
 */
export function findGenomesByUserId(userId: string): GenomeMetadata[] {
  const db = getDb();
  return db.prepare('SELECT * FROM genomes WHERE user_id = ? ORDER BY processed_at DESC').all(userId) as GenomeMetadata[];
}

/**
 * Get user's primary genome
 */
export function findPrimaryGenome(userId: string): GenomeMetadata | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM genomes WHERE user_id = ? AND is_primary = 1').get(userId) as GenomeMetadata | undefined;
}

/**
 * Set primary genome
 */
export function setPrimaryGenome(userId: string, genomeId: string): void {
  const db = getDb();
  
  // Clear existing primary
  db.prepare('UPDATE genomes SET is_primary = 0 WHERE user_id = ?').run(userId);
  
  // Set new primary
  db.prepare('UPDATE genomes SET is_primary = 1 WHERE id = ? AND user_id = ?').run(genomeId, userId);
}

/**
 * Get SNPs for a genome with pagination
 */
export function findSNPsByGenomeId(
  genomeId: string,
  options: { limit?: number; offset?: number; chromosome?: string } = {}
): SnpData[] {
  const db = getDb();
  const { limit = 1000, offset = 0, chromosome } = options;
  
  let query = 'SELECT * FROM snps WHERE genome_id = ?';
  const params: (string | number)[] = [genomeId];
  
  if (chromosome) {
    query += ' AND chromosome = ?';
    params.push(chromosome);
  }
  
  query += ' ORDER BY chromosome, position LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return db.prepare(query).all(...params) as SnpData[];
}

/**
 * Count SNPs for a genome
 */
export function countSNPsByGenomeId(genomeId: string): number {
  const db = getDb();
  const result = db.prepare('SELECT COUNT(*) as count FROM snps WHERE genome_id = ?').get(genomeId) as { count: number };
  return result.count;
}

/**
 * Delete genome and all associated data
 */
export function deleteGenome(id: string): boolean {
  const db = getDb();
  
  // Delete SNPs first (cascade should handle this, but be explicit)
  db.prepare('DELETE FROM snps WHERE genome_id = ?').run(id);
  
  // Delete genome
  const result = db.prepare('DELETE FROM genomes WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Search SNPs by rsid
 */
export function searchSNPs(
  genomeId: string,
  rsid: string
): SnpData | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM snps WHERE genome_id = ? AND rsid = ?').get(genomeId, rsid) as SnpData | undefined;
}

/**
 * Get genome statistics
 */
export function getGenomeStats(genomeId: string): {
  totalSNPs: number;
  chromosomes: string[];
} {
  const db = getDb();
  
  const totalResult = db.prepare('SELECT COUNT(*) as count FROM snps WHERE genome_id = ?').get(genomeId) as { count: number };
  const chromosomesResult = db.prepare('SELECT DISTINCT chromosome FROM snps WHERE genome_id = ?').all(genomeId) as { chromosome: string }[];
  
  return {
    totalSNPs: totalResult.count,
    chromosomes: chromosomesResult.map(r => r.chromosome),
  };
}
