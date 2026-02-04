/**
 * Request Signing Module
 * 
 * Implements HMAC-SHA256 request signing for sensitive API endpoints.
 * Inspired by Lightway's packet authentication - ensures request integrity
 * and prevents replay attacks.
 * 
 * SECURITY FEATURES:
 * - HMAC-SHA256 signatures
 * - Timestamp-based expiration (5 minute window)
 * - Nonce tracking to prevent replay attacks
 * - Constant-time signature comparison
 */

import crypto from 'crypto';
import { getDb } from './database';

// Configuration
const SIGNATURE_VERSION = 'v1';
const SIGNATURE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CLOCK_SKEW_MS = 60 * 1000; // 1 minute clock skew tolerance

// Nonce tracking for replay protection (in-memory cache with DB persistence)
const usedNonces = new Set<string>();
const NONCE_CLEANUP_INTERVAL = 10 * 60 * 1000; // Cleanup every 10 minutes

interface RequestSignature {
  version: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

/**
 * Generate a request signature for client-side use
 * This would typically be called by the client before making API requests
 */
export function generateRequestSignature(
  apiKey: string,
  apiSecret: string,
  method: string,
  path: string,
  body?: string
): { signature: string; timestamp: number; nonce: string } {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const signature = createSignature(
    apiSecret,
    apiKey,
    method,
    path,
    timestamp,
    nonce,
    body
  );
  
  return { signature, timestamp, nonce };
}

/**
 * Create HMAC-SHA256 signature
 */
function createSignature(
  secret: string,
  apiKey: string,
  method: string,
  path: string,
  timestamp: number,
  nonce: string,
  body?: string
): string {
  const payload = [
    SIGNATURE_VERSION,
    apiKey,
    method.toUpperCase(),
    path,
    timestamp.toString(),
    nonce,
    body || ''
  ].join('|');
  
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Parse signature from Authorization header
 * Format: GeneticExplorer-Signature v1;apiKey;timestamp;nonce;signature
 */
function parseSignatureHeader(header: string): RequestSignature | null {
  try {
    const prefix = 'GeneticExplorer-Signature ';
    if (!header.startsWith(prefix)) {
      return null;
    }
    
    const parts = header.slice(prefix.length).split(';');
    if (parts.length !== 5) {
      return null;
    }
    
    const [version, , timestamp, nonce, signature] = parts;
    
    return {
      version,
      timestamp: parseInt(timestamp, 10),
      nonce,
      signature
    };
  } catch {
    return null;
  }
}

/**
 * Verify a request signature
 * Implements Lightway-style strict validation
 */
export async function verifyRequestSignature(
  request: Request,
  body?: string
): Promise<SignatureVerificationResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'Missing authorization header', status: 401 };
  }
  
  const signature = parseSignatureHeader(authHeader);
  if (!signature) {
    return { valid: false, error: 'Invalid signature format', status: 401 };
  }
  
  // Check version
  if (signature.version !== SIGNATURE_VERSION) {
    return { valid: false, error: 'Unsupported signature version', status: 401 };
  }
  
  // Check timestamp (prevent replay of old requests)
  const now = Date.now();
  const age = now - signature.timestamp;
  
  if (age > SIGNATURE_TTL_MS + MAX_CLOCK_SKEW_MS) {
    return { valid: false, error: 'Request signature has expired', status: 401 };
  }
  
  if (age < -MAX_CLOCK_SKEW_MS) {
    return { valid: false, error: 'Request timestamp is in the future', status: 401 };
  }
  
  // Check nonce for replay protection
  const nonceKey = `${signature.nonce}:${signature.timestamp}`;
  if (await isNonceUsed(nonceKey)) {
    return { valid: false, error: 'Request nonce has already been used', status: 401 };
  }
  
  // Mark nonce as used
  await markNonceUsed(nonceKey);
  
  // Get API key from header
  const apiKeyMatch = authHeader.match(/GeneticExplorer-Signature v1;([^;]+);/);
  if (!apiKeyMatch) {
    return { valid: false, error: 'Invalid API key format', status: 401 };
  }
  
  const apiKey = apiKeyMatch[1];
  
  // Look up API secret from database
  const db = getDb();
  const apiKeyRecord = db.prepare(
    'SELECT secret, user_id, is_active, expires_at FROM api_keys WHERE key = ?'
  ).get(apiKey) as { secret: string; user_id: string; is_active: number; expires_at: string } | undefined;
  
  if (!apiKeyRecord) {
    return { valid: false, error: 'Invalid API key', status: 401 };
  }
  
  if (!apiKeyRecord.is_active) {
    return { valid: false, error: 'API key is deactivated', status: 401 };
  }
  
  if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired', status: 401 };
  }
  
  // Verify signature with constant-time comparison
  const expectedSignature = createSignature(
    apiKeyRecord.secret,
    apiKey,
    request.method,
    new URL(request.url).pathname,
    signature.timestamp,
    signature.nonce,
    body
  );
  
  if (!constantTimeEqual(signature.signature, expectedSignature)) {
    return { valid: false, error: 'Invalid signature', status: 401 };
  }
  
  return { valid: true, userId: apiKeyRecord.user_id } as SignatureVerificationResult & { userId: string };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    // Still do comparison to maintain constant time, just with wrong result
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Check if a nonce has been used (with DB persistence for multi-instance)
 */
