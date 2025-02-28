/**
 * Login Form Component
 *
 * This component provides a form for users to log in to the application.
 */

import React, { useState } from "react"

import { useAuthContext } from "../../contexts/AuthContext"

/**
 * Login Form Component
 *
 * Provides a form for users to log in with email and password.
 * Handles form submission and displays error messages.
 */
export function LoginForm() {
  const { signIn, loading, error } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate form
    if (!email) {
      setFormError("Email is required")
      return
    }

    if (!password) {
      setFormError("Password is required")
      return
    }

    try {
      await signIn(email, password)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to sign in")
    }
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {(formError || error) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {formError ||
              (error instanceof Error ? error.message : "An error occurred")}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  )
}
