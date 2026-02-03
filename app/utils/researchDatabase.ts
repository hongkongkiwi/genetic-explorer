/**
 * Research Database Manager
 * 
 * Handles storage and retrieval of genetic research data from external sources:
 * - ClinVar (variant clinical significance)
 * - PubMed (research papers)
 * - PharmGKB (drug-gene interactions)
 * - dbSNP (SNP reference data)
 * - GWAS Catalog (genome-wide association studies)
 */

import Database from 'better-sqlite3';
import { getDatabase } from './database';

// Types for research data
export interface ResearchSNP {
  rsid: string;
  chromosome: string;
  position: number;
  geneSymbol: string | null;
  geneName: string | null;
  refAllele: string;
  altAllele: string;
  sourceDatabases: string[]; // ['clinvar', 'dbsnp', 'pharmgkb']
  lastUpdated: Date;
}

export interface ClinVarRecord {
  id: string;
  rsid: string;
  variationId: string;
  clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'uncertain_significance' | 'likely_benign' | 'benign' | 'other';
  reviewStatus: string;
  conditions: string[];
  conditionIds: string[];
  significanceExplanation: string | null;
  lastEvaluated: Date | null;
  source: string;
}

export interface PubMedPaper {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  abstract: string | null;
  doi: string | null;
  keywords: string[];
  meshTerms: string[];
  relatedSnps: string[];
  relatedGenes: string[];
  paperType: 'gwas' | 'pharmacogenomics' | 'clinical' | 'review' | 'other';
  citationCount: number;
  lastUpdated: Date;
}

export interface PharmGKBDrug {
  id: string;
  name: string;
  genericName: string | null;
  drugClass: string | null;
  indications: string[];
}

export interface DrugGeneInteraction {
  id: string;
  geneSymbol: string;
  drugId: string;
  drugName: string;
  phenotype: string;
  evidenceLevel: '1A' | '1B' | '2A' | '2B' | '3' | '4';
  evidenceLevelDescription: string;
  implications: string;
  recommendations: string[];
  source: 'pharmgkb' | 'cpic' | 'dpwg' | 'other';
  lastUpdated: Date;
}

export interface GeneInfo {
  symbol: string;
  name: string;
  description: string | null;
  chromosome: string | null;
  startPosition: number | null;
  endPosition: number | null;
  strand: '+' | '-' | null;
  geneType: string | null;
  relatedPathways: string[];
  lastUpdated: Date;
}

export interface GWASStudy {
  id: string;
  trait: string;
  reportedTrait: string;
  pmid: string | null;
  pubDate: Date | null;
  sampleSize: number;
  population: string;
  pValue: number;
  riskAllele: string;
  riskFrequency: number | null;
  oddsRatio: number | null;
  beta: number | null;
  ciText: string | null;
  snpId: string;
  gene: string | null;
  mappedGene: string | null;
  context: string | null;
}

/**
 * Initialize research database tables
 */
