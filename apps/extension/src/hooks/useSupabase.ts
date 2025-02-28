/**
 * useSupabase Hook
 * 
 * This hook provides access to the Supabase client for database operations.
 * It initializes the Supabase client with the appropriate credentials from environment variables.
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Hook to access the Supabase client
 * @returns The Supabase client instance
 */
export function useSupabase() {
  return supabase
} 