async function isNonceUsed(nonceKey: string): Promise<boolean> {
  // Check memory cache first
  if (usedNonces.has(nonceKey)) {
    return true;
  }
  
  // Check database for multi-instance deployments
  try {
    const db = getDb();
    const existing = db.prepare(
      'SELECT 1 FROM used_nonces WHERE nonce = ? AND created_at > datetime(\'now\', \'-10 minutes\')'
    ).get(nonceKey);
    return !!existing;
  } catch {
    // If table doesn't exist, just use memory cache
    return false;
  }
}

/**
 * Mark a nonce as used
 */
async function markNonceUsed(nonceKey: string): Promise<void> {
  usedNonces.add(nonceKey);
  
  // Persist to database for multi-instance deployments
  try {
    const db = getDb();
    db.prepare(
      'INSERT OR IGNORE INTO used_nonces (nonce, created_at) VALUES (?, datetime(\'now\'))'
    ).run(nonceKey);
  } catch {
    // Table might not exist yet, that's ok
  }
}

/**
 * Cleanup old nonces (should be called periodically)
 */
export function cleanupUsedNonces(): void {
  const cutoff = Date.now() - SIGNATURE_TTL_MS - MAX_CLOCK_SKEW_MS;
  
  // Clean memory cache
  for (const nonce of usedNonces) {
    const timestamp = parseInt(nonce.split(':')[1], 10);
    if (timestamp < cutoff) {
      usedNonces.delete(nonce);
    }
  }
  
  // Clean database
  try {
    const db = getDb();
    db.prepare(
      "DELETE FROM used_nonces WHERE created_at < datetime('now', '-10 minutes')"
    ).run();
  } catch {
    // Table might not exist
  }
}

// Start periodic cleanup
setInterval(cleanupUsedNonces, NONCE_CLEANUP_INTERVAL);

/**
 * Middleware helper for API routes
 */
export function requireSignedRequest(
  handler: (ctx: { request: Request; userId: string }) => Promise<Response>
) {
  return async ({ request }: { request: Request }) => {
    // Read body for signature verification
    const body = request.method !== 'GET' && request.method !== 'HEAD' 
      ? await request.clone().text()
      : undefined;
    
    const result = await verifyRequestSignature(request, body);
    
    if (!result.valid) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status || 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return handler({ request, userId: (result as any).userId });
  };
}

/**
 * Generate API key pair for a user
 */
export function generateAPIKey(userId: string): { key: string; secret: string } {
  const key = `ge_${crypto.randomBytes(16).toString('hex')}`;
  const secret = crypto.randomBytes(32).toString('hex');
  
  const db = getDb();
  db.prepare(
    `INSERT INTO api_keys (id, user_id, key, secret, created_at, is_active)
     VALUES (?, ?, ?, ?, datetime('now'), 1)`
  ).run(crypto.randomUUID(), userId, key, secret);
  
  return { key, secret };
}

/**
 * Initialize request signing tables
 */
export function initRequestSigningTables(): void {
  const db = getDb();
  
  // API keys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key TEXT UNIQUE NOT NULL,
      secret TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      last_used_at DATETIME,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Used nonces table for replay protection
  db.exec(`
    CREATE TABLE IF NOT EXISTS used_nonces (
      nonce TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create index for efficient cleanup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_used_nonces_created_at ON used_nonces(created_at)
  `);
}

export default {
  generateRequestSignature,
  verifyRequestSignature,
  requireSignedRequest,
  generateAPIKey,
  initRequestSigningTables,
  cleanupUsedNonces,
};
