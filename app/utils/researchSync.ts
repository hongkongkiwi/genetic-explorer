/**
 * Research Data Synchronization Service
 */

import { 
  saveResearchSNP, 
  saveClinVarRecord, 
  savePubMedPaper,
  saveDrugGeneInteraction,
  saveGeneInfo,
  saveGWASStudy,
  startSync,
  completeSync,
  getResearchSNP,
  type ResearchSNP,
  type ClinVarRecord,
  type PubMedPaper,
  type DrugGeneInteraction,
  type GeneInfo,
  type GWASStudy,
} from './researchDatabase';

const NCBI_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const PHARMGKB_API_BASE = 'https://api.pharmgkb.org/v1';
const GWAS_API_BASE = 'https://www.ebi.ac.uk/gwas/rest/api';

const NCBI_DELAY = 400;
let lastNCBIRequest = 0;

async function delayNCBI() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastNCBIRequest;
  if (timeSinceLastRequest < NCBI_DELAY) {
    await new Promise(resolve => setTimeout(resolve, NCBI_DELAY - timeSinceLastRequest));
  }
  lastNCBIRequest = Date.now();
}

export async function syncSNPFromNCBI(rsid: string): Promise<ResearchSNP | null> {
  await delayNCBI();
  
  try {
    const existing = getResearchSNP(rsid);
    if (existing && Date.now() - existing.lastUpdated.getTime() < 30 * 24 * 60 * 60 * 1000) {
      return existing;
    }
    
    const summaryUrl = `${NCBI_API_BASE}/esummary.fcgi?db=snp&id=${rsid.replace('rs', '')}&retmode=json`;
    const response = await fetch(summaryUrl);
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${rsid} from dbSNP: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const result = data.result?.[rsid.replace('rs', '')];
    
    if (!result) {
      console.warn(`No data found for ${rsid} in dbSNP`);
      return null;
    }
    
    let geneSymbol = null;
    let geneName = null;
    if (result.genes && result.genes.length > 0) {
      geneSymbol = result.genes[0].name;
      geneName = result.genes[0].geneid?.toString();
    }
    
    const snp: ResearchSNP = {
      rsid: rsid,
      chromosome: result.chr || null,
      position: result.chrpos ? parseInt(result.chrpos) : null,
      geneSymbol,
      geneName,
      refAllele: result.refallele || null,
      altAllele: result.alts ? result.alts.split(',')[0] : null,
      sourceDatabases: ['dbsnp'],
      lastUpdated: new Date(),
    };
    
    saveResearchSNP(snp);
    
    if (geneSymbol) {
      await syncGeneFromNCBI(geneSymbol);
    }
    
    return snp;
  } catch (error) {
    console.error(`Error syncing ${rsid} from NCBI:`, error);
    return null;
  }
}

