/**
 * Tests for the useOnboarding hook
 */

import { act, renderHook } from "@testing-library/react"

import type { OnboardingState, OnboardingStep } from "../../types/onboarding"
import { onboardingManager } from "../../utils/onboarding"
import { useAuth } from "../useAuth"
import { useOnboarding } from "../useOnboarding"

// Mock dependencies
jest.mock("../useAuth", () => ({
  useAuth: jest.fn()
}))

jest.mock("../../utils/onboarding", () => ({
  onboardingManager: {
    getOnboardingState: jest.fn(),
    updateOnboardingState: jest.fn(),
    trackOnboardingEvent: jest.fn()
  }
}))

describe("useOnboarding", () => {
  const mockUser = { id: "test-user-id", email: "test@example.com" }
  const mockOnboardingState: OnboardingState = {
    completed: false,
    current_step: "welcome" as OnboardingStep,
    steps_completed: []
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(onboardingManager.getOnboardingState as jest.Mock).mockResolvedValue(
      mockOnboardingState
    )
    ;(onboardingManager.updateOnboardingState as jest.Mock).mockResolvedValue(
      undefined
    )
    ;(onboardingManager.trackOnboardingEvent as jest.Mock).mockResolvedValue(
      undefined
    )
  })

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useOnboarding())

    expect(result.current.loading).toBe(true)
    expect(result.current.onboardingState).toBe(null)
  })

  it("should load onboarding state when user is available", async () => {
    const { result } = renderHook(() => useOnboarding())

    // Wait for the effect to run
    await act(async () => {
      // Just waiting for the next tick
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.onboardingState).toEqual(mockOnboardingState)
    expect(onboardingManager.getOnboardingState).toHaveBeenCalledWith(
      mockUser.id
    )
  })

  it("should not load onboarding state when user is null", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    const { result } = renderHook(() => useOnboarding())

    // Wait for the effect to run
    await act(async () => {
      // Just waiting for the next tick
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.onboardingState).toBe(null)
    expect(onboardingManager.getOnboardingState).not.toHaveBeenCalled()
  })

  it("should handle errors when loading onboarding state", async () => {
    ;(onboardingManager.getOnboardingState as jest.Mock).mockRejectedValue(
      new Error("Failed to load")
    )

    const { result } = renderHook(() => useOnboarding())

    // Wait for the effect to run
    await act(async () => {
      // Just waiting for the next tick
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.onboardingState).toBe(null)
  })

  it("should update onboarding state", async () => {
    const updatedState: OnboardingState = {
      ...mockOnboardingState,
      current_step: "persona_survey" as OnboardingStep,
      steps_completed: ["welcome"] as OnboardingStep[]
    }

    ;(onboardingManager.getOnboardingState as jest.Mock)
      .mockResolvedValueOnce(mockOnboardingState)
      .mockResolvedValueOnce(updatedState)

    const { result } = renderHook(() => useOnboarding())

    // Wait for the initial effect to run
    await act(async () => {
      await Promise.resolve()
    })

    const updates = {
      current_step: "persona_survey" as OnboardingStep,
      steps_completed: ["welcome"] as OnboardingStep[]
    }

    await act(async () => {
      await result.current.updateOnboardingState(updates)
    })

    expect(onboardingManager.updateOnboardingState).toHaveBeenCalledWith(
      mockUser.id,
      updates
    )
    expect(onboardingManager.getOnboardingState).toHaveBeenCalledTimes(2)
    expect(result.current.onboardingState).toEqual(updatedState)
  })

  it("should not update onboarding state when user is null", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    const { result } = renderHook(() => useOnboarding())

    // Wait for the initial effect to run
    await act(async () => {
      await Promise.resolve()
    })

    const updates = {
      current_step: "persona_survey" as OnboardingStep,
      steps_completed: ["welcome"] as OnboardingStep[]
    }

    await act(async () => {
      await result.current.updateOnboardingState(updates)
    })

    expect(onboardingManager.updateOnboardingState).not.toHaveBeenCalled()
  })

  it("should handle errors when updating onboarding state", async () => {
    ;(onboardingManager.updateOnboardingState as jest.Mock).mockRejectedValue(
      new Error("Failed to update")
    )

    const { result } = renderHook(() => useOnboarding())

    // Wait for the initial effect to run
    await act(async () => {
      await Promise.resolve()
    })

    const updates = {
      current_step: "persona_survey" as OnboardingStep,
      steps_completed: ["welcome"] as OnboardingStep[]
    }

    await act(async () => {
      await result.current.updateOnboardingState(updates)
    })

    expect(onboardingManager.updateOnboardingState).toHaveBeenCalledWith(
      mockUser.id,
      updates
    )
    // State should remain unchanged
    expect(result.current.onboardingState).toEqual(mockOnboardingState)
  })

  it("should track onboarding events", async () => {
    const { result } = renderHook(() => useOnboarding())

    // Wait for the initial effect to run
    await act(async () => {
      await Promise.resolve()
    })

    const eventType = "welcome_completed"
    const eventData = { time_spent: 30 }

    await act(async () => {
      await result.current.trackOnboardingEvent(eventType, eventData)
    })

    expect(onboardingManager.trackOnboardingEvent).toHaveBeenCalledWith(
      mockUser.id,
      eventType,
      eventData
    )
  })

  it("should not track events when user is null", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    const { result } = renderHook(() => useOnboarding())

    // Wait for the initial effect to run
    await act(async () => {
      await Promise.resolve()
    })

    const eventType = "welcome_completed"
    const eventData = { time_spent: 30 }

    await act(async () => {
      await result.current.trackOnboardingEvent(eventType, eventData)
    })

    expect(onboardingManager.trackOnboardingEvent).not.toHaveBeenCalled()
  })

  it("should handle errors when tracking events", async () => {
    ;(onboardingManager.trackOnboardingEvent as jest.Mock).mockRejectedValue(
      new Error("Failed to track")
    )

    const { result } = renderHook(() => useOnboarding())

    // Wait for the initial effect to run
    await act(async () => {
      await Promise.resolve()
    })

    const eventType = "welcome_completed"
    const eventData = { time_spent: 30 }

    await act(async () => {
      // This should not throw
      await result.current.trackOnboardingEvent(eventType, eventData)
    })

    expect(onboardingManager.trackOnboardingEvent).toHaveBeenCalledWith(
      mockUser.id,
      eventType,
      eventData
    )
  })
})
