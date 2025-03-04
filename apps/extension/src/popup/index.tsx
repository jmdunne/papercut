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
import { testAuthFlow } from "../utils/auth-test"
import { runAuthStressTest, runAuthTestSuite } from "../utils/auth-test-suite"
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
  const {
    user,
    loading: authLoading,
    error: authError,
    resetAuthState
  } = useAuthContext()
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
  const [authTestResults, setAuthTestResults] = useState(null)
  const [isTestingAuth, setIsTestingAuth] = useState(false)
  const [authTestSuiteResults, setAuthTestSuiteResults] = useState(null)
  const [isRunningSuite, setIsRunningSuite] = useState(false)
  const [stressTestResults, setStressTestResults] = useState(null)
  const [isRunningStressTest, setIsRunningStressTest] = useState(false)
  const [testCredentials, setTestCredentials] = useState({
    email: "",
    password: ""
  })
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)

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

  // Handle auth flow testing
  const handleTestAuthFlow = async () => {
    console.log("[DEBUG] PopupContent: Testing auth flow")
    setIsTestingAuth(true)
    setAuthTestResults(null)

    try {
      const results = await testAuthFlow()
      console.log("[DEBUG] PopupContent: Auth flow test results:", results)
      setAuthTestResults(results)
    } catch (error) {
      console.error("[DEBUG] PopupContent: Error testing auth flow:", error)
      setAuthTestResults({
        hasStoredSession: false,
        sessionValid: false,
        refreshSuccessful: false,
        userRetrieved: false,
        timings: {},
        errors: [error instanceof Error ? error.message : String(error)]
      })
    } finally {
      setIsTestingAuth(false)
    }
  }

  // Handle auth test suite
  const handleRunTestSuite = async () => {
    console.log("[DEBUG] PopupContent: Running auth test suite")
    setIsRunningSuite(true)
    setAuthTestSuiteResults(null)

    try {
      const options = {
        timeoutMs: 10000
      }

      // Add credentials if provided
      if (testCredentials.email && testCredentials.password) {
        options["credentials"] = testCredentials
        options["runSignInTests"] = true
      }

      const results = await runAuthTestSuite(options)
      console.log("[DEBUG] PopupContent: Auth test suite results:", results)
      setAuthTestSuiteResults(results)
    } catch (error) {
      console.error(
        "[DEBUG] PopupContent: Error running auth test suite:",
        error
      )
      setAuthTestSuiteResults({
        overallSuccess: false,
        tests: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0
        },
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsRunningSuite(false)
    }
  }

  // Handle stress test
  const handleRunStressTest = async () => {
    if (!testCredentials.email || !testCredentials.password) {
      console.error(
        "[DEBUG] PopupContent: Credentials required for stress test"
      )
      return
    }

    console.log("[DEBUG] PopupContent: Running auth stress test")
    setIsRunningStressTest(true)
    setStressTestResults(null)

    try {
      const results = await runAuthStressTest({
        credentials: testCredentials,
        iterations: 3,
        delayBetweenMs: 1000
      })
      console.log("[DEBUG] PopupContent: Auth stress test results:", results)
      setStressTestResults(results)
    } catch (error) {
      console.error(
        "[DEBUG] PopupContent: Error running auth stress test:",
        error
      )
      setStressTestResults({
        success: false,
        iterations: 0,
        completedIterations: 0,
        failures: [
          {
            iteration: 0,
            error: error instanceof Error ? error.message : String(error)
          }
        ],
        averageDuration: 0
      })
    } finally {
      setIsRunningStressTest(false)
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

  // Ensure sequential loading - only fetch projects after auth is complete
  useEffect(() => {
    console.log(
      "[DEBUG] PopupContent: Auth state changed, user:",
      user ? "exists" : "null",
      "authLoading:",
      authLoading
    )

    if (user && !authLoading) {
      console.log(
        "[DEBUG] PopupContent: User authenticated and auth loading complete, fetching projects"
      )
      fetchProjects()
      fetchCollaborations()
    }
  }, [user, authLoading])

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

  // Handle going to login screen
  const handleGoToLogin = () => {
    console.log("[DEBUG] PopupContent: Going to login screen")
    resetAuthState()
    setForceRender(false)
  }

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
        <div className="flex space-x-2">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {retryCount > 0 ? `Retry (${retryCount}/3)` : "Retry"}
          </button>

          <button
            onClick={handleGoToLogin}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Go to Login
          </button>
        </div>

        {/* Test Buttons */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleTestSupabase}
            disabled={isTestingSupabase}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400">
            {isTestingSupabase ? "Testing..." : "Test Supabase"}
          </button>

          <button
            onClick={handleTestAuthFlow}
            disabled={isTestingAuth}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400">
            {isTestingAuth ? "Testing..." : "Test Auth Flow"}
          </button>
        </div>

        {/* Supabase Test Results */}
        {testResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50 w-full">
            <h3 className="font-medium mb-2">Supabase Test Results:</h3>
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
              {testResults.errors && testResults.errors.length > 0 && (
                <li className="text-red-600 mt-2">
                  <strong>Errors:</strong>
                  <ul className="ml-2">
                    {testResults.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Auth Test Results */}
        {authTestResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50 w-full">
            <h3 className="font-medium mb-2">Auth Flow Test Results:</h3>
            <ul className="text-xs">
              <li
                className={
                  authTestResults.hasStoredSession
                    ? "text-green-600"
                    : "text-red-600"
                }>
                Stored Session: {authTestResults.hasStoredSession ? "✓" : "✗"}
              </li>
              <li
                className={
                  authTestResults.sessionValid
                    ? "text-green-600"
                    : "text-red-600"
                }>
                Session Valid: {authTestResults.sessionValid ? "✓" : "✗"}
              </li>
              <li
                className={
                  authTestResults.refreshSuccessful
                    ? "text-green-600"
                    : "text-red-600"
                }>
                Session Refresh: {authTestResults.refreshSuccessful ? "✓" : "✗"}
              </li>
              <li
                className={
                  authTestResults.userRetrieved
                    ? "text-green-600"
                    : "text-red-600"
                }>
                User Retrieved: {authTestResults.userRetrieved ? "✓" : "✗"}
              </li>

              {/* Timings */}
              {authTestResults.timings &&
                Object.keys(authTestResults.timings).length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium">Timings:</h4>
                    <ul className="text-xs">
                      {Object.entries(authTestResults.timings).map(
                        ([key, value]) => (
                          <li key={key}>
                            {key}:{" "}
                            {typeof value === "number"
                              ? value.toFixed(2)
                              : String(value)}
                            ms
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Errors */}
              {authTestResults.errors && authTestResults.errors.length > 0 && (
                <li className="text-red-600 mt-2">
                  <strong>Errors:</strong>
                  <ul className="ml-2">
                    {authTestResults.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Auth Test Suite Section */}
        <div className="mt-4 w-full">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setShowCredentialsForm(!showCredentialsForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {showCredentialsForm
                ? "Hide Test Credentials"
                : "Show Test Credentials"}
            </button>

            {showCredentialsForm && (
              <div className="p-3 border rounded bg-gray-50">
                <h3 className="font-medium mb-2">Test Credentials</h3>
                <p className="text-xs mb-2">
                  Enter credentials to enable sign-in/out tests
                </p>
                <div className="flex flex-col space-y-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={testCredentials.email}
                    onChange={(e) =>
                      setTestCredentials((prev) => ({
                        ...prev,
                        email: e.target.value
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={testCredentials.password}
                    onChange={(e) =>
                      setTestCredentials((prev) => ({
                        ...prev,
                        password: e.target.value
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleRunTestSuite}
              disabled={isRunningSuite}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400">
              {isRunningSuite ? "Running Test Suite..." : "Run Auth Test Suite"}
            </button>

            <button
              onClick={handleRunStressTest}
              disabled={
                isRunningStressTest ||
                !testCredentials.email ||
                !testCredentials.password
              }
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400">
              {isRunningStressTest
                ? "Running Stress Test..."
                : "Run Auth Stress Test"}
            </button>
          </div>

          {/* Auth Test Suite Results */}
          {authTestSuiteResults && (
            <div className="mt-4 p-3 border rounded bg-gray-50">
              <h3 className="font-medium mb-2">
                Test Suite Results:
                <span
                  className={
                    authTestSuiteResults.overallSuccess
                      ? "text-green-600 ml-2"
                      : "text-red-600 ml-2"
                  }>
                  {authTestSuiteResults.overallSuccess ? "PASSED" : "FAILED"}
                </span>
              </h3>

              <div className="text-xs mb-2">
                <p>Total: {authTestSuiteResults.summary.total}</p>
                <p className="text-green-600">
                  Passed: {authTestSuiteResults.summary.passed}
                </p>
                <p className="text-red-600">
                  Failed: {authTestSuiteResults.summary.failed}
                </p>
                <p>
                  Duration:{" "}
                  {(authTestSuiteResults.totalDuration / 1000).toFixed(2)}s
                </p>
              </div>

              <div className="mt-2">
                <h4 className="font-medium">Test Details:</h4>
                <ul className="text-xs mt-1">
                  {authTestSuiteResults.tests.map((test, index) => (
                    <li key={index} className="mb-1">
                      <span
                        className={
                          test.success ? "text-green-600" : "text-red-600"
                        }>
                        {test.success ? "✓" : "✗"}
                      </span>{" "}
                      <strong>{test.name}</strong> (
                      {(test.duration / 1000).toFixed(2)}s)
                      {test.error && (
                        <p className="text-red-600 ml-4">{test.error}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Stress Test Results */}
          {stressTestResults && (
            <div className="mt-4 p-3 border rounded bg-gray-50">
              <h3 className="font-medium mb-2">
                Stress Test Results:
                <span
                  className={
                    stressTestResults.success
                      ? "text-green-600 ml-2"
                      : "text-red-600 ml-2"
                  }>
                  {stressTestResults.success ? "PASSED" : "FAILED"}
                </span>
              </h3>

              <div className="text-xs mb-2">
                <p>Iterations: {stressTestResults.iterations}</p>
                <p className="text-green-600">
                  Completed: {stressTestResults.completedIterations}
                </p>
                <p className="text-red-600">
                  Failed: {stressTestResults.failures.length}
                </p>
                <p>
                  Avg Duration: {stressTestResults.averageDuration.toFixed(2)}ms
                </p>
              </div>

              {stressTestResults.failures.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-red-600">Failures:</h4>
                  <ul className="text-xs text-red-600">
                    {stressTestResults.failures.map((failure, index) => (
                      <li key={index}>
                        Iteration {failure.iteration}: {failure.error}
                      </li>
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
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <ul className="text-xs text-red-600">
                    {testResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Auth Test Suite Section */}
          <div className="mt-4 w-full">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setShowCredentialsForm(!showCredentialsForm)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                {showCredentialsForm
                  ? "Hide Test Credentials"
                  : "Show Test Credentials"}
              </button>

              {showCredentialsForm && (
                <div className="p-3 border rounded bg-gray-50">
                  <h3 className="font-medium mb-2">Test Credentials</h3>
                  <p className="text-xs mb-2">
                    Enter credentials to enable sign-in/out tests
                  </p>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={testCredentials.email}
                      onChange={(e) =>
                        setTestCredentials((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={testCredentials.password}
                      onChange={(e) =>
                        setTestCredentials((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
                      className="px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleRunTestSuite}
                disabled={isRunningSuite}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400">
                {isRunningSuite
                  ? "Running Test Suite..."
                  : "Run Auth Test Suite"}
              </button>

              <button
                onClick={handleRunStressTest}
                disabled={
                  isRunningStressTest ||
                  !testCredentials.email ||
                  !testCredentials.password
                }
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400">
                {isRunningStressTest
                  ? "Running Stress Test..."
                  : "Run Auth Stress Test"}
              </button>
            </div>

            {/* Auth Test Suite Results */}
            {authTestSuiteResults && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <h3 className="font-medium mb-2">
                  Test Suite Results:
                  <span
                    className={
                      authTestSuiteResults.overallSuccess
                        ? "text-green-600 ml-2"
                        : "text-red-600 ml-2"
                    }>
                    {authTestSuiteResults.overallSuccess ? "PASSED" : "FAILED"}
                  </span>
                </h3>

                <div className="text-xs mb-2">
                  <p>Total: {authTestSuiteResults.summary.total}</p>
                  <p className="text-green-600">
                    Passed: {authTestSuiteResults.summary.passed}
                  </p>
                  <p className="text-red-600">
                    Failed: {authTestSuiteResults.summary.failed}
                  </p>
                  <p>
                    Duration:{" "}
                    {(authTestSuiteResults.totalDuration / 1000).toFixed(2)}s
                  </p>
                </div>

                <div className="mt-2">
                  <h4 className="font-medium">Test Details:</h4>
                  <ul className="text-xs mt-1">
                    {authTestSuiteResults.tests.map((test, index) => (
                      <li key={index} className="mb-1">
                        <span
                          className={
                            test.success ? "text-green-600" : "text-red-600"
                          }>
                          {test.success ? "✓" : "✗"}
                        </span>{" "}
                        <strong>{test.name}</strong> (
                        {(test.duration / 1000).toFixed(2)}s)
                        {test.error && (
                          <p className="text-red-600 ml-4">{test.error}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Stress Test Results */}
            {stressTestResults && (
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <h3 className="font-medium mb-2">
                  Stress Test Results:
                  <span
                    className={
                      stressTestResults.success
                        ? "text-green-600 ml-2"
                        : "text-red-600 ml-2"
                    }>
                    {stressTestResults.success ? "PASSED" : "FAILED"}
                  </span>
                </h3>

                <div className="text-xs mb-2">
                  <p>Iterations: {stressTestResults.iterations}</p>
                  <p className="text-green-600">
                    Completed: {stressTestResults.completedIterations}
                  </p>
                  <p className="text-red-600">
                    Failed: {stressTestResults.failures.length}
                  </p>
                  <p>
                    Avg Duration: {stressTestResults.averageDuration.toFixed(2)}
                    ms
                  </p>
                </div>

                {stressTestResults.failures.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium text-red-600">Failures:</h4>
                    <ul className="text-xs text-red-600">
                      {stressTestResults.failures.map((failure, index) => (
                        <li key={index}>
                          Iteration {failure.iteration}: {failure.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
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

      {/* Auth Testing Section for authenticated users */}
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">Authentication Testing</h3>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleTestAuthFlow}
            disabled={isTestingAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
            {isTestingAuth ? "Testing..." : "Test Auth Flow"}
          </button>

          <button
            onClick={handleRunTestSuite}
            disabled={isRunningSuite}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400">
            {isRunningSuite ? "Running Test Suite..." : "Run Auth Test Suite"}
          </button>

          {/* Show credentials form for stress test */}
          <button
            onClick={() => setShowCredentialsForm(!showCredentialsForm)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            {showCredentialsForm
              ? "Hide Credentials"
              : "Show Credentials for Stress Test"}
          </button>

          {showCredentialsForm && (
            <div className="p-3 border rounded bg-gray-50">
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={testCredentials.email}
                  onChange={(e) =>
                    setTestCredentials((prev) => ({
                      ...prev,
                      email: e.target.value
                    }))
                  }
                  className="px-2 py-1 border rounded text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={testCredentials.password}
                  onChange={(e) =>
                    setTestCredentials((prev) => ({
                      ...prev,
                      password: e.target.value
                    }))
                  }
                  className="px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={handleRunStressTest}
                  disabled={
                    isRunningStressTest ||
                    !testCredentials.email ||
                    !testCredentials.password
                  }
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400">
                  {isRunningStressTest
                    ? "Running Stress Test..."
                    : "Run Auth Stress Test"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Auth Test Results */}
        {authTestResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">Auth Flow Test Results:</h3>
            <ul className="text-xs">
              <li
                className={
                  authTestResults.hasStoredSession
                    ? "text-green-600"
                    : "text-red-600"
                }>
                Has Stored Session:{" "}
                {authTestResults.hasStoredSession ? "✓" : "✗"}
              </li>
              <li
                className={
                  authTestResults.sessionValid
                    ? "text-green-600"
                    : "text-red-600"
                }>
                Session Valid: {authTestResults.sessionValid ? "✓" : "✗"}
              </li>
              <li
                className={
                  authTestResults.refreshSuccessful
                    ? "text-green-600"
                    : "text-red-600"
                }>
                Refresh Successful:{" "}
                {authTestResults.refreshSuccessful ? "✓" : "✗"}
              </li>
              <li
                className={
                  authTestResults.userRetrieved
                    ? "text-green-600"
                    : "text-red-600"
                }>
                User Retrieved: {authTestResults.userRetrieved ? "✓" : "✗"}
              </li>
            </ul>

            {/* Timing Information */}
            {authTestResults.timings &&
              Object.keys(authTestResults.timings).length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium">Timings:</h4>
                  <ul className="text-xs">
                    {Object.entries(authTestResults.timings).map(
                      ([key, value]) => (
                        <li key={key}>
                          {key}:{" "}
                          {typeof value === "number"
                            ? value.toFixed(2)
                            : String(value)}
                          ms
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Errors */}
            {authTestResults.errors && authTestResults.errors.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-red-600">Errors:</h4>
                <ul className="text-xs text-red-600">
                  {authTestResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Auth Test Suite Results */}
        {authTestSuiteResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">
              Test Suite Results:
              <span
                className={
                  authTestSuiteResults.overallSuccess
                    ? "text-green-600 ml-2"
                    : "text-red-600 ml-2"
                }>
                {authTestSuiteResults.overallSuccess ? "PASSED" : "FAILED"}
              </span>
            </h3>

            <div className="text-xs mb-2">
              <p>Total: {authTestSuiteResults.summary.total}</p>
              <p className="text-green-600">
                Passed: {authTestSuiteResults.summary.passed}
              </p>
              <p className="text-red-600">
                Failed: {authTestSuiteResults.summary.failed}
              </p>
              <p>
                Duration:{" "}
                {(authTestSuiteResults.totalDuration / 1000).toFixed(2)}s
              </p>
            </div>

            <div className="mt-2">
              <h4 className="font-medium">Test Details:</h4>
              <ul className="text-xs mt-1">
                {authTestSuiteResults.tests.map((test, index) => (
                  <li key={index} className="mb-1">
                    <span
                      className={
                        test.success ? "text-green-600" : "text-red-600"
                      }>
                      {test.success ? "✓" : "✗"}
                    </span>{" "}
                    <strong>{test.name}</strong> (
                    {(test.duration / 1000).toFixed(2)}s)
                    {test.error && (
                      <p className="text-red-600 ml-4">{test.error}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Stress Test Results */}
        {stressTestResults && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h3 className="font-medium mb-2">
              Stress Test Results:
              <span
                className={
                  stressTestResults.success
                    ? "text-green-600 ml-2"
                    : "text-red-600 ml-2"
                }>
                {stressTestResults.success ? "PASSED" : "FAILED"}
              </span>
            </h3>

            <div className="text-xs mb-2">
              <p>Iterations: {stressTestResults.iterations}</p>
              <p className="text-green-600">
                Completed: {stressTestResults.completedIterations}
              </p>
              <p className="text-red-600">
                Failed: {stressTestResults.failures.length}
              </p>
              <p>
                Avg Duration: {stressTestResults.averageDuration.toFixed(2)}ms
              </p>
            </div>

            {stressTestResults.failures.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium text-red-600">Failures:</h4>
                <ul className="text-xs text-red-600">
                  {stressTestResults.failures.map((failure, index) => (
                    <li key={index}>
                      Iteration {failure.iteration}: {failure.error}
                    </li>
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
