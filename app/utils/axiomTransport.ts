/**
 * Axiom Transport for Loglayer
 * 
 * Sends logs to Axiom (or compatible third-party) for centralized logging.
 * Only active when AXIOM_TOKEN and AXIOM_DATASET environment variables are set.
 */

import { Axiom } from '@axiomhq/js';
import { registerInterval, unregisterInterval } from './intervalRegistry';

interface AxiomTransportConfig {
  /** Axiom API token */
  token?: string;
  /** Axiom dataset name */
  dataset?: string;
  /** Custom Axiom URL for third-party compatibility (e.g., https://axiom.my-company.com) */
  url?: string;
  /** Additional metadata to include with every log */
  defaultMetadata?: Record<string, unknown>;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

/**
 * Custom Loglayer transport for Axiom
 * Falls back silently if Axiom is not configured
 */
export class AxiomTransport {
  id = 'axiom';
  private client: Axiom | null = null;
  private dataset: string | null = null;
  private isEnabled: boolean = false;
  private defaultMetadata: Record<string, unknown> = {};
  private logBuffer: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 5000;

  constructor(config: AxiomTransportConfig = {}) {
    const token = config.token || process.env.AXIOM_TOKEN;
    const dataset = config.dataset || process.env.AXIOM_DATASET;
    const url = config.url || process.env.AXIOM_URL;

    if (!token || !dataset) {
      console.log('[AxiomTransport] Axiom logging disabled (AXIOM_TOKEN or AXIOM_DATASET not set)');
      return;
    }

    try {
      this.client = new Axiom({ token, url });
      this.dataset = dataset;
      this.isEnabled = true;
      this.defaultMetadata = config.defaultMetadata || {};
      
      // Start periodic flush
      this.flushInterval = registerInterval(setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS));
      
      console.log(`[AxiomTransport] Axiom logging enabled (dataset: ${dataset}, url: ${url || 'default'})`);
    } catch (error) {
      console.error('[AxiomTransport] Failed to initialize Axiom client:', error);
    }
  }

  /**
   * Send log to Axiom
   */
  send(logs: { message: string; level: string; data?: Record<string, unknown> }[]): void {
    if (!this.isEnabled || !this.client || !this.dataset) {
      return;
    }

    for (const log of logs) {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: log.level,
        message: log.message,
        ...this.defaultMetadata,
        ...log.data,
      };

      this.logBuffer.push(logEntry);
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.BUFFER_SIZE) {
      this.flush();
    }
  }

  /**
   * Send buffered logs to Axiom
   */
  private async flush(): Promise<void> {
    if (!this.isEnabled || !this.client || !this.dataset || this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.client.ingest(this.dataset, logsToSend);
    } catch (error) {
      // Put logs back in buffer for retry
      this.logBuffer.unshift(...logsToSend);
      
      // Keep buffer from growing indefinitely
      if (this.logBuffer.length > this.BUFFER_SIZE * 2) {
        this.logBuffer = this.logBuffer.slice(-this.BUFFER_SIZE);
        console.error('[AxiomTransport] Buffer overflow, dropped old logs');
      }
      
      console.error('[AxiomTransport] Failed to send logs to Axiom:', error);
    }
  }

  /**
   * Flush remaining logs and cleanup
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      unregisterInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    await this.flush();
    
    if (this.client) {
      await this.client.flush();
    }
  }
}

/**
 * Check if Axiom logging is configured and available
 */
export function isAxiomConfigured(): boolean {
  return !!(process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET);
}

/**
 * Get Axiom configuration status for health checks
 */
export function getAxiomStatus(): {
  enabled: boolean;
  dataset?: string;
  url?: string;
} {
  const enabled = isAxiomConfigured();
  return {
    enabled,
    dataset: enabled ? process.env.AXIOM_DATASET : undefined,
    url: process.env.AXIOM_URL,
  };
}
