/**
 * Performance monitoring utilities
 *
 * This file provides utilities for monitoring performance of operations
 * in the extension, helping to identify slow operations and bottlenecks.
 */

/**
 * Measures the execution time of an async function
 * @param fn The async function to measure
 * @param fnName The name of the function (for logging)
 * @returns The result of the function
 */
export const measureAsyncPerformance = async <T>(
  fn: () => Promise<T>,
  fnName: string
): Promise<T> => {
  const startTime = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - startTime
    console.log(`[PERF] ${fnName} took ${duration.toFixed(2)}ms`)
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`[PERF] ${fnName} failed after ${duration.toFixed(2)}ms`)
    throw error
  }
}

/**
 * Creates a wrapped version of an async function that measures performance
 * @param fn The async function to wrap
 * @param fnName The name of the function (for logging)
 * @returns A wrapped function that measures performance
 */
export const withPerformanceTracking = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  fnName: string
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    return measureAsyncPerformance(() => fn(...args), fnName)
  }
}

export default {
  measureAsyncPerformance,
  withPerformanceTracking
}
