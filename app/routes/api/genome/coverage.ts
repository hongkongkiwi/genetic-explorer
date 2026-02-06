import { createAPIFileRoute } from '@tanstack/start/api'
import { requireAuth } from '~/utils/auth.server'
import { canAccessGenome } from '~/utils/database'
import { getGenomeCoverage } from '~/utils/databaseQueries'
import { calculateGenomeCoverage } from '~/utils/genomeCoverage'
import { decryptForUser } from '~/utils/encryption'
import type { SNP } from '~/utils/genomeParser'

interface SnpRow {
  rsid: string
  chromosome: string
  position: number
  genotype_encrypted: string
}

export const APIRoute = createAPIFileRoute('/api/genome/coverage')({
  GET: async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const genomeId = url.searchParams.get('id')
    
    if (!genomeId) {
      return Response.json({ success: false, error: 'Genome ID required' }, { status: 400 })
    }

    // Check access
    const access = canAccessGenome(auth.id, genomeId)
    if (!access.canAccess) {
      return Response.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    try {
      // Get genome SNPs
      const snpRows = getGenomeCoverage(genomeId, auth.id) as SnpRow[]
      
      if (!snpRows || snpRows.length === 0) {
        return Response.json({ success: false, error: 'No SNPs found for this genome' }, { status: 404 })
      }

      // Decrypt SNPs
      const snps: SNP[] = snpRows.map(row => ({
        rsid: row.rsid,
        chromosome: row.chromosome,
        position: row.position,
        genotype: decryptForUser(auth.id, JSON.parse(row.genotype_encrypted)),
      }))

      // Calculate coverage
      const coverage = calculateGenomeCoverage(snps)

      return Response.json({
        success: true,
        coverage: {
          overall: coverage.overall,
          snps: coverage.snps,
          clinical: coverage.clinical,
          ancestry: coverage.ancestry,
          health: coverage.health,
          chromosomes: coverage.chromosomes.slice(0, 6), // Limit detail
          recommendations: coverage.recommendations,
        },
      })
    } catch (error) {
      console.error('Failed to calculate coverage:', error)
      return Response.json(
        { success: false, error: 'Failed to calculate genome coverage' },
        { status: 500 }
      )
    }
  },
})
