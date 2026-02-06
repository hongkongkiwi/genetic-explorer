import { createAPIFileRoute } from '@tanstack/start/api'
import { getDb, logActivity } from '~/utils/database'
import { sendEmail } from '~/email'
import { EmailVerification } from '~/emails'

export const APIRoute = createAPIFileRoute('/api/auth/verify-email')({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const { token } = body

      if (!token) {
        return Response.json(
          { success: false, error: 'Token is required' },
          { status: 400 },
        )
      }

      const db = getDb()

      // Find verification token
      const verification = db
        .prepare(
          `
        SELECT * FROM email_verifications 
        WHERE token = ? AND expires_at > datetime('now') AND verified = 0
      `,
        )
        .get(token) as any

      if (!verification) {
        return Response.json(
          { success: false, error: 'Invalid or expired verification token' },
          { status: 400 },
        )
      }

      // Mark email as verified
      db.prepare(
        `
        UPDATE users SET email_verified = 1 WHERE id = ?
      `,
      ).run(verification.user_id)

      // Mark token as verified
      db.prepare(
        `
        UPDATE email_verifications SET verified = 1 WHERE id = ?
      `,
      ).run(verification.id)

      // Log activity
      logActivity(
        verification.user_id,
        'email_verified',
        'user',
        verification.user_id,
      )

      return Response.json({ success: true, message: 'Email verified successfully' })
    } catch (error) {
      console.error('Verify email error:', error)
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})

export const APIRouteResend = createAPIFileRoute('/api/auth/verify-email')({
  POST: async ({ request }) => {
    try {
      // Get current user from session
      const authHeader = request.headers.get('Authorization')
      const cookieHeader = request.headers.get('Cookie')
      let sessionToken: string | null = null

      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.slice(7)
      } else if (cookieHeader) {
        const match = cookieHeader.match(/session_token=([^;]+)/)
        if (match) sessionToken = match[1]
      }

      if (!sessionToken) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      // Validate session and get user
      const db = getDb()
      const session = db
        .prepare(
          `
        SELECT s.user_id, u.email FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > datetime('now')
      `,
        )
        .get(sessionToken) as any

      if (!session) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      // Check if already verified
      const user = db
        .prepare(`SELECT email_verified FROM users WHERE id = ?`)
        .get(session.user_id) as any
      if (user.email_verified) {
        return Response.json(
          { success: false, error: 'Email already verified' },
          { status: 400 },
        )
      }

      // Generate new verification token
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store verification token
      db.prepare(
        `
        INSERT INTO email_verifications (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `,
      ).run(session.user_id, token, expiresAt.toISOString())

      // Send verification email
      const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`
      const emailResult = await sendEmail({
        to: session.email,
        subject: 'Verify your email - Genetic Explorer',
        react: EmailVerification({
          verificationUrl,
          userName: session.email,
        }),
      })

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        return Response.json(
          { success: false, error: 'Failed to send verification email' },
          { status: 500 },
        )
      }

      return Response.json({ success: true, message: 'Verification email sent' })
    } catch (error) {
      console.error('Resend verification error:', error)
      return Response.json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})
