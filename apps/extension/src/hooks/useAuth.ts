/**
 * Authentication hook for Supabase
 *
 * This hook provides authentication functionality for the extension,
 * including sign in, sign up, sign out, and auth state management.
 */

import { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  supabase,
  signOut as supabaseSignOut
} from "../utils/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: object) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

/**
 * Hook for managing authentication state and operations
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session }
        } = await supabase.auth.getSession()

        // Get user if session exists
        let user = null
        if (session) {
          user = await getCurrentUser()
        }

        setState({
          user,
          session,
          loading: false,
          error: null
        })
      } catch (error) {
        setState({
          user: null,
          session: null,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Unknown error during auth initialization")
        })
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      let user = null
      if (session) {
        user = await getCurrentUser()
      }

      setState((prevState) => ({
        ...prevState,
        user,
        session,
        loading: false
      }))
    })

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setState((prevState) => ({ ...prevState, loading: true, error: null }))
      const { error } = await signInWithEmail(email, password)

      if (error) throw error
    } catch (error) {
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
      const { error } = await signUpWithEmail(email, password, metadata)

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
      const { error } = await supabaseSignOut()

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
      const user = await getCurrentUser()

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
