/**
 * Welcome Modal Component
 *
 * This component displays a welcome message to new users and provides
 * options to start the onboarding process or skip it.
 */

import React, { useEffect } from "react"

import { useAuth } from "../../hooks/useAuth"
import { useOnboarding } from "../../hooks/useOnboarding"

interface WelcomeModalProps {
  onGetStarted: () => void
  onSkip: () => void
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onGetStarted,
  onSkip
}) => {
  const { user } = useAuth()
  const { trackOnboardingEvent, updateOnboardingState } = useOnboarding()

  useEffect(() => {
    if (user) {
      trackOnboardingEvent("welcome_modal_shown")
    }
  }, [user, trackOnboardingEvent])

  const handleGetStarted = async () => {
    if (user) {
      await updateOnboardingState({
        current_step: "persona_survey",
        steps_completed: ["welcome"]
      })

      await trackOnboardingEvent("welcome_completed")
    }

    onGetStarted()
  }

  const handleSkip = async () => {
    if (user) {
      await updateOnboardingState({
        current_step: "dashboard",
        steps_completed: ["welcome"]
      })

      await trackOnboardingEvent("welcome_skipped")
    }

    onSkip()
  }

  return (
    <div className="modal-overlay" data-testid="welcome-modal">
      <div className="welcome-modal">
        <div className="welcome-modal-header">
          <img src="/logo.svg" alt="Papercut Logo" className="welcome-logo" />
          <h1>Welcome to Papercut!</h1>
        </div>

        <div className="welcome-content">
          <p className="welcome-description">
            Design and test UI changes directly in your browser without writing
            code. Get feedback faster and collaborate with your team in
            real-time.
          </p>

          <div className="welcome-features">
            <div className="welcome-feature">
              <span className="icon">🔍</span>
              <h3>Select Any Element</h3>
              <p>Click to select and edit any element on any website</p>
            </div>

            <div className="welcome-feature">
              <span className="icon">✏️</span>
              <h3>Visual Editing</h3>
              <p>
                Adjust colors, spacing, typography and more with intuitive
                controls
              </p>
            </div>

            <div className="welcome-feature">
              <span className="icon">🤖</span>
              <h3>AI-Powered Design</h3>
              <p>
                Describe changes in plain English and watch them come to life
              </p>
            </div>
          </div>

          <div className="welcome-actions">
            <button
              className="primary-button"
              onClick={handleGetStarted}
              data-testid="get-started-button">
              Let's Get Started (2 min)
            </button>

            <button
              className="text-button"
              onClick={handleSkip}
              data-testid="skip-button">
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
