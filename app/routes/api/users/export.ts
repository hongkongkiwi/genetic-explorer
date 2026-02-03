import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import crypto from 'crypto'
import { requireAuth, getUserByEmail } from '~/utils/auth'
import {
  getDb,
  getUserById,
  getUserGenomes,
  getUserOAuthAccounts,
  getUserActivity,
} from '~/utils/database'
import {
  verifyTotpCode,
  verifyEmailCode,
  verifyBackupCode,
  is2faRequiredForAction,
} from '~/utils/twoFactor'
import { v4 as uuidv4 } from 'uuid'
import { logActivity } from '~/utils/database'
import { getClientIp } from '~/utils/rateLimit'

// ============================================================================
// Data Export Request/Response Types
// ============================================================================

interface ExportRequest {
  format: 'json' | 'zip'
  include: {
    profile: boolean
    genomes: boolean
    reports: boolean
    activity: boolean
    preferences: boolean
  }
  twoFactor: {
    method: 'totp' | 'email' | 'backup'
    code: string
  }
  password: string
}

interface ExportVerificationState {
  verified: boolean
  expiresAt: number
  userId: string
}

// In-memory verification store (use Redis in production)
const exportVerificationStore = new Map<string, ExportVerificationState>()
const EXPORT_VERIFICATION_TIMEOUT = 15 * 60 * 1000 // 15 minutes

// ============================================================================
// Helper Functions
// ============================================================================

function getExportVerificationKey(userId: string): string {
  return `export_verify_${userId}_${Date.now()}`
}

function storeExportVerification(key: string, userId: string): void {
  exportVerificationStore.set(key, {
    verified: true,
    expiresAt: Date.now() + EXPORT_VERIFICATION_TIMEOUT,
    userId,
  })
}

function isExportVerified(key: string, userId: string): boolean {
  const state = exportVerificationStore.get(key)
  if (!state) return false
  if (state.userId !== userId) return false
  if (Date.now() > state.expiresAt) {
    exportVerificationStore.delete(key)
    return false
  }
  return state.verified
}

function clearExportVerification(key: string): void {
  exportVerificationStore.delete(key)
}

// ============================================================================
// POST: Initiate export verification
// ============================================================================

