/**
 * Centralized logging utility
 * Provides structured logging with different levels and metadata support
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
  error?: Error;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableJson: boolean;
  prefix?: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: (process.env.NODE_ENV === 'production' ? 'info' : 'debug') as LogLevel,
      enableConsole: true,
      enableJson: process.env.NODE_ENV === 'production',
      prefix: undefined,
      ...config,
    };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Format a log entry
   */
  private format(entry: LogEntry): string {
    if (this.config.enableJson) {
      return JSON.stringify({
        ...entry,
        error: entry.error ? {
          message: entry.error.message,
          stack: entry.error.stack,
          name: entry.error.name,
        } : undefined,
      });
    }

    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
    const error = entry.error ? `\n${entry.error.stack}` : '';
    
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${prefix}${entry.message}${meta}${error}`;
  }

  /**
   * Output a log entry
   */
  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formatted = this.format(entry);

    if (!this.config.enableConsole) return;

    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  /**
   * Create a log entry
   */
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>, error?: Error): void {
    this.output({
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      error,
    });
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
    this.log('error', message, meta, err);
  }

  /**
   * Create a child logger with additional prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    });
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create default logger instance
export const logger = new Logger();

// Export Logger class for custom instances
export { Logger };

// Convenience exports for direct use
export const debug = (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta);
export const info = (message: string, meta?: Record<string, unknown>) => logger.info(message, meta);
export const warn = (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta);
export const error = (message: string, err?: Error | unknown, meta?: Record<string, unknown>) => logger.error(message, err, meta);

export default logger;
