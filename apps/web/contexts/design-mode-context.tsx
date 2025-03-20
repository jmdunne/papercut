"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

// Define the available design mode tools
export type DesignModeTool = "select" | "move" | "style" | "ai" | "history";

type DesignModeContextType = {
  // Design mode state
  isDesignMode: boolean;
  toggleDesignMode: () => void;
  activateDesignMode: () => void;
  deactivateDesignMode: () => void;

  // Element selection
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;

  // Active tool
  activeTool: DesignModeTool;
  setActiveTool: (tool: DesignModeTool) => void;

  // History
  history: any[]; // We'll define a proper type later
  addToHistory: (change: any) => void;
  undoLastChange: () => void;

  // Active breakpoint for responsive design
  activeBreakpoint: string;
  setActiveBreakpoint: (breakpoint: string) => void;
};

const DesignModeContext = createContext<DesignModeContextType | undefined>(
  undefined
);

export function DesignModeProvider({ children }: { children: ReactNode }) {
  // Design mode state
  const [isDesignMode, setIsDesignMode] = useState(false);

  // Element selection
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Active tool
  const [activeTool, setActiveTool] = useState<DesignModeTool>("select");

  // History
  const [history, setHistory] = useState<any[]>([]);

  // Active breakpoint
  const [activeBreakpoint, setActiveBreakpoint] = useState<string>("desktop");

  // Design mode toggle functions
  const toggleDesignMode = useCallback(
    () => setIsDesignMode((prev) => !prev),
    []
  );

  const activateDesignMode = useCallback(() => {
    setIsDesignMode(true);
    setActiveTool("select"); // Reset to select tool when entering design mode
  }, []);

  const deactivateDesignMode = useCallback(() => {
    setIsDesignMode(false);
    setSelectedElement(null);
  }, []);

  // History functions
  const addToHistory = useCallback((change: any) => {
    setHistory((prev) => [...prev, change]);
  }, []);

  const undoLastChange = useCallback(() => {
    setHistory((prev) => prev.slice(0, -1));
  }, []);

  // Setup keyboard shortcut for toggling design mode (Cmd+D / Ctrl+D)
  useKeyboardShortcut(["Meta", "d"], toggleDesignMode);

  // Also support Ctrl+D for Windows users
  useKeyboardShortcut(["Control", "d"], toggleDesignMode);

  // Prevent the browser's default save dialog when Cmd+D/Ctrl+D is pressed
  useEffect(() => {
    const preventDefaultSave = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventDefaultSave);

    return () => {
      window.removeEventListener("keydown", preventDefaultSave);
    };
  }, []);

  return (
    <DesignModeContext.Provider
      value={{
        isDesignMode,
        toggleDesignMode,
        activateDesignMode,
        deactivateDesignMode,
        selectedElement,
        setSelectedElement,
        activeTool,
        setActiveTool,
        history,
        addToHistory,
        undoLastChange,
        activeBreakpoint,
        setActiveBreakpoint,
      }}
    >
      {children}
    </DesignModeContext.Provider>
  );
}

export function useDesignMode() {
  const context = useContext(DesignModeContext);
  if (context === undefined) {
    throw new Error("useDesignMode must be used within a DesignModeProvider");
  }
  return context;
}
