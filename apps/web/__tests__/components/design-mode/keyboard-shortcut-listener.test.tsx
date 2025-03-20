import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { KeyboardShortcutListener } from "@/components/design-mode/keyboard-shortcut-listener";
import { useDesignMode } from "@/contexts/design-mode-context";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

// Mock the dependencies
jest.mock("@/contexts/design-mode-context", () => ({
  useDesignMode: jest.fn(),
}));

jest.mock("@/hooks/use-keyboard-shortcut", () => ({
  useKeyboardShortcut: jest.fn(),
}));

describe("KeyboardShortcutListener", () => {
  // Mock implementation values
  const mockToggleDesignMode = jest.fn();
  const mockUndoLastChange = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock implementations
    (useDesignMode as jest.Mock).mockReturnValue({
      toggleDesignMode: mockToggleDesignMode,
      isDesignMode: true,
      undoLastChange: mockUndoLastChange,
    });
  });

  test("registers keyboard shortcuts for design mode toggle (Meta+D and Control+D)", () => {
    render(<KeyboardShortcutListener />);

    // Check if useKeyboardShortcut was called with the correct parameters for Meta+D
    expect(useKeyboardShortcut).toHaveBeenCalledWith(
      ["Meta", "d"],
      mockToggleDesignMode
    );

    // Check if useKeyboardShortcut was called with the correct parameters for Control+D
    expect(useKeyboardShortcut).toHaveBeenCalledWith(
      ["Control", "d"],
      mockToggleDesignMode
    );
  });

  test("registers keyboard shortcuts for undo (Meta+Z and Control+Z)", () => {
    render(<KeyboardShortcutListener />);

    // Extract the callback functions passed to useKeyboardShortcut for Meta+Z and Control+Z
    const callsToUseKeyboardShortcut = (useKeyboardShortcut as jest.Mock).mock
      .calls;

    // Find the call for Meta+Z
    const metaZCallback = callsToUseKeyboardShortcut.find(
      (call) => call[0][0] === "Meta" && call[0][1] === "z"
    )?.[1];

    // Find the call for Control+Z
    const controlZCallback = callsToUseKeyboardShortcut.find(
      (call) => call[0][0] === "Control" && call[0][1] === "z"
    )?.[1];

    // Verify callbacks exist
    expect(metaZCallback).toBeDefined();
    expect(controlZCallback).toBeDefined();

    // Call the callbacks to verify they trigger undoLastChange when in design mode
    if (metaZCallback) metaZCallback();
    if (controlZCallback) controlZCallback();

    // Since isDesignMode is true, undoLastChange should be called twice
    expect(mockUndoLastChange).toHaveBeenCalledTimes(2);
  });

  test("does not call undoLastChange when not in design mode", () => {
    // Update the mock to set isDesignMode to false
    (useDesignMode as jest.Mock).mockReturnValue({
      toggleDesignMode: mockToggleDesignMode,
      isDesignMode: false,
      undoLastChange: mockUndoLastChange,
    });

    render(<KeyboardShortcutListener />);

    // Extract the callback functions passed to useKeyboardShortcut for Meta+Z and Control+Z
    const callsToUseKeyboardShortcut = (useKeyboardShortcut as jest.Mock).mock
      .calls;

    // Find the call for Meta+Z
    const metaZCallback = callsToUseKeyboardShortcut.find(
      (call) => call[0][0] === "Meta" && call[0][1] === "z"
    )?.[1];

    // Find the call for Control+Z
    const controlZCallback = callsToUseKeyboardShortcut.find(
      (call) => call[0][0] === "Control" && call[0][1] === "z"
    )?.[1];

    // Call the callbacks to verify they don't trigger undoLastChange when not in design mode
    if (metaZCallback) metaZCallback();
    if (controlZCallback) controlZCallback();

    // Since isDesignMode is false, undoLastChange should not be called
    expect(mockUndoLastChange).not.toHaveBeenCalled();
  });

  test("does not render any visible elements", () => {
    const { container } = render(<KeyboardShortcutListener />);
    expect(container.firstChild).toBeNull();
  });
});
