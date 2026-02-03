/**
 * Research Update System
 * 
 * Automatically fetches new genetic research and updates SNP information
 * Uses PubMed API, GWAS Catalog, and ClinVar to stay current
 */

import { 
  getResearchDatabaseStats, 
  savePubMedPaper, 
  saveGWASStudy,
  startSync,
  completeSync,
  getSyncHistory,
} from './researchDatabase';

// Update intervals (in milliseconds)
const UPDATE_INTERVALS = {
  pubmed: 24 * 60 * 60 * 1000,      // Daily
  gwas: 7 * 24 * 60 * 60 * 1000,     // Weekly
  clinvar: 7 * 24 * 60 * 60 * 1000,  // Weekly
};

interface ResearchUpdate {
  source: 'pubmed' | 'gwas' | 'clinvar';
  timestamp: Date;
  newStudies: number;
  relevantSnps: string[];
  summary: string;
}

interface NewStudyAlert {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  relatedSnps: string[];
  relevance: 'high' | 'medium' | 'low';
  findings: string;
}

/**
 * Check for new PubMed papers related to stored SNPs
 */
export async function checkForNewPubMedPapers(): Promise<ResearchUpdate> {
  const syncId = startSync('pubmed', 'incremental');
  let newPapers = 0;
  const relevantSnps: string[] = [];

  try {
    // Get list of SNPs we track
    const trackedSnps = await getTrackedSNPs();
    
    // Search PubMed for each SNP (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (const rsid of trackedSnps.slice(0, 50)) { // Limit to prevent rate limiting
      await delay(100); // Rate limiting
      
      const papers = await searchPubMedForSNP(rsid, thirtyDaysAgo);
      
      for (const paper of papers) {
        // Check if already in database
        const exists = await checkPaperExists(paper.pmid);
        if (!exists) {
          savePubMedPaper({
            pmid: paper.pmid,
            title: paper.title,
            authors: paper.authors,
            journal: paper.journal,
            publicationDate: new Date(paper.date),
            abstract: paper.abstract,
            doi: paper.doi,
            keywords: paper.keywords,
            meshTerms: paper.meshTerms,
            relatedSnps: [rsid],
            relatedGenes: paper.genes,
            paperType: classifyPaper(paper.title, paper.meshTerms),
            citationCount: 0,
            lastUpdated: new Date(),
          });
          newPapers++;
          if (!relevantSnps.includes(rsid)) {
            relevantSnps.push(rsid);
          }
        }
      }
    }

    const summary = newPapers > 0 
      ? `Found ${newPapers} new papers related to ${relevantSnps.length} SNPs`
      : 'No new papers found';

    completeSync(syncId, trackedSnps.length, newPapers, 0);

    return {
      source: 'pubmed',
      timestamp: new Date(),
      newStudies: newPapers,
      relevantSnps,
      summary,
    };
  } catch (error) {
    completeSync(syncId, 0, 0, 0, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Check for new GWAS studies
 */
export async function checkForNewGWASStudies(): Promise<ResearchUpdate> {
  const syncId = startSync('gwas', 'incremental');
  let newStudies = 0;
  const relevantSnps: string[] = [];

  try {
    // Fetch recent GWAS catalog updates
    const recentStudies = await fetchRecentGWASStudies();
    
    for (const study of recentStudies) {
      // Check if study already exists
      const exists = await checkGWASStudyExists(study.id);
      if (!exists) {
        saveGWASStudy({
          id: study.id,
          trait: study.trait,
          reportedTrait: study.reportedTrait,
          pmid: study.pmid,
          pubDate: study.date,
          sampleSize: study.sampleSize,
          population: study.population,
          pValue: study.pValue,
          riskAllele: study.riskAllele,
          riskFrequency: study.riskFrequency,
          oddsRatio: study.oddsRatio,
          beta: study.beta,
          ciText: study.ci,
          snpId: study.snpId,
          gene: study.gene,
          mappedGene: study.mappedGene,
          context: study.context,
        });
        newStudies++;
        if (study.snpId && !relevantSnps.includes(study.snpId)) {
          relevantSnps.push(study.snpId);
        }
      }
    }

    const summary = newStudies > 0
      ? `Found ${newStudies} new GWAS studies affecting ${relevantSnps.length} SNPs`
      : 'No new GWAS studies found';

    completeSync(syncId, recentStudies.length, newStudies, 0);

    return {
      source: 'gwas',
      timestamp: new Date(),
      newStudies,
      relevantSnps,
      summary,
    };
  } catch (error) {
    completeSync(syncId, 0, 0, 0, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get new research alerts for a user's genome
 */
export async function getNewResearchAlerts(
  userSnps: string[],
  since: Date
): Promise<NewStudyAlert[]> {
  const alerts: NewStudyAlert[] = [];

  // Get recent papers related to user's SNPs
  for (const rsid of userSnps) {
    const papers = await getRecentPapersForSNP(rsid, since);
    
    for (const paper of papers) {
      const relevance = calculateRelevance(paper, userSnps);
      
      if (relevance !== 'low') {
        alerts.push({
          pmid: paper.pmid,
          title: paper.title,
          journal: paper.journal,
          year: paper.publicationDate?.getFullYear() || new Date().getFullYear(),
          relatedSnps: paper.relatedSnps,
          relevance,
          findings: paper.abstract?.substring(0, 200) + '...' || 'See full paper',
        });
      }
    }
  }

  // Sort by relevance
  const relevanceOrder = { high: 3, medium: 2, low: 1 };
  alerts.sort((a, b) => relevanceOrder[b.relevance] - relevanceOrder[a.relevance]);

  return alerts.slice(0, 20); // Return top 20
}

/**
 * Schedule automatic updates
 */
export function scheduleResearchUpdates(): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  // Schedule PubMed updates (daily)
  setInterval(async () => {
    try {
      console.log('Running scheduled PubMed update...');
      await checkForNewPubMedPapers();
    } catch (error) {
      console.error('Scheduled PubMed update failed:', error);
    }
  }, UPDATE_INTERVALS.pubmed);

  // Schedule GWAS updates (weekly)
  setInterval(async () => {
    try {
      console.log('Running scheduled GWAS update...');
      await checkForNewGWASStudies();
    } catch (error) {
      console.error('Scheduled GWAS update failed:', error);
    }
  }, UPDATE_INTERVALS.gwas);

  console.log('Research update scheduler initialized');
}

/**
 * Get update status and statistics
 */
export function getResearchUpdateStatus(): {
  lastPubMedUpdate: Date | null;
  lastGWASUpdate: Date | null;
  totalPapers: number;
  totalGWAS: number;
  isUpdating: boolean;
} {
  const history = getSyncHistory();
  
  const pubMedSync = history.find(h => h.source === 'pubmed' && h.status === 'completed');
  const gwasSync = history.find(h => h.source === 'gwas' && h.status === 'completed');
  const runningSync = history.find(h => h.status === 'running');

  const stats = getResearchDatabaseStats();

  return {
    lastPubMedUpdate: pubMedSync?.completed_at ? new Date(pubMedSync.completed_at) : null,
    lastGWASUpdate: gwasSync?.completed_at ? new Date(gwasSync.completed_at) : null,
    totalPapers: stats.paperCount,
    totalGWAS: stats.gwasCount,
    isUpdating: !!runningSync,
  };
}

// Helper functions

async function getTrackedSNPs(): Promise<string[]> {
  // In production, this would come from the database
  // For now, return common SNPs
  return [
    'rs1801133', 'rs1801131', 'rs3892097', 'rs4244285', 'rs762551',
    'rs429358', 'rs7412', 'rs9939609', 'rs1815739', 'rs4680',
    'rs6265', 'rs7903146', 'rs2476601', 'rs1800562',
  ];
}

async function searchPubMedForSNP(rsid: string, since: Date): Promise<any[]> {
  // This would query PubMed E-utilities
  // For now, return empty (implementation in researchSync.ts)
  return [];
}

async function checkPaperExists(pmid: string): Promise<boolean> {
  // Query database
  return false;
}

async function checkGWASStudyExists(id: string): Promise<boolean> {
  // Query database
  return false;
}

async function fetchRecentGWASStudies(): Promise<any[]> {
  // This would query GWAS Catalog API
  return [];
}

async function getRecentPapersForSNP(rsid: string, since: Date): Promise<any[]> {
  // Query database for papers since date
  return [];
}

function calculateRelevance(paper: any, userSnps: string[]): 'high' | 'medium' | 'low' {
  const matchingSnps = paper.relatedSnps?.filter((rsid: string) => 
    userSnps.includes(rsid)
  ) || [];
  
  if (matchingSnps.length >= 3) return 'high';
  if (matchingSnps.length >= 1) return 'medium';
  return 'low';
}

function classifyPaper(title: string, meshTerms: string[]): 'gwas' | 'pharmacogenomics' | 'clinical' | 'review' | 'other' {
  const text = (title + ' ' + meshTerms.join(' ')).toLowerCase();
  
  if (text.includes('gwas') || text.includes('genome-wide')) return 'gwas';
  if (text.includes('pharmacogenom') || text.includes('drug')) return 'pharmacogenomics';
  if (text.includes('review')) return 'review';
  if (text.includes('clinical trial')) return 'clinical';
  return 'other';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Import at the end to avoid circular dependency
import { getResearchDatabaseStats } from './researchDatabase';
