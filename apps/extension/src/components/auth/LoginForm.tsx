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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
          disabled={loading}
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <a href="#" className="text-xs text-blue-600 hover:text-blue-500">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-700">
          Remember me
        </label>
      </div>

      {/* Error Message */}
      {(formError || error) && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          {formError ||
            (error instanceof Error ? error.message : "An error occurred")}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  )
}