export function initializeResearchDatabase() {
  const db = getDatabase();

  // Research SNPs table - consolidated SNP info from multiple sources
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_snps (
      rsid TEXT PRIMARY KEY,
      chromosome TEXT,
      position INTEGER,
      gene_symbol TEXT,
      gene_name TEXT,
      ref_allele TEXT,
      alt_allele TEXT,
      source_databases TEXT, -- JSON array
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_snp_gene ON research_snps(gene_symbol);
    CREATE INDEX IF NOT EXISTS idx_snp_chrom_pos ON research_snps(chromosome, position);
  `);

  // ClinVar records
  db.exec(`
    CREATE TABLE IF NOT EXISTS clinvar_records (
      id TEXT PRIMARY KEY,
      rsid TEXT NOT NULL,
      variation_id TEXT,
      clinical_significance TEXT,
      review_status TEXT,
      conditions TEXT, -- JSON array
      condition_ids TEXT, -- JSON array
      significance_explanation TEXT,
      last_evaluated DATE,
      source TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rsid) REFERENCES research_snps(rsid)
    );

    CREATE INDEX IF NOT EXISTS idx_clinvar_rsid ON clinvar_records(rsid);
    CREATE INDEX IF NOT EXISTS idx_clinvar_sig ON clinvar_records(clinical_significance);
  `);

  // PubMed papers
  db.exec(`
    CREATE TABLE IF NOT EXISTS pubmed_papers (
      pmid TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors TEXT, -- JSON array
      journal TEXT,
      publication_date DATE,
      abstract TEXT,
      doi TEXT,
      keywords TEXT, -- JSON array
      mesh_terms TEXT, -- JSON array
      related_snps TEXT, -- JSON array of rsids
      related_genes TEXT, -- JSON array
      paper_type TEXT,
      citation_count INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_papers_date ON pubmed_papers(publication_date);
    CREATE INDEX IF NOT EXISTS idx_papers_type ON pubmed_papers(paper_type);
  `);

  // SNP-Paper relationships (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS snp_paper_links (
      rsid TEXT NOT NULL,
      pmid TEXT NOT NULL,
      relevance_score REAL,
      findings TEXT,
      PRIMARY KEY (rsid, pmid),
      FOREIGN KEY (rsid) REFERENCES research_snps(rsid),
      FOREIGN KEY (pmid) REFERENCES pubmed_papers(pmid)
    );

    CREATE INDEX IF NOT EXISTS idx_snp_paper_rsid ON snp_paper_links(rsid);
  `);

  // Drug information
  db.exec(`
    CREATE TABLE IF NOT EXISTS drugs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      generic_name TEXT,
      drug_class TEXT,
      indications TEXT, -- JSON array
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_drugs_name ON drugs(name);
  `);

  // Drug-Gene interactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS drug_gene_interactions (
      id TEXT PRIMARY KEY,
      gene_symbol TEXT NOT NULL,
      drug_id TEXT NOT NULL,
      drug_name TEXT NOT NULL,
      phenotype TEXT,
      evidence_level TEXT,
      evidence_level_description TEXT,
      implications TEXT,
      recommendations TEXT, -- JSON array
      source TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drug_id) REFERENCES drugs(id)
    );

    CREATE INDEX IF NOT EXISTS idx_dgi_gene ON drug_gene_interactions(gene_symbol);
    CREATE INDEX IF NOT EXISTS idx_dgi_drug ON drug_gene_interactions(drug_id);
  `);

  // Gene information
  db.exec(`
    CREATE TABLE IF NOT EXISTS genes (
      symbol TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      chromosome TEXT,
      start_position INTEGER,
      end_position INTEGER,
      strand TEXT,
      gene_type TEXT,
      related_pathways TEXT, -- JSON array
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_genes_chrom ON genes(chromosome);
  `);

  // GWAS Catalog studies
  db.exec(`
    CREATE TABLE IF NOT EXISTS gwas_studies (
      id TEXT PRIMARY KEY,
      trait TEXT NOT NULL,
      reported_trait TEXT,
      pmid TEXT,
      pub_date DATE,
      sample_size INTEGER,
      population TEXT,
      p_value REAL,
      risk_allele TEXT,
      risk_frequency REAL,
      odds_ratio REAL,
      beta REAL,
      ci_text TEXT,
      snp_id TEXT,
      gene TEXT,
      mapped_gene TEXT,
      context TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_gwas_trait ON gwas_studies(trait);
    CREATE INDEX IF NOT EXISTS idx_gwas_snp ON gwas_studies(snp_id);
    CREATE INDEX IF NOT EXISTS idx_gwas_gene ON gwas_studies(gene);
  `);

  // Sync log to track when we last updated each data source
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
      records_processed INTEGER,
      records_added INTEGER,
      records_updated INTEGER,
      started_at DATETIME,
      completed_at DATETIME,
      status TEXT, -- 'running', 'completed', 'failed'
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sync_source ON sync_log(source);
  `);

  console.log('✅ Research database initialized');
}

// ==================== SNP Operations ====================

