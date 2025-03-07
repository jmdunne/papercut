/**
 * Supabase client utility
 *
 * This file provides a configured Supabase client instance for use throughout the extension.
 * It handles authentication, database access, and other Supabase-related functionality.
 */

import { createClient } from "@supabase/supabase-js"

import type { Database } from "../types/supabase"

/**
 * Utility function to add timeout to promises
 * @param promise The promise to add timeout to
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise with timeout
 */
export const withTimeout = async <T>(
  promise: Promise,
  timeoutMs = 5000,
  operationName = "Operation"
): Promise => {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId)
    return result
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Environment variables are prefixed with PLASMO_PUBLIC_ to make them accessible in the extension
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

console.log(
  "[DEBUG] supabase: Initializing with URL:",
  supabaseUrl ? "exists" : "missing"
)
console.log(
  "[DEBUG] supabase: Anon key:",
  supabaseAnonKey ? "exists" : "missing"
)

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[DEBUG] supabase: Missing Supabase environment variables. Please check your .env file."
  )
}

/**
 * Supabase client instance
 *
 * This client is used to interact with the Supabase backend services including:
 * - Authentication
 * - Database
 * - Storage
 * - Realtime subscriptions
 */
console.log("[DEBUG] supabase: Creating Supabase client")
export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || ""
)
console.log("[DEBUG] supabase: Supabase client created")

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  console.log("[DEBUG] supabase: Getting current user")
  try {
    const {
      data: { user },
      error
    } = await withTimeout(supabase.auth.getUser(), 3000, "Get current user")

    if (error) {
      console.error("[DEBUG] supabase: Error getting user:", error)
      throw error
    }

    console.log("[DEBUG] supabase: Current user:", user ? "exists" : "null")
    return user
  } catch (error) {
    console.error("[DEBUG] supabase: Exception getting user:", error)
    throw error
  }
}

/**
 * Sign in with email and password
 * @param email User's email
 * @param password User's password
 * @returns Authentication response
 */
export const signInWithEmail = async (email: string, password: string) => {
  console.log("[DEBUG] supabase: Signing in with email")
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (response.error) {
      console.error("[DEBUG] supabase: Sign in error:", response.error)
    } else {
      console.log("[DEBUG] supabase: Sign in successful")
    }

    return response
  } catch (error) {
    console.error("[DEBUG] supabase: Exception during sign in:", error)
    throw error
  }
}

/**
 * Sign up with email and password
 * @param email User's email
 * @param password User's password
 * @param metadata Additional user metadata
 * @returns Authentication response
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: object
) => {
  console.log("[DEBUG] supabase: Signing up with email")
  try {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (response.error) {
      console.error("[DEBUG] supabase: Sign up error:", response.error)
    } else {
      console.log("[DEBUG] supabase: Sign up successful")
    }

    return response
  } catch (error) {
    console.error("[DEBUG] supabase: Exception during sign up:", error)
    throw error
  }
}

/**
 * Sign out the current user
 * @returns Void
 */
export const signOut = async () => {
  console.log("[DEBUG] supabase: Signing out")
  try {
    const response = await supabase.auth.signOut()

    if (response.error) {
      console.error("[DEBUG] supabase: Sign out error:", response.error)
    } else {
      console.log("[DEBUG] supabase: Sign out successful")
    }

    return response
  } catch (error) {
    console.error("[DEBUG] supabase: Exception during sign out:", error)
    throw error
  }
}

/**
 * Set up auth state change listener
 * @param callback Function to call when auth state changes
 * @returns Subscription object that can be used to unsubscribe
 */
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Check if the Supabase client is properly initialized
 * @returns True if the client is properly initialized, false otherwise
 */
export const isSupabaseInitialized = () => {
  console.log("[DEBUG] supabase: Checking if Supabase is initialized")

  // Check if URL and key are defined
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[DEBUG] supabase: Missing URL or key")
    return false
  }

  // Check if client has required methods
  if (
    !supabase ||
    !supabase.auth ||
    typeof supabase.auth.getSession !== "function"
  ) {
    console.error("[DEBUG] supabase: Client not properly initialized")
    return false
  }

  console.log("[DEBUG] supabase: Client appears to be properly initialized")
  return true
}

/**
 * Refresh the current session
 * @returns The refreshed session
 */
