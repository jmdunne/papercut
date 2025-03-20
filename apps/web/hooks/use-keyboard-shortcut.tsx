"use client";

import { useEffect, useRef } from "react";

/**
 * A hook that listens for keyboard shortcuts and triggers a callback when the specified keys are pressed
 *
 * @param keys - Array of keys that need to be pressed together (e.g., ["Meta", "d"] for Cmd+D / Ctrl+D)
 * @param callback - Function to call when the specified keys are pressed
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void
): void {
  // Use a ref to track currently pressed keys
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Handler for keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Add the pressed key to our set
      pressedKeys.current.add(event.key);

      // Check if all required keys are pressed
      const allKeysPressed = keys.every((key) => pressedKeys.current.has(key));

      // If all required keys are pressed, trigger the callback
      if (allKeysPressed) {
        callback();
      }
    };

    // Handler for keyup events
    const handleKeyUp = (event: KeyboardEvent) => {
      // Remove the released key from our set
      pressedKeys.current.delete(event.key);
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      // Clear the pressed keys set when the component unmounts
      pressedKeys.current.clear();
    };
  }, [keys, callback]);
}
