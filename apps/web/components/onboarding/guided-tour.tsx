"use client";

import React, { useEffect } from "react";
import { useOnboarding, TutorialConfig } from "./onboarding-context";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

// Define the design mode tutorial
export const designModeTutorial: TutorialConfig = {
  steps: [
    {
      id: "welcome",
      title: "Welcome to Design Mode",
      description:
        "Let's learn how to edit your website directly in the browser. Get ready to create something amazing!",
      position: "bottom",
    },
    {
      id: "floating-bar",
      title: "Floating Action Bar",
      description:
        "This is your toolbox. It contains all the tools you need to edit your website.",
      target: "[data-sidebar='content']",
      position: "top",
    },
    {
      id: "select-tool",
      title: "Selection Tool",
      description:
        "Use this tool to select any element on the page that you want to edit.",
      target: "[aria-label='Select']",
      position: "top",
      tool: "select",
    },
    {
      id: "move-tool",
      title: "Move/Resize Tool",
      description:
        "This tool allows you to move elements around or resize them exactly how you want.",
      target: "[aria-label='Move/Resize']",
      position: "top",
      tool: "move",
    },
    {
      id: "style-tool",
      title: "Style Tool",
      description:
        "Change colors, fonts, spacing, and other visual properties with this tool.",
      target: "[aria-label='Style']",
      position: "top",
      tool: "style",
    },
    {
      id: "ai-tool",
      title: "AI Assistant",
      description:
        "Get smart suggestions and generate content with our AI assistant.",
      target: "[aria-label='AI Assistant']",
      position: "top",
      tool: "ai",
    },
    {
      id: "history-tool",
      title: "History Tool",
      description:
        "Made a mistake? No problem! You can undo and redo changes with this tool.",
      target: "[aria-label='History']",
      position: "top",
      tool: "history",
    },
    {
      id: "properties-panel",
      title: "Properties Panel",
      description:
        "When you select an element, this panel appears showing all its properties that you can edit.",
      target: ".properties-panel",
      position: "left",
    },
    {
      id: "try-it",
      title: "Try It Yourself",
      description:
        "Select an element on the page and try changing its properties. You can see the changes in real-time!",
      position: "bottom",
    },
    {
      id: "completion",
      title: "You're Ready to Design!",
      description:
        "You've completed the tutorial! Now you have the tools to make your website look exactly how you want it.",
      position: "bottom",
    },
  ],
  autoAdvance: false,
  skipEnabled: true,
  showProgress: true,
};

// Define the website editing tutorial
export const websiteEditingTutorial: TutorialConfig = {
  steps: [
    {
      id: "welcome",
      title: "Let's Edit Your Website",
      description:
        "This tour will show you how easy it is to edit your website content directly in the browser.",
      position: "bottom",
    },
    {
      id: "select-heading",
      title: "Select a Heading",
      description: "Click on any heading text to select it for editing.",
      target: "h1, h2, h3",
      position: "bottom",
      tool: "select",
    },
    {
      id: "edit-text",
      title: "Edit the Text",
      description:
        "Double-click the selected heading to edit the text directly.",
      target: "h1, h2, h3",
      position: "bottom",
    },
    {
      id: "change-styles",
      title: "Change Styles",
      description:
        "With the heading selected, click the Style tool to change its appearance.",
      target: "[aria-label='Style']",
      position: "top",
      tool: "style",
    },
    {
      id: "try-other-elements",
      title: "Try Other Elements",
      description:
        "Now try selecting other elements like images, buttons, or paragraphs.",
      position: "bottom",
    },
    {
      id: "save-changes",
      title: "Save Your Changes",
      description:
        "When you're done, your changes will be automatically saved.",
      position: "bottom",
    },
    {
      id: "completion",
      title: "You've Got This!",
      description:
        "You now know how to edit your website content. Feel free to explore and make more changes!",
      position: "bottom",
    },
  ],
  autoAdvance: false,
  skipEnabled: true,
  showProgress: true,
};

type GuidedTourProps = {
  tourType?: "designMode" | "websiteEditing";
  autoStart?: boolean;
};

export function GuidedTour({
  tourType = "designMode",
  autoStart = false,
}: GuidedTourProps) {
  const { startTutorial, isActive } = useOnboarding();

  // Determine which tutorial to use
  const tutorial =
    tourType === "designMode" ? designModeTutorial : websiteEditingTutorial;

  // Auto-start the tutorial if enabled
  useEffect(() => {
    if (autoStart && !isActive) {
      startTutorial(tutorial);
    }
  }, [autoStart, isActive, startTutorial, tutorial]);

  if (isActive) {
    return null; // Don't show start button if tour is already active
  }

  return (
    <Button onClick={() => startTutorial(tutorial)} size="sm" className="gap-2">
      <PlayCircle className="h-4 w-4" />
      {tourType === "designMode" ? "Design Mode Tour" : "Editing Tour"}
    </Button>
  );
}
