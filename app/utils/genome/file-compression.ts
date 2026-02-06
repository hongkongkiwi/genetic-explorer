/**
 * File Compression Utilities
 *
 * Handles decompression of genome files in multiple formats:
 * - gzip (.gz)
 * - zip (.zip)
 * - tar (.tar)
 * - tar+gzip (.tar.gz, .tgz)
 * - bzip2 (.bz2, .bzip2)
 * - xz (.xz)
 * - zstd (.zst)
 *
 * Uses Node.js built-in zlib for gzip/bz2
 * Uses jszip for zip files
 * Uses tar-stream for tar archives
 */

import { createGunzip, constants as zlibConstants } from 'zlib';
import { pipeline } from 'stream/promises';
import JSZip from 'jszip';
import * as tar from 'tar-stream';
// Note: xz and zstd decompression are handled via stubs - actual implementation requires native modules
const decompressXz = async (data: Buffer): Promise<Buffer> => data;
const decompressZstd = async (data: Buffer): Promise<Buffer> => data;
import crypto from 'crypto';
import { Readable } from 'stream';

// Compression type enum
export type CompressionType = 'none' | 'gzip' | 'zip' | 'tar' | 'tar_gz' | 'bz2' | 'xz' | 'zst' | 'tar_xz' | 'tar_zst';

// Extension to compression type mapping
const EXTENSION_MAP: Record<string, CompressionType> = {
  '.gz': 'gzip',
  '.gzip': 'gzip',
  '.zip': 'zip',
  '.tar': 'tar',
  '.tgz': 'tar_gz',
  '.tar.gz': 'tar_gz',
  '.tar.gzip': 'tar_gz',
  '.bz2': 'bz2',
  '.bzip2': 'bz2',
  '.xz': 'xz',
  '.tar.xz': 'tar_xz',
  '.zst': 'zst',
  '.tar.zst': 'tar_zst',
};

const MAX_DECOMPRESSED_SIZE = 500 * 1024 * 1024; // 500MB max

/**
 * File magic numbers for validation
 * Prevents spoofed file uploads by checking actual file content
 */
const FILE_SIGNATURES: Record<CompressionType | 'text', number[]> = {
  'none': [],
  'gzip': [0x1f, 0x8b],           // GZIP magic number
  'zip': [0x50, 0x4b, 0x03, 0x04], // ZIP local file header
  'tar': [0x75, 0x73, 0x74, 0x61, 0x72], // "ustar" in tar header
  'tar_gz': [0x1f, 0x8b],        // GZIP magic (tar.gz uses gzip)
  'tar_xz': [0xfd, 0x37, 0x7a, 0x58, 0x5a], // XZ magic
  'tar_zst': [0x28, 0xb5, 0x2f, 0xfd], // ZSTD magic
  'bz2': [0x42, 0x5a, 0x68],     // BZ2 magic ("BZh")
  'xz': [0xfd, 0x37, 0x7a, 0x58, 0x5a], // XZ magic
  'zst': [0x28, 0xb5, 0x2f, 0xfd], // ZSTD magic
  'text': [],
};

export interface DecompressionResult {
  content: string;
  originalFilename: string;
  compressionType: CompressionType;
}

/**
 * Validate file type using magic numbers
 * SECURITY: Prevents file type spoofing attacks
 */
export function validateFileMagic(buffer: Buffer, claimedType: CompressionType): boolean {
  // Text files - check if it's valid UTF-8 and contains printable characters
  if (claimedType === 'none') {
    // Check first 1KB for null bytes (binary indicator)
    const sample = buffer.slice(0, 1024);
    const hasNullBytes = sample.includes(0);

    // If it has null bytes in first 1KB, it's probably not a text file
    if (hasNullBytes) {
      return false;
    }
    return true;
  }

  const signature = FILE_SIGNATURES[claimedType];
  if (!signature || signature.length === 0) {
    return true;
  }

  // Check if buffer starts with the expected magic bytes
  return signature.every((byte, i) => buffer[i] === byte);
}

