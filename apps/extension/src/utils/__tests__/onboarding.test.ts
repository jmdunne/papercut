/**
 * Tests for the OnboardingStateManager class
 */

import type { OnboardingState } from "../../types/onboarding"
import { OnboardingStateManager } from "../onboarding"
import { supabase } from "../supabase"

// Mock Supabase client
jest.mock("../supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    upsert: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis()
  }
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
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

describe("OnboardingStateManager", () => {
  let onboardingManager: OnboardingStateManager
  const userId = "test-user-id"
  const defaultState: OnboardingState = {
    completed: false,
    current_step: "welcome",
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
      ;(
        supabase.from("profiles").select("id").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: { id: userId },
        error: null
      })

      // Mock onboarding status exists
      ;(
        supabase.from("profiles").select("onboarding_status").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: {
          onboarding_status: {
            completed: true,
            current_step: "project_setup",
            steps_completed: ["welcome", "persona_survey"]
          }
        },
        error: null
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
      ;(
        supabase.from("profiles").select("id").eq("id", userId)
          .single as jest.Mock
      ).mockResolvedValueOnce({
        data: null,
        error: { message: "Profile not found" }
      })

      // Mock profile creation success
      ;(supabase.from("profiles").upsert as jest.Mock).mockResolvedValueOnce({
        error: null
      })

      const result = await onboardingManager.getOnboardingState(userId)

      expect(result).toEqual(defaultState)
      expect(supabase.from).toHaveBeenCalledWith("profiles")
      expect(supabase.from("profiles").upsert).toHaveBeenCalledWith({
        id: userId,
        onboarding_status: defaultState
      })
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
        current_step: "feature_intro",
        steps_completed: ["welcome", "persona_survey", "project_setup"]
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
        current_step: "persona_survey",
        steps_completed: ["welcome"]
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
        current_step: "project_setup",
        steps_completed: ["persona_survey"]
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
        current_step: "persona_survey",
        steps_completed: ["welcome"]
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
        supabase.from("onboarding_analytics").insert as jest.Mock
      ).mockResolvedValueOnce({
        error: null
      })

      const eventType = "welcome_completed"
      const eventData = { time_spent: 30 }

      await onboardingManager.trackOnboardingEvent(userId, eventType, eventData)

      expect(supabase.from).toHaveBeenCalledWith("onboarding_analytics")
      expect(supabase.from("onboarding_analytics").insert).toHaveBeenCalledWith(
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
        supabase.from("onboarding_analytics").insert as jest.Mock
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
