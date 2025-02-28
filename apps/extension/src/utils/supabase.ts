/**
 * Supabase client utility
 *
 * This file provides a configured Supabase client instance for use throughout the extension.
 * It handles authentication, database access, and other Supabase-related functionality.
 */

import { createClient } from "@supabase/supabase-js"

import type { Database } from "../types/supabase"

// Environment variables are prefixed with PLASMO_PUBLIC_ to make them accessible in the extension
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env file."
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
export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || ""
)

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}

/**
 * Sign in with email and password
 * @param email User's email
 * @param password User's password
 * @returns Authentication response
 */
export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
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
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
}

/**
 * Sign out the current user
 * @returns Void
 */
export const signOut = async () => {
  return await supabase.auth.signOut()
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

export default supabase