export function saveResearchSNP(snp: ResearchSNP): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO research_snps 
    (rsid, chromosome, position, gene_symbol, gene_name, ref_allele, alt_allele, source_databases, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    snp.rsid,
    snp.chromosome,
    snp.position,
    snp.geneSymbol,
    snp.geneName,
    snp.refAllele,
    snp.altAllele,
    JSON.stringify(snp.sourceDatabases),
    new Date().toISOString()
  );
}

export function getResearchSNP(rsid: string): ResearchSNP | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM research_snps WHERE rsid = ?').get(rsid) as any;
  
  if (!row) return null;
  
  return {
    rsid: row.rsid,
    chromosome: row.chromosome,
    position: row.position,
    geneSymbol: row.gene_symbol,
    geneName: row.gene_name,
    refAllele: row.ref_allele,
    altAllele: row.alt_allele,
    sourceDatabases: JSON.parse(row.source_databases || '[]'),
    lastUpdated: new Date(row.last_updated),
  };
}

export function searchSNPsByGene(geneSymbol: string): ResearchSNP[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM research_snps WHERE gene_symbol = ?').all(geneSymbol) as any[];
  
  return rows.map(row => ({
    rsid: row.rsid,
    chromosome: row.chromosome,
    position: row.position,
    geneSymbol: row.gene_symbol,
    geneName: row.gene_name,
    refAllele: row.ref_allele,
    altAllele: row.alt_allele,
    sourceDatabases: JSON.parse(row.source_databases || '[]'),
    lastUpdated: new Date(row.last_updated),
  }));
}

export function searchSNPs(query: string): ResearchSNP[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM research_snps 
    WHERE rsid LIKE ? 
    OR gene_symbol LIKE ? 
    OR gene_name LIKE ?
    LIMIT 100
  `).all(`%${query}%`, `%${query}%`, `%${query}%`) as any[];
  
  return rows.map(row => ({
    rsid: row.rsid,
    chromosome: row.chromosome,
    position: row.position,
    geneSymbol: row.gene_symbol,
    geneName: row.gene_name,
    refAllele: row.ref_allele,
    altAllele: row.alt_allele,
    sourceDatabases: JSON.parse(row.source_databases || '[]'),
    lastUpdated: new Date(row.last_updated),
  }));
}

// ==================== ClinVar Operations ====================

export function saveClinVarRecord(record: ClinVarRecord): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO clinvar_records
    (id, rsid, variation_id, clinical_significance, review_status, conditions, condition_ids,
     significance_explanation, last_evaluated, source, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    record.id,
    record.rsid,
    record.variationId,
    record.clinicalSignificance,
    record.reviewStatus,
    JSON.stringify(record.conditions),
    JSON.stringify(record.conditionIds),
    record.significanceExplanation,
    record.lastEvaluated?.toISOString(),
    record.source,
    new Date().toISOString()
  );
}

export function getClinVarForSNP(rsid: string): ClinVarRecord[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM clinvar_records WHERE rsid = ?').all(rsid) as any[];
  
  return rows.map(row => ({
    id: row.id,
    rsid: row.rsid,
    variationId: row.variation_id,
    clinicalSignificance: row.clinical_significance,
    reviewStatus: row.review_status,
    conditions: JSON.parse(row.conditions || '[]'),
    conditionIds: JSON.parse(row.condition_ids || '[]'),
    significanceExplanation: row.significance_explanation,
    lastEvaluated: row.last_evaluated ? new Date(row.last_evaluated) : null,
    source: row.source,
  }));
}

export function getSNPsByClinicalSignificance(significance: string): Array<{rsid: string; conditions: string[]}> {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT rsid, conditions FROM clinvar_records 
    WHERE clinical_significance = ?
  `).all(significance) as any[];
  
  return rows.map(row => ({
    rsid: row.rsid,
    conditions: JSON.parse(row.conditions || '[]'),
  }));
}

// ==================== PubMed Operations ====================

