/**
 * Login Component
 *
 * This component provides the login interface for the extension.
 * It handles user authentication using Supabase.
 */

import React, { useState } from "react"

import { useAuth } from "../hooks/useAuth"

/**
 * Login component props
 */
interface LoginProps {
  onLoginSuccess?: () => void
}

/**
 * Login component
 */
export default function Login({ onLoginSuccess }: LoginProps) {
  // Authentication hook
  const { signInWithEmail, signUpWithEmail, isLoading, error } = useAuth()

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate form
    if (!email || !password) {
      setFormError("Email and password are required")
      return
    }

    if (isSignUp && !fullName) {
      setFormError("Full name is required")
      return
    }

    try {
      if (isSignUp) {
        // Sign up
        const result = await signUpWithEmail(email, password, fullName)

        if (result?.success) {
          if (result.needsEmailConfirmation) {
            setFormError("Please check your email to confirm your account")
          } else {
            onLoginSuccess?.()
          }
        } else {
          setFormError(result?.error || "Failed to sign up")
        }
      } else {
        // Sign in
        const result = await signInWithEmail(email, password)

        if (result?.success) {
          onLoginSuccess?.()
        } else {
          setFormError(result?.error || "Failed to sign in")
        }
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred")
    }
  }

  return (
    <div className="login-container">
      <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>

      {(formError || error) && (
        <div className="error-message">{formError || error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="toggle-form">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={isLoading}
          className="toggle-button">
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>

      <style jsx>{`
        .login-container {
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        .error-message {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        input:focus {
          outline: none;
          border-color: #00a8ff;
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          background-color: #00a8ff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
        }

        .submit-button:hover {
          background-color: #0096e0;
        }

        .submit-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .toggle-form {
          margin-top: 20px;
          text-align: center;
        }

        .toggle-button {
          background: none;
          border: none;
          color: #00a8ff;
          cursor: pointer;
          font-size: 14px;
        }

        .toggle-button:hover {
          text-decoration: underline;
        }

        .toggle-button:disabled {
          color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