export async function syncGeneFromNCBI(geneSymbol: string): Promise<GeneInfo | null> {
  await delayNCBI();
  
  try {
    const searchUrl = `${NCBI_API_BASE}/esearch.fcgi?db=gene&term=${encodeURIComponent(geneSymbol)}[Gene]+AND+human[Organism]&retmode=json`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    const geneId = searchData.esearchresult?.idlist?.[0];
    
    if (!geneId) {
      console.warn(`Gene ${geneSymbol} not found in NCBI Gene`);
      return null;
    }
    
    await delayNCBI();
    const summaryUrl = `${NCBI_API_BASE}/esummary.fcgi?db=gene&id=${geneId}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) return null;
    
    const data = await summaryResponse.json();
    const result = data.result?.[geneId];
    
    if (!result) return null;
    
    const gene: GeneInfo = {
      symbol: geneSymbol,
      name: result.name || geneSymbol,
      description: result.description || null,
      chromosome: result.chromosome || null,
      startPosition: result.genomicinfo?.[0]?.chrstart || null,
      endPosition: result.genomicinfo?.[0]?.chrstop || null,
      strand: result.genomicinfo?.[0]?.chraccver?.includes('minus') ? '-' : '+',
      geneType: result.type || null,
      relatedPathways: [],
      lastUpdated: new Date(),
    };
    
    saveGeneInfo(gene);
    return gene;
  } catch (error) {
    console.error(`Error syncing gene ${geneSymbol}:`, error);
    return null;
  }
}

export async function syncClinVarForSNP(rsid: string): Promise<ClinVarRecord[]> {
  await delayNCBI();
  
  try {
    const url = `${NCBI_API_BASE}/esearch.fcgi?db=clinvar&term=${rsid}[Variant%20ID]&retmode=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to search ClinVar for ${rsid}`);
      return [];
    }
    
    const data = await response.json();
    const ids = data.esearchresult?.idlist || [];
    
    if (ids.length === 0) {
      return [];
    }
    
    const records: ClinVarRecord[] = [];
    
    for (const id of ids.slice(0, 5)) {
      await delayNCBI();
      
      const summaryUrl = `${NCBI_API_BASE}/esummary.fcgi?db=clinvar&id=${id}&retmode=json`;
      const summaryResponse = await fetch(summaryUrl);
      
      if (!summaryResponse.ok) continue;
      
      const summaryData = await summaryResponse.json();
      const result = summaryData.result?.[id];
      
      if (!result) continue;
      
      let clinicalSignificance: ClinVarRecord['clinicalSignificance'] = 'other';
      const sig = result.clinical_significance?.description?.[0]?.toLowerCase() || '';
      if (sig.includes('pathogenic') && !sig.includes('likely')) {
        clinicalSignificance = 'pathogenic';
      } else if (sig.includes('likely_pathogenic') || (sig.includes('likely') && sig.includes('pathogenic'))) {
        clinicalSignificance = 'likely_pathogenic';
      } else if (sig.includes('benign') && !sig.includes('likely')) {
        clinicalSignificance = 'benign';
      } else if (sig.includes('likely_benign')) {
        clinicalSignificance = 'likely_benign';
      } else if (sig.includes('uncertain') || sig.includes('conflicting')) {
        clinicalSignificance = 'uncertain_significance';
      }
      
      const conditions = result.trait_set?.map((t: any) => t.trait_name) || [];
      
      const record: ClinVarRecord = {
        id: `clinvar-${id}`,
        rsid: rsid,
        variationId: result.variation_set?.[0]?.variation_id || id,
        clinicalSignificance,
        reviewStatus: result.clinical_significance?.review_status?.[0] || 'unknown',
        conditions,
        conditionIds: result.trait_set?.map((t: any) => t.trait_id) || [],
        significanceExplanation: null,
        lastEvaluated: result.clinical_significance?.date_last_evaluated?.[0] 
          ? new Date(result.clinical_significance.date_last_evaluated[0]) 
          : null,
        source: 'clinvar',
      };
      
      saveClinVarRecord(record);
      records.push(record);
    }
    
    return records;
  } catch (error) {
    console.error(`Error syncing ClinVar for ${rsid}:`, error);
    return [];
  }
}

export async function syncPubMedPapersForSNP(rsid: string, maxResults = 20): Promise<PubMedPaper[]> {
  await delayNCBI();
  
  try {
    const searchUrl = `${NCBI_API_BASE}/esearch.fcgi?db=pubmed&term=${rsid}[Title/Abstract]+AND+(genetics[Mesh]+OR+genome-wide+association+study[Title/Abstract])&retmax=${maxResults}&retmode=json&sort=date`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.warn(`Failed to search PubMed for ${rsid}`);
      return [];
    }
    
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];
    
    if (pmids.length === 0) {
      return [];
    }
    
    await delayNCBI();
    
    const summaryUrl = `${NCBI_API_BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) {
      return [];
    }
    
    const data = await summaryResponse.json();
    const papers: PubMedPaper[] = [];
    
    for (const pmid of pmids) {
      const result = data.result?.[pmid];
      if (!result) continue;
      
      const paper: PubMedPaper = {
        pmid: pmid,
        title: result.title || 'Unknown Title',
        authors: result.authors?.map((a: any) => a.name) || [],
        journal: result.fulljournalname || result.source || 'Unknown Journal',
        publicationDate: result.pubdate ? parsePubDate(result.pubdate) : null,
        abstract: null,
        doi: result.articleids?.find((id: any) => id.idtype === 'doi')?.value || null,
        keywords: result.keywords || [],
        meshTerms: result.meshterms || [],
        relatedSnps: [rsid],
        relatedGenes: [],
        paperType: classifyPaperType(result.title, result.meshterms),
        citationCount: result.pmcrefcount || 0,
        lastUpdated: new Date(),
      };
      
      savePubMedPaper(paper);
      papers.push(paper);
    }
    
    return papers;
  } catch (error) {
    console.error(`Error syncing PubMed for ${rsid}:`, error);
    return [];
  }
}

