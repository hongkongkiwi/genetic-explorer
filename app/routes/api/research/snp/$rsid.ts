import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { 
  getResearchSNP, 
  getClinVarForSNP, 
  getPapersForSNP, 
  getDrugInteractionsForGene,
  getGWASStudiesForSNP,
} from '~/utils/researchDatabase';
import { syncSNPFromNCBI } from '~/utils/researchSync';

export const APIRoute = createAPIFileRoute('/api/research/snp/$rsid')({
  GET: async ({ params }) => {
    try {
      const rsid = params.rsid;
      
      if (!rsid.startsWith('rs')) {
        return json({
          success: false,
          error: 'Invalid SNP ID format. Expected rsXXXXXXX',
        }, { status: 400 });
      }
      
      let snp = getResearchSNP(rsid);
      
      if (!snp) {
        snp = await syncSNPFromNCBI(rsid);
      }
      
      if (!snp) {
        return json({
          success: false,
          error: `SNP ${rsid} not found`,
        }, { status: 404 });
      }
      
      const [clinvar, papers, gwas] = await Promise.all([
        getClinVarForSNP(rsid),
        getPapersForSNP(rsid),
        getGWASStudiesForSNP(rsid),
      ]);
      
      let drugInteractions: any[] = [];
      if (snp.geneSymbol) {
        drugInteractions = getDrugInteractionsForGene(snp.geneSymbol);
      }
      
      return json({
        success: true,
        snp,
        clinvar,
        papers,
        gwas,
        drugInteractions,
      });
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get SNP data',
      }, { status: 500 });
    }
  },
});
