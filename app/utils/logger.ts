/**
 * Structured Logging Utility
 * 
 * Provides consistent logging across the application with different log levels
 * and proper formatting for development and production environments.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    this.logLevel = envLevel || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatLog(level, message, context);

    // In production, you might want to send to a logging service
    // For now, use console with structured format
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}:`;

    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(prefix, message, context || '');
        }
        break;
      case 'info':
        console.info(prefix, message, context || '');
        break;
      case 'warn':
        console.warn(prefix, message, context || '');
        break;
      case 'error':
        console.error(prefix, message, context || '', error || '');
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  // Specialized loggers for different domains
  analysis(message: string, context?: LogContext): void {
    this.info(`[Analysis] ${message}`, context);
  }

  security(message: string, context?: LogContext): void {
    this.info(`[Security] ${message}`, context);
  }

  genome(message: string, context?: LogContext): void {
    this.info(`[Genome] ${message}`, context);
  }

  encryption(message: string, context?: LogContext): void {
    this.info(`[Encryption] ${message}`, context);
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience exports
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logError = (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context);
