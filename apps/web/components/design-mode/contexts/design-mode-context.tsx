"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

// Define the types for our context
export type ElementProperties = {
  metadata: {
    id: string | null;
    className: string;
    tagName: string;
    testId: string | null;
  };
  dimensions: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  style: {
    typography: {
      fontSize: string;
      fontWeight: string;
      textAlign: string;
      lineHeight: string;
    };
    colors: {
      color: string;
      backgroundColor: string;
    };
    spacing: {
      margin: string;
      padding: string;
    };
  };
  content: {
    text?: string;
    html?: string;
    src?: string;
    href?: string;
  };
};

export type ElementPath = {
  id: string | null;
  tagName: string;
  index: number;
};

export type DesignTool =
  | "select"
  | "move"
  | "resize"
  | "text"
  | "image"
  | "shape";

export type DesignModeContextType = {
  isDesignMode: boolean;
  toggleDesignMode: () => void;
  selectedElement: string | null;
  setSelectedElement: (elementId: string | null) => void;
  elementProperties: ElementProperties | null;
  elementPath: ElementPath[];
  activeTool: DesignTool;
  setActiveTool: (tool: DesignTool) => void;
  selectedElementRef: React.MutableRefObject<HTMLElement | null>;
  updateElementProperty: (
    category: string,
    property: string,
    value: any
  ) => void;
  undoLastChange: () => void;
};

// Create the context with a default value
const DesignModeContext = createContext<DesignModeContextType | undefined>(
  undefined
);

/**
 * DesignModeProvider provides state and methods for design mode functionality.
 */
