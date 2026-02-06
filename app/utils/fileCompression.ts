/**
 * File Compression Utilities
 * 
 * Handles decompression of various genome file formats.
 */

import { createGunzip, createBrotliDecompress } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import type { Readable } from 'stream';
import * as crypto from 'crypto';

const pipelineAsync = promisify(pipeline);

export type CompressionFormat = 'gzip' | 'brotli' | 'none';
export type CompressionType = CompressionFormat;

export interface DecompressionResult {
  data: Buffer;
  format: CompressionFormat;
  originalSize?: number;
}

/**
 * Detect compression type from filename
 */
export function detectCompressionType(filename: string): CompressionType {
  return detectFormatFromFilename(filename);
}

/**
 * Calculate MD5 checksum of data
 */
export function calculateChecksum(data: Buffer): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Validate file magic bytes
 */
export function validateFileMagic(buffer: Buffer, expectedFormat: CompressionFormat): boolean {
  const detected = detectCompressionFormat(buffer);
  return detected === expectedFormat || (expectedFormat === 'none' && detected === 'none');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Detect compression format from buffer
 */
export function detectCompressionFormat(buffer: Buffer): CompressionFormat {
  // Gzip magic bytes: 0x1f 0x8b
  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return 'gzip';
  }
  
  // Brotli magic bytes: 0xce 0xb2 0xcf 0x81
  if (buffer.length >= 4 && 
      buffer[0] === 0xce && buffer[1] === 0xb2 && 
      buffer[2] === 0xcf && buffer[3] === 0x81) {
    return 'brotli';
  }
  
  return 'none';
}

/**
 * Detect compression format from filename
 */
export function detectFormatFromFilename(filename: string): CompressionFormat {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.gz') || lower.endsWith('.gzip')) return 'gzip';
  if (lower.endsWith('.br')) return 'brotli';
  return 'none';
}

/**
 * Decompress gzip data
 */
export async function decompressGzip(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];
    
    gunzip.on('data', (chunk) => chunks.push(chunk));
    gunzip.on('end', () => resolve(Buffer.concat(chunks)));
    gunzip.on('error', reject);
    
    gunzip.end(data);
  });
}

/**
 * Decompress brotli data
 */
export async function decompressBrotli(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const brotli = createBrotliDecompress();
    const chunks: Buffer[] = [];
    
    brotli.on('data', (chunk) => chunks.push(chunk));
    brotli.on('end', () => resolve(Buffer.concat(chunks)));
    brotli.on('error', reject);
    
    brotli.end(data);
  });
}

/**
 * Auto-detect and decompress data
 */
export async function decompressBuffer(buffer: Buffer): Promise<DecompressionResult> {
  const format = detectCompressionFormat(buffer);
  
  switch (format) {
    case 'gzip':
      return {
        data: await decompressGzip(buffer),
        format,
        originalSize: buffer.length,
      };
    case 'brotli':
      return {
        data: await decompressBrotli(buffer),
        format,
        originalSize: buffer.length,
      };
    default:
      return {
        data: buffer,
        format: 'none',
        originalSize: buffer.length,
      };
  }
}

/**
 * Stream decompression for large files
 */
export async function decompressStream(
  input: Readable,
  format: CompressionFormat
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  if (format === 'gzip') {
    const gunzip = createGunzip();
    input.pipe(gunzip);
    
    for await (const chunk of gunzip) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  } else if (format === 'brotli') {
    const brotli = createBrotliDecompress();
    input.pipe(brotli);
    
    for await (const chunk of brotli) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  } else {
    for await (const chunk of input) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  }
  
  return Buffer.concat(chunks);
}

/**
 * Check if data is compressed
 */
export function isCompressed(buffer: Buffer): boolean {
  return detectCompressionFormat(buffer) !== 'none';
}

/**
 * Get compression ratio info
 */
export function getCompressionInfo(originalSize: number, compressedSize: number): {
  ratio: number;
  savings: number;
  percentage: number;
} {
  const savings = originalSize - compressedSize;
  const ratio = originalSize / compressedSize;
  const percentage = (savings / originalSize) * 100;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    savings,
    percentage: Math.round(percentage * 100) / 100,
  };
}
