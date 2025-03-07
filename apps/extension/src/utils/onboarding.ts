/**
 * Onboarding state management utilities
 *
 * This file provides functions for managing onboarding state and tracking onboarding events.
 */

import type { OnboardingState } from "../types/onboarding"
import { supabase } from "./supabase"

export class OnboardingStateManager {
  /**
   * Get current onboarding state for a user
   */
  async getOnboardingState(userId: string): Promise<OnboardingState> {
    try {
      console.log(
        "[DEBUG] OnboardingStateManager: Fetching onboarding state for user",
        userId
      )

      // First check if the user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.log(
          "[DEBUG] OnboardingStateManager: Profile doesn't exist, creating it"
        )

        // Profile doesn't exist, create it with default onboarding state
        const defaultState: OnboardingState = {
          completed: false,
          current_step: "welcome",
          steps_completed: []
        }

        // Try to create the profile
        const { error: createError } = await supabase.from("profiles").upsert({
          id: userId,
          onboarding_status: defaultState
        })

        if (createError) {
          console.error(
            "[DEBUG] OnboardingStateManager: Error creating profile:",
            createError
          )
          // Fall back to local storage
          return this.getLocalOnboardingState(userId)
        }

        return defaultState
      }

      // Profile exists, get the onboarding status
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_status")
        .eq("id", userId)
        .single()

      if (error) {
        console.error(
          "[DEBUG] OnboardingStateManager: Error fetching onboarding state:",
          error
        )
        return this.getLocalOnboardingState(userId)
      }

      if (!data?.onboarding_status) {
        console.log(
          "[DEBUG] OnboardingStateManager: No onboarding status found, using default"
        )
        const defaultState: OnboardingState = {
          completed: false,
          current_step: "welcome",
          steps_completed: []
        }

        // Save the default state
        this.updateOnboardingState(userId, defaultState)

        return defaultState
      }

      // Also update local storage as backup
      localStorage.setItem(
        `onboarding_state_${userId}`,
        JSON.stringify(data.onboarding_status)
      )

      return data.onboarding_status
    } catch (error) {
      console.error(
        "[DEBUG] OnboardingStateManager: Exception getting onboarding state:",
        error
      )
      return this.getLocalOnboardingState(userId)
    }
  }

  /**
   * Get onboarding state from local storage
   */
  private getLocalOnboardingState(userId: string): OnboardingState {
    try {
      const localState = localStorage.getItem(`onboarding_state_${userId}`)
      if (localState) {
        return JSON.parse(localState)
      }
    } catch (e) {
      console.error(
        "[DEBUG] OnboardingStateManager: Error reading from local storage:",
        e
      )
    }

    // Default state if nothing is found
    return {
      completed: false,
      current_step: "welcome",
      steps_completed: []
    }
  }

  /**
   * Update onboarding state for a user
   */
  async updateOnboardingState(
    userId: string,
    updates: Partial<OnboardingState> | OnboardingState
  ): Promise<void> {
    try {
      console.log(
        "[DEBUG] OnboardingStateManager: Updating onboarding state for user",
        userId
      )

      // Get current state or use default
      let currentState: OnboardingState
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_status")
          .eq("id", userId)
          .single()

        if (error || !data?.onboarding_status) {
          currentState = {
            completed: false,
            current_step: "welcome",
            steps_completed: []
          }
        } else {
          currentState = data.onboarding_status
        }
      } catch (e) {
        console.error(
          "[DEBUG] OnboardingStateManager: Error getting current state:",
          e
        )
        // Try to get from local storage
        const localState = localStorage.getItem(`onboarding_state_${userId}`)
        currentState = localState
          ? JSON.parse(localState)
          : {
              completed: false,
              current_step: "welcome",
              steps_completed: []
            }
      }

      // Merge updates with current state
      const newState = {
        ...currentState,
        ...updates,
        steps_completed: [
          ...new Set([
            ...(currentState.steps_completed || []),
            ...(updates.steps_completed || [])
          ])
        ]
      }

      // Update in Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        onboarding_status: newState
      })

      if (error) {
        console.error(
          "[DEBUG] OnboardingStateManager: Error updating onboarding state:",
          error
        )
      }

      // Always update local storage as backup
      localStorage.setItem(
        `onboarding_state_${userId}`,
        JSON.stringify(newState)
      )
    } catch (error) {
      console.error(
        "[DEBUG] OnboardingStateManager: Exception updating onboarding state:",
        error
      )

      // Ensure local storage is updated even if Supabase fails
      try {
        const localState = localStorage.getItem(`onboarding_state_${userId}`)
        const currentState = localState
          ? JSON.parse(localState)
          : {
              completed: false,
              current_step: "welcome",
              steps_completed: []
            }

        const newState = {
          ...currentState,
          ...updates,
          steps_completed: [
            ...new Set([
              ...(currentState.steps_completed || []),
              ...(updates.steps_completed || [])
            ])
          ]
        }

        localStorage.setItem(
          `onboarding_state_${userId}`,
          JSON.stringify(newState)
        )
      } catch (e) {
        console.error(
          "[DEBUG] OnboardingStateManager: Error updating local storage:",
          e
        )
      }
    }
  }

  /**
   * Track onboarding event for analytics
   */
  async trackOnboardingEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any> = {}
  ): Promise<void> {
    try {
      console.log(
        `[DEBUG] OnboardingStateManager: Tracking event ${eventType} for user ${userId}`
      )

      const { error } = await supabase.from("onboarding_analytics").insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      })

      if (error) {
        console.error(
          "[DEBUG] OnboardingStateManager: Error tracking event:",
          error
        )
        this.storeOfflineEvent(userId, eventType, eventData)
      }
    } catch (error) {
      console.error(
        "[DEBUG] OnboardingStateManager: Exception tracking event:",
        error
      )
      this.storeOfflineEvent(userId, eventType, eventData)
    }
  }

  /**
   * Store event locally for later sync
   */
  private storeOfflineEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any> = {}
  ): void {
    try {
      const offlineEvents = JSON.parse(
        localStorage.getItem("offline_onboarding_events") || "[]"
      )

      offlineEvents.push({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      })

      localStorage.setItem(
        "offline_onboarding_events",
        JSON.stringify(offlineEvents)
      )
      console.log(
        "[DEBUG] OnboardingStateManager: Stored event offline for later sync"
      )
    } catch (e) {
      console.error(
        "[DEBUG] OnboardingStateManager: Error storing event offline:",
        e
      )
    }
  }
}

// Export a singleton instance
export const onboardingManager = new OnboardingStateManager()