export function DesignModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementProperties, setElementProperties] =
    useState<ElementProperties | null>(null);
  const [elementPath, setElementPath] = useState<ElementPath[]>([]);
  const [activeTool, setActiveTool] = useState<DesignTool>("select");
  const selectedElementRef = useRef<HTMLElement | null>(null);
  const [history, setHistory] = useState<
    Array<{ property: string; category: string; oldValue: any; newValue: any }>
  >([]);

  const toggleDesignMode = useCallback(() => {
    setIsDesignMode((prev) => !prev);
    // Clear selection when toggling design mode off
    if (isDesignMode) {
      setSelectedElement(null);
    }
  }, [isDesignMode]);

  // Listen for Cmd+D / Ctrl+D keyboard shortcut to toggle design mode
  useKeyboardShortcut(["Meta", "d"], toggleDesignMode, {
    preventDefault: true,
  });

  useKeyboardShortcut(["Control", "d"], toggleDesignMode, {
    preventDefault: true,
  });

  // Listen for escape key to deselect element
  useKeyboardShortcut(
    ["Escape"],
    () => {
      if (isDesignMode && selectedElement) {
        setSelectedElement(null);
      }
    },
    { preventDefault: false }
  );

  // Update element properties when a new element is selected
  useEffect(() => {
    if (!selectedElement || !isDesignMode) {
      setElementProperties(null);
      setElementPath([]);
      selectedElementRef.current = null;
      return;
    }

    // Get the selected element from the DOM
    const element = document.getElementById(selectedElement);
    if (!element) {
      console.warn(
        `Selected element with ID "${selectedElement}" not found in DOM`
      );
      return;
    }

    // Store a reference to the element
    selectedElementRef.current = element;

    // Get computed styles
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    // Extract properties from element
    const properties: ElementProperties = {
      metadata: {
        id: element.id || null,
        className: element.className,
        tagName: element.tagName.toLowerCase(),
        testId: element.getAttribute("data-testid") || null,
      },
      dimensions: {
        width: rect.width,
        height: rect.height,
        x: rect.left,
        y: rect.top,
      },
      style: {
        typography: {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          textAlign: styles.textAlign,
          lineHeight: styles.lineHeight,
        },
        colors: {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
        },
        spacing: {
          margin: styles.margin,
          padding: styles.padding,
        },
      },
      content: {
        text: element.textContent || undefined,
        html: element.innerHTML || undefined,
        src:
          element.tagName === "IMG"
            ? (element as HTMLImageElement).src
            : undefined,
        href:
          element.tagName === "A"
            ? (element as HTMLAnchorElement).href
            : undefined,
      },
    };

    setElementProperties(properties);
    console.log("Element properties updated:", properties);

    // Generate element path
    const path: ElementPath[] = [];
    let currentElement: HTMLElement | null = element;
    let index = 0;

    while (currentElement && currentElement.tagName !== "BODY") {
      path.unshift({
        id: currentElement.id || null,
        tagName: currentElement.tagName.toLowerCase(),
        index,
      });
      currentElement = currentElement.parentElement;
      index++;
    }

    setElementPath(path);
    console.log("Element path updated:", path);

    // Setup a mutation observer to track changes to the element
    const observer = new MutationObserver(() => {
      // Re-calculate properties when the element changes
      setSelectedElement(selectedElement);
    });

    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedElement, isDesignMode]);

  // Update an element property
  const updateElementProperty = useCallback(
    (category: string, property: string, value: any) => {
      if (
        !selectedElement ||
        !selectedElementRef.current ||
        !elementProperties
      ) {
        console.warn("Cannot update property: no element selected");
        return;
      }

      // Get the current element
      const element = selectedElementRef.current;

      // Store the old value for history
      let oldValue: any;

      // Update based on the category and property
      if (category === "style") {
        // Deep clone to avoid state mutation
        const newProperties = { ...elementProperties };

        // Handle nested properties like style.typography.fontSize
        const [subcategory, prop] = property.split(".");

        if (subcategory === "typography" && prop) {
          // Type-safe access for typography properties
          if (
            prop === "fontSize" ||
            prop === "fontWeight" ||
            prop === "textAlign" ||
            prop === "lineHeight"
          ) {
            oldValue = newProperties.style.typography[prop];
            newProperties.style.typography[prop] = value;

            // Apply the change to the DOM element
            element.style[prop as any] = value;
          }
        } else if (subcategory === "colors" && prop) {
          // Type-safe access for color properties
          if (prop === "color" || prop === "backgroundColor") {
            oldValue = newProperties.style.colors[prop];
            newProperties.style.colors[prop] = value;

            // Apply the change to the DOM element
            element.style[prop] = value;
          }
        } else if (subcategory === "spacing" && prop) {
          // Type-safe access for spacing properties
          if (prop === "margin" || prop === "padding") {
            oldValue = newProperties.style.spacing[prop];
            newProperties.style.spacing[prop] = value;

            // Apply the change to the DOM element
            element.style[prop] = value;
          }
        }

        // Update the element properties in state
        setElementProperties(newProperties);
      } else if (category === "content") {
        // Clone properties
        const newProperties = { ...elementProperties };

        // Type-safe access for content properties
        if (property === "text") {
          oldValue = newProperties.content.text;
          newProperties.content.text = value;

          // Apply content changes to the DOM
          if (element.textContent !== value) {
            element.textContent = value;
          }
        } else if (property === "html") {
          oldValue = newProperties.content.html;
          newProperties.content.html = value;
          element.innerHTML = value;
        } else if (property === "src" && element instanceof HTMLImageElement) {
          oldValue = newProperties.content.src;
          newProperties.content.src = value;
          element.src = value;
        } else if (
          property === "href" &&
          element instanceof HTMLAnchorElement
        ) {
          oldValue = newProperties.content.href;
          newProperties.content.href = value;
          element.href = value;
        }

        // Update state
        setElementProperties(newProperties);
      }

      // Add to history
      setHistory((prev) => [
        ...prev,
        {
          category,
          property,
          oldValue,
          newValue: value,
        },
      ]);
    },
    [selectedElement, selectedElementRef, elementProperties]
  );

  // Undo the last change
  const undoLastChange = useCallback(() => {
    if (history.length === 0) {
      console.log("No changes to undo");
      return;
    }

    // Get the last change
    const lastChange = history[history.length - 1];

    // Apply the reverse change
    updateElementProperty(
      lastChange.category,
      lastChange.property,
      lastChange.oldValue
    );

    // Remove the last change from history to avoid infinite loops
    setHistory((prev) => prev.slice(0, -1));
  }, [history, updateElementProperty]);

  const value = {
    isDesignMode,
    toggleDesignMode,
    selectedElement,
    setSelectedElement,
    elementProperties,
    elementPath,
    activeTool,
    setActiveTool,
    selectedElementRef,
    updateElementProperty,
    undoLastChange,
  };

  return (
    <DesignModeContext.Provider value={value}>
      {children}
    </DesignModeContext.Provider>
  );
}

/**
 * Hook to use the design mode context
 */
export function useDesignMode() {
  const context = useContext(DesignModeContext);
  if (context === undefined) {
    throw new Error("useDesignMode must be used within a DesignModeProvider");
  }
  return context;
}
