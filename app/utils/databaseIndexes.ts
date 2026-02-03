import type { Database } from 'better-sqlite3';

// Database index definitions for optimal query performance
export const databaseIndexes = [
  // Genomes table indexes
  {
    name: 'idx_genomes_user_status',
    table: 'genomes',
    columns: ['user_id', 'status'],
  },
  {
    name: 'idx_genomes_user_processed',
    table: 'genomes',
    columns: ['user_id', 'processed_at'],
  },
  {
    name: 'idx_genomes_source',
    table: 'genomes',
    columns: ['source'],
  },

  // Genome SNPs table indexes
  {
    name: 'idx_genome_snps_user_rsid',
    table: 'genome_snps',
    columns: ['user_id', 'rsid'],
  },
  {
    name: 'idx_genome_snps_genome',
    table: 'genome_snps',
    columns: ['genome_id'],
  },
  {
    name: 'idx_genome_snps_gene',
    table: 'genome_snps',
    columns: ['gene'],
  },
  {
    name: 'idx_genome_snps_chromosome',
    table: 'genome_snps',
    columns: ['chromosome', 'position'],
  },
  {
    name: 'idx_genome_snps_impact',
    table: 'genome_snps',
    columns: ['clinical_impact'],
  },
  {
    name: 'idx_genome_snps_category',
    table: 'genome_snps',
    columns: ['category'],
  },
  {
    name: 'idx_genome_snps_user_category',
    table: 'genome_snps',
    columns: ['user_id', 'category'],
  },

  // SNP Database indexes
  {
    name: 'idx_snp_db_rsid',
    table: 'snp_database',
    columns: ['rsid'],
  },
  {
    name: 'idx_snp_db_gene',
    table: 'snp_database',
    columns: ['gene_symbol'],
  },
  {
    name: 'idx_snp_db_category',
    table: 'snp_database',
    columns: ['category'],
  },

  // Reports table indexes
  {
    name: 'idx_reports_genome',
    table: 'reports',
    columns: ['genome_id'],
  },
  {
    name: 'idx_reports_created',
    table: 'reports',
    columns: ['created_at'],
  },

  // Sharing permissions indexes
  {
    name: 'idx_sharing_owner',
    table: 'sharing_permissions',
    columns: ['owner_id', 'status'],
  },
  {
    name: 'idx_sharing_shared_with',
    table: 'sharing_permissions',
    columns: ['shared_with_id', 'status'],
  },
  {
    name: 'idx_sharing_genome',
    table: 'sharing_permissions',
    columns: ['genome_id'],
  },

  // Research updates indexes
  {
    name: 'idx_research_updates_date',
    table: 'research_updates',
    columns: ['date'],
  },
  {
    name: 'idx_research_updates_rsid',
    table: 'research_updates',
    columns: ['snp_rsid'],
  },
  {
    name: 'idx_research_updates_type',
    table: 'research_updates',
    columns: ['change_type'],
  },

  // Activity log indexes
  {
    name: 'idx_activity_user_created',
    table: 'activity_log',
    columns: ['user_id', 'created_at'],
  },

  // SNP favorites indexes
  {
    name: 'idx_favorites_user',
    table: 'snp_favorites',
    columns: ['user_id'],
  },
  {
    name: 'idx_favorites_user_rsid',
    table: 'snp_favorites',
    columns: ['user_id', 'rsid'],
  },

  // Notifications indexes
  {
    name: 'idx_notifications_user_read',
    table: 'notifications',
    columns: ['user_id', 'is_read'],
  },
  {
    name: 'idx_notifications_created',
    table: 'notifications',
    columns: ['created_at'],
  },
];

export function createIndexes(db: Database): void {
  for (const index of databaseIndexes) {
    try {
      const columns = index.columns.join(', ');
      db.exec(`
        CREATE INDEX IF NOT EXISTS ${index.name} 
        ON ${index.table} (${columns})
      `);
    } catch (error) {
      console.warn(`Failed to create index ${index.name}:`, error);
    }
  }
}

// Analyze tables for query optimizer
export function analyzeTables(db: Database): void {
  try {
    db.exec('ANALYZE');
  } catch (error) {
    console.warn('Failed to analyze tables:', error);
  }
}

// Get query performance stats
export function getQueryStats(db: Database): Array<{
  query: string;
  count: number;
  avgTime: number;
}> {
  try {
    // This requires SQLite to be compiled with SQLITE_ENABLE_STMT_SCANSTATUS
    // As a fallback, we can track this in application code
    return [];
  } catch {
    return [];
  }
}
