import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { getDb } from '~/utils/database'
import crypto from 'crypto'
import { sendSecurityNotification } from '~/utils/securityNotifications';
import { terminateAllUserSessions } from '~/utils/sessionManagement';
import { getClientIp } from '~/utils/rateLimit';

// Password hashing using PBKDF2
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha256')
    .toString('hex')
  return { hash, salt }
}

export const APIRoute = createAPIFileRoute('/api/auth/reset-password')({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const { token, password } = body

      if (!token || !password) {
        return json(
          { success: false, error: 'Token and password are required' },
          { status: 400 },
        )
      }

      // Validate password strength
      if (password.length < 8) {
        return json(
          { success: false, error: 'Password must be at least 8 characters' },
          { status: 400 },
        )
      }

      const db = getDb()

      // Find valid reset token
      const resetRecord = db
        .prepare(
          `
        SELECT * FROM password_resets 
        WHERE token = ? AND expires_at > datetime('now') AND used = 0
      `,
        )
        .get(token) as any

      if (!resetRecord) {
        return json(
          { success: false, error: 'Invalid or expired token' },
          { status: 400 },
        )
      }

      // Hash new password
      const { hash, salt } = hashPassword(password)
      const passwordHash = `${salt}:${hash}`

      // Update user password
      db.prepare(
        `
        UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?
      `,
      ).run(passwordHash, new Date().toISOString(), resetRecord.user_id)

      // Mark token as used
      db.prepare(
        `
        UPDATE password_resets SET used = 1 WHERE id = ?
      `,
      ).run(resetRecord.id)

      // Terminate all user's sessions for security
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent');
      const terminatedCount = terminateAllUserSessions(resetRecord.user_id, 'password_reset');

      // Send security notification
      sendSecurityNotification(
        resetRecord.user_id,
        'password_reset_completed',
        {},
        ipAddress || undefined,
        userAgent || undefined
      );

      return json({ 
        success: true, 
        message: 'Password reset successfully',
        terminatedSessions: terminatedCount,
      })
    } catch (error) {
      console.error('Reset password error:', error)
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})

export const APIRouteValidate = createAPIFileRoute('/api/auth/reset-password')({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const token = url.searchParams.get('token')

      if (!token) {
        return json(
          { success: false, error: 'Token is required' },
          { status: 400 },
        )
      }

      const db = getDb()
      const resetRecord = db
        .prepare(
          `
        SELECT * FROM password_resets 
        WHERE token = ? AND expires_at > datetime('now') AND used = 0
      `,
        )
        .get(token) as any

      if (!resetRecord) {
        return json(
          { success: false, error: 'Invalid or expired token' },
          { status: 400 },
        )
      }

      return json({ success: true, message: 'Token is valid' })
    } catch (error) {
      console.error('Validate token error:', error)
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})
