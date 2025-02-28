/**
 * Authentication Page
 *
 * This component provides a page for users to authenticate with the application.
 * It includes tabs for switching between login and signup forms.
 */

import React, { useState } from "react"

import { LoginForm } from "./LoginForm"
import { SignupForm } from "./SignupForm"

/**
 * Authentication Page Component
 *
 * Provides a tabbed interface for users to either log in or sign up.
 */
export function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Papercut</h1>
          <p className="text-gray-600 mt-2">
            Design with precision, edit with ease
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm">
          <button
            className={`flex-1 py-3 text-center font-medium rounded-tl-lg rounded-bl-lg transition-colors ${
              activeTab === "login"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("login")}>
            Log In
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium rounded-tr-lg rounded-br-lg transition-colors ${
              activeTab === "signup"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("signup")}>
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        {activeTab === "login" ? <LoginForm /> : <SignupForm />}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By using Papercut, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
