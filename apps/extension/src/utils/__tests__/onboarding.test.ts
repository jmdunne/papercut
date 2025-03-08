/**
 * Tests for the OnboardingStateManager class
 */

import { createSupabaseMock } from "../../setupTests"
import type { OnboardingState, OnboardingStep } from "../../types/onboarding"
import { OnboardingStateManager } from "../onboarding"
import { supabase } from "../supabase"

// Mock Supabase client
jest.mock("../supabase", () => ({
  supabase: createSupabaseMock()
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

// Mock the onboarding_analytics table
// This is needed because it's not in the Supabase types
type MockSupabase = typeof supabase & {
  from(table: "onboarding_analytics"): any
}

describe("OnboardingStateManager", () => {
  let onboardingManager: OnboardingStateManager
  const userId = "test-user-id"
  const defaultState: OnboardingState = {
    completed: false,
    current_step: "welcome" as OnboardingStep,
    steps_completed: []
  }

  beforeEach(() => {
    onboardingManager = new OnboardingStateManager()
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe("getOnboardingState", () => {
    it("should fetch onboarding state from Supabase", async () => {
      // Mock profile exists
      const mockProfileQuery = supabase.from("profiles")
      ;(mockProfileQuery.select as jest.Mock).mockReturnThis()
      ;(mockProfileQuery.eq as jest.Mock).mockReturnThis()
      ;(mockProfileQuery.single as jest.Mock).mockImplementation(() => {
        // First call checks if profile exists
        if (
          (mockProfileQuery.select as jest.Mock).mock.calls[0][0] ===
          "id, email"
        ) {
          return Promise.resolve({
            data: { id: userId, email: "test@example.com" },
            error: null
          })
        }
        // Second call gets onboarding status
        return Promise.resolve({
          data: {
            onboarding_status: {
              completed: true,
              current_step: "project_setup",
              steps_completed: ["welcome", "persona_survey"]
            }
          },
          error: null
        })
      })

      const result = await onboardingManager.getOnboardingState(userId)

      expect(result).toEqual({
        completed: true,
        current_step: "project_setup",
        steps_completed: ["welcome", "persona_survey"]
      })
      expect(supabase.from).toHaveBeenCalledWith("profiles")
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`,
        JSON.stringify({
          completed: true,
          current_step: "project_setup",
          steps_completed: ["welcome", "persona_survey"]
        })
      )
    })

    it("should create profile if it does not exist", async () => {
      // Mock profile does not exist
      const mockProfileQuery = supabase.from("profiles")
      ;(mockProfileQuery.select as jest.Mock).mockReturnThis()
      ;(mockProfileQuery.eq as jest.Mock).mockReturnThis()
      ;(mockProfileQuery.single as jest.Mock).mockImplementation(() => {
        // First call checks if profile exists
        if (
          (mockProfileQuery.select as jest.Mock).mock.calls[0][0] ===
          "id, email"
        ) {
          return Promise.resolve({
            data: null,
            error: { message: "Profile not found" }
          })
        }
        return Promise.resolve({
          data: null,
          error: { message: "Profile not found" }
        })
      })

      // Mock auth.getUser
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { email: "test@example.com" } },
        error: null
      })

      // Mock profile creation success
      ;(mockProfileQuery.upsert as jest.Mock).mockResolvedValue({
        error: null
      })

      const result = await onboardingManager.getOnboardingState(userId)

      expect(result).toEqual(defaultState)
      expect(supabase.from).toHaveBeenCalledWith("profiles")
      expect(supabase.auth.getUser).toHaveBeenCalled()
      // Check upsert was called with correct parameters
      expect(mockProfileQuery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          email: "test@example.com",
          onboarding_status: defaultState
        })
      )
    })

    it("should fall back to local storage if profile creation fails", async () => {
      // Mock profile does not exist
      ;(
        supabase.from("profiles").select("id").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: null,
        error: { message: "Profile not found" }
      })

      // Mock profile creation failure
      ;(supabase.from("profiles").upsert as jest.Mock).mockResolvedValueOnce({
        error: { message: "Database error" }
      })

      // Set up local storage with a state
      const localState = {
        completed: true,
        current_step: "feature_intro" as OnboardingStep,
        steps_completed: [
          "welcome",
          "persona_survey",
          "project_setup"
        ] as OnboardingStep[]
      }
      localStorageMock.setItem(
        `onboarding_state_${userId}`,
        JSON.stringify(localState)
      )

      const result = await onboardingManager.getOnboardingState(userId)

      expect(result).toEqual(localState)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`
      )
    })

    it("should return default state if no onboarding status found", async () => {
      // Mock profile exists
      ;(
        supabase.from("profiles").select("id").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: { id: userId },
        error: null
      })

      // Mock no onboarding status
      ;(
        supabase.from("profiles").select("onboarding_status").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: { onboarding_status: null },
        error: null
      })

      // Mock update success
      ;(supabase.from("profiles").upsert as jest.Mock).mockResolvedValueOnce({
        error: null
      })

      const result = await onboardingManager.getOnboardingState(userId)

      expect(result).toEqual(defaultState)
    })

    it("should handle errors when fetching onboarding state", async () => {
      // Mock profile exists
      ;(
        supabase.from("profiles").select("id").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: { id: userId },
        error: null
      })

      // Mock error fetching onboarding status
      ;(
        supabase.from("profiles").select("onboarding_status").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" }
      })

      // Set up local storage with a state
      const localState = {
        completed: true,
        current_step: "dashboard" as OnboardingStep,
        steps_completed: [
          "welcome",
          "persona_survey",
          "project_setup",
          "feature_intro"
        ] as OnboardingStep[]
      }
      localStorageMock.setItem(
        `onboarding_state_${userId}`,
        JSON.stringify(localState)
      )

      const result = await onboardingManager.getOnboardingState(userId)

      expect(result).toEqual(localState)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`
      )
    })
  })

  describe("updateOnboardingState", () => {
    it("should update onboarding state in Supabase", async () => {
      // Mock getting current state
      ;(
        supabase.from("profiles").select("onboarding_status").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: { onboarding_status: defaultState },
        error: null
      })

      // Mock update success
      ;(supabase.from("profiles").upsert as jest.Mock).mockResolvedValueOnce({
        error: null
      })

      const updates = {
        current_step: "persona_survey" as OnboardingStep,
        steps_completed: ["welcome"] as OnboardingStep[]
      }

      await onboardingManager.updateOnboardingState(userId, updates)

      expect(supabase.from).toHaveBeenCalledWith("profiles")
      expect(supabase.from("profiles").upsert).toHaveBeenCalledWith({
        id: userId,
        onboarding_status: {
          completed: false,
          current_step: "persona_survey",
          steps_completed: ["welcome"]
        }
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`,
        JSON.stringify({
          completed: false,
          current_step: "persona_survey",
          steps_completed: ["welcome"]
        })
      )
    })

    it("should merge steps_completed arrays correctly", async () => {
      // Mock getting current state
      ;(
        supabase.from("profiles").select("onboarding_status").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: {
          onboarding_status: {
            completed: false,
            current_step: "persona_survey",
            steps_completed: ["welcome"]
          }
        },
        error: null
      })

      // Mock update success
      ;(supabase.from("profiles").upsert as jest.Mock).mockResolvedValueOnce({
        error: null
      })

      const updates = {
        current_step: "project_setup" as OnboardingStep,
        steps_completed: ["persona_survey"] as OnboardingStep[]
      }

      await onboardingManager.updateOnboardingState(userId, updates)

      expect(supabase.from("profiles").upsert).toHaveBeenCalledWith({
        id: userId,
        onboarding_status: {
          completed: false,
          current_step: "project_setup",
          steps_completed: ["welcome", "persona_survey"]
        }
      })
    })

    it("should handle errors when updating state", async () => {
      // Mock error getting current state
      ;(
        supabase.from("profiles").select("onboarding_status").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" }
      })

      // Set up local storage with a state
      const localState = {
        completed: false,
        current_step: "welcome",
        steps_completed: []
      }
      localStorageMock.setItem(
        `onboarding_state_${userId}`,
        JSON.stringify(localState)
      )

      const updates = {
        current_step: "persona_survey" as OnboardingStep,
        steps_completed: ["welcome"] as OnboardingStep[]
      }

      await onboardingManager.updateOnboardingState(userId, updates)

      // Should still update localStorage even if Supabase fails
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`,
        JSON.stringify({
          completed: false,
          current_step: "persona_survey",
          steps_completed: ["welcome"]
        })
      )
    })
  })

  describe("trackOnboardingEvent", () => {
    it("should track onboarding event in Supabase", async () => {
      // Mock insert success
      ;(
        (supabase as MockSupabase).from("onboarding_analytics")
          .insert as jest.Mock
      ).mockResolvedValueOnce({
        error: null
      })

      const eventType = "welcome_completed"
      const eventData = { time_spent: 30 }

      await onboardingManager.trackOnboardingEvent(userId, eventType, eventData)

      expect(supabase.from).toHaveBeenCalledWith("onboarding_analytics")
      expect(
        (supabase as MockSupabase).from("onboarding_analytics").insert
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          event_type: eventType,
          event_data: eventData
        })
      )
    })

    it("should store event offline if tracking fails", async () => {
      // Mock insert failure
      ;(
        (supabase as MockSupabase).from("onboarding_analytics")
          .insert as jest.Mock
      ).mockResolvedValueOnce({
        error: { message: "Database error" }
      })

      const eventType = "welcome_completed"
      const eventData = { time_spent: 30 }

      await onboardingManager.trackOnboardingEvent(userId, eventType, eventData)

      // Should store in localStorage for later sync
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "offline_onboarding_events"
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "offline_onboarding_events",
        expect.stringContaining(eventType)
      )
    })
  })

  describe("getLocalOnboardingState", () => {
    it("should get state from localStorage", async () => {
      // Set up local storage with a state
      const localState = {
        completed: true,
        current_step: "dashboard",
        steps_completed: [
          "welcome",
          "persona_survey",
          "project_setup",
          "feature_intro"
        ]
      }
      localStorageMock.setItem(
        `onboarding_state_${userId}`,
        JSON.stringify(localState)
      )

      // We need to access the private method, so we'll use any to bypass TypeScript
      const result = (onboardingManager as any).getLocalOnboardingState(userId)

      expect(result).toEqual(localState)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`
      )
    })

    it("should return default state if localStorage is empty", async () => {
      // We need to access the private method, so we'll use any to bypass TypeScript
      const result = (onboardingManager as any).getLocalOnboardingState(userId)

      expect(result).toEqual(defaultState)
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `onboarding_state_${userId}`
      )
    })
  })
})
