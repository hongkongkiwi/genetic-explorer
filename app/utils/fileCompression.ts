/**
 * File Compression Utilities
 * 
 * Handles decompression of genome files (.gz, .zip)
 * Uses Node.js built-in zlib for gzip
 * Uses adm-zip for zip files (if available)
 */

import { gunzipSync, constants as zlibConstants } from 'zlib';

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
        const decompressed = gunzipSync(buffer);
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
  // Use Node.js crypto module dynamically to avoid issues
  try {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch {
    // Fallback: return empty if crypto not available
    return '';
  }
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
