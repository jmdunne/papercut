"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";
import { cn } from "@/lib/utils";

/**
 * ElementPathBreadcrumb displays a breadcrumb navigation of the selected element's DOM path
 */
export function ElementPathBreadcrumb() {
  const { elementPath, setSelectedElement } = useDesignMode();
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if the breadcrumb is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      const { scrollWidth, clientWidth } = containerRef.current;
      setIsOverflowing(scrollWidth > clientWidth);

      // Auto-scroll to the end when a new element is selected
      if (scrollWidth > clientWidth) {
        containerRef.current.scrollLeft = scrollWidth;
        setScrollPosition(scrollWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [elementPath]);

  // Handle scroll left
  const scrollLeft = () => {
    if (!containerRef.current) return;
    const newPosition = Math.max(0, scrollPosition - 100);
    containerRef.current.scrollLeft = newPosition;
    setScrollPosition(newPosition);
  };

  // Handle scroll right
  const scrollRight = () => {
    if (!containerRef.current) return;
    const { scrollWidth, clientWidth } = containerRef.current;
    const newPosition = Math.min(
      scrollWidth - clientWidth,
      scrollPosition + 100
    );
    containerRef.current.scrollLeft = newPosition;
    setScrollPosition(newPosition);
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!containerRef.current) return;
    setScrollPosition(containerRef.current.scrollLeft);
  };

  if (elementPath.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center text-xs design-mode-ui"
      data-testid="element-path-breadcrumb"
    >
      {isOverflowing && scrollPosition > 0 && (
        <button
          onClick={scrollLeft}
          className="flex-shrink-0 p-1 hover:bg-muted rounded-full mr-1"
          aria-label="Scroll path left"
        >
          <ChevronsLeft className="h-3 w-3" />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex items-center overflow-x-auto scrollbar-hide"
        onScroll={handleScroll}
      >
        {elementPath.map((segment, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0 text-muted-foreground" />
            )}
            <button
              onClick={() => {
                // Find element with this id, or use data-testid
                const elementId = segment.id;
                if (elementId) {
                  setSelectedElement(elementId);
                }
              }}
              className={cn(
                "px-1.5 py-0.5 rounded whitespace-nowrap",
                "hover:bg-muted transition-colors",
                "flex items-center gap-1",
                index === elementPath.length - 1
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/70"
              )}
              data-testid={`path-segment-${index}`}
            >
              <span className="text-muted-foreground">{segment.tagName}</span>
              {segment.id && <span>#{segment.id}</span>}
            </button>
          </React.Fragment>
        ))}
      </div>

      {isOverflowing &&
        scrollPosition <
          (containerRef.current?.scrollWidth || 0) -
            (containerRef.current?.clientWidth || 0) -
            10 && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 p-1 hover:bg-muted rounded-full ml-1"
            aria-label="Scroll path right"
          >
            <ChevronsRight className="h-3 w-3" />
          </button>
        )}
    </div>
  );
}
