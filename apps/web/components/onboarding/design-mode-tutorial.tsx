"use client";

import React, { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useOnboarding } from "./onboarding-context";
import { designModeTutorial } from "./guided-tour";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";

export function DesignModeTutorial() {
  const { startTutorial, isActive } = useOnboarding();
  const { toggleDesignMode, isDesignMode } = useDesignMode();

  // Start the tutorial and activate design mode
  const handleStartTutorial = useCallback(() => {
    if (!isDesignMode) {
      toggleDesignMode();
    }

    // Then start the tutorial with a slight delay to allow design mode to initialize
    setTimeout(() => {
      startTutorial(designModeTutorial);
    }, 800);
  }, [isDesignMode, toggleDesignMode, startTutorial]);

  // If tutorial is active or design mode is already on, don't show the button
  if (isActive || isDesignMode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30"
    >
      <Button
        onClick={handleStartTutorial}
        className="rounded-full shadow-lg px-6 py-2 h-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0"
        size="lg"
      >
        <PlayCircle className="h-5 w-5 mr-2" />
        <span className="text-base">Try Interactive Demo</span>
        <Sparkles className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );
}
