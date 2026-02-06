/**
 * Genomes Domain Module
 * 
 * Genome data management, SNP storage, and analysis results.
 * Re-exports from database-legacy during migration.
 */

export {
  saveGenome,
  getGenome,
  getGenomeFile,
  getUserGenomes,
  getAllGenomes,
  deleteGenome,
  getUserSNPs,
  batchInsertSNPs,
  getSNPsPaginated,
  setPrimaryGenome,
  canAccessGenome,
  getAccessibleGenomes,
  verifyGenomeIntegrity,
  deleteAllUserGenomes,
} from '../database-legacy';

export type {
  SaveGenomeResult,
  SnpData,
  GenomeMetadata,
} from '../database-legacy';