function parsePubDate(pubDateStr: string): Date | null {
  try {
    const yearMatch = pubDateStr.match(/(\d{4})/);
    if (yearMatch) {
      return new Date(parseInt(yearMatch[1]), 0, 1);
    }
    return null;
  } catch {
    return null;
  }
}

function classifyPaperType(title: string, meshTerms: string[]): PubMedPaper['paperType'] {
  const title_lower = title.toLowerCase();
  const mesh_lower = meshTerms.join(' ').toLowerCase();
  
  if (title_lower.includes('gwas') || title_lower.includes('genome-wide') || mesh_lower.includes('genome-wide association study')) {
    return 'gwas';
  }
  if (mesh_lower.includes('pharmacogenomics') || mesh_lower.includes('pharmacogenetics') || title_lower.includes('drug response')) {
    return 'pharmacogenomics';
  }
  if (mesh_lower.includes('review')) {
    return 'review';
  }
  if (mesh_lower.includes('clinical trial')) {
    return 'clinical';
  }
  return 'other';
}

export async function syncGWASCatalog(snpList?: string[]): Promise<GWASStudy[]> {
  try {
    let url = `${GWAS_API_BASE}/studies`;
    if (snpList && snpList.length > 0) {
      const rsid = snpList[0].replace('rs', '');
      url = `${GWAS_API_BASE}/singleNucleotidePolymorphisms/rs${rsid}/associations`;
    }
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch GWAS catalog: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const studies: GWASStudy[] = [];
    
    const associations = data._embedded?.associations || [];
    
    for (const assoc of associations.slice(0, 50)) {
      const study: GWASStudy = {
        id: `gwas-${assoc.id}`,
        trait: assoc.traitName?.[0] || 'Unknown',
        reportedTrait: assoc.reportedTrait,
        pmid: assoc.publication?.pubmedId || null,
        pubDate: assoc.publication?.publicationDate ? new Date(assoc.publication.publicationDate) : null,
        sampleSize: assoc.numberOfIndividuals || 0,
        population: assoc.population?.[0] || 'Unknown',
        pValue: assoc.pvalue || 0,
        riskAllele: assoc.riskAllele || null,
        riskFrequency: assoc.riskFrequency ? parseFloat(assoc.riskFrequency) : null,
        oddsRatio: assoc.orValue || null,
        beta: assoc.beta || null,
        ciText: assoc.ci || null,
        snpId: assoc.rsId ? `rs${assoc.rsId}` : null,
        gene: assoc.geneName || null,
        mappedGene: assoc.mappedGene || null,
        context: assoc.context || null,
      };
      
      if (study.snpId) {
        saveGWASStudy(study);
        studies.push(study);
      }
    }
    
    return studies;
  } catch (error) {
    console.error('Error syncing GWAS catalog:', error);
    return [];
  }
}