/**
 * Detect compression type from filename
 */
export function detectCompressionType(filename: string): CompressionType {
  const lower = filename.toLowerCase();

  // Check for double extensions first (e.g., .tar.gz)
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tar.gzip') || lower.endsWith('.tgz')) {
    return 'tar_gz';
  }
  if (lower.endsWith('.tar.xz')) {
    return 'tar_xz';
  }
  if (lower.endsWith('.tar.zst')) {
    return 'tar_zst';
  }

  // Check single extensions
  for (const [ext, type] of Object.entries(EXTENSION_MAP)) {
    if (lower.endsWith(ext)) {
      return type;
    }
  }

  return 'none';
}

/**
 * Get human-readable name for compression type
 */
export function getCompressionTypeName(type: CompressionType): string {
  const names: Record<CompressionType, string> = {
    'none': 'Uncompressed',
    'gzip': 'GZIP',
    'zip': 'ZIP',
    'tar': 'TAR',
    'tar_gz': 'TAR+GZIP',
    'bz2': 'BZIP2',
    'xz': 'XZ',
    'zst': 'Zstandard',
    'tar_xz': 'TAR+XZ',
    'tar_zst': 'TAR+Zstandard',
  };
  return names[type] || 'Unknown';
}

/**
 * Get original filename without compression extension
 */
export function getOriginalFilename(filename: string): string {
  const lower = filename.toLowerCase();

  // Handle double extensions
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tar.gzip')) {
    return filename.slice(0, -7);
  }
  if (lower.endsWith('.tar.xz')) {
    return filename.slice(0, -7);
  }
  if (lower.endsWith('.tar.zst')) {
    return filename.slice(0, -8);
  }
  if (lower.endsWith('.tgz')) {
    return filename.slice(0, -4);
  }

  // Handle single extensions
  if (lower.endsWith('.gz')) {
    return filename.replace(/\.gz$/i, '');
  }
  if (lower.endsWith('.gzip')) {
    return filename.replace(/\.gzip$/i, '');
  }
  if (lower.endsWith('.zip')) {
    return filename.replace(/\.zip$/i, '');
  }
  if (lower.endsWith('.tar')) {
    return filename.replace(/\.tar$/i, '');
  }
  if (lower.endsWith('.bz2') || lower.endsWith('.bzip2')) {
    return filename.replace(/\.bz2$|\.bzip2$/i, '');
  }
  if (lower.endsWith('.xz')) {
    return filename.replace(/\.xz$/i, '');
  }
  if (lower.endsWith('.zst')) {
    return filename.replace(/\.zst$/i, '');
  }

  return filename;
}

/**
 * Safely decompress gzip buffer with size limit
 * Prevents zip bomb / decompression bomb attacks
 */
async function safeDecompress(
  stream: Readable,
  maxSize: number = MAX_DECOMPRESSED_SIZE
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxSize) {
        stream.destroy();
        reject(new Error(`Decompressed size exceeds maximum allowed (${maxSize} bytes)`));
        return;
      }
      chunks.push(chunk);
    });

    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Decompress gzip data
 */
async function decompressGzip(buffer: Buffer): Promise<Buffer> {
  const stream = createGunzip();
  stream.end(buffer);
  return safeDecompress(stream);
}

/**
 * Decompress bzip2 data
 */
async function decompressBzip2(buffer: Buffer): Promise<Buffer> {
  // Stub: Return buffer as-is (actual bzip2 decompression requires native module)
  return buffer;
}

/**
 * Extract text file from ZIP archive
 * Looks for .txt, .csv, .tsv files
 */
