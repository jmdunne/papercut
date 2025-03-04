/**
 * Authentication Test Utility
 *
 * This file provides functions to test the authentication flow,
 * particularly focusing on session persistence and refresh.
 */

import { measureAsyncPerformance } from "./performance"
import {
  getCurrentUser,
  refreshSession,
  supabase,
  withTimeout
} from "./supabase"

/**
 * Test the authentication flow, focusing on session persistence and refresh
 * @returns Test results
 */
export const testAuthFlow = async () => {
  console.log("[DEBUG] auth-test: Starting authentication flow test")

  const results = {
    hasStoredSession: false,
    sessionValid: false,
    refreshSuccessful: false,
    userRetrieved: false,
    timings: {} as Record<string, number>,
    errors: [] as string[]
  }

  try {
    // Step 1: Check if we have a stored session
    console.log("[DEBUG] auth-test: Checking for stored session")
    let startTime = performance.now()

    const { data: sessionData, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      3000,
      "Get session for test"
    )

    results.timings.getSession = performance.now() - startTime

    if (sessionError) {
      results.errors.push(`Session error: ${sessionError.message}`)
      console.error("[DEBUG] auth-test: Error getting session:", sessionError)
      return results
    }

    results.hasStoredSession = !!sessionData.session
    console.log(
      "[DEBUG] auth-test: Has stored session:",
      results.hasStoredSession
    )

    if (!results.hasStoredSession) {
      console.log("[DEBUG] auth-test: No stored session, test complete")
      return results
    }

    // Step 2: Check if the session is valid
    console.log("[DEBUG] auth-test: Checking if session is valid")
    try {
      // A simple request that requires authentication
      startTime = performance.now()
      const { data, error } = await withTimeout(
        supabase.from("profiles").select("id").limit(1),
        3000,
        "Test authenticated request"
      )

      results.timings.testAuthRequest = performance.now() - startTime

      if (error && error.code === "PGRST301") {
        // This is the error code for unauthorized
        results.sessionValid = false
        results.errors.push("Session is invalid or expired")
        console.error("[DEBUG] auth-test: Session is invalid:", error)
      } else {
        results.sessionValid = true
        console.log("[DEBUG] auth-test: Session is valid")
      }
    } catch (error) {
      results.sessionValid = false
      results.errors.push(
        `Session validation error: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error("[DEBUG] auth-test: Error validating session:", error)
    }

    // Step 3: Try to refresh the session
    console.log("[DEBUG] auth-test: Attempting to refresh session")
    try {
      const refreshResult = await measureAsyncPerformance(
        async () => await refreshSession(),
        "Session Refresh"
      )

      results.refreshSuccessful =
        !refreshResult.error && !!refreshResult.data.session

      // Store the timing from the performance measurement
      const refreshDuration = performance.now() - startTime
      results.timings.refreshSession = refreshDuration

      console.log(
        "[DEBUG] auth-test: Session refresh result:",
        results.refreshSuccessful ? "successful" : "failed"
      )

      if (!results.refreshSuccessful) {
        results.errors.push(
          `Session refresh failed: ${
            refreshResult.error
              ? refreshResult.error.message
              : "No session returned"
          }`
        )
      }
    } catch (error) {
      results.refreshSuccessful = false
      results.errors.push(
        `Session refresh error: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error("[DEBUG] auth-test: Error refreshing session:", error)
    }

    // Step 4: Try to get the current user
    console.log("[DEBUG] auth-test: Attempting to get current user")
    try {
      startTime = performance.now()
      const user = await measureAsyncPerformance(
        async () => await getCurrentUser(),
        "Get Current User"
      )

      results.userRetrieved = !!user

      // Store the timing from the performance measurement
      const userDuration = performance.now() - startTime
      results.timings.getCurrentUser = userDuration

      console.log(
        "[DEBUG] auth-test: User retrieval result:",
        results.userRetrieved ? "successful" : "failed"
      )

      if (!results.userRetrieved) {
        results.errors.push("Failed to retrieve user")
      }
    } catch (error) {
      results.userRetrieved = false
      results.errors.push(
        `User retrieval error: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error("[DEBUG] auth-test: Error getting user:", error)
    }
  } catch (error) {
    results.errors.push(
      `General test error: ${error instanceof Error ? error.message : String(error)}`
    )
    console.error("[DEBUG] auth-test: General test error:", error)
  }

  console.log("[DEBUG] auth-test: Test results:", results)
  return results
}

export default {
  testAuthFlow
}
