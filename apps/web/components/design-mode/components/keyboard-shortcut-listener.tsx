"use client";

import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

/**
 * KeyboardShortcutListener is a component that listens for keyboard shortcuts
 * and triggers appropriate actions in the design mode context.
 *
 * This component doesn't render anything visible - it just sets up event listeners.
 */
export function KeyboardShortcutListener() {
  const { toggleDesignMode, isDesignMode, undoLastChange } = useDesignMode();

  // Cmd+D / Ctrl+D to toggle design mode
  // Note: The actual listeners are in the DesignModeContext, but we add this for completeness
  useKeyboardShortcut(["Meta", "d"], toggleDesignMode);
  useKeyboardShortcut(["Control", "d"], toggleDesignMode);

  // Cmd+Z / Ctrl+Z to undo last change (only when in design mode)
  useKeyboardShortcut(["Meta", "z"], () => {
    if (isDesignMode) {
      undoLastChange();
    }
  });

  useKeyboardShortcut(["Control", "z"], () => {
    if (isDesignMode) {
      undoLastChange();
    }
  });

  // This component doesn't render anything
  return null;
}
