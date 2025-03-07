/**
 * Resumption Banner Component
 *
 * This component displays a banner for users who have started but not completed
 * the onboarding process, allowing them to resume where they left off.
 */

import React, { useEffect, useState } from "react"

import { useAuth } from "../../hooks/useAuth"
import { useOnboarding } from "../../hooks/useOnboarding"
import type { OnboardingStep } from "../../types/onboarding"

interface ResumptionBannerProps {
  onResume: (step: OnboardingStep) => void
  onDismiss: () => void
}

export const ResumptionBanner: React.FC<ResumptionBannerProps> = ({
  onResume,
  onDismiss
}) => {
  const { user } = useAuth()
  const { onboardingState, trackOnboardingEvent } = useOnboarding()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (user && onboardingState && !onboardingState.completed) {
      setIsVisible(true)
    }
  }, [user, onboardingState])

  const handleResume = async () => {
    if (user && onboardingState) {
      await trackOnboardingEvent("onboarding_resumed")
      onResume(onboardingState.current_step)
    }

    setIsVisible(false)
  }

  const handleDismiss = async () => {
    if (user) {
      await trackOnboardingEvent("resumption_banner_dismissed")
    }

    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible || !onboardingState) return null

  // Calculate progress percentage
  const stepsCompleted = onboardingState.steps_completed.length
  const totalSteps = 5 // Total number of onboarding steps
  const progressPercent = Math.round((stepsCompleted / totalSteps) * 100)

  return (
    <div className="resumption-banner" data-testid="resumption-banner">
      <div className="resumption-content">
        <h3>Welcome back!</h3>
        <p>
          You're {progressPercent}% through setting up Papercut. Continue where
          you left off?
        </p>

        <div className="progress-bar" data-testid="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
            data-testid="progress-fill"
          />
        </div>
      </div>

      <div className="resumption-actions">
        <button
          className="primary-button"
          onClick={handleResume}
          data-testid="resume-button">
          Continue Setup
        </button>

        <button
          className="icon-button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          data-testid="dismiss-button">
          ✕
        </button>
      </div>
    </div>
  )
}
