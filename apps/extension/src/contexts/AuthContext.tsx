;
/**
 * Authentication Context
 *
 * This context provides authentication state and methods to all components in the app.
 * It wraps the useAuth hook and makes it available through React Context.
 */

import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";



import { useAuth } from "../hooks/useAuth";


// Define the shape of the context
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<Session | null>
  signUp: (email: string, password: string, metadata?: object) => Promise<Session | null>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Props for the provider component
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication Provider Component
 *
 * Wraps the application and provides authentication state and methods
 * to all child components through context.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use the auth context
 *
 * This hook provides a convenient way to access the auth context
 * and ensures that it's being used within an AuthProvider.
 */
export function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }

  return context
}

/**
 * Higher-order component to protect routes that require authentication
 *
 * Wraps a component and only renders it if the user is authenticated.
 * Otherwise, it renders a fallback component (e.g., login screen).
 */
export function withAuth<P extends object>(
  Component: React.ComponentType,
  FallbackComponent: React.ComponentType
) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuthContext()

    if (loading) {
      // You could return a loading spinner here
      return <div>Loading...</div>
    }

    if (!user) {
      return <FallbackComponent />
    }

    return <Component {...props} />
  }
}