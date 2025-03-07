/**
 * Hook for managing onboarding state
 *
 * This hook provides access to the onboarding state and methods for updating it.
 */

import { useEffect, useState } from "react"

import type { OnboardingState } from "../types/onboarding"
import { onboardingManager } from "../utils/onboarding"
import { useAuth } from "./useAuth"

export function useOnboarding() {
  const { user } = useAuth()
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOnboardingState() {
      if (!user) {
        setOnboardingState(null)
        setLoading(false)
        return
      }

      try {
        const state = await onboardingManager.getOnboardingState(user.id)
        setOnboardingState(state)
      } catch (error) {
        console.error(
          "[DEBUG] useOnboarding: Error loading onboarding state:",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingState()
  }, [user])

  const updateOnboardingState = async (updates: Partial<OnboardingState>) => {
    if (!user) return

    try {
      await onboardingManager.updateOnboardingState(user.id, updates)
      // Refresh state
      const newState = await onboardingManager.getOnboardingState(user.id)
      setOnboardingState(newState)
    } catch (error) {
      console.error(
        "[DEBUG] useOnboarding: Error updating onboarding state:",
        error
      )
    }
  }

  const trackOnboardingEvent = async (
    eventType: string,
    eventData: Record<string, any> = {}
  ) => {
    if (!user) return

    try {
      await onboardingManager.trackOnboardingEvent(
        user.id,
        eventType,
        eventData
      )
    } catch (error) {
      console.error(
        "[DEBUG] useOnboarding: Error tracking onboarding event:",
        error
      )
    }
  }

  return {
    onboardingState,
    loading,
    updateOnboardingState,
    trackOnboardingEvent
  }
}
