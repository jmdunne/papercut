/**
 * Authentication hook for Supabase
 *
 * This hook provides authentication functionality for the extension,
 * including sign in, sign up, sign out, and auth state management.
 */

import type { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

// Try to import using the relative path first
import supabaseDefault, {
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
  signOut: supabaseSignOutFallback
} = supabaseDefault || {}

// Use the imported functions or their fallbacks
const getUser = getCurrentUser || getCurrentUserFallback
const checkSupabaseInit = isSupabaseInitialized || isSupabaseInitializedFallback
const doSignIn = signInWithEmail || signInWithEmailFallback
const doSignUp = signUpWithEmail || signUpWithEmailFallback
const supabaseClient = supabase || supabaseFallback
const doSignOut = supabaseSignOut || supabaseSignOutFallback

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

  // Initialize auth state on mount
  useEffect(() => {
    console.log("[DEBUG] useAuth: useEffect running")

    const initializeAuth = async () => {
      console.log("[DEBUG] useAuth: Starting auth initialization")
      try {
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
          console.error("[DEBUG] useAuth: Error getting session", sessionError)
          throw sessionError
        }

        console.log(
          "[DEBUG] useAuth: Session result",
          session ? "Session exists" : "No session"
        )

        // Get user if session exists
        let user = null
        if (session) {
          console.log("[DEBUG] useAuth: Getting current user")
          user = await getUser()
          console.log(
            "[DEBUG] useAuth: User result",
            user ? "User exists" : "No user"
          )
        }

        console.log("[DEBUG] useAuth: Setting state with loading=false")
        setState({
          user,
          session,
          loading: false,
          error: null
        })
        console.log("[DEBUG] useAuth: State updated, loading=false")
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
    refreshUser
  }
}
