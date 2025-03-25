"use client";

// Export all design mode components
export { FloatingActionBar } from "./floating-action-bar";
export { KeyboardShortcutListener } from "./keyboard-shortcut-listener";
export { TransitionAnimation } from "./transition-animation";
export { WelcomeMessage } from "./welcome-message";
export { GlitterEffect } from "./glitter-effect";

// Export all onboarding components
export {
  OnboardingProvider,
  useOnboarding,
  defaultTutorial,
} from "../onboarding/onboarding-context";

export { OnboardingOverlay } from "../onboarding/onboarding-overlay";

export { DesignModeTutorial } from "../onboarding/design-mode-tutorial";

export {
  GuidedTour,
  designModeTutorial,
  websiteEditingTutorial,
} from "../onboarding/guided-tour";

export { StyleContextPanel } from "../onboarding/style-context-panel";
