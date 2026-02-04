import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { requireAuth } from '~/utils/auth'
import { canAccessGenome } from '~/utils/database'
import { getGenomeCoverage } from '~/utils/databaseQueries'
import { calculateGenomeCoverage } from '~/utils/genomeCoverage'
import { decryptForUser } from '~/utils/encryption'
import type { SNP } from '~/utils/genomeParser'

export const APIRoute = createAPIFileRoute('/api/genome/coverage')({
  GET: async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const genomeId = url.searchParams.get('id')
    
    if (!genomeId) {
      return json({ success: false, error: 'Genome ID required' }, { status: 400 })
    }

    // Check access
    const access = canAccessGenome(auth.id, genomeId)
    if (!access.canAccess) {
      return json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    try {
      // Get genome SNPs
      const snpRows = getGenomeCoverage(genomeId, auth.id)
      
      if (!snpRows || snpRows.length === 0) {
        return json({ success: false, error: 'No SNPs found for this genome' }, { status: 404 })
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

      return json({
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
      return json(
        { success: false, error: 'Failed to calculate genome coverage' },
        { status: 500 }
      )
    }
  },
})
