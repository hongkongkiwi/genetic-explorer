import { createAPIFileRoute } from '@tanstack/start/api'
import { requireAuth } from '~/utils/auth.server'
import { canReplaceGenome } from '~/utils/genomeReplacement'

export const APIRoute = createAPIFileRoute('/api/genomes/$id/replace-status')({
  GET: async ({ request, params }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const genomeId = params.id
    if (!genomeId) {
      return Response.json({ success: false, error: 'Genome ID required' }, { status: 400 })
    }

    try {
      const status = canReplaceGenome(genomeId, auth.id)

      return Response.json({
        success: true,
        canReplace: status.canReplace,
        reason: status.reason,
        warnings: status.warnings,
      })
    } catch (error) {
      console.error('Failed to check replacement status:', error)
      return Response.json(
        { success: false, error: 'Failed to check replacement status' },
        { status: 500 }
      )
    }
  },
})
