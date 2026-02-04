import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { requireAuth } from '~/utils/auth'
import { csrfProtection } from '~/utils/csrf'
import { 
  replaceGenome, 
  canReplaceGenome, 
  getReplacementHistory,
  validateReplacementCompatibility 
} from '~/utils/genomeReplacement'
import { 
  decompressBuffer, 
  detectCompressionType, 
  calculateChecksum,
  validateFileMagic,
  formatFileSize 
} from '~/utils/fileCompression'

// Maximum file size: 100MB compressed
const MAX_FILE_SIZE = 100 * 1024 * 1024
const MAX_DECOMPRESSED_SIZE = 500 * 1024 * 1024

export const APIRoute = createAPIFileRoute('/api/genomes/replace')({
  POST: async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // CSRF protection
    const csrfCheck = csrfProtection(request, request.headers.get('cookie'))
    if (!csrfCheck.valid) {
      return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status })
    }

    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const genomeId = formData.get('genomeId') as string
      const preserveSharing = formData.get('preserveSharing') === 'true'
      const preserveReports = formData.get('preserveReports') === 'false' // Default false
      const createBackup = formData.get('createBackup') !== 'false' // Default true
      const reason = formData.get('reason') as string | undefined
      const nickname = formData.get('nickname') as string | undefined
      
      // Danger zone confirmations
      const skipIdentityVerification = formData.get('skipIdentityVerification') === 'true'
      const forceLowerQuality = formData.get('forceLowerQuality') === 'true'
      const confirmedIdentity = formData.get('confirmedIdentity') === 'true'
      const confirmedQualityDowngrade = formData.get('confirmedQualityDowngrade') === 'true'

      // Validate required fields
      if (!file || !genomeId) {
        return json(
          { success: false, error: 'Missing required fields: file and genomeId' },
          { status: 400 }
        )
      }

      // Check if genome can be replaced
      const canReplace = canReplaceGenome(genomeId, auth.id)
      if (!canReplace.canReplace) {
        return json(
          { success: false, error: canReplace.reason },
          { status: 403 }
        )
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        return json(
          {
            success: false,
            error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(MAX_FILE_SIZE)})`,
          },
          { status: 400 }
        )
      }

      // Read file
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      
      // Validate file magic
      const compressionType = detectCompressionType(file.name)
      if (!validateFileMagic(fileBuffer, compressionType)) {
        return json(
          {
            success: false,
            error: `File type validation failed. The file does not appear to be a valid ${compressionType === 'none' ? 'text' : compressionType} file.`,
          },
          { status: 400 }
        )
      }

      // Decompress to validate content
      let content: string
      try {
        const decompressed = await decompressBuffer(fileBuffer, file.name)
        content = decompressed.content
      } catch (decompressError) {
        return json(
          {
            success: false,
            error: decompressError instanceof Error
              ? decompressError.message
              : 'Failed to decompress file',
          },
          { status: 400 }
        )
      }

      // Validate decompressed size
      const decompressedSize = Buffer.byteLength(content, 'utf8')
      if (decompressedSize > MAX_DECOMPRESSED_SIZE) {
        return json(
          {
            success: false,
            error: `Decompressed file size (${formatFileSize(decompressedSize)}) exceeds maximum allowed (${formatFileSize(MAX_DECOMPRESSED_SIZE)})`,
          },
          { status: 400 }
        )
      }

      // Validate compatibility
      const newChecksum = calculateChecksum(fileBuffer)
      const compatibility = await validateReplacementCompatibility(
        genomeId,
        content,
        newChecksum
      )

      if (!compatibility.compatible) {
        return json(
          {
            success: false,
            error: 'Replacement validation failed',
            details: compatibility.errors,
          },
          { status: 400 }
        )
      }

      // Perform replacement
      const result = await replaceGenome(
        genomeId,
        auth.id,
        fileBuffer,
        file.name,
        {
          preserveSharing,
          preserveReports,
          createBackup,
          reason,
          nickname,
          skipIdentityVerification,
          forceLowerQuality,
          confirmedIdentity,
          confirmedQualityDowngrade,
        }
      )

      if (!result.success) {
        // Check if this is a danger zone response
        if (result.dangerZone?.show) {
          return json(
            {
              success: false,
              error: result.error,
              warnings: result.warnings,
              dangerZone: result.dangerZone,
              qualityComparison: result.qualityComparison,
              identityVerification: result.identityVerification,
              requiresConfirmation: true,
            },
            { status: 409 } // Conflict - requires confirmation
          )
        }
        
        return json(
          {
            success: false,
            error: result.error,
            warnings: result.warnings,
          },
          { status: 400 }
        )
      }

      return json({
        success: true,
        message: 'Genome successfully replaced',
        newGenomeId: result.newGenomeId,
        oldGenomeId: result.oldGenomeId,
        snpCount: result.snpCount,
        qualityComparison: result.qualityComparison,
        identityVerification: result.identityVerification,
        warnings: result.warnings,
      })
    } catch (error) {
      console.error('Genome replacement error:', error)
      return json(
        {
          success: false,
          error: error instanceof Error
            ? error.message
            : 'Failed to replace genome',
        },
        { status: 500 }
      )
    }
  },
})
