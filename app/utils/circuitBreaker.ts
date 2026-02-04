/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures when external services are down.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests fail fast
 * - HALF_OPEN: Testing if service has recovered
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;      // Number of failures before opening
  resetTimeoutMs: number;        // Time before trying again (HALF_OPEN)
  successThreshold: number;      // Successes needed to close circuit
  halfOpenMaxCalls: number;      // Max calls allowed in HALF_OPEN state
}

interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  nextAttempt: number | null;
  totalCalls: number;
  rejectedCalls: number;
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private halfOpenCalls = 0;
  private totalCalls = 0;
  private rejectedCalls = 0;
  private nextAttempt = 0;

  constructor(
    private readonly action: (...args: any[]) => Promise<any>,
    private readonly options: CircuitBreakerOptions
  ) {}

  /**
   * Execute the wrapped function with circuit breaker protection
   */
  async execute<T>(...args: any[]): Promise<T> {
    this.totalCalls++;

    // Check if circuit is OPEN
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        this.rejectedCalls++;
        throw new CircuitBreakerError('Circuit breaker is OPEN');
      }
      
      // Try HALF_OPEN
      this.state = 'HALF_OPEN';
      this.halfOpenCalls = 0;
      console.log('🔌 Circuit breaker entering HALF_OPEN state');
    }

    // Limit calls in HALF_OPEN state
    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
        this.rejectedCalls++;
        throw new CircuitBreakerError('Circuit breaker HALF_OPEN call limit reached');
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await this.action(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful call
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      
      if (this.successes >= this.options.successThreshold) {
        this.state = 'CLOSED';
        this.successes = 0;
        this.halfOpenCalls = 0;
        console.log('✅ Circuit breaker CLOSED');
      }
    }
  }

  /**
   * Handle failed call
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Failed in HALF_OPEN, go back to OPEN
      this.openCircuit();
    } else if (this.failures >= this.options.failureThreshold) {
      // Too many failures, open circuit
      this.openCircuit();
    }
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.options.resetTimeoutMs;
    console.warn(`🔌 Circuit breaker OPENED. Will retry after ${this.options.resetTimeoutMs}ms`);
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.state === 'OPEN' ? this.nextAttempt : null,
      totalCalls: this.totalCalls,
      rejectedCalls: this.rejectedCalls,
    };
  }

  /**
   * Force circuit to specific state (for testing/emergencies)
   */
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
    } else if (state === 'OPEN') {
      this.nextAttempt = Date.now() + this.options.resetTimeoutMs;
    }
  }
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// Global circuit breakers registry
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Create or get a circuit breaker
 */
export function getCircuitBreaker(
  name: string,
  action: (...args: any[]) => Promise<any>,
  options?: Partial<CircuitBreakerOptions>
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    const defaultOptions: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeoutMs: 30000, // 30 seconds
      successThreshold: 3,
      halfOpenMaxCalls: 3,
      ...options,
    };
    
    circuitBreakers.set(name, new CircuitBreaker(action, defaultOptions));
  }
  
  return circuitBreakers.get(name)!;
}

/**
 * Execute with circuit breaker
 */
export async function withCircuitBreaker<T>(
  name: string,
  action: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>
): Promise<T> {
  const breaker = getCircuitBreaker(name, action, options);
  return breaker.execute<T>();
}

/**
 * Get all circuit breaker metrics
 */
export function getAllCircuitBreakerMetrics(): Record<string, CircuitBreakerMetrics> {
  const metrics: Record<string, CircuitBreakerMetrics> = {};
  
  for (const [name, breaker] of circuitBreakers) {
    metrics[name] = breaker.getMetrics();
  }
  
  return metrics;
}

/**
 * Reset a circuit breaker
 */
export function resetCircuitBreaker(name: string): void {
  const breaker = circuitBreakers.get(name);
  if (breaker) {
    breaker.forceState('CLOSED');
  }
}

/**
 * Common circuit breaker configurations
 */
export const CircuitBreakerPresets = {
  // For external APIs (more lenient)
  externalAPI: {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
    successThreshold: 2,
    halfOpenMaxCalls: 3,
  },
  
  // For critical services (stricter)
  critical: {
    failureThreshold: 3,
    resetTimeoutMs: 60000,
    successThreshold: 5,
    halfOpenMaxCalls: 2,
  },
  
  // For non-critical services (very lenient)
  nonCritical: {
    failureThreshold: 10,
    resetTimeoutMs: 15000,
    successThreshold: 1,
    halfOpenMaxCalls: 5,
  },
};
