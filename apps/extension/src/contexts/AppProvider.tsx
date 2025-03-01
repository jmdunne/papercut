/**
 * App Provider
 *
 * This component combines all context providers into a single provider
 * that can be used to wrap the entire application.
 */

import React, { ReactNode, useEffect } from "react"

import { refreshSession } from "../utils/supabase"
import { AuthProvider } from "./AuthContext"
import { DesignProvider } from "./DesignContext"
import { ProjectProvider } from "./ProjectContext"

interface AppProviderProps {
  children: ReactNode
}

/**
 * App Provider Component
 *
 * Wraps the application with all necessary context providers
 * in the correct order to ensure proper data flow.
 */
export function AppProvider({ children }: AppProviderProps) {
  console.log("[DEBUG] AppProvider: Initializing")

  useEffect(() => {
    console.log("[DEBUG] AppProvider: Mounted")

    // Refresh the session when the popup is opened
    const refreshAuthSession = async () => {
      console.log("[DEBUG] AppProvider: Refreshing auth session")
      try {
        await refreshSession()
        console.log("[DEBUG] AppProvider: Session refresh completed")
      } catch (error) {
        console.error("[DEBUG] AppProvider: Error refreshing session:", error)
        if (error instanceof Error) {
          console.error("[DEBUG] AppProvider: Error details:", error.message)
        }
      }
    }

    refreshAuthSession()

    return () => {
      console.log("[DEBUG] AppProvider: Unmounting")
    }
  }, [])

  return (
    <AuthProvider>
      <ProjectProvider>
        <DesignProvider>{children}</DesignProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
