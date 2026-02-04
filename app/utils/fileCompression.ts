/**
 * File Compression Utilities
 *
 * Handles decompression of genome files (.gz, .zip)
 * Uses Node.js built-in zlib for gzip
 * Uses adm-zip for zip files (if available)
 */

import { gunzipSync, constants as zlibConstants, createGunzip } from 'zlib';
import crypto from 'crypto';

const MAX_DECOMPRESSED_SIZE = 500 * 1024 * 1024; // 500MB max

/**
 * File magic numbers for validation
 * Prevents spoofed file uploads by checking actual file content
 */
const FILE_SIGNATURES: Record<string, number[]> = {
  'gzip': [0x1f, 0x8b],           // GZIP magic number
  'zip': [0x50, 0x4b, 0x03, 0x04], // ZIP local file header
  'text': [],                      // Text files don't have signatures
};

/**
 * Validate file type using magic numbers
 * SECURITY: Prevents file type spoofing attacks
 */
export function validateFileMagic(buffer: Buffer, claimedType: 'gzip' | 'zip' | 'none'): boolean {
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

export interface DecompressionResult {
  content: string;
  originalFilename: string;
  compressionType: 'gzip' | 'zip' | 'none';
}

/**
 * Detect compression type from filename
 */
export function detectCompressionType(filename: string): 'gzip' | 'zip' | 'none' {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.gz') || lower.endsWith('.gzip')) {
    return 'gzip';
  }
  if (lower.endsWith('.zip')) {
    return 'zip';
  }
  return 'none';
}

/**
 * Get original filename without compression extension
 */
export function getOriginalFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.gz') || lower.endsWith('.gzip')) {
    return filename.replace(/\.(gz|gzip)$/i, '');
  }
  if (lower.endsWith('.zip')) {
    return filename.replace(/\.zip$/i, '');
  }
  return filename;
}

/**
 * Safely decompress gzip buffer with size limit
 * Prevents zip bomb / decompression bomb attacks
 */
function safeGunzip(buffer: Buffer, maxSize: number = MAX_DECOMPRESSED_SIZE): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const stream = createGunzip();
    const chunks: Buffer[] = [];
    let size = 0;
    
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
    stream.end(buffer);
  });
}

/**
 * Decompress buffer based on detected type
 */
export async function decompressBuffer(
  buffer: Buffer,
  filename: string
): Promise<DecompressionResult> {
  const compressionType = detectCompressionType(filename);
  const originalFilename = getOriginalFilename(filename);

  switch (compressionType) {
    case 'gzip':
      try {
        // Use safe decompression to prevent zip bomb attacks
        const decompressed = await safeGunzip(buffer, MAX_DECOMPRESSED_SIZE);
        return {
          content: decompressed.toString('utf-8'),
          originalFilename,
          compressionType: 'gzip',
        };
      } catch (error) {
        throw new Error(`Failed to decompress gzip file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'zip':
      // For now, zip files need manual extraction
      // We'll implement zip support if adm-zip is available
      throw new Error(
        'ZIP files are not yet supported. Please extract the file first and upload the .txt or .csv inside. '
      );

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
