"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "./onboarding-context";
import { ChevronRight } from "lucide-react";

type TutorialStepProps = {
  step: number;
  className?: string;
};

export function TutorialStep({ step, className }: TutorialStepProps) {
  const { currentStepData, nextStep, totalSteps, currentStep } =
    useOnboarding();
  const isLastStep = currentStep === totalSteps - 1;

  if (!currentStepData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg",
        className
      )}
    >
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-primary">
          {currentStepData.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {currentStepData.description}
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={nextStep} className="flex items-center">
          {isLastStep ? "Finish" : "Next"}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