export function savePubMedPaper(paper: PubMedPaper): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO pubmed_papers
    (pmid, title, authors, journal, publication_date, abstract, doi, keywords,
     mesh_terms, related_snps, related_genes, paper_type, citation_count, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    paper.pmid,
    paper.title,
    JSON.stringify(paper.authors),
    paper.journal,
    paper.publicationDate?.toISOString(),
    paper.abstract,
    paper.doi,
    JSON.stringify(paper.keywords),
    JSON.stringify(paper.meshTerms),
    JSON.stringify(paper.relatedSnps),
    JSON.stringify(paper.relatedGenes),
    paper.paperType,
    paper.citationCount,
    new Date().toISOString()
  );
  
  // Update SNP-Paper links
  const linkStmt = db.prepare(`
    INSERT OR IGNORE INTO snp_paper_links (rsid, pmid, relevance_score, findings)
    VALUES (?, ?, ?, ?)
  `);
  
  for (const rsid of paper.relatedSnps) {
    linkStmt.run(rsid, paper.pmid, 1.0, null);
  }
}

export function getPapersForSNP(rsid: string, paperType?: string): PubMedPaper[] {
  const db = getDatabase();
  let query = `
    SELECT p.* FROM pubmed_papers p
    JOIN snp_paper_links spl ON p.pmid = spl.pmid
    WHERE spl.rsid = ?
  `;
  const params: any[] = [rsid];
  
  if (paperType) {
    query += ' AND p.paper_type = ?';
    params.push(paperType);
  }
  
  query += ' ORDER BY p.publication_date DESC';
  
  const rows = db.prepare(query).all(...params) as any[];
  
  return rows.map(row => ({
    pmid: row.pmid,
    title: row.title,
    authors: JSON.parse(row.authors || '[]'),
    journal: row.journal,
    publicationDate: row.publication_date ? new Date(row.publication_date) : null,
    abstract: row.abstract,
    doi: row.doi,
    keywords: JSON.parse(row.keywords || '[]'),
    meshTerms: JSON.parse(row.mesh_terms || '[]'),
    relatedSnps: JSON.parse(row.related_snps || '[]'),
    relatedGenes: JSON.parse(row.related_genes || '[]'),
    paperType: row.paper_type,
    citationCount: row.citation_count,
    lastUpdated: new Date(row.last_updated),
  }));
}

export function searchPapers(query: string, filters?: {gene?: string; yearFrom?: number; yearTo?: number}): PubMedPaper[] {
  const db = getDatabase();
  let sql = `
    SELECT * FROM pubmed_papers 
    WHERE (title LIKE ? OR abstract LIKE ? OR keywords LIKE ?)
  `;
  const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];
  
  if (filters?.gene) {
    sql += ' AND related_genes LIKE ?';
    params.push(`%${filters.gene}%`);
  }
  
  if (filters?.yearFrom) {
    sql += ' AND publication_date >= ?';
    params.push(`${filters.yearFrom}-01-01`);
  }
  
  if (filters?.yearTo) {
    sql += ' AND publication_date <= ?';
    params.push(`${filters.yearTo}-12-31`);
  }
  
  sql += ' ORDER BY publication_date DESC LIMIT 100';
  
  const rows = db.prepare(sql).all(...params) as any[];
  
  return rows.map(row => ({
    pmid: row.pmid,
    title: row.title,
    authors: JSON.parse(row.authors || '[]'),
    journal: row.journal,
    publicationDate: row.publication_date ? new Date(row.publication_date) : null,
    abstract: row.abstract,
    doi: row.doi,
    keywords: JSON.parse(row.keywords || '[]'),
    meshTerms: JSON.parse(row.mesh_terms || '[]'),
    relatedSnps: JSON.parse(row.related_snps || '[]'),
    relatedGenes: JSON.parse(row.related_genes || '[]'),
    paperType: row.paper_type,
    citationCount: row.citation_count,
    lastUpdated: new Date(row.last_updated),
  }));
}

// ==================== Drug-Gene Interaction Operations ====================

