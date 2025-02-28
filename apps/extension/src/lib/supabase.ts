/**
 * Supabase Client Configuration
 *
 * This file sets up and exports the Supabase client for use throughout the extension.
 * It handles authentication state persistence using Chrome's storage API.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"

// These would typically come from environment variables
// For development, we'll use placeholders that should be replaced with actual values
const SUPABASE_URL = "YOUR_SUPABASE_URL"
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"

/**
 * Custom storage adapter for Supabase that uses Chrome's storage API
 * This allows auth state to persist between browser sessions
 */
const chromeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null)
      })
    })
  },
  setItem: async (key: string, value: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  },
  removeItem: async (key: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve()
      })
    })
  }
}

/**
 * Initialize the Supabase client with custom storage adapter
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: chromeStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)

/**
 * Get the current user session
 * @returns The current session or null if not authenticated
 */
export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Get the current user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user
}
