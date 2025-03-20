"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type MotionProps } from "framer-motion";
import { useDesignMode } from "@/contexts/design-mode-context";
import {
  MousePointer,
  MoveHorizontal,
  Paintbrush,
  Sparkles,
  Clock,
  Monitor,
  ChevronUp,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesignModeTool } from "@/contexts/design-mode-context";

// Create properly typed motion components
type MotionDivProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;
const MotionDiv = motion.div as React.FC<MotionDivProps>;

type MotionButtonProps = MotionProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
const MotionButton = motion.button as React.FC<MotionButtonProps>;

/**
 * Floating Action Bar (FAB) component that appears at the bottom of the screen
 * when design mode is activated. Allows users to select different design tools.
 */
export function FloatingActionBar() {
  const { isDesignMode, activeTool, setActiveTool } = useDesignMode();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tool configuration
  const tools = [
    { id: "select" as DesignModeTool, icon: MousePointer, label: "Select" },
    {
      id: "move" as DesignModeTool,
      icon: MoveHorizontal,
      label: "Move/Resize",
    },
    { id: "style" as DesignModeTool, icon: Paintbrush, label: "Style" },
    { id: "ai" as DesignModeTool, icon: Sparkles, label: "AI Assistant" },
    { id: "history" as DesignModeTool, icon: Clock, label: "History" },
  ];

  // Optional tools
  const optionalTools = [
    { id: "responsive", icon: Monitor, label: "Responsive" },
    { id: "help", icon: HelpCircle, label: "Help" },
  ];

  // Show/hide the FAB based on design mode state
  useEffect(() => {
    setIsVisible(isDesignMode);
    setIsAutoHidden(false);

    if (!isDesignMode) {
      // Reset state when design mode is deactivated
      setIsMinimized(false);
    }
  }, [isDesignMode]);

  // Setup auto-hide behavior
  useEffect(() => {
    const startAutoHideTimer = () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }

      autoHideTimerRef.current = setTimeout(() => {
        if (isVisible && !isMinimized) {
          setIsAutoHidden(true);
        }
      }, 2000); // Auto-hide after 2 seconds of inactivity
    };

    if (isDesignMode) {
      startAutoHideTimer();

      // Add event listener for mouse movement to reset the timer
      const handleMouseMove = () => {
        setIsAutoHidden(false);
        startAutoHideTimer();
      };

      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isDesignMode, isVisible, isMinimized]);

  // Handle tool selection
  const handleToolClick = (toolId: DesignModeTool) => {
    setActiveTool(toolId);
  };

  // If not in design mode, don't render the FAB
  if (!isDesignMode) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionDiv
          ref={containerRef}
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: 0,
            opacity: isAutoHidden ? 0.4 : 1,
          }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
            "flex items-center",
            isMinimized
              ? "rounded-full bg-black/70"
              : "rounded-full bg-black/70",
            "backdrop-blur-md shadow-lg",
            "transition-opacity duration-300",
            isAutoHidden ? "hover:opacity-100" : ""
          )}
          onMouseEnter={() => setIsAutoHidden(false)}
        >
          {isMinimized ? (
            // Minimized view - just shows a pill
            <MotionButton
              className="p-2 text-white flex items-center space-x-1 px-4"
              onClick={() => setIsMinimized(false)}
            >
              <span className="text-sm">Design Mode</span>
              <ChevronUp className="h-4 w-4" />
            </MotionButton>
          ) : (
            // Full view - shows all tools
            <div className="flex items-center px-4 py-2 space-x-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    "transition-colors duration-200",
                    activeTool === tool.id
                      ? "bg-primary text-white"
                      : "bg-white/20 text-white/80 hover:bg-white/30"
                  )}
                  onClick={() => handleToolClick(tool.id)}
                  aria-label={tool.label}
                  title={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}

              <div className="h-4 w-px bg-white/20" />

              {optionalTools.map((tool) => (
                <button
                  key={tool.id}
                  className="h-8 w-8 rounded-full bg-white/20 text-white/80 hover:bg-white/30 flex items-center justify-center"
                  aria-label={tool.label}
                  title={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}

              <button
                className="h-8 w-8 rounded-full bg-white/10 text-white/80 hover:bg-white/20 flex items-center justify-center"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize"
                title="Minimize"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
