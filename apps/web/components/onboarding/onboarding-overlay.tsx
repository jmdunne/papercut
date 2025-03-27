"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "./onboarding-context";
import { TutorialStep } from "./tutorial-step";
import { ProgressIndicator } from "./progress-indicator";
import { ToolHighlighter } from "./tool-highlighter";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { CompletionCelebration } from "./completion-celebration/index";

export function OnboardingOverlay() {
  const {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    skipTutorial,
    nextStep,
    prevStep,
    tutorial,
  } = useOnboarding();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const isLastStep = currentStep === totalSteps - 1;

  // Find the target element for highlighting
  useEffect(() => {
    if (!isActive || !currentStepData?.target) {
      setTargetElement(null);
      setTargetRect(null);
      return;
    }

    // Find the target element
    const element = document.querySelector(
      currentStepData.target
    ) as HTMLElement;
    if (element) {
      setTargetElement(element);
      setTargetRect(element.getBoundingClientRect());

      // Update the rect on window resize
      const handleResize = () => {
        setTargetRect(element.getBoundingClientRect());
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isActive, currentStepData]);

  // If not active, don't render anything
  if (!isActive) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none design-mode-ui" />

      {/* Target element highlighter */}
      {targetRect && (
        <ToolHighlighter
          rect={targetRect}
          position={currentStepData?.position || "bottom"}
        />
      )}

      {/* Main container for the tour content */}
      <div
        className="fixed inset-0 z-50 design-mode-ui"
        data-testid="onboarding-overlay"
      >
        {/* Tutorial step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-50 max-w-md pointer-events-auto"
            style={getStepPosition(
              targetRect,
              currentStepData?.position || "bottom"
            )}
          >
            <div className="bg-background border rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  {currentStepData?.title}
                </h3>
                {tutorial?.skipEnabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipTutorial}
                    className="h-6 w-6 -mt-1 -mr-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {currentStepData?.description}
                </p>
              </div>

              {tutorial?.showProgress && (
                <ProgressIndicator
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                />
              )}

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button variant="default" size="sm" onClick={nextStep}>
                  {isLastStep ? "Finish" : "Next"}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Show celebration on last step */}
        {isLastStep && <CompletionCelebration />}
      </div>
    </>
  );
}

// Helper to position the step card relative to the target element
function getStepPosition(
  targetRect: DOMRect | null,
  position: "top" | "right" | "bottom" | "left"
): React.CSSProperties {
  if (!targetRect) {
    // Center in viewport if no target
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const margin = 16; // Margin from the target element

  // Check if the element is part of the floating action bar by checking its position near the bottom of the screen
  // and if the element has aria-label (tools in the floating bar have aria-labels)
  const isFloatingBarElement =
    targetRect.bottom > window.innerHeight - 150 &&
    (document
      .querySelector(`[data-sidebar='content']`)
      ?.contains(
        document.elementFromPoint(
          targetRect.left + targetRect.width / 2,
          targetRect.top + targetRect.height / 2
        )
      ) ||
      document
        .querySelector(`[aria-label]`)
        ?.contains(
          document.elementFromPoint(
            targetRect.left + targetRect.width / 2,
            targetRect.top + targetRect.height / 2
          )
        ));

  // Force "top" position for floating bar elements
  if (isFloatingBarElement && position === "bottom") {
    position = "top";
  }

  switch (position) {
    case "top":
      return {
        bottom: `${window.innerHeight - targetRect.top + margin}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: "translateX(-50%)",
      };
    case "right":
      return {
        left: `${targetRect.right + margin}px`,
        top: `${targetRect.top + targetRect.height / 2}px`,
        transform: "translateY(-50%)",
      };
    case "bottom":
      return {
        top: `${targetRect.bottom + margin}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        right: `${window.innerWidth - targetRect.left + margin}px`,
        top: `${targetRect.top + targetRect.height / 2}px`,
        transform: "translateY(-50%)",
      };
    default:
      return {
        top: `${targetRect.bottom + margin}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: "translateX(-50%)",
      };
  }
}
