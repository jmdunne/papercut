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
  async getOnboardingState(userId: string): Promise {
    try {
      console.log(
        "[DEBUG] OnboardingStateManager: Fetching onboarding state for user",
        userId
      )

      // First check if the user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.log(
          "[DEBUG] OnboardingStateManager: Profile doesn't exist, creating it"
        )

        // Get user email from auth
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userError || !userData?.user?.email) {
          console.error(
            "[DEBUG] OnboardingStateManager: Error getting user email:",
            userError
          )
          // Fall back to local storage
          return this.getLocalOnboardingState(userId)
        }

        const userEmail = userData.user.email

        // Profile doesn't exist, create it with default onboarding state
        const defaultState: OnboardingState = {
          completed: false,
          current_step: "welcome",
          steps_completed: []
        }

        // Try to create the profile
        const { error: createError } = await supabase.from("profiles").upsert({
          id: userId,
          email: userEmail,
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
    updates: Partial | OnboardingState
  ): Promise {
    try {
      console.log(
        "[DEBUG] OnboardingStateManager: Updating onboarding state for user",
        userId
      )

      // Get user profile to get email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, onboarding_status")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error(
          "[DEBUG] OnboardingStateManager: Error getting user profile:",
          profileError
        )

        // Try to get user email from auth
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userError || !userData?.user?.email) {
          console.error(
            "[DEBUG] OnboardingStateManager: Error getting user email:",
            userError
          )
          // Fall back to local storage only
          this.updateLocalOnboardingState(userId, updates)
          return
        }

        // Use default state since we couldn't get the current state
        const currentState: OnboardingState = {
          completed: false,
          current_step: "welcome",
          steps_completed: []
        }

        // Merge updates with current state
        const newState = this.mergeStates(currentState, updates)

        // Update in Supabase with the user email
        const { error } = await supabase.from("profiles").upsert({
          id: userId,
          email: userData.user.email,
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

        return
      }

      // We have the profile, use its email and current state
      const userEmail = profile.email
      const currentState = profile.onboarding_status || {
        completed: false,
        current_step: "welcome",
        steps_completed: []
      }

      // Merge updates with current state
      const newState = this.mergeStates(currentState, updates)

      // Update in Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
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
      this.updateLocalOnboardingState(userId, updates)
    }
  }

  /**
   * Helper method to merge states
   */
  private mergeStates(
    currentState: OnboardingState,
    updates: Partial | OnboardingState
  ): OnboardingState {
    return {
      ...currentState,
      ...updates,
      steps_completed: [
        ...new Set([
          ...(currentState.steps_completed || []),
          ...(updates.steps_completed || [])
        ])
      ]
    }
  }

  /**
   * Update onboarding state in local storage
   */
  private updateLocalOnboardingState(
    userId: string,
    updates: Partial | OnboardingState
  ): void {
    try {
      const localState = localStorage.getItem(`onboarding_state_${userId}`)
      const currentState = localState
        ? JSON.parse(localState)
        : {
            completed: false,
            current_step: "welcome",
            steps_completed: []
          }

      const newState = this.mergeStates(currentState, updates)

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

  /**
   * Track onboarding event for analytics
   */
  async trackOnboardingEvent(
    userId: string,
    eventType: string,
    eventData: Record = {}
  ): Promise {
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
    eventData: Record = {}
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
