/**
 * Authentication hook for Supabase
 *
 * This hook provides authentication functionality for the extension,
 * including sign in, sign up, sign out, and auth state management.
 */

import type { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

// Import performance monitoring
import { measureAsyncPerformance } from "../utils/performance"
// Try to import using the relative path first
import supabaseDefault, {
  ensureUserProfile,
  getCurrentUser,
  isSupabaseInitialized,
  signInWithEmail,
  signUpWithEmail,
  supabase,
  signOut as supabaseSignOut
} from "../utils/supabase"

// Fallback mechanism if the relative import fails
// This is to handle potential path resolution issues during build
const {
  getCurrentUser: getCurrentUserFallback,
  isSupabaseInitialized: isSupabaseInitializedFallback,
  signInWithEmail: signInWithEmailFallback,
  signUpWithEmail: signUpWithEmailFallback,
  supabase: supabaseFallback,
  signOut: supabaseSignOutFallback,
  ensureUserProfile: ensureUserProfileFallback
} = supabaseDefault || {}

// Use the imported functions or their fallbacks
const getUser = getCurrentUser || getCurrentUserFallback
const checkSupabaseInit = isSupabaseInitialized || isSupabaseInitializedFallback
const doSignIn = signInWithEmail || signInWithEmailFallback
const doSignUp = signUpWithEmail || signUpWithEmailFallback
const supabaseClient = supabase || supabaseFallback
const doSignOut = supabaseSignOut || supabaseSignOutFallback
const doEnsureUserProfile = ensureUserProfile || ensureUserProfileFallback

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise
  signUp: (email: string, password: string, metadata?: object) => Promise
  signOut: () => Promise
  refreshUser: () => Promise
  resetAuthState: () => void
}

