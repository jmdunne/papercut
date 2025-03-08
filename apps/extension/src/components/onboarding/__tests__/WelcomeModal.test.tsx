/**
 * Tests for the WelcomeModal component
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"

import { useAuth } from "../../../hooks/useAuth"
import { useOnboarding } from "../../../hooks/useOnboarding"
import type { OnboardingStep } from "../../../types/onboarding"
import { WelcomeModal } from "../WelcomeModal"

// Mock dependencies
jest.mock("../../../hooks/useAuth", () => ({
  useAuth: jest.fn()
}))

jest.mock("../../../hooks/useOnboarding", () => ({
  useOnboarding: jest.fn()
}))

describe("WelcomeModal", () => {
  // Mock handlers
  const mockOnGetStarted = jest.fn()
  const mockOnSkip = jest.fn()

  // Mock hook returns
  const mockUser = { id: "test-user-id", email: "test@example.com" }
  const mockTrackOnboardingEvent = jest.fn()
  const mockUpdateOnboardingState = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
    ;(useOnboarding as jest.Mock).mockReturnValue({
      trackOnboardingEvent: mockTrackOnboardingEvent,
      updateOnboardingState: mockUpdateOnboardingState,
      loading: false,
      onboardingState: {
        completed: false,
        current_step: "welcome",
        steps_completed: []
      }
    })
  })

  it("should render correctly", () => {
    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    // Check that the component renders with the correct content
    expect(screen.getByTestId("welcome-modal")).toBeInTheDocument()
    expect(screen.getByText("Welcome to Papercut!")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Design and test UI changes directly in your browser without writing code."
      )
    ).toBeInTheDocument()
    expect(screen.getByText("Select Any Element")).toBeInTheDocument()
    expect(screen.getByText("Visual Editing")).toBeInTheDocument()
    expect(screen.getByText("AI-Powered Design")).toBeInTheDocument()
    expect(screen.getByTestId("get-started-button")).toBeInTheDocument()
    expect(screen.getByTestId("skip-button")).toBeInTheDocument()
  })

  it("should track welcome_modal_shown event on mount", () => {
    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    expect(mockTrackOnboardingEvent).toHaveBeenCalledWith("welcome_modal_shown")
  })

  it("should not track events if user is null", () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    expect(mockTrackOnboardingEvent).not.toHaveBeenCalled()
  })

  it("should handle Get Started button click", async () => {
    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    fireEvent.click(screen.getByTestId("get-started-button"))

    await waitFor(() => {
      expect(mockUpdateOnboardingState).toHaveBeenCalledWith({
        current_step: "persona_survey" as OnboardingStep,
        steps_completed: ["welcome"] as OnboardingStep[]
      })
      expect(mockTrackOnboardingEvent).toHaveBeenCalledWith("welcome_completed")
      expect(mockOnGetStarted).toHaveBeenCalled()
    })
  })

  it("should handle Skip button click", async () => {
    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    fireEvent.click(screen.getByTestId("skip-button"))

    await waitFor(() => {
      expect(mockUpdateOnboardingState).toHaveBeenCalledWith({
        current_step: "dashboard" as OnboardingStep,
        steps_completed: ["welcome"] as OnboardingStep[]
      })
      expect(mockTrackOnboardingEvent).toHaveBeenCalledWith("welcome_skipped")
      expect(mockOnSkip).toHaveBeenCalled()
    })
  })

  it("should still call handlers even if user is null", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null })

    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    fireEvent.click(screen.getByTestId("get-started-button"))

    await waitFor(() => {
      expect(mockUpdateOnboardingState).not.toHaveBeenCalled()
      expect(mockTrackOnboardingEvent).not.toHaveBeenCalled()
      expect(mockOnGetStarted).toHaveBeenCalled()
    })

    // Reset mock
    mockOnGetStarted.mockReset()

    fireEvent.click(screen.getByTestId("skip-button"))

    await waitFor(() => {
      expect(mockUpdateOnboardingState).not.toHaveBeenCalled()
      expect(mockTrackOnboardingEvent).not.toHaveBeenCalled()
      expect(mockOnSkip).toHaveBeenCalled()
    })
  })

  it("should handle errors when updating onboarding state", async () => {
    // Mock updateOnboardingState to throw an error
    mockUpdateOnboardingState.mockRejectedValueOnce(new Error("Update failed"))

    render(<WelcomeModal onGetStarted={mockOnGetStarted} onSkip={mockOnSkip} />)

    fireEvent.click(screen.getByTestId("get-started-button"))

    // Should still call onGetStarted even if updateOnboardingState fails
    await waitFor(() => {
      expect(mockOnGetStarted).toHaveBeenCalled()
    })
  })
})