export const refreshSession = async () => {
  console.log("[DEBUG] supabase: Refreshing session")
  try {
    // First check if we have a session
    const { data: sessionData, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      3000,
      "Get session for refresh"
    )

    if (sessionError) {
      console.error(
        "[DEBUG] supabase: Error getting session for refresh:",
        sessionError
      )
      throw sessionError
    }

    // If there's no active session, nothing to refresh
    if (!sessionData.session) {
      console.log("[DEBUG] supabase: No active session to refresh")
      return { data: { session: null }, error: null }
    }

    // Attempt to refresh the session
    const { data, error } = await withTimeout(
      supabase.auth.refreshSession(),
      5000,
      "Session refresh"
    )

    if (error) {
      console.error("[DEBUG] supabase: Session refresh error:", error)
      console.error(
        "[DEBUG] supabase: Error details:",
        JSON.stringify({
          message: error.message,
          status: error.status,
          name: error.name
        })
      )
      throw error
    }

    console.log("[DEBUG] supabase: Session refreshed successfully")
    return { data, error: null }
  } catch (error) {
    console.error("[DEBUG] supabase: Exception during session refresh:", error)
    if (error instanceof Error) {
      console.error("[DEBUG] supabase: Error details:", error.message)
    }
    throw error
  }
}

/**
 * Ensure a user profile exists in the database
 * This is a fallback mechanism in case the database trigger doesn't work
 * @param user The user to ensure has a profile
 * @returns The result of the upsert operation
 */
export const ensureUserProfile = async (user: any) => {
  console.log("[DEBUG] supabase: Ensuring user profile exists", user?.id)
  if (!user) {
    console.log("[DEBUG] supabase: No user provided to ensureUserProfile")
    return { error: new Error("No user provided") }
  }

  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "No rows returned" error
      console.error(
        "[DEBUG] supabase: Error checking for existing profile:",
        checkError
      )
      // Continue anyway to try creating the profile
    }

    // If profile exists, no need to create it
    if (existingProfile) {
      console.log("[DEBUG] supabase: User profile already exists")
      return { data: existingProfile, error: null }
    }

    console.log("[DEBUG] supabase: Creating user profile")
    // Create profile with onboarding_status
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        onboarding_status: {
          completed: false,
          current_step: "welcome",
          steps_completed: []
        }
      })
      .select()
      .single()

    if (error) {
      console.error("[DEBUG] supabase: Error creating user profile:", error)
      return { error }
    }

    console.log("[DEBUG] supabase: User profile created successfully")
    return { data, error: null }
  } catch (error) {
    console.error("[DEBUG] supabase: Exception ensuring user profile:", error)
    return { error }
  }
}

/**
 * Track an onboarding event
 * This function handles errors gracefully and provides fallback mechanisms
 * @param userId The user ID
 * @param eventType The type of event
 * @param eventData Additional event data
 * @returns The result of the operation
 */
export const trackOnboardingEvent = async (
  userId: string,
  eventType: string,
  eventData: Record = {}
) => {
  console.log(`[DEBUG] supabase: Tracking onboarding event: ${eventType}`)

  if (!userId) {
    console.error("[DEBUG] supabase: No user ID provided for tracking event")
    return { error: new Error("No user ID provided") }
  }

  try {
    // Attempt to insert into onboarding_analytics table
    const { data, error } = await supabase.from("onboarding_analytics").insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error("[DEBUG] supabase: Error tracking onboarding event:", error)

      // Store event locally as fallback
      try {
        const offlineEvents = JSON.parse(
          localStorage.getItem("offline_onboarding_events") || "[]"
        )

        offlineEvents.push({
          user_id: userId,
          event_type: eventType,
          event_data: eventData,
          created_at: new Date().toISOString()
        })

        localStorage.setItem(
          "offline_onboarding_events",
          JSON.stringify(offlineEvents)
        )
        console.log("[DEBUG] supabase: Stored event offline for later sync")
      } catch (storageError) {
        console.error(
          "[DEBUG] supabase: Error storing event offline:",
          storageError
        )
      }

      return { error }
    }

    console.log("[DEBUG] supabase: Event tracked successfully")
    return { data, error: null }
  } catch (error) {
    console.error(
      "[DEBUG] supabase: Exception tracking onboarding event:",
      error
    )
    return { error }
  }
}

// Export all functions and the client as default export as well
// This provides flexibility in how the module is imported
const supabaseUtils = {
  supabase,
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChange,
  isSupabaseInitialized,
  refreshSession,
  ensureUserProfile,
  trackOnboardingEvent
}

export default supabaseUtils
