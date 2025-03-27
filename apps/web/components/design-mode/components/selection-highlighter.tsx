"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants";

/**
 * SelectionHighlighter displays a highlight box around the selected element
 * and provides resize handles.
 */
export function SelectionHighlighter() {
  const { isDesignMode, selectedElement, selectedElementRef } = useDesignMode();
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  // Update highlighter position based on selected element
  useEffect(() => {
    if (!isDesignMode || !selectedElement) {
      setIsVisible(false);
      return;
    }

    // Get the DOM element using the selected element ID
    const element =
      selectedElementRef.current || document.getElementById(selectedElement);
    if (!element) {
      console.warn(
        `Selected element with ID "${selectedElement}" not found in DOM`
      );
      setIsVisible(false);
      return;
    }

    // Function to update the highlighter position
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();

      // Set position state
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      setIsVisible(true);
    };

    // Update position immediately
    updatePosition();

    // Set up a resize observer to update position when element dimensions change
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      updatePosition();
    });

    resizeObserverRef.current.observe(element);

    // Listen for scroll events to update the position
    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    // Cleanup function
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isDesignMode, selectedElement, selectedElementRef]);

  // Don't render if we're not in design mode, no element is selected, or position is not calculated
  if (!isDesignMode || !isVisible) {
    return null;
  }

  // Render the highlighter with resize handles
  return (
    <div
      ref={highlighterRef}
      data-testid="selection-highlighter"
      className="fixed z-[9999] pointer-events-none design-mode-ui"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        zIndex: Z_INDEX.SELECTION_OVERLAY,
      }}
    >
      {/* Highlight border */}
      <div
        className={cn(
          "absolute inset-0 border-2 border-primary rounded-sm",
          "shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
        )}
      />

      {/* Resize handles */}
      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full" />
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full" />
      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full" />
      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full" />

      {/* Middle handles */}
      <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-primary rounded-full transform -translate-y-1/2" />
      <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-primary rounded-full transform -translate-y-1/2" />
      <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2" />
      <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2" />
    </div>
  );
}