export async function batchSyncSNPs(rsids: string[]): Promise<{success: number; failed: number}> {
  let success = 0;
  let failed = 0;
  
  console.log(`Starting batch sync for ${rsids.length} SNPs...`);
  
  for (let i = 0; i < rsids.length; i++) {
    const rsid = rsids[i];
    
    if (i % 10 === 0) {
      console.log(`Progress: ${i}/${rsids.length} SNPs processed`);
    }
    
    try {
      const snp = await syncSNPFromNCBI(rsid);
      if (snp) {
        success++;
        await syncClinVarForSNP(rsid);
        await syncPubMedPapersForSNP(rsid, 5);
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to sync ${rsid}:`, error);
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Batch sync complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

export async function runFullSync(): Promise<void> {
  const syncId = startSync('all_sources', 'full');
  
  try {
    const importantSNPs = [
      'rs1801133', 'rs1801131', 'rs762551', 'rs3892097', 'rs9939609',
      'rs1815739', 'rs429358', 'rs7412', 'rs2395029', 'rs113993960',
      'rs1800562', 'rs80357906', 'rs4680', 'rs1544410', 'rs1801260',
      'rs7903146', 'rs10455872', 'rs4948672', 'rs1799983', 'rs33972313',
      'rs713598', 'rs2802292', 'rs662', 'rs5275', 'rs1815739',
    ];
    
    const result = await batchSyncSNPs(importantSNPs);
    
    completeSync(syncId, importantSNPs.length, result.success, 0);
    console.log('Full sync completed successfully');
  } catch (error) {
    completeSync(syncId, 0, 0, 0, error instanceof Error ? error.message : 'Unknown error');
    console.error('Full sync failed:', error);
    throw error;
  }
}

export async function syncGeneDrugsFromPharmGKB(geneSymbol: string): Promise<DrugGeneInteraction[]> {
  try {
    const url = `${PHARMGKB_API_BASE}/data/gene/${geneSymbol}?view=base`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Gene ${geneSymbol} not found in PharmGKB`);
      } else {
        console.warn(`PharmGKB API error: ${response.status}`);
      }
      return [];
    }
    
    const data = await response.json();
    const interactions: DrugGeneInteraction[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.drug && item.phenotype) {
          const interaction: DrugGeneInteraction = {
            id: `pgkb-${item.id}`,
            geneSymbol: geneSymbol,
            drugId: item.drug.id,
            drugName: item.drug.name,
            phenotype: item.phenotype.name,
            evidenceLevel: mapPharmGKBLevel(item.evidenceLevel),
            evidenceLevelDescription: getEvidenceDescription(item.evidenceLevel),
            implications: item.implications || 'See PharmGKB for details',
            recommendations: item.recommendations || [],
            source: 'pharmgkb',
            lastUpdated: new Date(),
          };
          
          saveDrugGeneInteraction(interaction);
          interactions.push(interaction);
        }
      }
    }
    
    return interactions;
  } catch (error) {
    console.error(`Error syncing PharmGKB for ${geneSymbol}:`, error);
    return [];
  }
}

function mapPharmGKBLevel(level: string): DrugGeneInteraction['evidenceLevel'] {
  const mapping: Record<string, DrugGeneInteraction['evidenceLevel']> = {
    '1A': '1A', '1B': '1B', '2A': '2A', '2B': '2B',
    '3': '3', '4': '4',
  };
  return mapping[level] || '4';
}

function getEvidenceDescription(level: string): string {
  const descriptions: Record<string, string> = {
    '1A': 'Clinical Annotation Level 1A - Strongest evidence',
    '1B': 'Clinical Annotation Level 1B - Strong evidence',
    '2A': 'Clinical Annotation Level 2A - Moderate evidence',
    '2B': 'Clinical Annotation Level 2B - Moderate evidence',
    '3': 'Clinical Annotation Level 3 - Weak evidence',
    '4': 'Clinical Annotation Level 4 - Minimal evidence',
  };
  return descriptions[level] || 'Unknown evidence level';
}
