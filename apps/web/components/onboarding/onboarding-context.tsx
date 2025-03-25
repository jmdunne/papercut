"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useDesignMode } from "@/contexts/design-mode-context";

// Define the tutorial steps
export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for the element to highlight
  position?: "top" | "right" | "bottom" | "left"; // Position of the tooltip
  action?: string; // Action to perform (e.g., "click", "hover")
  tool?: string; // Tool to select
  completionCriteria?: () => boolean; // Function to determine if step is complete
};

// Define the tutorial configuration
export type TutorialConfig = {
  steps: TutorialStep[];
  autoAdvance?: boolean; // Whether to auto-advance to the next step
  skipEnabled?: boolean; // Whether the tutorial can be skipped
  showProgress?: boolean; // Whether to show the progress indicator
};

// Define the onboarding context type
type OnboardingContextType = {
  // State
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  tutorial: TutorialConfig | null;

  // Actions
  startTutorial: (tutorial: TutorialConfig) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  setStep: (stepIndex: number) => void;

  // Current step data
  currentStepData: TutorialStep | null;
};

// Create the context
const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

// Context provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { activateDesignMode, setActiveTool } = useDesignMode();

  // State
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorial, setTutorial] = useState<TutorialConfig | null>(null);

  // Derived values
  const totalSteps = tutorial?.steps.length || 0;
  const currentStepData = tutorial?.steps[currentStep] || null;

  // Start a tutorial
  const startTutorial = useCallback(
    (tutorialConfig: TutorialConfig) => {
      setTutorial(tutorialConfig);
      setCurrentStep(0);
      setIsActive(true);

      // If the first step requires design mode, activate it
      if (tutorialConfig.steps[0]?.tool) {
        activateDesignMode();
      }
    },
    [activateDesignMode]
  );

  // Navigate to the next step
  const nextStep = useCallback(() => {
    if (!tutorial) return;

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < tutorial.steps.length) {
      setCurrentStep(nextStepIndex);

      // If the next step requires a specific tool, select it
      const nextStepTool = tutorial.steps[nextStepIndex].tool;
      if (nextStepTool) {
        setActiveTool(nextStepTool as any);
      }
    } else {
      // Complete the tutorial if we're at the last step
      completeTutorial();
    }
  }, [currentStep, tutorial, setActiveTool]);

  // Navigate to the previous step
  const prevStep = useCallback(() => {
    if (!tutorial || currentStep <= 0) return;

    const prevStepIndex = currentStep - 1;
    setCurrentStep(prevStepIndex);

    // If the previous step requires a specific tool, select it
    const prevStepTool = tutorial.steps[prevStepIndex].tool;
    if (prevStepTool) {
      setActiveTool(prevStepTool as any);
    }
  }, [currentStep, tutorial, setActiveTool]);

  // Skip the tutorial
  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setTutorial(null);
  }, []);

  // Complete the tutorial
  const completeTutorial = useCallback(() => {
    setIsActive(false);
    // Optionally save completion state to localStorage
    localStorage.setItem("tutorial-completed", "true");
  }, []);

  // Set a specific step
  const setStep = useCallback(
    (stepIndex: number) => {
      if (!tutorial) return;

      if (stepIndex >= 0 && stepIndex < tutorial.steps.length) {
        setCurrentStep(stepIndex);

        // If the step requires a specific tool, select it
        const stepTool = tutorial.steps[stepIndex].tool;
        if (stepTool) {
          setActiveTool(stepTool as any);
        }
      }
    },
    [tutorial, setActiveTool]
  );

  // Effect to handle auto-advance when step completion criteria are met
  useEffect(() => {
    if (
      !tutorial ||
      !tutorial.autoAdvance ||
      !currentStepData?.completionCriteria
    ) {
      return;
    }

    const checkCompletion = () => {
      if (
        currentStepData.completionCriteria &&
        currentStepData.completionCriteria()
      ) {
        nextStep();
      }
    };

    // Check completion every 500ms
    const interval = setInterval(checkCompletion, 500);

    return () => clearInterval(interval);
  }, [tutorial, currentStepData, nextStep]);

  // Provide the context value
  const contextValue: OnboardingContextType = {
    isActive,
    currentStep,
    totalSteps,
    tutorial,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    setStep,
    currentStepData,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook to use the onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }

  return context;
}

// Default tutorial configuration
export const defaultTutorial: TutorialConfig = {
  steps: [
    {
      id: "welcome",
      title: "Welcome to Papercut!",
      description:
        "This tutorial will guide you through editing your website directly in the browser. Let's get started!",
      position: "bottom",
    },
    {
      id: "design-mode",
      title: "Entering Design Mode",
      description:
        "First, let's activate Design Mode to start editing your website.",
      target: "[data-sidebar='trigger']",
      position: "right",
      action: "click",
      tool: "select",
    },
    {
      id: "selection-tool",
      title: "Selection Tool",
      description:
        "Use the Selection tool to click on any element you want to edit.",
      target: "[aria-label='Select']",
      position: "right",
      action: "click",
      tool: "select",
    },
    {
      id: "style-tool",
      title: "Style Tool",
      description:
        "The Style tool lets you change colors, fonts, and other visual properties.",
      target: "[aria-label='Style']",
      position: "right",
      action: "click",
      tool: "style",
    },
    {
      id: "ai-tool",
      title: "AI Assistant",
      description:
        "The AI tool can help you generate content or suggest design improvements.",
      target: "[aria-label='AI Assistant']",
      position: "right",
      action: "click",
      tool: "ai",
    },
    {
      id: "completion",
      title: "You're All Set!",
      description:
        "You've completed the tutorial! Now you can edit your website with confidence.",
      position: "bottom",
    },
  ],
  autoAdvance: true,
  skipEnabled: true,
  showProgress: true,
};
