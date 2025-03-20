"use client";

import { useState, useEffect } from "react";
import { motion, type MotionProps, AnimatePresence } from "framer-motion";
import { useDesignMode } from "@/contexts/design-mode-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Create properly typed motion component
type MotionDivProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;
const MotionDiv = motion.div as React.FC<MotionDivProps>;

export function WelcomeMessage() {
  const { isDesignMode } = useDesignMode();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isDesignMode) {
      // Show welcome message after the transition animation
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 1800);

      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [isDesignMode]);

  const handleDismiss = () => {
    setShowMessage(false);
  };

  return (
    <AnimatePresence>
      {showMessage && (
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-10 z-50 flex justify-center items-center"
        >
          <div className="bg-black/80 backdrop-blur-lg border border-primary/20 rounded-lg shadow-lg p-4 text-white max-w-md mx-auto">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-primary">
                Welcome to Design Mode!
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-6 w-6 -mt-1 -mr-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm mb-3">
              You can now edit any element on this page. Click on an element to
              select it, or double-click text to edit it directly.
            </p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/10"
                onClick={handleDismiss}
              >
                Got it
              </Button>
            </div>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
