import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { requireAuth } from '~/utils/auth'
import { getReplacementHistory } from '~/utils/genomeReplacement'

export const APIRoute = createAPIFileRoute('/api/genomes/replace/history')({
  GET: async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const history = getReplacementHistory(auth.id)

      return json({
        success: true,
        history,
      })
    } catch (error) {
      console.error('Failed to fetch replacement history:', error)
      return json(
        { success: false, error: 'Failed to fetch replacement history' },
        { status: 500 }
      )
    }
  },
})
