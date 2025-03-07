/**
 * Types for onboarding state management
 */

/**
 * Possible steps in the onboarding flow
 */
export type OnboardingStep =
  | "welcome"
  | "persona_survey"
  | "project_setup"
  | "feature_intro"
  | "dashboard"

/**
 * Onboarding state stored in the database
 */
export interface OnboardingState {
  completed: boolean
  current_step: OnboardingStep
  steps_completed: OnboardingStep[]
}