export function saveDrugGeneInteraction(interaction: DrugGeneInteraction): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO drug_gene_interactions
    (id, gene_symbol, drug_id, drug_name, phenotype, evidence_level,
     evidence_level_description, implications, recommendations, source, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    interaction.id,
    interaction.geneSymbol,
    interaction.drugId,
    interaction.drugName,
    interaction.phenotype,
    interaction.evidenceLevel,
    interaction.evidenceLevelDescription,
    interaction.implications,
    JSON.stringify(interaction.recommendations),
    interaction.source,
    new Date().toISOString()
  );
}

export function getDrugInteractionsForGene(geneSymbol: string): DrugGeneInteraction[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM drug_gene_interactions 
    WHERE gene_symbol = ?
    ORDER BY evidence_level
  `).all(geneSymbol) as any[];
  
  return rows.map(row => ({
    id: row.id,
    geneSymbol: row.gene_symbol,
    drugId: row.drug_id,
    drugName: row.drug_name,
    phenotype: row.phenotype,
    evidenceLevel: row.evidence_level,
    evidenceLevelDescription: row.evidence_level_description,
    implications: row.implications,
    recommendations: JSON.parse(row.recommendations || '[]'),
    source: row.source,
    lastUpdated: new Date(row.last_updated),
  }));
}

export function getDrugInteractionsForDrug(drugName: string): DrugGeneInteraction[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM drug_gene_interactions 
    WHERE drug_name LIKE ?
    ORDER BY evidence_level
  `).all(`%${drugName}%`) as any[];
  
  return rows.map(row => ({
    id: row.id,
    geneSymbol: row.gene_symbol,
    drugId: row.drug_id,
    drugName: row.drug_name,
    phenotype: row.phenotype,
    evidenceLevel: row.evidence_level,
    evidenceLevelDescription: row.evidence_level_description,
    implications: row.implications,
    recommendations: JSON.parse(row.recommendations || '[]'),
    source: row.source,
    lastUpdated: new Date(row.last_updated),
  }));
}

// ==================== Gene Operations ====================

export function saveGeneInfo(gene: GeneInfo): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO genes
    (symbol, name, description, chromosome, start_position, end_position, strand, gene_type, related_pathways, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    gene.symbol,
    gene.name,
    gene.description,
    gene.chromosome,
    gene.startPosition,
    gene.endPosition,
    gene.strand,
    gene.geneType,
    JSON.stringify(gene.relatedPathways),
    new Date().toISOString()
  );
}

export function getGeneInfo(symbol: string): GeneInfo | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM genes WHERE symbol = ?').get(symbol) as any;
  
  if (!row) return null;
  
  return {
    symbol: row.symbol,
    name: row.name,
    description: row.description,
    chromosome: row.chromosome,
    startPosition: row.start_position,
    endPosition: row.end_position,
    strand: row.strand,
    geneType: row.gene_type,
    relatedPathways: JSON.parse(row.related_pathways || '[]'),
    lastUpdated: new Date(row.last_updated),
  };
}

// ==================== GWAS Operations ====================

export function saveGWASStudy(study: GWASStudy): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO gwas_studies
    (id, trait, reported_trait, pmid, pub_date, sample_size, population, p_value,
     risk_allele, risk_frequency, odds_ratio, beta, ci_text, snp_id, gene, mapped_gene, context, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    study.id,
    study.trait,
    study.reportedTrait,
    study.pmid,
    study.pubDate?.toISOString(),
    study.sampleSize,
    study.population,
    study.pValue,
    study.riskAllele,
    study.riskFrequency,
    study.oddsRatio,
    study.beta,
    study.ciText,
    study.snpId,
    study.gene,
    study.mappedGene,
    study.context,
    new Date().toISOString()
  );
}

export function getGWASStudiesForSNP(rsid: string): GWASStudy[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM gwas_studies WHERE snp_id = ?').all(rsid) as any[];
  
  return rows.map(row => ({
    id: row.id,
    trait: row.trait,
    reportedTrait: row.reported_trait,
    pmid: row.pmid,
    pubDate: row.pub_date ? new Date(row.pub_date) : null,
    sampleSize: row.sample_size,
    population: row.population,
    pValue: row.p_value,
    riskAllele: row.risk_allele,
    riskFrequency: row.risk_frequency,
    oddsRatio: row.odds_ratio,
    beta: row.beta,
    ciText: row.ci_text,
    snpId: row.snp_id,
    gene: row.gene,
    mappedGene: row.mapped_gene,
    context: row.context,
  }));
}