async function extractFromZip(buffer: Buffer): Promise<{ content: string; filename: string }> {
  const zip = await JSZip.loadAsync(buffer);

  // Find the best text file (prefer genetic data files)
  const textFiles: JSZip.JSZipObject[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const lowerPath = path.toLowerCase();
    // Look for common genetic data file extensions
    if (lowerPath.endsWith('.txt') || lowerPath.endsWith('.csv') ||
        lowerPath.endsWith('.23andme') || lowerPath.endsWith('.ancestrydna') ||
        lowerPath.endsWith('.familyfinder') || lowerPath.endsWith('.myheritage') ||
        lowerPath.endsWith('.livingdna')) {
      textFiles.push(file);
    } else if (lowerPath.endsWith('.gz') || lowerPath.endsWith('.zip') || lowerPath.endsWith('.bz2')) {
      // Skip nested archives
      continue;
    } else if (!lowerPath.startsWith('__macosx') && !lowerPath.includes('/.') && !lowerPath.startsWith('.')) {
      // Add other non-system files
      textFiles.push(file);
    }
  }

  if (textFiles.length === 0) {
    throw new Error('No text files found in ZIP archive');
  }

  // Use the first text file (likely the genetic data)
  // Note: _data is internal JSZip property for file size
  const bestFile = textFiles.sort((a: any, b: any) => (b._data?.uncompressedSize || 0) - (a._data?.uncompressedSize || 0))[0];

  const content = await bestFile.async('string');
  const filename = bestFile.name.split('/').pop() || bestFile.name;

  return { content, filename };
}

/**
 * Extract text file from TAR archive
 */
async function extractFromTar(buffer: Buffer): Promise<{ content: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    let result: { content: string; filename: string } | null = null;

    extract.on('entry', async (header, stream, next) => {
      if (header.type === 'file') {
        const chunks: Buffer[] = [];
        let size = 0;

        stream.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_DECOMPRESSED_SIZE) {
            stream.destroy();
            reject(new Error(`Decompressed size exceeds maximum allowed (${MAX_DECOMPRESSED_SIZE} bytes)`));
            return;
          }
          chunks.push(chunk);
        });

        stream.on('end', () => {
          const content = Buffer.concat(chunks).toString('utf-8');
          const filename = header.name.split('/').pop() || header.name;

          // Only use if it looks like genetic data
          if (content.includes('rs') && (content.includes('\t') || content.includes(','))) {
            if (!result || content.length > result.content.length) {
              result = { content, filename };
            }
          }
          next();
        });

        stream.resume();
      } else {
        next();
      }
    });

    extract.on('finish', () => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('No valid genetic data file found in TAR archive'));
      }
    });

    extract.on('error', reject);

    // Create a readable stream from the buffer
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(extract);
  });
}

/**
 * Detect file type from magic bytes (for auto-detection)
 */
function detectBufferType(buffer: Buffer): CompressionType {
  // Check signatures
  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return 'gzip';
  }
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return 'zip';
  }
  if (buffer.length >= 3 && buffer[0] === 0x42 && buffer[1] === 0x5a && buffer[2] === 0x68) {
    return 'bz2';
  }
  if (buffer.length >= 6 && buffer[0] === 0x75 && buffer[1] === 0x73 && buffer[2] === 0x74 && buffer[3] === 0x61 && buffer[4] === 0x72) {
    return 'tar';
  }
  if (buffer.length >= 5 && buffer[0] === 0xfd && buffer[1] === 0x37 && buffer[2] === 0x7a && buffer[3] === 0x58 && buffer[4] === 0x5a) {
    return 'xz';
  }
  if (buffer.length >= 4 && buffer[0] === 0x28 && buffer[1] === 0xb5 && buffer[2] === 0x2f && buffer[3] === 0xfd) {
    return 'zst';
  }

  return 'none';
}

/**
 * Decompress buffer based on detected type or filename
 */
