/**
 * Signup Form Component
 *
 * This component provides a form for users to sign up for the application.
 */

import React, { useState } from "react"

import { useAuthContext } from "../../contexts/AuthContext"

/**
 * Signup Form Component
 *
 * Provides a form for users to create a new account.
 * Handles form submission and displays error messages.
 */
export function SignupForm() {
  const { signUp, loading, error } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(false)

    // Validate form
    if (!email) {
      setFormError("Email is required")
      return
    }

    if (!password) {
      setFormError("Password is required")
      return
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    try {
      await signUp(email, password, { full_name: fullName })
      setSuccess(true)
      // Clear form
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setFullName("")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to sign up")
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">
          Your account has been created. Please check your email for a
          confirmation link.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          Sign Up Again
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name Field */}
      <div className="space-y-2">
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="John Doe"
          disabled={loading}
        />
      </div>

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
          required
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          disabled={loading}
          required
          minLength={6}
        />
        <p className="mt-1 text-xs text-gray-500">
          Must be at least 6 characters
        </p>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          disabled={loading}
          required
        />
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
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  )
}
