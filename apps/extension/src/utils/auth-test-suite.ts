/**
 * Authentication Test Suite
 *
 * This file provides a comprehensive test suite for the authentication flow,
 * including edge cases and error scenarios.
 */

import { testAuthFlow } from "./auth-test"
import { measureAsyncPerformance } from "./performance"
import {
  getCurrentUser,
  isSupabaseInitialized,
  refreshSession,
  signInWithEmail,
  signOut,
  supabase,
  withTimeout
} from "./supabase"
import { testSupabase } from "./test-supabase"

// Test result interfaces
export interface AuthTestResult {
  success: boolean
  name: string
  description: string
  duration: number
  error?: string
  details?: Record<string, any>
}

export interface AuthTestSuiteResult {
  overallSuccess: boolean
  tests: AuthTestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
  }
  startTime: number
  endTime: number
  totalDuration: number
}

/**
 * Run a single test with timing and error handling
 */
const runTest = async (
  name: string,
  description: string,
  testFn: () => Promise<any>
): Promise<AuthTestResult> => {
  console.log(`[TEST] Running test: ${name}`)
  const startTime = performance.now()

  try {
    const details = await testFn()
    const duration = performance.now() - startTime
    const success = details?.success !== false

    console.log(
      `[TEST] ${name}: ${success ? "PASSED" : "FAILED"} (${duration.toFixed(2)}ms)`
    )

    return {
      success,
      name,
      description,
      duration,
      details
    }
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`[TEST] ${name}: ERROR (${duration.toFixed(2)}ms)`, error)

    return {
      success: false,
      name,
      description,
      duration,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Run the complete authentication test suite
 */
export const runAuthTestSuite = async (
  options: {
    credentials?: { email: string; password: string }
    runSignInTests?: boolean
    timeoutMs?: number
  } = {}
): Promise<AuthTestSuiteResult> => {
  const startTime = performance.now()
  const tests: AuthTestResult[] = []
  const timeoutMs = options.timeoutMs || 10000

  console.log("[TEST-SUITE] Starting authentication test suite")

  // Test 1: Supabase initialization
  tests.push(
    await runTest(
      "Supabase Initialization",
      "Checks if Supabase client is properly initialized",
      async () => {
        const initialized = isSupabaseInitialized()
        return {
          success: initialized,
          initialized
        }
      }
    )
  )

  // Test 2: Basic Supabase connectivity
  tests.push(
    await runTest(
      "Supabase Connectivity",
      "Tests basic connectivity to Supabase services",
      async () => {
        const results = await testSupabase()
        return {
          success: results.connection,
          ...results
        }
      }
    )
  )

  // Test 3: Session persistence
  tests.push(
    await runTest(
      "Session Persistence",
      "Checks if session is properly stored and retrieved",
      async () => {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          timeoutMs,
          "Get session test"
        )

        return {
          success: !error && !!data.session,
          hasSession: !!data.session,
          error: error?.message
        }
      }
    )
  )

  // Test 4: Session refresh
  tests.push(
    await runTest(
      "Session Refresh",
      "Tests the ability to refresh an existing session",
      async () => {
        try {
          const { data, error } = await withTimeout(
            refreshSession(),
            timeoutMs,
            "Session refresh test"
          )

          return {
            success: !error && !!data.session,
            refreshed: !!data.session,
            error: error?.message
          }
        } catch (error) {
          return {
            success: false,
            refreshed: false,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    )
  )

  // Test 5: User retrieval
  tests.push(
    await runTest(
      "User Retrieval",
      "Tests the ability to retrieve the current user",
      async () => {
        try {
          const user = await withTimeout(
            getCurrentUser(),
            timeoutMs,
            "Get current user test"
          )

          return {
            success: !!user,
            user: user ? { id: user.id, email: user.email } : null
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    )
  )

  // Test 6: Complete auth flow
  tests.push(
    await runTest(
      "Complete Auth Flow",
      "Tests the complete authentication flow using the existing test utility",
      async () => {
        const results = await testAuthFlow()
        return {
          success:
            results.hasStoredSession &&
            results.sessionValid &&
            results.refreshSuccessful &&
            results.userRetrieved,
          ...results
        }
      }
    )
  )

  // Optional sign-in tests if credentials are provided
  if (options.credentials && options.runSignInTests) {
    const { email, password } = options.credentials

    // Test 7: Sign out
    tests.push(
      await runTest("Sign Out", "Tests the ability to sign out", async () => {
        try {
          await withTimeout(signOut(), timeoutMs, "Sign out test")

          // Verify we're signed out
          const { data } = await supabase.auth.getSession()
          const signedOut = !data.session

          return {
            success: signedOut,
            signedOut
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      })
    )

    // Test 8: Sign in
    tests.push(
      await runTest(
        "Sign In",
        "Tests the ability to sign in with provided credentials",
        async () => {
          try {
            const { data, error } = await withTimeout(
              signInWithEmail(email, password),
              timeoutMs,
              "Sign in test"
            )

            return {
              success: !error && !!data.session,
              signedIn: !!data.session,
              error: error?.message
            }
          } catch (error) {
            return {
              success: false,
              signedIn: false,
              error: error instanceof Error ? error.message : String(error)
            }
          }
        }
      )
    )
  }

  // Calculate summary
  const endTime = performance.now()
  const summary = {
    total: tests.length,
    passed: tests.filter((t) => t.success).length,
    failed: tests.filter((t) => !t.success).length,
    skipped: 0
  }

  const result: AuthTestSuiteResult = {
    overallSuccess: summary.failed === 0,
    tests,
    summary,
    startTime,
    endTime,
    totalDuration: endTime - startTime
  }

  console.log("[TEST-SUITE] Authentication test suite completed", result)
  return result
}

/**
 * Run a stress test on the authentication flow
 * This will repeatedly sign in and out to test the robustness of the auth flow
 */
export const runAuthStressTest = async (options: {
  credentials: { email: string; password: string }
  iterations?: number
  delayBetweenMs?: number
}): Promise<{
  success: boolean
  iterations: number
  completedIterations: number
  failures: Array<{ iteration: number; error: string }>
  averageDuration: number
}> => {
  const { credentials, iterations = 5, delayBetweenMs = 1000 } = options
  const failures: Array<{ iteration: number; error: string }> = []
  const durations: number[] = []

  console.log(
    `[STRESS-TEST] Starting auth stress test with ${iterations} iterations`
  )

  for (let i = 0; i < iterations; i++) {
    console.log(`[STRESS-TEST] Iteration ${i + 1}/${iterations}`)
    const startTime = performance.now()

    try {
      // Sign out
      await withTimeout(signOut(), 5000, "Stress test sign out")

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Sign in
      const { data, error } = await withTimeout(
        signInWithEmail(credentials.email, credentials.password),
        10000,
        "Stress test sign in"
      )

      if (error || !data.session) {
        throw new Error(error?.message || "Failed to sign in")
      }

      // Get user to verify
      const user = await withTimeout(
        getCurrentUser(),
        5000,
        "Stress test get user"
      )

      if (!user) {
        throw new Error("Failed to get user after sign in")
      }

      const duration = performance.now() - startTime
      durations.push(duration)
      console.log(
        `[STRESS-TEST] Iteration ${i + 1} completed in ${duration.toFixed(2)}ms`
      )

      // Delay between iterations
      if (i < iterations - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenMs))
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error(`[STRESS-TEST] Iteration ${i + 1} failed:`, errorMessage)
      failures.push({
        iteration: i + 1,
        error: errorMessage
      })
    }
  }

  const completedIterations = iterations - failures.length
  const averageDuration =
    durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0

  const result = {
    success: failures.length === 0,
    iterations,
    completedIterations,
    failures,
    averageDuration
  }

  console.log("[STRESS-TEST] Auth stress test completed", result)
  return result
}

export default {
  runAuthTestSuite,
  runAuthStressTest
}
