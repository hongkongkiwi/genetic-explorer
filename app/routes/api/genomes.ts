import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { parseGeneticData, validateGenomeData } from '~/utils/genomeParser'
import {
  saveGenome,
  getAccessibleGenomes,
  getUserGenomes,
  deleteGenome,
  getDatabaseStats,
  verifyGenomeIntegrity,
  canAccessGenome,
  setPrimaryGenome,
  logActivity,
} from '~/utils/database'
import { requireAuth } from '~/utils/auth'
import { csrfProtection } from '~/utils/csrf'
import {
  decompressBuffer,
  detectCompressionType,
  calculateChecksum,
  formatFileSize,
  validateGeneticContent,
  validateFileMagic,
} from '~/utils/fileCompression'

// Maximum file size: 100MB compressed, ~500MB decompressed
const MAX_FILE_SIZE = 100 * 1024 * 1024
const MAX_DECOMPRESSED_SIZE = 500 * 1024 * 1024

export const APIRoute = createAPIFileRoute('/api/genomes')({
  GET: async ({ request }) => {
    try {
      const auth = requireAuth(request)

      // If authenticated, return user's genomes and shared genomes
      let genomes
      if (auth) {
        const url = new URL(request.url)
        const mineOnly = url.searchParams.get('mine') === 'true'
        genomes = mineOnly
          ? getUserGenomes(auth.id)
          : getAccessibleGenomes(auth.id)
      } else {
        genomes = getAccessibleGenomes('') // Empty string will return empty array
      }

      const stats = getDatabaseStats()

      return json({
        success: true,
        genomes: genomes.map((g: any) => ({
          id: g.id,
          filename: g.original_filename,
          internalFilename: g.filename,
          source: g.source,
          snpCount: g.snp_count,
          storedSnps: g.stored_snps,
          fileSize: formatFileSize(g.file_size),
          compressionType: g.compression_type,
          checksum: g.checksum_sha256.substring(0, 16) + '...',
          processedAt: g.processed_at,
          status: g.status,
          isPrimary: g.is_primary === 1,
          nickname: g.nickname,
          accessLevel: g.accessLevel || 'owner',
          sharedBy: g.sharedBy,
        })),
        stats,
      })
    } catch (error) {
      console.error('Failed to fetch genomes:', error)
      return json(
        { success: false, error: 'Failed to fetch genomes' },
        { status: 500 },
      )
    }
  },

  POST: async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // CSRF protection for state-changing operation
    const csrfCheck = csrfProtection(request, request.headers.get('cookie'))
    if (!csrfCheck.valid) {
      return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status })
    }

    const processingStart = Date.now()

    try {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return json(
          { success: false, error: 'No file provided' },
          { status: 400 },
        )
      }

      // Server-side file size validation
      if (file.size > MAX_FILE_SIZE) {
        return json(
          {
            success: false,
            error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(MAX_FILE_SIZE)})`,
          },
          { status: 400 },
        )
      }

      // Read file into buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer())

      // SECURITY: Validate file magic numbers to prevent spoofed uploads
      const compressionType = detectCompressionType(file.name)
      const magicValid = validateFileMagic(fileBuffer, compressionType);
      if (!magicValid) {
        return json(
          {
            success: false,
            error: `File type validation failed. The file does not appear to be a valid ${compressionType === 'none' ? 'text' : compressionType} file.`,
          },
          { status: 400 },
        );
      }

      // Calculate checksum before any processing
      const checksum = calculateChecksum(fileBuffer)

      // Decompress if needed
      let content: string
      let originalFilename: string

      try {
        const decompressed = await decompressBuffer(fileBuffer, file.name)
        content = decompressed.content
        originalFilename = decompressed.originalFilename
      } catch (decompressError) {
        return json(
          {
            success: false,
            error:
              decompressError instanceof Error
                ? decompressError.message
                : 'Failed to decompress file',
          },
          { status: 400 },
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
          { status: 400 },
        )
      }

      // Validate content looks like genetic data
      const contentValidation = validateGeneticContent(content)
      if (!contentValidation.valid) {
        return json(
          {
            success: false,
            error: contentValidation.error,
          },
          { status: 400 },
        )
      }

      // Parse genetic data
      const parseResult = parseGeneticData(content)

      // Validate SNP data
      const validation = validateGenomeData(parseResult.snps)
      if (!validation.valid) {
        return json(
          {
            success: false,
            errors: validation.errors,
          },
          { status: 400 },
        )
      }

      // Save to database with user_id
      const result = saveGenome(
        file.name,
        originalFilename,
        parseResult.source,
        parseResult.snps,
        fileBuffer,
        checksum,
        compressionType === 'none' ? null : compressionType,
        auth.id,
      )

      // Log activity
      logActivity(auth.id, 'genome_uploaded', 'genome', result.id, {
        filename: originalFilename,
        snpCount: result.storedSnps,
      })

      const processingTime = Date.now() - processingStart

      return json({
        success: true,
        genomeId: result.id,
        stats: {
          source: parseResult.source,
          originalFilename,
          compressionType: compressionType === 'none' ? null : compressionType,
          originalSize: formatFileSize(file.size),
          decompressedSize: formatFileSize(decompressedSize),
          totalLines: parseResult.totalLines,
          validSnps: parseResult.validSnps,
          storedSnps: result.storedSnps,
          checksum: checksum.substring(0, 16) + '...',
          processingTimeMs: processingTime,
        },
      })
    } catch (error) {
      console.error('Upload error:', error)
      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to process genome file',
        },
        { status: 500 },
      )
    }
  },

  DELETE: async ({ request }) => {
    try {
      const auth = requireAuth(request)
      if (!auth) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      // CSRF protection for state-changing operation
      const csrfCheck = csrfProtection(request, request.headers.get('cookie'))
      if (!csrfCheck.valid) {
        return json({ success: false, error: csrfCheck.error }, { status: csrfCheck.status })
      }

      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return json(
          { success: false, error: 'No ID provided' },
          { status: 400 },
        )
      }

      // Check ownership
      const access = canAccessGenome(auth.id, id)
      if (!access.canAccess || access.permissionLevel !== 'owner') {
        return json(
          {
            success: false,
            error: 'You do not have permission to delete this genome',
          },
          { status: 403 },
        )
      }

      deleteGenome(id)

      // Log activity
      logActivity(auth.id, 'genome_deleted', 'genome', id)

      return json({ success: true, message: 'Genome deleted successfully' })
    } catch (error) {
      console.error('Delete error:', error)
      return json(
        { success: false, error: 'Failed to delete genome' },
        { status: 500 },
      )
    }
  },
})
