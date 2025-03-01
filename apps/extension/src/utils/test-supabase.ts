/**
 * Supabase Testing Utility
 *
 * This file provides functions to test the Supabase connection and functionality.
 * It can be used to verify that the Supabase client is properly configured and
 * that authentication and database access are working correctly.
 */

import { isSupabaseInitialized, supabase } from "./supabase"

/**
 * Test the Supabase connection and functionality
 * @returns An object containing test results
 */
export const testSupabase = async () => {
  console.log("[DEBUG] test-supabase: Starting Supabase tests")

  const results = {
    initialized: false,
    connection: false,
    auth: false,
    database: false,
    errors: [] as string[]
  }

  try {
    // Test 1: Check if Supabase is initialized
    console.log("[DEBUG] test-supabase: Testing initialization")
    results.initialized = isSupabaseInitialized()

    if (!results.initialized) {
      results.errors.push("Supabase client is not properly initialized")
      console.error("[DEBUG] test-supabase: Initialization test failed")
      return results
    }

    console.log("[DEBUG] test-supabase: Initialization test passed")

    // Test 2: Test connection by making a simple request
    console.log("[DEBUG] test-supabase: Testing connection")
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        results.errors.push(`Connection error: ${error.message}`)
        console.error("[DEBUG] test-supabase: Connection test failed:", error)
      } else {
        results.connection = true
        console.log("[DEBUG] test-supabase: Connection test passed")
      }
    } catch (error) {
      results.errors.push(
        `Connection exception: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error("[DEBUG] test-supabase: Connection test exception:", error)
    }

    // Test 3: Test authentication functionality
    console.log("[DEBUG] test-supabase: Testing auth functionality")
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.log(
          "[DEBUG] test-supabase: Auth test - not logged in:",
          authError
        )
        // This is not necessarily an error, just means user is not logged in
        results.auth = false
      } else {
        results.auth = true
        console.log(
          "[DEBUG] test-supabase: Auth test passed, user is logged in"
        )
      }
    } catch (error) {
      results.errors.push(
        `Auth exception: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error("[DEBUG] test-supabase: Auth test exception:", error)
    }

    // Test 4: Test database access
    console.log("[DEBUG] test-supabase: Testing database access")
    try {
      // Try to access a public table or view
      const { data: dbData, error: dbError } = await supabase
        .from("projects")
        .select("id")
        .limit(1)

      if (dbError) {
        results.errors.push(`Database error: ${dbError.message}`)
        console.error("[DEBUG] test-supabase: Database test failed:", dbError)
      } else {
        results.database = true
        console.log("[DEBUG] test-supabase: Database test passed")
      }
    } catch (error) {
      results.errors.push(
        `Database exception: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error("[DEBUG] test-supabase: Database test exception:", error)
    }
  } catch (error) {
    results.errors.push(
      `General test exception: ${error instanceof Error ? error.message : String(error)}`
    )
    console.error("[DEBUG] test-supabase: General test exception:", error)
  }

  console.log("[DEBUG] test-supabase: Test results:", results)
  return results
}

export default {
  testSupabase
}
