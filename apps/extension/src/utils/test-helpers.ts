/**
 * Test helper functions
 *
 * This file provides utility functions for testing components and hooks
 * that interact with Supabase.
 */

import { createSupabaseMock } from "../setupTests"

/**
 * Sets up mocks for the onboarding state manager
 *
 * @param options Configuration options for the mock
 * @returns Mock implementation functions
 */
export const setupOnboardingMocks = (
  options: {
    userId?: string
    profileExists?: boolean
    onboardingState?: any
    authUser?: any
    upsertError?: any
  } = {}
) => {
  const {
    userId = "test-user-id",
    profileExists = true,
    onboardingState = {
      completed: false,
      current_step: "welcome",
      steps_completed: []
    },
    authUser = { email: "test@example.com" },
    upsertError = null
  } = options

  // Create a Supabase mock
  const supabaseMock = createSupabaseMock()

  // Set up profile query mock
  const mockProfileQuery = supabaseMock.from("profiles")

  // Mock profile exists/doesn't exist
  ;(mockProfileQuery.select as jest.Mock).mockReturnThis()
  ;(mockProfileQuery.eq as jest.Mock).mockReturnThis()
  ;(mockProfileQuery.single as jest.Mock).mockImplementation(() => {
    // First call checks if profile exists
    if (
      (mockProfileQuery.select as jest.Mock).mock.calls[0]?.[0] === "id, email"
    ) {
      return Promise.resolve({
        data: profileExists ? { id: userId, email: authUser.email } : null,
        error: profileExists ? null : { message: "Profile not found" }
      })
    }

    // Second call gets onboarding status
    if (
      (mockProfileQuery.select as jest.Mock).mock.calls[0]?.[0] ===
      "onboarding_status"
    ) {
      return Promise.resolve({
        data: { onboarding_status: onboardingState },
        error: null
      })
    }

    // Third call gets email and onboarding status
    if (
      (mockProfileQuery.select as jest.Mock).mock.calls[0]?.[0] ===
      "email, onboarding_status"
    ) {
      return Promise.resolve({
        data: {
          email: authUser.email,
          onboarding_status: onboardingState
        },
        error: null
      })
    }

    return Promise.resolve({
      data: null,
      error: { message: "Unexpected query" }
    })
  })

  // Mock auth.getUser
  ;(supabaseMock.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: authUser },
    error: null
  })

  // Mock profile creation/update
  ;(mockProfileQuery.upsert as jest.Mock).mockResolvedValue({
    error: upsertError
  })

  // Mock analytics insert
  ;(mockProfileQuery.insert as jest.Mock).mockResolvedValue({
    error: null
  })

  return {
    supabaseMock,
    mockProfileQuery,
    mockAuthUser: () => ({
      data: { user: authUser },
      error: null
    }),
    mockProfileExists: (exists: boolean) => {
      ;(mockProfileQuery.single as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: exists ? { id: userId, email: authUser.email } : null,
          error: exists ? null : { message: "Profile not found" }
        })
      )
    },
    mockOnboardingState: (state: any) => {
      ;(mockProfileQuery.single as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          data: { onboarding_status: state },
          error: null
        })
      )
    },
    mockUpsertError: (error: any) => {
      ;(mockProfileQuery.upsert as jest.Mock).mockResolvedValueOnce({
        error
      })
    }
  }
}

/**
 * Sets up mocks for the auth hooks
 *
 * @param options Configuration options for the mock
 * @returns Mock implementation functions
 */
export const setupAuthMocks = (
  options: {
    isAuthenticated?: boolean
    user?: any
    session?: any
    signInError?: any
    signUpError?: any
  } = {}
) => {
  const {
    isAuthenticated = true,
    user = { id: "test-user-id", email: "test@example.com" },
    session = { user },
    signInError = null,
    signUpError = null
  } = options

  // Create a Supabase mock
  const supabaseMock = createSupabaseMock()

  // Mock auth.getSession
  ;(supabaseMock.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: isAuthenticated ? session : null },
    error: null
  })

  // Mock auth.getUser
  ;(supabaseMock.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: isAuthenticated ? user : null },
    error: null
  })

  // Mock auth.signInWithPassword
  ;(supabaseMock.auth.signInWithPassword as jest.Mock).mockResolvedValue({
    data: signInError ? null : { user, session },
    error: signInError
  })

  // Mock auth.signUp
  ;(supabaseMock.auth.signUp as jest.Mock).mockResolvedValue({
    data: signUpError ? null : { user, session },
    error: signUpError
  })

  // Mock auth.signOut
  ;(supabaseMock.auth.signOut as jest.Mock).mockResolvedValue({
    error: null
  })

  return {
    supabaseMock,
    mockSignIn: (success: boolean, error: any = null) => {
      ;(
        supabaseMock.auth.signInWithPassword as jest.Mock
      ).mockResolvedValueOnce({
        data: success ? { user, session } : null,
        error: success ? null : error
      })
    },
    mockSignUp: (success: boolean, error: any = null) => {
      ;(supabaseMock.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: success ? { user, session } : null,
        error: success ? null : error
      })
    },
    mockSignOut: (success: boolean, error: any = null) => {
      ;(supabaseMock.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: success ? null : error
      })
    }
  }
}
