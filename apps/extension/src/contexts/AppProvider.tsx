/**
 * App Provider
 *
 * This component combines all context providers into a single provider
 * that can be used to wrap the entire application.
 */

import React, { ReactNode } from "react"

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
  return (
    <AuthProvider>
      <ProjectProvider>
        <DesignProvider>{children}</DesignProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
