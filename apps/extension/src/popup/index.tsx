/**
 * Popup Component
 *
 * This is the main entry point for the extension popup.
 * It provides authentication and project management functionality.
 */

import React, { useState } from "react"

import { AuthPage } from "../components/auth/AuthPage"
import { UserProfile } from "../components/auth/UserProfile"
import { ProjectDetail } from "../components/projects/ProjectDetail"
import { ProjectList } from "../components/projects/ProjectList"
import { AppProvider } from "../contexts/AppProvider"
import { useAuthContext } from "../contexts/AuthContext"
import { useProjectContext } from "../contexts/ProjectContext"

import "../../style.css"

/**
 * Main Popup Content
 *
 * This component renders either the authenticated content or the auth page
 * based on the user's authentication state.
 */
function PopupContent() {
  const { user, loading: authLoading } = useAuthContext()
  const { currentProject, loading: projectLoading } = useProjectContext()
  const [showProjectList, setShowProjectList] = useState(!currentProject)

  const loading = authLoading || projectLoading

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />
  }

  // Show authenticated content
  return (
    <div className="p-4 w-96">
      <UserProfile />

      {/* Project Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {showProjectList ? "Your Projects" : "Project Details"}
        </h2>
        <button
          onClick={() => setShowProjectList(!showProjectList)}
          className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {showProjectList
            ? currentProject
              ? "View Details"
              : "Create Project"
            : "Back to Projects"}
        </button>
      </div>

      <div className="mt-4">
        {showProjectList ? (
          <ProjectList onProjectSelect={() => setShowProjectList(false)} />
        ) : (
          <ProjectDetail />
        )}
      </div>
    </div>
  )
}

/**
 * Popup Component
 *
 * Wraps the popup content with necessary providers.
 */
function IndexPopup() {
  return (
    <AppProvider>
      <PopupContent />
    </AppProvider>
  )
}

export default IndexPopup
