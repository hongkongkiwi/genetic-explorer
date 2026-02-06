import { createAPIFileRoute } from '@tanstack/start/api'
import { getSharingInviteByToken, acceptSharingInvite } from '~/utils/database'
import { requireAuth } from '~/utils/auth.server'
import { logActivity } from '~/utils/database'

export const APIRoute = createAPIFileRoute('/api/sharing/invite')({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const token = url.searchParams.get('token')

      if (!token) {
        return Response.json(
          { success: false, error: 'Token is required' },
          { status: 400 },
        )
      }

      const invite = getSharingInviteByToken(token)

      if (!invite) {
        return Response.json(
          { success: false, error: 'Invalid or expired invitation' },
          { status: 404 },
        )
      }

      return Response.json({
        success: true,
        invite: {
          ownerEmail: invite.ownerEmail,
          ownerName: invite.ownerName,
          permissionLevel: invite.permissionLevel,
        },
      })
    } catch (error) {
      console.error('Get invite error:', error)
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})

export const APIRouteAccept = createAPIFileRoute('/api/sharing/invite')({
  POST: async ({ request }) => {
    try {
      const auth = requireAuth(request)
      if (!auth) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const { token } = body

      if (!token) {
        return Response.json(
          { success: false, error: 'Token is required' },
          { status: 400 },
        )
      }

      const success = acceptSharingInvite(token, auth.id)

      if (!success) {
        return Response.json(
          { success: false, error: 'Invalid or expired invitation' },
          { status: 400 },
        )
      }

      // Log activity
      logActivity(auth.id, 'sharing_accepted', 'sharing', undefined, { token })

      return Response.json({
        success: true,
        message: 'Invitation accepted successfully',
      })
    } catch (error) {
      console.error('Accept invite error:', error)
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})
