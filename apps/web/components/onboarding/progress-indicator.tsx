"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  const [timeRemainingText, setTimeRemainingText] = useState("Calculating...");

  // Calculate progress percentage
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Move time calculations to useEffect to run only on client
  useEffect(() => {
    // Calculate estimated time remaining (4m left)
    const stepsRemaining = totalSteps - currentStep - 1;
    const timePerStep = 30; // seconds per step (estimated)
    const timeRemainingSeconds = stepsRemaining * timePerStep;

    let text = "";
    if (timeRemainingSeconds > 60) {
      const minutes = Math.ceil(timeRemainingSeconds / 60);
      text = `${minutes}m left`;
    } else if (timeRemainingSeconds > 0) {
      text = `${timeRemainingSeconds}s left`;
    } else {
      text = "Almost done!";
    }

    setTimeRemainingText(text);
  }, [currentStep, totalSteps]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <div>
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div>{timeRemainingText}</div>
      </div>

      <div className="w-full h-1 bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === currentStep
                ? "bg-primary"
                : i < currentStep
                  ? "bg-primary/50"
                  : "bg-muted/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}
