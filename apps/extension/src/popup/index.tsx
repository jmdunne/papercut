/**
 * Popup Component
 *
 * This is the main entry point for the extension popup.
 * It provides authentication and project management functionality.
 */

import React, { useEffect, useState } from "react"

import { AuthPage } from "../components/auth/AuthPage"
import { UserProfile } from "../components/auth/UserProfile"
import { ProjectDetail } from "../components/projects/ProjectDetail"
import { ProjectList } from "../components/projects/ProjectList"
import { AppProvider } from "../contexts/AppProvider"
import { useAuthContext } from "../contexts/AuthContext"
import { useProjectContext } from "../contexts/ProjectContext"
import { testSupabase } from "../utils/test-supabase"

import "../../style.css"

/**
 * Main Popup Content
 *
 * This component renders either the authenticated content or the auth page
 * based on the user's authentication state.
 */
function PopupContent() {
  console.log("[DEBUG] PopupContent: Rendering")
  const { user, loading: authLoading, error: authError } = useAuthContext()
  const {
    currentProject,
    loading: projectLoading,
    error: projectError,
    fetchProjects,
    fetchCollaborations
  } = useProjectContext()
  const [showProjectList, setShowProjectList] = useState(!currentProject)
  const [forceRender, setForceRender] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [testResults, setTestResults] = useState(null)
  const [isTestingSupabase, setIsTestingSupabase] = useState(false)

  console.log("[DEBUG] PopupContent: Auth loading:", authLoading)
  console.log("[DEBUG] PopupContent: Project loading:", projectLoading)
  console.log(
    "[DEBUG] PopupContent: Auth error:",
    authError ? "exists" : "null"
  )
  console.log(
    "[DEBUG] PopupContent: Project error:",
    projectError ? "exists" : "null"
  )
  console.log("[DEBUG] PopupContent: User:", user ? "exists" : "null")
  console.log(
    "[DEBUG] PopupContent: Current project:",
    currentProject ? "exists" : "null"
  )

  const loading = authLoading || projectLoading
  console.log("[DEBUG] PopupContent: Combined loading state:", loading)

  // Handle Supabase testing
  const handleTestSupabase = async () => {
    console.log("[DEBUG] PopupContent: Testing Supabase connection")
    setIsTestingSupabase(true)
    setTestResults(null)

    try {
      const results = await testSupabase()
      console.log("[DEBUG] PopupContent: Supabase test results:", results)
      setTestResults(results)
    } catch (error) {
      console.error("[DEBUG] PopupContent: Error testing Supabase:", error)
      setTestResults({
        initialized: false,
        connection: false,
        auth: false,
        database: false,
        errors: [error instanceof Error ? error.message : String(error)]
      })
    } finally {
      setIsTestingSupabase(false)
    }
  }

  // Handle retry functionality
  const handleRetry = async () => {
    console.log("[DEBUG] PopupContent: Retry attempt", retryCount + 1)
    setRetryCount((prev) => prev + 1)
    setForceRender(false)

    // Reload the page on third retry attempt
    if (retryCount >= 2) {
      console.log("[DEBUG] PopupContent: Too many retries, reloading the page")
      window.location.reload()
      return
    }

    try {
      // Try to refresh data
      if (user) {
        console.log("[DEBUG] PopupContent: Retrying data fetch operations")
        await fetchProjects()
        await fetchCollaborations()
      }
    } catch (error) {
      console.error("[DEBUG] PopupContent: Error during retry:", error)
    }
  }

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      console.log("[DEBUG] PopupContent: Setting loading timeout")
      const timeoutId = setTimeout(() => {
        console.log(
          "[DEBUG] PopupContent: Loading timeout triggered, forcing render"
        )
        setForceRender(true)
      }, 5000) // 5 seconds timeout

      return () => {
        console.log("[DEBUG] PopupContent: Clearing loading timeout")
        clearTimeout(timeoutId)
      }
    }
  }, [loading])

  // Show loading state
  if (loading && !forceRender) {
    console.log("[DEBUG] PopupContent: Showing loading spinner")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If we forced render due to timeout, show a message
  if (forceRender && loading) {
    console.log("[DEBUG] PopupContent: Showing timeout message")
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">Loading timed out</div>
        <p className="text-sm text-gray-600 mb-4">
          {authError || projectError
            ? "An error occurred while loading your data."
            : "There might be an issue connecting to the server. Please check your connection and try again."}
        </p>
        {authError && (
          <p className="text-xs text-red-500 mb-2">
            Authentication error: {authError.message}
          </p>
        )}
        {projectError && (
          <p className="text-xs text-red-500 mb-2">
            Project error: {projectError.message}
          </p>
        )}
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {retryCount > 0 ? `Retry (${retryCount}/3)` : "Retry"}
        </button>

        {/* Supabase Test Button */}
        <div className="mt-4">
          <button
            onClick={handleTestSupabase}
            disabled={isTestingSupabase}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400">
            {isTestingSupabase ? "Testing..." : "Test Supabase Connection"}
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50 w-full">
            <h3 className="font-medium mb-2">Test Results:</h3>
            <ul className="text-xs">
              <li
                className={
                  testResults.initialized ? "text-green-600" : "text-red-600"
                }>
                Initialization: {testResults.initialized ? "✓" : "✗"}
              </li>
              <li
                className={
                  testResults.connection ? "text-green-600" : "text-red-600"
                }>
                Connection: {testResults.connection ? "✓" : "✗"}
              </li>
              <li
                className={
                  testResults.auth ? "text-green-600" : "text-red-600"
                }>
                Authentication: {testResults.auth ? "✓" : "✗"}
              </li>
              <li
                className={
                  testResults.database ? "text-green-600" : "text-red-600"
                }>
                Database: {testResults.database ? "✓" : "✗"}
              </li>
            </ul>
            {testResults.errors && testResults.errors.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-xs text-red-600">Errors:</h4>
                <ul className="text-xs text-red-600">
                  {testResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!user) {
    console.log("[DEBUG] PopupContent: Showing auth page")
    return (
      <div>
        <AuthPage />

        {/* Supabase Test Button for unauthenticated users */}
        <div className="mt-4 p-4 flex flex-col items-center">
          <button
            onClick={handleTestSupabase}
            disabled={isTestingSupabase}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400">
            {isTestingSupabase ? "Testing..." : "Test Supabase Connection"}
          </button>

          {/* Test Results */}
          {testResults && (
            <div className="mt-4 p-3 border rounded bg-gray-50 w-full">
              <h3 className="font-medium mb-2">Test Results:</h3>
              <ul className="text-xs">
                <li
                  className={
                    testResults.initialized ? "text-green-600" : "text-red-600"
                  }>
                  Initialization: {testResults.initialized ? "✓" : "✗"}
                </li>
                <li
                  className={
                    testResults.connection ? "text-green-600" : "text-red-600"
                  }>
                  Connection: {testResults.connection ? "✓" : "✗"}
                </li>
                <li
                  className={
                    testResults.auth ? "text-green-600" : "text-red-600"
                  }>
                  Authentication: {testResults.auth ? "✓" : "✗"}
                </li>
                <li
                  className={
                    testResults.database ? "text-green-600" : "text-red-600"
                  }>
                  Database: {testResults.database ? "✓" : "✗"}
                </li>
              </ul>
              {testResults.errors && testResults.errors.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-xs text-red-600">Errors:</h4>
                  <ul className="text-xs text-red-600">
                    {testResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show authenticated content
  console.log("[DEBUG] PopupContent: Showing authenticated content")
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

      {/* Supabase Test Button for authenticated users */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleTestSupabase}
          disabled={isTestingSupabase}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400">
          {isTestingSupabase ? "Testing..." : "Test Supabase Connection"}
        </button>

        {/* Test Results */}
        {testResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Test Results:</h3>
            <ul className="text-xs">
              <li
                className={
                  testResults.initialized ? "text-green-600" : "text-red-600"
                }>
                Initialization: {testResults.initialized ? "✓" : "✗"}
              </li>
              <li
                className={
                  testResults.connection ? "text-green-600" : "text-red-600"
                }>
                Connection: {testResults.connection ? "✓" : "✗"}
              </li>
              <li
                className={
                  testResults.auth ? "text-green-600" : "text-red-600"
                }>
                Authentication: {testResults.auth ? "✓" : "✗"}
              </li>
              <li
                className={
                  testResults.database ? "text-green-600" : "text-red-600"
                }>
                Database: {testResults.database ? "✓" : "✗"}
              </li>
            </ul>
            {testResults.errors && testResults.errors.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-xs text-red-600">Errors:</h4>
                <ul className="text-xs text-red-600">
                  {testResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
