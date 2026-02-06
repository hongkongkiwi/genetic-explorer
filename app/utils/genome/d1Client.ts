/**
 * D1 Client - Cloudflare D1 Database
 * 
 * Serverless SQL database for edge deployment.
 */

export interface D1Config {
  databaseId: string;
  apiToken: string;
  accountId: string;
}

export interface D1QueryResult<T> {
  results: T[];
  success: boolean;
  meta?: {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

// Configuration from environment
const D1_CONFIG: D1Config = {
  databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID || '',
  apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
};

const API_BASE = 'https://api.cloudflare.com/client/v4';

/**
 * Check if D1 is configured
 */
export function isD1Configured(): boolean {
  return !!D1_CONFIG.databaseId && !!D1_CONFIG.apiToken && !!D1_CONFIG.accountId;
}

/**
 * Make D1 API request
 */
async function d1Request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: Record<string, unknown>
): Promise<T | null> {
  if (!isD1Configured()) {
    return null;
  }

  const url = `${API_BASE}/accounts/${D1_CONFIG.accountId}/d1/database/${D1_CONFIG.databaseId}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${D1_CONFIG.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[D1] API error:', error);
      return null;
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('[D1] Query failed:', data.errors);
      return null;
    }

    return data.result as T;
  } catch (error) {
    console.error('[D1] Request error:', error);
    return null;
  }
}

/**
 * Execute a query
 */
export async function d1Query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await d1Request<D1QueryResult<T>>('/query', 'POST', {
    sql,
    params: params?.map(p => 
      typeof p === 'object' ? JSON.stringify(p) : String(p)
    ),
  });

  return result?.results || [];
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE)
 */
export async function d1Exec(sql: string): Promise<void> {
  await d1Request('/query', 'POST', { sql });
}

/**
 * Get a single row
 */
export async function d1Get<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const results = await d1Query<T>(sql, params);
  return results[0] || null;
}

/**
 * Insert and return the last row ID
 */
export async function d1Insert(
  sql: string,
  params?: unknown[]
): Promise<number> {
  const result = await d1Request<D1QueryResult<unknown>>('/query', 'POST', {
    sql,
    params: params?.map(p => 
      typeof p === 'object' ? JSON.stringify(p) : String(p)
    ),
  });

  return result?.meta?.last_row_id || 0;
}

/**
 * Create D1 client instance
 */
export function createD1Client(config: D1Config): D1Client {
  return new D1Client(config);
}

export class D1Client {
  private config: D1Config;

  constructor(config: D1Config) {
    this.config = config;
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    return d1Query<T>(sql, params);
  }

  async exec(sql: string): Promise<void> {
    return d1Exec(sql);
  }
}