/**
 * Hook for managing authentication state and operations
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  console.log("[DEBUG] useAuth: Hook initialized")
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  /**
   * Reset authentication state to unauthenticated
   */
  const resetAuthState = () => {
    console.log("[DEBUG] useAuth: Resetting auth state")
    setState({
      user: null,
      session: null,
      loading: false,
      error: null
    })
  }

  // Initialize auth state on mount
  useEffect(() => {
    console.log("[DEBUG] useAuth: useEffect running")

    const initializeAuth = async () => {
      console.log("[DEBUG] useAuth: Starting auth initialization")
      try {
        await measureAsyncPerformance(async () => {
          // Check if Supabase is properly initialized
          const isInitialized = checkSupabaseInit()
          if (!isInitialized) {
            console.error(
              "[DEBUG] useAuth: Supabase client not properly initialized"
            )
            setState({
              user: null,
              session: null,
              loading: false,
              error: new Error("Supabase client not properly initialized")
            })
            return
          }

          // Get initial session
          console.log("[DEBUG] useAuth: Getting session")
          const {
            data: { session },
            error: sessionError
          } = await supabaseClient.auth.getSession()

          if (sessionError) {
            console.error(
              "[DEBUG] useAuth: Error getting session",
              sessionError
            )
            throw sessionError
          }

          console.log(
            "[DEBUG] useAuth: Session result",
            session ? "Session exists" : "No session"
          )

          // If session exists, try to refresh it first
          let refreshedSession = session
          if (session) {
            console.log(
              "[DEBUG] useAuth: Found existing session, attempting refresh"
            )
            try {
              const { data: refreshData, error: refreshError } =
                await refreshSession()
              if (refreshError) {
                console.error(
                  "[DEBUG] useAuth: Session refresh failed",
                  refreshError
                )
              } else if (refreshData.session) {
                console.log("[DEBUG] useAuth: Session refreshed successfully")
                refreshedSession = refreshData.session
              }
            } catch (refreshErr) {
              console.error(
                "[DEBUG] useAuth: Exception during session refresh",
                refreshErr
              )
              // Continue with existing session even if refresh fails
            }
          }

          // Get user if session exists
          let user = null
          if (refreshedSession) {
            console.log("[DEBUG] useAuth: Getting current user")
            try {
              user = await getUser()
              console.log(
                "[DEBUG] useAuth: User result",
                user ? "User exists" : "No user"
              )

              // Ensure user profile exists
              if (user) {
                console.log("[DEBUG] useAuth: Ensuring user profile exists")
                const { error: profileError } = await doEnsureUserProfile(user)
                if (profileError) {
                  console.error(
                    "[DEBUG] useAuth: Error ensuring user profile",
                    profileError
                  )
                  // Continue anyway, don't fail the auth flow
                }
              }
            } catch (userError) {
              console.error("[DEBUG] useAuth: Error getting user", userError)
              // If we can't get the user, reset auth state
              setState({
                user: null,
                session: null,
                loading: false,
                error:
                  userError instanceof Error
                    ? userError
                    : new Error("Failed to get user after session refresh")
              })
              return
            }
          }

          console.log("[DEBUG] useAuth: Setting state with loading=false")
          setState({
            user,
            session: refreshedSession,
            loading: false,
            error: null
          })
          console.log("[DEBUG] useAuth: State updated, loading=false")
        }, "Auth Initialization")
      } catch (error) {
        console.error("[DEBUG] useAuth: Error during initialization", error)
        setState({
          user: null,
          session: null,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Unknown error during auth initialization")
        })
        console.log("[DEBUG] useAuth: State updated after error, loading=false")
      }
    }

    initializeAuth()

    // Set up auth state change listener
    console.log("[DEBUG] useAuth: Setting up auth state change listener")
    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("[DEBUG] useAuth: Auth state changed:", event)

      let user = null
      if (session) {
        console.log("[DEBUG] useAuth: Getting user after state change")
        user = await getUser()
        console.log(
          "[DEBUG] useAuth: User after state change",
          user ? "exists" : "null"
        )

        // Ensure user profile exists after auth state change
        if (user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
          console.log(
            "[DEBUG] useAuth: Ensuring user profile after auth change"
          )
          const { error: profileError } = await doEnsureUserProfile(user)
          if (profileError) {
            console.error(
              "[DEBUG] useAuth: Error ensuring user profile after auth change",
              profileError
            )
            // Continue anyway, don't fail the auth flow
          }
        }
      }

      console.log(
        "[DEBUG] useAuth: Updating state after auth change, loading=false"
      )
      setState((prevState) => ({
        ...prevState,
        user,
        session,
        loading: false
      }))
      console.log("[DEBUG] useAuth: State updated after auth change")
    })

    // Clean up subscription on unmount
    return () => {
      console.log("[DEBUG] useAuth: Cleaning up auth subscription")
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    console.log("[DEBUG] useAuth: signIn called")
    try {
      console.log("[DEBUG] useAuth: Setting loading=true for sign in")
      setState((prevState) => ({ ...prevState, loading: true, error: null }))
      const { error } = await doSignIn(email, password)

      if (error) {
        console.error("[DEBUG] useAuth: Sign in error", error)
        throw error
      }
      console.log("[DEBUG] useAuth: Sign in successful")
    } catch (error) {
      console.error("[DEBUG] useAuth: Sign in exception", error)
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during sign in")
      }))
      throw error
    }
  }

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      setState((prevState) => ({ ...prevState, loading: true, error: null }))
      const { error } = await doSignUp(email, password, metadata)

      if (error) throw error
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during sign up")
      }))
      throw error
    }
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      setState((prevState) => ({ ...prevState, loading: true, error: null }))
      const { error } = await doSignOut()

      if (error) throw error

      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      })
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during sign out")
      }))
      throw error
    }
  }

  /**
   * Refresh the current user data
   */
  const refreshUser = async () => {
    try {
      setState((prevState) => ({ ...prevState, loading: true, error: null }))
      const user = await getUser()

      setState((prevState) => ({
        ...prevState,
        user,
        loading: false
      }))
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error refreshing user")
      }))
      throw error
    }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshUser,
    resetAuthState
  }
}
