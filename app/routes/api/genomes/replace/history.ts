import { createAPIFileRoute } from '@tanstack/start/api'
import { requireAuth } from '~/utils/auth.server'
import { getReplacementHistory } from '~/utils/genomeReplacement'

export const APIRoute = createAPIFileRoute('/api/genomes/replace/history')({
  GET: async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const history = getReplacementHistory(auth.id)

      return Response.json({
        success: true,
        history,
      })
    } catch (error) {
      console.error('Failed to fetch replacement history:', error)
      return Response.json(
        { success: false, error: 'Failed to fetch replacement history' },
        { status: 500 }
      )
    }
  },
})
