"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

/**
 * Floating Action Bar (FAB) component that appears at the bottom of the screen
 * when design mode is activated. Allows users to select different design tools.
 */
export function FloatingActionBar() {
  const { isDesignMode, activeTool, setActiveTool } = useDesignMode();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, width: 0 });

  // Animation configs
  const springConfig = {
    duration: 0.3,
    ease: "easeInOut",
  };

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
    { id: "responsive" as string, icon: Monitor, label: "Responsive" },
    { id: "help" as string, icon: HelpCircle, label: "Help" },
  ];

  // All tools combined
  const allTools = [...tools, ...optionalTools];

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
        if (isVisible && !isMinimized && !isAutoHidden) {
          setIsAutoHidden(true);
        }
      }, 2000); // Auto-hide after 2 seconds of inactivity
    };

    if (isDesignMode) {
      startAutoHideTimer();

      // Add event listener for mouse movement to reset the timer
      const handleMouseMove = () => {
        if (isAutoHidden) {
          setIsAutoHidden(false);
          startAutoHideTimer();
        } else if (isVisible && !isMinimized) {
          // Only restart the timer if we're visible and not minimized
          startAutoHideTimer();
        }
      };

      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isDesignMode, isVisible, isMinimized, isAutoHidden]);

  // Calculate tooltip position when tool is hovered
  useEffect(() => {
    if (
      hoveredTool !== null &&
      containerRef.current &&
      tooltipRef.current &&
      !isMinimized
    ) {
      const toolIndex = allTools.findIndex((tool) => tool.id === hoveredTool);
      if (toolIndex === -1) return;

      const barButtons = containerRef.current.querySelectorAll(".tool-button");
      if (!barButtons || barButtons.length === 0) return;

      const toolButton = barButtons[toolIndex] as HTMLElement;
      const barRect = containerRef.current.getBoundingClientRect();
      const buttonRect = toolButton.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Calculate the center position of the button relative to the bar
      const left =
        buttonRect.left -
        barRect.left +
        (buttonRect.width - tooltipRect.width) / 2;

      const newLeft = Math.max(
        0,
        Math.min(left, barRect.width - tooltipRect.width)
      );

      // Update position only if there's a significant change (more than 1px)
      // This prevents infinite update loops
      if (
        Math.abs(newLeft - tooltipPosition.left) > 1 ||
        Math.abs(tooltipRect.width - tooltipPosition.width) > 1
      ) {
        setTooltipPosition({
          left: newLeft,
          width: tooltipRect.width,
        });
      }
    }
    // Removing tooltipPosition from dependencies to break infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredTool, isMinimized, allTools]);

  // Handle tool selection
  const handleToolClick = (toolId: DesignModeTool) => {
    setActiveTool(toolId);
  };

  // If not in design mode, don't render the FAB
  if (!isDesignMode) {
    return null;
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: 20, opacity: 0 }}
      animate={{
        y: 0,
        opacity: isAutoHidden ? 0.4 : 1,
      }}
      exit={{ y: 20, opacity: 0 }}
      transition={springConfig}
      className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
        "transition-all duration-300"
      )}
      onMouseEnter={() => {
        if (isAutoHidden) {
          setIsAutoHidden(false);
        }
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
      }}
      onMouseLeave={() => {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
        // Only start auto-hide timer if not already auto-hidden
        if (!isAutoHidden) {
          autoHideTimerRef.current = setTimeout(() => {
            setIsAutoHidden(true);
          }, 2000);
        }
        setHoveredTool(null);
      }}
      data-testid="motion-div"
    >
      <div className="relative">
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredTool !== null && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={springConfig}
              className="absolute left-0 right-0 -top-[31px] pointer-events-none z-50"
            >
              <motion.div
                ref={tooltipRef}
                className={cn(
                  "px-3 py-1 rounded-lg inline-flex justify-center items-center overflow-hidden",
                  "bg-black/85 text-white backdrop-blur-sm",
                  "border border-white/10",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                )}
                initial={{ x: tooltipPosition.left }}
                animate={{ x: tooltipPosition.left }}
                transition={springConfig}
                style={{ width: "auto" }}
              >
                <p className="text-[13px] font-medium leading-tight whitespace-nowrap">
                  {allTools.find((tool) => tool.id === hoveredTool)?.label}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Bar */}
        <motion.div
          className={cn(
            "rounded-full",
            "backdrop-blur-lg shadow-lg",
            "border border-white/10",
            isMinimized ? "bg-black/80" : "bg-black/80"
          )}
          animate={{ height: isMinimized ? "40px" : "auto" }}
          transition={springConfig}
        >
          {isMinimized ? (
            // Minimized view
            <motion.button
              className="px-4 py-2 text-white flex items-center gap-2"
              onClick={() => setIsMinimized(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm font-medium">Design Mode</span>
              <ChevronUp className="h-4 w-4" />
            </motion.button>
          ) : (
            // Full view
            <div className="flex items-center px-3 py-2 gap-1">
              {/* Main tools */}
              {tools.map((tool) => (
                <motion.button
                  key={tool.id}
                  className={cn(
                    "tool-button h-9 w-9 rounded-full flex items-center justify-center",
                    "transition-colors duration-200",
                    activeTool === tool.id
                      ? "bg-primary text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  )}
                  onClick={() => handleToolClick(tool.id)}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </motion.button>
              ))}

              {/* Divider */}
              <div className="h-6 w-px bg-white/20 mx-1" />

              {/* Optional tools */}
              {optionalTools.map((tool) => (
                <motion.button
                  key={tool.id}
                  className="tool-button h-9 w-9 rounded-full bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center"
                  aria-label={tool.label}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tool.icon className="h-4 w-4" />
                </motion.button>
              ))}

              {/* Minimize button */}
              <motion.button
                className="h-9 w-9 rounded-full bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center ml-1"
                onClick={() => setIsMinimized(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Minimize"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
