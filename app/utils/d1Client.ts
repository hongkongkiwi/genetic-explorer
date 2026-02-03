/**
 * D1 Client Wrapper
 *
 * Provides a unified interface for D1 database access that works
 * both in Cloudflare Workers (production) and local development.
 *
 * Environment detection:
 * - Cloudflare Workers: Uses getRequestContext().env.DB
 * - Local development: Uses wrangler d1 or BetterSQLite3 fallback
 */

import type { D1Database } from '@cloudflare/workers-types';

// Type definitions for D1 operations
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    changed_db: boolean;
    db_size_on_disk: number;
    rows_read: number;
    rows_written: number;
  };
  duration: number;
}

export interface D1ExecResult {
  count: number;
  time: number;
}

// Environment variable to toggle between D1 and local SQLite
const USE_LOCAL_SQLITE = process.env.USE_LOCAL_SQLITE === 'true';

// D1 database binding (Cloudflare Workers context)
let d1Database: D1Database | null = null;

/**
 * Get D1 database instance
 * In Cloudflare Workers, this uses the DB binding
 * In local development, this can use BetterSQLite3 or wrangler
 */
export function getD1Database(): D1Database | null {
  if (USE_LOCAL_SQLITE) {
    return null; // Will fall back to local SQLite
  }

  // In Cloudflare Workers, this would be set via setD1Database
  // For type safety, we return null and let the caller handle the binding
  return d1Database;
}

/**
 * Set D1 database instance (called in Cloudflare Workers context)
 */
export function setD1Database(db: D1Database): void {
  d1Database = db;
}

/**
 * Check if running in Cloudflare Workers environment
 */
export function isCloudflareWorkers(): boolean {
  return typeof process.env.WORKER_ENV !== 'undefined' ||
         typeof globalThis.__env !== 'undefined';
}

/**
 * Query wrapper that handles both D1 and local SQLite
 */
export async function d1Query<T = Record<string, unknown>>(
  query: string,
  params?: unknown[]
): Promise<D1Result<T>> {
  const db = getD1Database();

  if (db) {
    // D1 execution in Cloudflare Workers
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      stmt.bind(...params);
    }

    const start = performance.now();
    const result = await stmt.all();
    const duration = performance.now() - start;

    return {
      results: result.results as T[],
      success: true,
      meta: {
        changed_db: result.success,
        db_size_on_disk: 0,
        rows_read: 0,
        rows_written: 0,
      },
      duration,
    };
  }

  // Fall back to local SQLite (better-sqlite3)
  const { getDb } = await import('./database');
  const localDb = getDb();

  const start = performance.now();
  const stmt = localDb.prepare(query);

  let results: T[];
  if (params && params.length > 0) {
    results = stmt.all(...params) as T[];
  } else {
    results = stmt.all() as T[];
  }

  const duration = performance.now() - start;

  return {
    results,
    success: true,
    meta: {
      changed_db: false,
      db_size_on_disk: 0,
      rows_read: 0,
      rows_written: 0,
    },
    duration,
  };
}

/**
 * Execute a write operation (INSERT, UPDATE, DELETE)
 */
export async function d1Exec(
  query: string,
  params?: unknown[]
): Promise<D1ExecResult> {
  const db = getD1Database();

  if (db) {
    // D1 execution
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      stmt.bind(...params);
    }

    const start = performance.now();
    const result = await stmt.run();
    const duration = performance.now() - start;

    return {
      count: result.meta?.rows_written || 0,
      time: duration,
    };
  }

  // Fall back to local SQLite
  const { getDb } = await import('./database');
  const localDb = getDb();

  const start = performance.now();
  const stmt = localDb.prepare(query);

  let result;
  if (params && params.length > 0) {
    result = stmt.run(...params);
  } else {
    result = stmt.run();
  }

  const duration = performance.now() - start;

  return {
    count: result.changes,
    time: duration,
  };
}

/**
 * Execute multiple statements in a transaction
 */
export async function d1Transaction(
  statements: Array<{ query: string; params?: unknown[] }>
): Promise<D1ExecResult> {
  const db = getD1Database();

  if (db) {
    // D1 batch execution
    const start = performance.now();
    const result = await db.batch(
      statements.map((s) => {
        const stmt = db.prepare(s.query);
        if (s.params && s.params.length > 0) {
          return stmt.bind(...s.params);
        }
        return stmt;
      })
    );
    const duration = performance.now() - start;

    let totalChanges = 0;
    for (const r of result) {
      totalChanges += r.meta?.rows_written || 0;
    }

    return {
      count: totalChanges,
      time: duration,
    };
  }

  // Fall back to local SQLite transaction
  const { getDb } = await import('./database');
  const localDb = getDb();

  const start = performance.now();
  const transaction = localDb.transaction(() => {
    for (const s of statements) {
      const stmt = localDb.prepare(s.query);
      if (s.params && s.params.length > 0) {
        stmt.run(...s.params);
      } else {
        stmt.run();
      }
    }
  });

  const result = transaction();
  const duration = performance.now() - start;

  return {
    count: result.changes,
    time: duration,
  };
}

/**
 * Get a single row
 */
export async function d1Get<T = Record<string, unknown>>(
  query: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await d1Query<T>(query, params);
  return result.results[0] || null;
}

/**
 * Insert and return the last row ID
 */
export async function d1Insert(
  query: string,
  params?: unknown[]
): Promise<string | null> {
  const db = getD1Database();

  if (db) {
    const stmt = db.prepare(query);
    if (params && params.length > 0) {
      stmt.bind(...params);
    }

    const result = await stmt.run();
    // D1 doesn't return the inserted ID directly
    // You'll need to use RETURNING clause or a separate query
    return result.success ? 'inserted' : null;
  }

  // Local SQLite fallback
  const { getDb } = await import('./database');
  const localDb = getDb();

  const stmt = localDb.prepare(query);
  const result = params ? stmt.run(...params) : stmt.run();

  return result.lastInsertRowid ? String(result.lastInsertRowid) : null;
}

/**
 * Close database connection (for cleanup)
 */
export async function closeDatabase(): Promise<void> {
  // D1 doesn't require explicit closing
  d1Database = null;
}