export function searchGWASByTrait(trait: string): GWASStudy[] {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM gwas_studies 
    WHERE trait LIKE ? OR reported_trait LIKE ?
    ORDER BY p_value ASC
    LIMIT 100
  `).all(`%${trait}%`, `%${trait}%`) as any[];
  
  return rows.map(row => ({
    id: row.id,
    trait: row.trait,
    reportedTrait: row.reported_trait,
    pmid: row.pmid,
    pubDate: row.pub_date ? new Date(row.pub_date) : null,
    sampleSize: row.sample_size,
    population: row.population,
    pValue: row.p_value,
    riskAllele: row.risk_allele,
    riskFrequency: row.risk_frequency,
    oddsRatio: row.odds_ratio,
    beta: row.beta,
    ciText: row.ci_text,
    snpId: row.snp_id,
    gene: row.gene,
    mappedGene: row.mapped_gene,
    context: row.context,
  }));
}

// ==================== Sync Log Operations ====================

export function startSync(source: string, syncType: string): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO sync_log (source, sync_type, started_at, status)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(source, syncType, new Date().toISOString(), 'running');
  return result.lastInsertRowid as number;
}

export function completeSync(syncId: number, recordsProcessed: number, recordsAdded: number, recordsUpdated: number, errorMessage?: string): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE sync_log 
    SET completed_at = ?, status = ?, records_processed = ?, records_added = ?, records_updated = ?, error_message = ?
    WHERE id = ?
  `);
  
  stmt.run(
    new Date().toISOString(),
    errorMessage ? 'failed' : 'completed',
    recordsProcessed,
    recordsAdded,
    recordsUpdated,
    errorMessage || null,
    syncId
  );
}

export function getSyncHistory(source?: string): any[] {
  const db = getDatabase();
  let query = 'SELECT * FROM sync_log';
  const params: any[] = [];
  
  if (source) {
    query += ' WHERE source = ?';
    params.push(source);
  }
  
  query += ' ORDER BY started_at DESC LIMIT 50';
  
  return db.prepare(query).all(...params);
}

// ==================== Statistics ====================

export function getResearchDatabaseStats(): {
  snpCount: number;
  clinvarCount: number;
  paperCount: number;
  drugInteractionCount: number;
  geneCount: number;
  gwasCount: number;
  lastSyncBySource: Record<string, Date>;
} {
  const db = getDatabase();
  
  const snpCount = (db.prepare('SELECT COUNT(*) as count FROM research_snps').get() as any).count;
  const clinvarCount = (db.prepare('SELECT COUNT(*) as count FROM clinvar_records').get() as any).count;
  const paperCount = (db.prepare('SELECT COUNT(*) as count FROM pubmed_papers').get() as any).count;
  const drugInteractionCount = (db.prepare('SELECT COUNT(*) as count FROM drug_gene_interactions').get() as any).count;
  const geneCount = (db.prepare('SELECT COUNT(*) as count FROM genes').get() as any).count;
  const gwasCount = (db.prepare('SELECT COUNT(*) as count FROM gwas_studies').get() as any).count;
  
  const syncRows = db.prepare(`
    SELECT source, MAX(completed_at) as last_sync 
    FROM sync_log 
    WHERE status = 'completed'
    GROUP BY source
  `).all() as any[];
  
  const lastSyncBySource: Record<string, Date> = {};
  for (const row of syncRows) {
    lastSyncBySource[row.source] = new Date(row.last_sync);
  }
  
  return {
    snpCount,
    clinvarCount,
    paperCount,
    drugInteractionCount,
    geneCount,
    gwasCount,
    lastSyncBySource,
  };
}

// Initialize on module load
initializeResearchDatabase();
