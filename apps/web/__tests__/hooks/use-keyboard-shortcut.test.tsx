import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { fireEvent } from "@testing-library/react";

// Mock the window object to simulate keyboard events
const mockAddEventListener = jest.spyOn(window, "addEventListener");
const mockRemoveEventListener = jest.spyOn(window, "removeEventListener");

describe("useKeyboardShortcut", () => {
  // Create a mock for the window event listeners
  let eventMap: Record<string, EventListener> = {};

  // Mock window.addEventListener and window.removeEventListener
  beforeEach(() => {
    eventMap = {};

    window.addEventListener = jest.fn((event, callback) => {
      eventMap[event] = callback as EventListener;
    });

    window.removeEventListener = jest.fn((event, callback) => {
      const isCallbackRegistered = eventMap[event] === callback;
      if (isCallbackRegistered) {
        delete eventMap[event];
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("calls callback when shortcut keys are pressed", () => {
    const callback = jest.fn();
    const keys = ["Meta", "d"]; // Cmd+D / Ctrl+D

    renderHook(() => useKeyboardShortcut(keys, callback));

    // Simulate key down events for Cmd+D
    const metaKeyDownEvent = new KeyboardEvent("keydown", {
      key: "Meta",
      metaKey: true,
    });
    const dKeyDownEvent = new KeyboardEvent("keydown", {
      key: "d",
      metaKey: true,
    });

    // Get the keydown event handler
    const keydownHandler = mockAddEventListener.mock.calls.find(
      ([eventType]) => eventType === "keydown"
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Simulate pressing the Meta key
    act(() => {
      keydownHandler(metaKeyDownEvent);
    });

    // Callback should not be triggered yet
    expect(callback).not.toHaveBeenCalled();

    // Simulate pressing the D key while Meta is still down
    act(() => {
      keydownHandler(dKeyDownEvent);
    });

    // Now the callback should be triggered
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("does not call callback when different keys are pressed", () => {
    const callback = jest.fn();
    const keys = ["Meta", "d"]; // Cmd+D / Ctrl+D

    renderHook(() => useKeyboardShortcut(keys, callback));

    // Simulate key down events for Alt+F
    const altKeyDownEvent = new KeyboardEvent("keydown", {
      key: "Alt",
      altKey: true,
    });
    const fKeyDownEvent = new KeyboardEvent("keydown", {
      key: "f",
      altKey: true,
    });

    // Get the keydown event handler
    const keydownHandler = mockAddEventListener.mock.calls.find(
      ([eventType]) => eventType === "keydown"
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Simulate pressing the Alt key
    act(() => {
      keydownHandler(altKeyDownEvent);
    });

    // Simulate pressing the F key while Alt is still down
    act(() => {
      keydownHandler(fKeyDownEvent);
    });

    // Callback should not be triggered
    expect(callback).not.toHaveBeenCalled();
  });

  test("adds event listeners on mount and removes on unmount", () => {
    const callback = jest.fn();
    const keys = ["Meta", "d"];

    const { unmount } = renderHook(() => useKeyboardShortcut(keys, callback));

    // Check that addEventListener was called for both keydown and keyup
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function)
    );

    // Unmount the hook
    unmount();

    // Check that removeEventListener was called for both keydown and keyup
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function)
    );
  });

  test("resets pressed keys when component unmounts", () => {
    const callback = jest.fn();
    const keys = ["Meta", "d"];

    const { unmount } = renderHook(() => useKeyboardShortcut(keys, callback));

    // Get the keydown event handler
    const keydownHandler = mockAddEventListener.mock.calls.find(
      ([eventType]) => eventType === "keydown"
    )?.[1] as EventListener;

    // Get the keyup event handler
    const keyupHandler = mockAddEventListener.mock.calls.find(
      ([eventType]) => eventType === "keyup"
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();
    expect(keyupHandler).toBeDefined();

    // Simulate pressing the Meta key
    act(() => {
      keydownHandler(
        new KeyboardEvent("keydown", { key: "Meta", metaKey: true })
      );
    });

    // Unmount the hook
    unmount();

    // Simulate pressing the D key
    act(() => {
      keydownHandler(new KeyboardEvent("keydown", { key: "d", metaKey: true }));
    });

    // Callback should not be triggered since the hook was unmounted
    expect(callback).not.toHaveBeenCalled();
  });

  test("calls callback when all specified keys are pressed", () => {
    const callback = jest.fn();
    const keys = ["Meta", "d"];

    // Render the hook
    renderHook(() => useKeyboardShortcut(keys, callback));

    // Simulate pressing Meta key
    fireEvent.keyDown(window, { key: "Meta" });

    // Callback should not be called yet since we haven't pressed all required keys
    expect(callback).not.toHaveBeenCalled();

    // Simulate pressing 'd' key while Meta is still pressed
    fireEvent.keyDown(window, { key: "d" });

    // Callback should now be called since all required keys are pressed
    expect(callback).toHaveBeenCalledTimes(1);

    // Simulate releasing the keys
    fireEvent.keyUp(window, { key: "Meta" });
    fireEvent.keyUp(window, { key: "d" });
  });

  test("does not call callback when not all keys are pressed", () => {
    const callback = jest.fn();
    const keys = ["Control", "z"];

    // Render the hook
    renderHook(() => useKeyboardShortcut(keys, callback));

    // Simulate pressing only Control key
    fireEvent.keyDown(window, { key: "Control" });

    // Callback should not be called since we haven't pressed all required keys
    expect(callback).not.toHaveBeenCalled();

    // Simulate pressing a different key while Control is still pressed
    fireEvent.keyDown(window, { key: "x" });

    // Callback should still not be called
    expect(callback).not.toHaveBeenCalled();
  });

  test("calls callback again after keys are released and pressed again", () => {
    const callback = jest.fn();
    const keys = ["Meta", "z"];

    // Render the hook
    renderHook(() => useKeyboardShortcut(keys, callback));

    // First key combination
    fireEvent.keyDown(window, { key: "Meta" });
    fireEvent.keyDown(window, { key: "z" });

    // Callback should be called
    expect(callback).toHaveBeenCalledTimes(1);

    // Release keys
    fireEvent.keyUp(window, { key: "Meta" });
    fireEvent.keyUp(window, { key: "z" });

    // Press again
    fireEvent.keyDown(window, { key: "Meta" });
    fireEvent.keyDown(window, { key: "z" });

    // Callback should be called again
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("handles multiple key combinations", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    // Render two hooks with different key combinations
    renderHook(() => useKeyboardShortcut(["Meta", "d"], callback1));
    renderHook(() => useKeyboardShortcut(["Control", "z"], callback2));

    // Trigger first combination
    fireEvent.keyDown(window, { key: "Meta" });
    fireEvent.keyDown(window, { key: "d" });

    // Only first callback should be called
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Release keys
    fireEvent.keyUp(window, { key: "Meta" });
    fireEvent.keyUp(window, { key: "d" });

    // Trigger second combination
    fireEvent.keyDown(window, { key: "Control" });
    fireEvent.keyDown(window, { key: "z" });

    // Now second callback should be called
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test("cleans up event listeners on unmount", () => {
    const callback = jest.fn();

    // Render the hook and get the unmount function
    const { unmount } = renderHook(() =>
      useKeyboardShortcut(["Meta", "d"], callback)
    );

    // Check that event listeners were added
    expect(window.addEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function)
    );

    // Unmount the hook
    unmount();

    // Check that event listeners were removed
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function)
    );
  });
});
