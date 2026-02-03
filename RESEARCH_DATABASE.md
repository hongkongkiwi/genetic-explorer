# 🧬 Research Database System

The Genetic Explorer now includes a comprehensive **Research Database** system that fetches and stores genetic research data from authoritative external sources in your own local database.

## Overview

Instead of relying on static hardcoded SNP data, the system now:

1. **Fetches live data** from NCBI (dbSNP, ClinVar, PubMed), PharmGKB, and GWAS Catalog
2. **Stores locally** in SQLite for fast lookups
3. **Caches results** to minimize external API calls
4. **Provides rich analysis** using real research papers and clinical data

## Data Sources

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| **NCBI dbSNP** | SNP reference data (chromosome, position, alleles) | On-demand + 30-day cache |
| **NCBI ClinVar** | Clinical significance (pathogenic/benign) | On-demand + 30-day cache |
| **NCBI PubMed** | Research papers mentioning SNPs | On-demand + 30-day cache |
| **NCBI Gene** | Gene descriptions and locations | On-demand + 30-day cache |
| **PharmGKB** | Drug-gene interactions | Manual sync |
| **GWAS Catalog** | Genome-wide association studies | Manual sync |

## Database Schema

### Core Tables

```sql
-- SNPs from dbSNP
research_snps (rsid, chromosome, position, gene_symbol, gene_name, ...)

-- ClinVar clinical significance
clinvar_records (id, rsid, clinical_significance, conditions, review_status, ...)

-- PubMed papers
pubmed_papers (pmid, title, authors, journal, abstract, related_snps, ...)

-- Drug-gene interactions  
drug_gene_interactions (id, gene_symbol, drug_name, phenotype, evidence_level, ...)

-- Gene information
genes (symbol, name, description, chromosome, ...)

-- GWAS studies
gwas_studies (id, trait, snp_id, p_value, odds_ratio, ...)
```

## API Endpoints

### Research Database Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/research/stats` | GET | Get database statistics |
| `/api/research/sync` | GET | Get sync history |
| `/api/research/sync` | POST | Trigger sync (`{action: "full"\|"batch"\|"single"}`) |
| `/api/research/snp?q=query` | GET | Search SNPs |
| `/api/research/snp/:rsid` | GET | Get full SNP data (with ClinVar, papers, GWAS) |
| `/api/research/papers?q=query` | GET | Search research papers |
| `/api/research/papers?rsid=rs123` | GET | Get papers for specific SNP |

## Usage

### 1. Initial Setup

The research database tables are created automatically when you start the app. To populate with initial data:

```bash
# Option 1: Use the Research Admin UI
# Go to http://localhost:3000/research → Click "Full Sync"

# Option 2: Use the API
curl -X POST http://localhost:3000/api/research/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "full"}'
```

### 2. Search for SNPs

```bash
# Search by rsID, gene, or keyword
curl "http://localhost:3000/api/research/snp?q=MTHFR"

# Get detailed info for specific SNP
curl "http://localhost:3000/api/research/snp/rs1801133"
```

### 3. Query Research Papers

```bash
# Search papers by keyword
curl "http://localhost:3000/api/research/papers?q=diabetes+genetics"

# Get papers for specific SNP
curl "http://localhost:3000/api/research/papers?rsid=rs1801133"
```

### 4. Programmatic Usage

```typescript
import { analyzeSNPAgainstResearch } from '~/utils/enhancedAnalysis';
import { getResearchSNP, getPapersForSNP } from '~/utils/researchDatabase';
import { syncSNPFromNCBI } from '~/utils/researchSync';

// Get enriched SNP data with research papers
const variant = await analyzeSNPAgainstResearch({
  rsid: 'rs1801133',
  chromosome: '1',
  position: 11856378,
  genotype: 'CT'
});

// variant includes:
// - ClinVar clinical significance
// - Related PubMed papers
// - GWAS studies
// - Drug interactions
```

## Admin UI

Visit `/research` to access the research database admin panel:

- **Overview**: Database statistics and quick actions
- **Search**: Search and explore SNPs in the database
- **Sync**: View sync history and trigger manual syncs

## Rate Limiting & Caching

### External API Limits

- **NCBI E-utilities**: 3 requests/second (no API key required for low volume)
- **PharmGKB**: Requires free API key for higher limits
- **GWAS Catalog**: No strict limits, but be respectful

### Caching Strategy

| Data Type | Cache Duration | Behavior |
|-----------|---------------|----------|
| SNP basic info | 30 days | Refreshed on demand after expiry |
| ClinVar records | 30 days | Refreshed on demand after expiry |
| PubMed papers | 30 days | Refreshed on demand after expiry |
| Gene info | 30 days | Refreshed on demand after expiry |

## Sync Strategies

### Full Sync
Fetches data for a curated list of ~25 important pharmacogenomic SNPs:
- MTHFR, CYP family, APOE, BRCA, etc.
- Takes ~5-10 minutes
- Good for initial setup

### On-Demand Sync
When analyzing a user's genome:
- Only fetches SNPs present in their data
- Caches results for future use
- Minimizes API calls

### Batch Sync
For updating specific SNPs:

```typescript
import { batchSyncSNPs } from '~/utils/researchSync';

const result = await batchSyncSNPs([
  'rs1801133', 'rs762551', 'rs429358'
]);

console.log(`Success: ${result.success}, Failed: ${result.failed}`);
```

## Enhanced Analysis

The `enhancedAnalysis.ts` module provides analysis using the research database:

```typescript
import { performEnhancedAnalysis } from '~/utils/enhancedAnalysis';

const result = await performEnhancedAnalysis(userSNPs, {
  minImpact: 2  // Only return variants with impact >= 2
});

// result.variants includes:
// - ClinVar clinical significance
// - Related research papers
// - GWAS associations
// - Evidence-based recommendations
```

## Future Enhancements

Potential improvements to consider:

1. **Automated Sync Jobs**: Daily/weekly background updates
2. **PubMed Alerts**: Auto-fetch new papers for stored SNPs
3. **Evidence Scoring**: Weight recommendations by study quality
4. **Population Frequencies**: Add allele frequencies from gnomAD
5. **Pathway Analysis**: KEGG/Reactome pathway enrichment
6. **Custom SNP Lists**: Import company-specific variant panels

## Troubleshooting

### "SNP not found" errors
- The SNP may not be in dbSNP (rare for common SNPs)
- Check NCBI directly: https://www.ncbi.nlm.nih.gov/snp/
- Try running a manual sync for that SNP

### Slow performance
- First analysis is slower due to API calls
- Subsequent analyses use cached data
- Consider running a full sync during off-hours

### API rate limits
- NCBI may throttle excessive requests
- Built-in delays (400ms between requests)
- For heavy usage, apply for NCBI API key

## Data Attribution

When using this data, please cite the original sources:

- **ClinVar**: Landrum et al. Nucleic Acids Res. 2018
- **dbSNP**: Sherry et al. Nucleic Acids Res. 2001
- **PubMed**: NCBI Resource Coordinators. Nucleic Acids Res. 2018
- **PharmGKB**: Thorn et al. Nucleic Acids Res. 2013
- **GWAS Catalog**: Buniello et al. Nucleic Acids Res. 2019
