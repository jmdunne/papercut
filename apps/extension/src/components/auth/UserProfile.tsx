/**
 * User Profile Component
 *
 * This component displays the user's profile information and provides
 * options for signing out.
 */

import React from "react"

import { useAuthContext } from "../../contexts/AuthContext"

/**
 * User Profile Component
 *
 * Displays user information and provides sign out functionality.
 */
export function UserProfile() {
  const { user, signOut, loading } = useAuthContext()

  if (!user) {
    return null
  }

  // Extract user metadata
  const fullName = user.user_metadata?.full_name || "User"
  const email = user.email || ""
  const avatarUrl = user.user_metadata?.avatar_url || ""

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-blue-600 text-xl font-bold">
              {fullName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{fullName}</h3>
          <p className="text-sm text-gray-500">{email}</p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50">
          {loading ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  )
}
