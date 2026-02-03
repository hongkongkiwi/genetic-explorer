import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { searchPapers, getPapersForSNP } from '~/utils/researchDatabase';

export const APIRoute = createAPIFileRoute('/api/research/papers')({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q');
      const rsid = url.searchParams.get('rsid');
      const gene = url.searchParams.get('gene');
      const yearFrom = url.searchParams.get('yearFrom');
      const yearTo = url.searchParams.get('yearTo');
      
      // If rsid provided, get papers for that SNP
      if (rsid) {
        const papers = getPapersForSNP(rsid);
        return json({
          success: true,
          rsid,
          count: papers.length,
          papers,
        });
      }
      
      // Otherwise search by query
      if (!query) {
        return json({
          success: false,
          error: 'Query parameter "q" or "rsid" is required',
        }, { status: 400 });
      }
      
      const papers = searchPapers(query, {
        gene: gene || undefined,
        yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
        yearTo: yearTo ? parseInt(yearTo) : undefined,
      });
      
      return json({
        success: true,
        query,
        filters: { gene, yearFrom, yearTo },
        count: papers.length,
        papers,
      });
    } catch (error) {
      return json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search papers',
      }, { status: 500 });
    }
  },
});