export const APIRoute = createAPIFileRoute('/api/users/export')({
  POST: async ({ request }) => {
    try {
      // Require authentication
      const auth = requireAuth(request)
      const ipAddress = getClientIp(request)

      const body = (await request.json()) as Partial<ExportRequest>
      const { password, twoFactor, format, include } = body

      // Validate request
      if (!password) {
        return json(
          { success: false, error: 'Password is required for verification' },
          { status: 400 },
        )
      }

      // Verify password
      const userWithPassword = getUserByEmail(auth.email)
      if (!userWithPassword) {
        return json(
          { success: false, error: 'User not found' },
          { status: 404 },
        )
      }

      // Check if user has a password (OAuth users may not)
      if (userWithPassword.passwordHash) {
        const [salt, hash] = userWithPassword.passwordHash.split(':')
        const { hash: computedHash } = crypto.pbkdf2Sync(
          password,
          salt,
          100000,
          64,
          'sha256',
        )
        if (computedHash !== hash) {
          logActivity(
            auth.id,
            'export_failed',
            'export',
            auth.id,
            { reason: 'invalid_password' },
            ipAddress,
          )
          return json(
            { success: false, error: 'Invalid password' },
            { status: 401 },
          )
        }
      } else {
        // OAuth user without password - skip password verification
        // They'll need to verify via 2FA or OAuth session
      }

      // Check if 2FA is required for export
      if (is2faRequiredForAction('export')) {
        if (!twoFactor || !twoFactor.code) {
          // Return challenge to require 2FA
          return json(
            {
              success: false,
              requiresTwoFactor: true,
              availableMethods: ['totp', 'email', 'backup'],
              error: 'Two-factor authentication is required',
            },
            { status: 200 },
          )
        }

        // Verify 2FA code
        let is2faValid = false

        if (twoFactor.method === 'totp') {
          // Get user's TOTP secret from database (placeholder)
          // const totpSecret = await getUserTotpSecret(auth.id);
          // is2faValid = verifyTotpCode(totpSecret, twoFactor.code);
          return json(
            { success: false, error: 'TOTP verification not yet configured' },
            { status: 501 },
          )
        } else if (twoFactor.method === 'email') {
          is2faValid = verifyEmailCode(auth.email, twoFactor.code)
        } else if (twoFactor.method === 'backup') {
          const result = await verifyBackupCode(auth.id, twoFactor.code)
          is2faValid = result.valid
        }

        if (!is2faValid) {
          logActivity(
            auth.id,
            'export_failed',
            'export',
            auth.id,
            { reason: 'invalid_2fa', method: twoFactor.method },
            ipAddress,
          )
          return json(
            { success: false, error: 'Invalid verification code' },
            { status: 401 },
          )
        }
      }

      // Store verification state
      const verificationKey = getExportVerificationKey(auth.id)
      storeExportVerification(verificationKey, auth.id)

      // Log successful verification
      logActivity(
        auth.id,
        'export_verified',
        'export',
        auth.id,
        { format, include },
        ipAddress,
      )

      return json({
        success: true,
        verificationKey,
        expiresIn: EXPORT_VERIFICATION_TIMEOUT / 1000, // seconds
        message: 'Identity verified. You can now proceed with export.',
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      console.error('Export verification error:', error)
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },

  // GET: Actually perform the export (requires verification)
  GET: async ({ request }) => {
    try {
      // Require authentication
      const auth = requireAuth(request)
      const ipAddress = getClientIp(request)

      const url = new URL(request.url)
      const verificationKey = url.searchParams.get('verificationKey')
      const format =
        (url.searchParams.get('format') as 'json' | 'zip') || 'json'
      const includeProfile = url.searchParams.get('includeProfile') !== 'false'
      const includeGenomes = url.searchParams.get('includeGenomes') !== 'false'
      const includeReports = url.searchParams.get('includeReports') !== 'false'
      const includeActivity =
        url.searchParams.get('includeActivity') !== 'false'
      const includePreferences =
        url.searchParams.get('includePreferences') !== 'false'

      if (!verificationKey || !isExportVerified(verificationKey, auth.id)) {
        return json(
          {
            success: false,
            error:
              'Export verification required. Please verify your identity first.',
          },
          { status: 403 },
        )
      }

      // Get user data
      const user = getUserById(auth.id)
      if (!user) {
        return json(
          { success: false, error: 'User not found' },
          { status: 404 },
        )
      }

      // Collect export data
      const exportData: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        user: null,
        genomes: [],
        reports: [],
        activity: [],
        preferences: null,
      }

      // Include profile
      if (includeProfile) {
        exportData.user = {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          emailVerified: user.emailVerified,
        }
      }

      // Include genomes (without raw data for privacy)
      if (includeGenomes) {
        const genomes = getUserGenomes(auth.id)
        exportData.genomes = genomes.map((g) => ({
          id: g.id,
          filename: g.original_filename,
          source: g.source,
          snpCount: g.snp_count,
          uploadedAt: g.processed_at,
          status: g.status,
          nickname: g.nickname,
        }))
      }

      // Include reports
      if (includeReports) {
        const db = getDb()
        const reports = db
          .prepare(
            `
          SELECT id, genome_id, generated_at, report_data
          FROM reports
          WHERE user_id = ?
          ORDER BY generated_at DESC
        `,
          )
          .all(auth.id) as any[]

        exportData.reports = reports.map((r) => ({
          id: r.id,
          genomeId: r.genome_id,
          generatedAt: r.generated_at,
          // report_data is already JSON
        }))
      }

      // Include activity log
      if (includeActivity) {
        exportData.activity = getUserActivity(auth.id, 1000)
      }

      // Include preferences
      if (includePreferences) {
        const { getUserProfile } = require('~/utils/database')
        const profile = getUserProfile(auth.id)
        if (profile) {
          exportData.preferences = {
            bio: profile.bio,
            birthDate: profile.birthDate,
            sex: profile.sex,
            ancestry: profile.ancestry,
            timezone: profile.timezone,
            notificationPreferences: profile.notificationPreferences,
            privacySettings: profile.privacySettings,
          }
        }
      }

      // Log export
      logActivity(
        auth.id,
        'data_exported',
        'export',
        auth.id,
        {
          format,
          includeProfile,
          includeGenomes,
          includeReports,
          includeActivity,
          includePreferences,
        },
        ipAddress,
      )

      // Clear verification after use
      clearExportVerification(verificationKey)

      // Return data
      if (format === 'json') {
        return json(exportData, {
          headers: {
            'Content-Disposition': `attachment; filename="genetic-explorer-data-${Date.now()}.json"`,
            'Content-Type': 'application/json',
          },
        })
      } else {
        // ZIP format would require additional processing
        return json(
          { success: false, error: 'ZIP format not yet implemented' },
          { status: 501 },
        )
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      console.error('Export error:', error)
      return json(
        { success: false, error: 'An unexpected error occurred' },
        { status: 500 },
      )
    }
  },
})

// ============================================================================
// POST: Request email verification code for export
// ============================================================================

export const APIRouteSendVerification = createAPIFileRoute('/api/users/export')(
  {
    POST: async ({ request }) => {
      try {
        const auth = requireAuth(request)

        // Generate and store email code
        const {
          generateEmailCode,
          storeEmailCode,
        } = require('~/utils/twoFactor')
        const code = generateEmailCode()
        storeEmailCode(auth.email, code)

        // In production, send email with code
        // For now, log it (remove in production!)
        console.log(`Export verification code for ${auth.email}: ${code}`)

        // Log the request
        const ipAddress = getClientIp(request)
        logActivity(
          auth.id,
          'export_verification_sent',
          'export',
          auth.id,
          {},
          ipAddress,
        )

        return json({
          success: true,
          message: 'Verification code sent to your email',
          // Remove this in production - only for development
          // devCode: code,
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          return json(
            { success: false, error: 'Unauthorized' },
            { status: 401 },
          )
        }
        console.error('Send verification error:', error)
        return json(
          { success: false, error: 'An unexpected error occurred' },
          { status: 500 },
        )
      }
    },
  },
)
