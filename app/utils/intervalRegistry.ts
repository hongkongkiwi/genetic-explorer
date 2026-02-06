/**
 * Interval Registry
 * 
 * Manages all global intervals for proper cleanup on shutdown.
 * Prevents memory leaks and ensures graceful exit.
 */

export type IntervalId = ReturnType<typeof setInterval>;

const registeredIntervals: Set<IntervalId> = new Set();

/**
 * Register an interval for tracking
 */
export function registerInterval(intervalId: IntervalId): IntervalId {
  registeredIntervals.add(intervalId);
  return intervalId;
}

/**
 * Unregister an interval (call when manually clearing)
 */
export function unregisterInterval(intervalId: IntervalId): void {
  registeredIntervals.delete(intervalId);
}

/**
 * Clear all registered intervals
 * Call this during graceful shutdown
 */
export function clearAllIntervals(): void {
  for (const intervalId of registeredIntervals) {
    clearInterval(intervalId);
  }
  registeredIntervals.clear();
  console.log(`[IntervalRegistry] Cleared all intervals`);
}

/**
 * Get count of active intervals
 */
export function getActiveIntervalCount(): number {
  return registeredIntervals.size;
}
