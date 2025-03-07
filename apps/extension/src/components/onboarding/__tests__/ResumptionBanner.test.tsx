/**
 * Tests for the ResumptionBanner component
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"

import { useAuth } from "../../../hooks/useAuth"
import { useOnboarding } from "../../../hooks/useOnboarding"
import type { OnboardingState, OnboardingStep } from "../../../types/onboarding"
import { ResumptionBanner } from "../ResumptionBanner"

// Mock dependencies
jest.mock("../../../hooks/useAuth", () => ({
  useAuth: jest.fn()
}))

jest.mock("../../../hooks/useOnboarding", () => ({
  useOnboarding: jest.fn()
}))

describe("ResumptionBanner", () => {
  // Mock handlers
  const mockOnResume = jest.fn()
  const mockOnDismiss = jest.fn()

  // Mock hook returns
  const mockUser = { id: "test-user-id", email: "test@example.com" }
  const mockTrackOnboardingEvent = jest.fn()

  // Mock onboarding states
  const incompleteOnboardingState: OnboardingState = {
    completed: false,
    current_step: "persona_survey" as OnboardingStep,
    steps_completed: ["welcome"] as OnboardingStep[]
  }

  const completeOnboardingState: OnboardingState = {
    completed: true,
    current_step: "dashboard" as OnboardingStep,
    steps_completed: [
      "welcome",
      "persona_survey",
      "project_setup",
      "feature_intro",
      "dashboard"
    ] as OnboardingStep[]
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(useOnboarding as jest.Mock).mockReturnValue({
      onboardingState: incompleteOnboardingState,
      trackOnboardingEvent: mockTrackOnboardingEvent
    })
  })

  it("should render correctly for incomplete onboarding", () => {
    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    // Check that the component renders with the correct content
    expect(screen.getByTestId("resumption-banner")).toBeInTheDocument()
    expect(screen.getByText("Welcome back!")).toBeInTheDocument()
    expect(
      screen.getByText(
        "You're 20% through setting up Papercut. Continue where you left off?"
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument()
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 20%")
    expect(screen.getByTestId("resume-button")).toBeInTheDocument()
    expect(screen.getByTestId("dismiss-button")).toBeInTheDocument()
  })

  it("should not render if onboarding is complete", () => {
    ;(useOnboarding as jest.Mock).mockReturnValue({
      onboardingState: completeOnboardingState,
      trackOnboardingEvent: mockTrackOnboardingEvent
    })

    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    // Banner should not be rendered
    expect(screen.queryByTestId("resumption-banner")).not.toBeInTheDocument()
  })

  it("should not render if user is null", () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    // Banner should not be rendered
    expect(screen.queryByTestId("resumption-banner")).not.toBeInTheDocument()
  })

  it("should not render if onboardingState is null", () => {
    ;(useOnboarding as jest.Mock).mockReturnValue({
      onboardingState: null,
      trackOnboardingEvent: mockTrackOnboardingEvent
    })

    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    // Banner should not be rendered
    expect(screen.queryByTestId("resumption-banner")).not.toBeInTheDocument()
  })

  it("should handle Resume button click", async () => {
    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    fireEvent.click(screen.getByTestId("resume-button"))

    await waitFor(() => {
      expect(mockTrackOnboardingEvent).toHaveBeenCalledWith(
        "onboarding_resumed"
      )
      expect(mockOnResume).toHaveBeenCalledWith("persona_survey")
    })

    // Banner should be hidden after clicking resume
    expect(screen.queryByTestId("resumption-banner")).not.toBeInTheDocument()
  })

  it("should handle Dismiss button click", async () => {
    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    fireEvent.click(screen.getByTestId("dismiss-button"))

    await waitFor(() => {
      expect(mockTrackOnboardingEvent).toHaveBeenCalledWith(
        "resumption_banner_dismissed"
      )
      expect(mockOnDismiss).toHaveBeenCalled()
    })

    // Banner should be hidden after clicking dismiss
    expect(screen.queryByTestId("resumption-banner")).not.toBeInTheDocument()
  })

  it("should calculate progress percentage correctly", () => {
    // Test with 3 completed steps
    ;(useOnboarding as jest.Mock).mockReturnValue({
      onboardingState: {
        completed: false,
        current_step: "feature_intro" as OnboardingStep,
        steps_completed: [
          "welcome",
          "persona_survey",
          "project_setup"
        ] as OnboardingStep[]
      },
      trackOnboardingEvent: mockTrackOnboardingEvent
    })

    render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    expect(
      screen.getByText(
        "You're 60% through setting up Papercut. Continue where you left off?"
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 60%")
  })

  it("should not track events if user is null", async () => {
    // First render with user to make the banner visible
    const { rerender } = render(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    // Then change to null user
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    rerender(
      <ResumptionBanner onResume={mockOnResume} onDismiss={mockOnDismiss} />
    )

    // Banner should still be visible because isVisible state doesn't change
    // when user becomes null (only on initial render)

    fireEvent.click(screen.getByTestId("resume-button"))

    await waitFor(() => {
      expect(mockTrackOnboardingEvent).not.toHaveBeenCalled()
      expect(mockOnResume).not.toHaveBeenCalled()
    })

    fireEvent.click(screen.getByTestId("dismiss-button"))

    await waitFor(() => {
      expect(mockTrackOnboardingEvent).not.toHaveBeenCalled()
      expect(mockOnDismiss).toHaveBeenCalled()
    })
  })
})
