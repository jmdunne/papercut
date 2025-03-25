"use client";

// Export all onboarding components from a single file
export {
  OnboardingProvider,
  useOnboarding,
  defaultTutorial,
} from "./onboarding-context";
export { OnboardingOverlay } from "./onboarding-overlay";
export { TutorialStep } from "./tutorial-step";
export { ToolHighlighter } from "./tool-highlighter";
export { ProgressIndicator } from "./progress-indicator";
export { CompletionCelebration } from "./completion-celebration/index";
export { OnboardingController } from "./onboarding-controller";
export {
  GuidedTour,
  designModeTutorial,
  websiteEditingTutorial,
} from "./guided-tour";

// Export types
export type { TutorialStep, TutorialConfig } from "./onboarding-context";