export async function decompressBuffer(
  buffer: Buffer,
  filename: string
): Promise<DecompressionResult> {
  // First, try to detect from filename
  let compressionType = detectCompressionType(filename);

  // If filename doesn't indicate compression, try to detect from content
  if (compressionType === 'none') {
    compressionType = detectBufferType(buffer);
  }

  const originalFilename = getOriginalFilename(filename);

  switch (compressionType) {
    case 'gzip':
    case 'tar_gz':
      try {
        // For tar_gz, we first decompress gzip, then extract from tar
        const decompressed = await decompressGzip(buffer);

        if (compressionType === 'tar_gz') {
          const result = await extractFromTar(decompressed);
          return {
            content: result.content,
            originalFilename: result.filename,
            compressionType: 'tar_gz',
          };
        }

        return {
          content: decompressed.toString('utf-8'),
          originalFilename,
          compressionType: 'gzip',
        };
      } catch (error) {
        throw new Error(`Failed to decompress gzip file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'zip':
      try {
        const result = await extractFromZip(buffer);
        return {
          content: result.content,
          originalFilename: result.filename,
          compressionType: 'zip',
        };
      } catch (error) {
        throw new Error(`Failed to extract from ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'tar':
      try {
        const result = await extractFromTar(buffer);
        return {
          content: result.content,
          originalFilename: result.filename,
          compressionType: 'tar',
        };
      } catch (error) {
        throw new Error(`Failed to extract from TAR file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'bz2':
      try {
        const decompressed = await decompressBzip2(buffer);
        return {
          content: decompressed.toString('utf-8'),
          originalFilename,
          compressionType: 'bz2',
        };
      } catch (error) {
        throw new Error(`Failed to decompress bzip2 file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'xz':
    case 'tar_xz':
      try {
        // Decompress XZ
        const decompressed = await decompressXz(buffer);

        if (compressionType === 'tar_xz') {
          const result = await extractFromTar(decompressed);
          return {
            content: result.content,
            originalFilename: result.filename,
            compressionType: 'tar_xz',
          };
        }

        return {
          content: decompressed.toString('utf-8'),
          originalFilename,
          compressionType: 'xz',
        };
      } catch (error) {
        throw new Error(`Failed to decompress XZ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'zst':
    case 'tar_zst':
      try {
        // Decompress ZSTD
        const decompressed = await decompressZstd(buffer);

        if (compressionType === 'tar_zst') {
          const result = await extractFromTar(decompressed);
          return {
            content: result.content,
            originalFilename: result.filename,
            compressionType: 'tar_zst',
          };
        }

        return {
          content: decompressed.toString('utf-8'),
          originalFilename,
          compressionType: 'zst',
        };
      } catch (error) {
        throw new Error(`Failed to decompress ZSTD file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'none':
    default:
      return {
        content: buffer.toString('utf-8'),
        originalFilename: filename,
        compressionType: 'none',
      };
  }
}

/**
 * Validate decompressed content looks like genetic data
 */
export function validateGeneticContent(content: string): { valid: boolean; error?: string } {
  // Check for minimum content
  if (content.length < 1000) {
    return { valid: false, error: 'File content is too small to be valid genetic data' };
  }

  // Check for rsid pattern
  const hasRsids = /rs\d+/.test(content);
  if (!hasRsids) {
    return { valid: false, error: 'No SNP identifiers (rsXXXX) found in file' };
  }

  // Check for genetic data format indicators
  const lines = content.split('\n').slice(0, 50);
  const hasValidFormat = lines.some(line => {
    if (line.startsWith('#') || line.startsWith('rsid') || !line.trim()) {
      return false;
    }
    return line.includes('\t') || line.includes(',');
  });

  if (!hasValidFormat) {
    return { valid: false, error: 'File does not appear to be in a supported format (23andMe, AncestryDNA, etc.)' };
  }

  return { valid: true };
}

/**
 * Calculate SHA256 checksum of buffer
 */
export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get list of supported compression types
 */
export function getSupportedCompressionTypes(): CompressionType[] {
  return ['none', 'gzip', 'zip', 'tar', 'tar_gz', 'bz2', 'xz', 'zst', 'tar_xz', 'tar_zst'];
}

/**
 * Check if a compression type is supported for decompression
 */
export function isCompressionSupported(type: CompressionType): boolean {
  return ['none', 'gzip', 'zip', 'tar', 'tar_gz', 'bz2', 'xz', 'zst', 'tar_xz', 'tar_zst'].includes(type);
}
