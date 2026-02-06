/**
 * Axiom Transport
 * 
 * Sends logs to Axiom.co for centralized logging and analysis.
 * Falls back to console logging if Axiom is not configured.
 */

import { logActivity } from '~/db';

// Axiom configuration
const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET || 'genetic-explorer';
const AXIOM_URL = process.env.AXIOM_URL || 'https://api.axiom.co/v1/datasets';

// Batch logs for efficiency
const logBatch: Array<{
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, unknown>;
}> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Flush logs to Axiom
 */
async function flushLogs(): Promise<void> {
  if (!AXIOM_TOKEN || logBatch.length === 0) {
    return;
  }
  
  const logsToSend = [...logBatch];
  logBatch.length = 0; // Clear batch
  
  try {
    const response = await fetch(`${AXIOM_URL}/${AXIOM_DATASET}/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AXIOM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logsToSend),
    });
    
    if (!response.ok) {
      console.error('[Axiom] Failed to send logs:', await response.text());
      // Re-add logs to batch for retry
      logBatch.push(...logsToSend);
    }
  } catch (error) {
    console.error('[Axiom] Error sending logs:', error);
    // Re-add logs to batch for retry
    logBatch.push(...logsToSend);
  }
}

/**
 * Schedule log flush
 */
function scheduleFlush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
  }
  flushTimer = setTimeout(flushLogs, 5000); // Flush every 5 seconds
}

/**
 * Axiom transport class
 */
export class AxiomTransport {
  id = 'axiom';
  
  private log(level: string, message: string, metadata?: Record<string, unknown>) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      service: 'genetic-explorer',
      environment: process.env.NODE_ENV,
    };
    
    if (AXIOM_TOKEN) {
      logBatch.push(entry);
      scheduleFlush();
    }
    
    // Also log to console
    console.log(`[${level.toUpperCase()}] ${message}`, metadata);
  }
  
  trace(message: string, metadata?: Record<string, unknown>) { 
    this.log('trace', message, metadata); 
  }
  
  debug(message: string, metadata?: Record<string, unknown>) { 
    this.log('debug', message, metadata); 
  }
  
  info(message: string, metadata?: Record<string, unknown>) { 
    this.log('info', message, metadata); 
  }
  
  warn(message: string, metadata?: Record<string, unknown>) { 
    this.log('warn', message, metadata); 
  }
  
  error(message: string, metadata?: Record<string, unknown>) { 
    this.log('error', message, metadata); 
  }
  
  fatal(message: string, metadata?: Record<string, unknown>) { 
    this.log('fatal', message, metadata); 
  }
  
  shipToLogger(_log: unknown) { 
    return { success: true }; 
  }
}

/**
 * Check if Axiom is configured
 */
export function isAxiomConfigured(): boolean {
  return !!AXIOM_TOKEN;
}

/**
 * Get Axiom status
 */
export function getAxiomStatus(): { 
  configured: boolean; 
  dataset?: string;
  url?: string;
} {
  return {
    configured: isAxiomConfigured(),
    dataset: AXIOM_DATASET,
    url: AXIOM_URL,
  };
}

/**
 * Force flush pending logs
 */
export async function flushAxiomLogs(): Promise<void> {
  await flushLogs();
}

// Flush logs on process exit
process.on('beforeExit', async () => {
  await flushLogs();
});
