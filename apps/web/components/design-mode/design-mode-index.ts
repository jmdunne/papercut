"use client";

// Export all design mode components
export { FloatingActionBar } from "@/components/design-mode/components/floating-action-bar";
export { KeyboardShortcutListener } from "@/components/design-mode/components/keyboard-shortcut-listener";
export { TransitionAnimation } from "@/components/design-mode/components/transition-animation";
export { GlitterEffect } from "@/components/design-mode/components/glitter-effect";
export { SelectionHighlighter } from "@/components/design-mode/components/selection-highlighter";
export { InspectorPanel } from "@/components/design-mode/components/inspector-panel";
export { ElementPathBreadcrumb } from "@/components/design-mode/components/element-path-breadcrumb";
export { ElementSelectionHandler } from "@/components/design-mode/components/element-selection-handler";

// Export all onboarding components
export {
  OnboardingProvider,
  useOnboarding,
  defaultTutorial,
} from "@/components/onboarding/onboarding-context";

export { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";

export { DesignModeTutorial } from "@/components/onboarding/design-mode-tutorial";

export {
  GuidedTour,
  designModeTutorial,
  websiteEditingTutorial,
} from "@/components/onboarding/guided-tour";
