"use client";

import { useEffect } from "react";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";

/**
 * ElementSelectionHandler adds click event listeners to the document
 * to handle element selection when in design mode.
 */
export function ElementSelectionHandler() {
  const { isDesignMode, activeTool, setSelectedElement } = useDesignMode();

  useEffect(() => {
    if (!isDesignMode) return;

    // Only handle element selection when the select tool is active
    if (activeTool !== "select") return;

    const handleElementSelection = (e: MouseEvent) => {
      // Find the target element
      let target = e.target as HTMLElement;

      // Skip selection of the selection highlighter itself and other UI elements
      if (
        target.closest("[data-testid='selection-highlighter']") ||
        target.closest("[data-testid='inspector-panel']") ||
        target.closest("[data-testid='motion-div']") || // This is the Floating Action Bar
        target.closest("[data-testid='breadcrumb-separator']") ||
        target.closest("[data-testid='welcome-message']") ||
        // Onboarding components
        target.closest("[data-testid='onboarding-overlay']") ||
        target.closest("[data-testid='guided-tour']") ||
        target.closest("[data-testid='tutorial-step']") ||
        target.closest("[data-testid='progress-indicator']") ||
        target.closest("[data-testid='completion-celebration']") ||
        target.closest("[data-testid='tool-highlighter']") ||
        // Any element with design-mode-ui class
        target.closest(".design-mode-ui")
      ) {
        return;
      }

      // Prevent default to avoid triggering links, buttons, etc.
      e.preventDefault();
      e.stopPropagation();

      // Get element ID or data-testid
      const elementId = target.id || target.getAttribute("data-testid");

      // If element has no ID, traverse up to find nearest element with ID
      if (!elementId) {
        let currentElement: HTMLElement | null = target;
        let depth = 0;

        while (currentElement && depth < 10) {
          // Limit search depth
          const currentId =
            currentElement.id || currentElement.getAttribute("data-testid");
          if (currentId) {
            console.log("Selected element:", currentId);
            setSelectedElement(currentId);
            return;
          }

          // If no ID found but has a meaningful tag, use it with a generated ID
          if (
            currentElement.tagName &&
            [
              "DIV",
              "SECTION",
              "HEADER",
              "FOOTER",
              "MAIN",
              "ARTICLE",
              "NAV",
              "ASIDE",
            ].includes(currentElement.tagName)
          ) {
            const generatedId = `${currentElement.tagName.toLowerCase()}-${Date.now()}`;
            currentElement.id = generatedId;
            console.log("Generated ID for element:", generatedId);
            setSelectedElement(generatedId);
            return;
          }

          currentElement = currentElement.parentElement;
          depth++;
        }

        // If we reach here, no suitable element was found
        console.log("No selectable element found");
      } else {
        console.log("Selected element with ID:", elementId);
        setSelectedElement(elementId);
      }
    };

    // Attach document listeners with capture to get events before they reach other handlers
    document.addEventListener("click", handleElementSelection, {
      capture: true,
    });

    return () => {
      document.removeEventListener("click", handleElementSelection, {
        capture: true,
      });
    };
  }, [isDesignMode, activeTool, setSelectedElement]);

  // This component doesn't render anything visible
  return null;
}
