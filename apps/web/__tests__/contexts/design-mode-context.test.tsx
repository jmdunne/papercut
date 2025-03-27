import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// Test component that uses the DesignModeContext
function TestComponent() {
  const {
    isDesignMode,
    toggleDesignMode,
    selectedElement,
    setSelectedElement,
  } = useDesignMode();

  return (
    <div>
      <div data-testid="design-mode-status">
        {isDesignMode ? "true" : "false"}
      </div>
      <div data-testid="selected-element">{selectedElement || "none"}</div>
      <button data-testid="toggle-btn" onClick={toggleDesignMode}>
        Toggle
      </button>
      <button
        data-testid="activate-btn"
        onClick={() => {
          if (!isDesignMode) toggleDesignMode();
        }}
      >
        Activate
      </button>
      <button
        data-testid="deactivate-btn"
        onClick={() => {
          if (isDesignMode) toggleDesignMode();
        }}
      >
        Deactivate
      </button>
      <button
        data-testid="select-element-btn"
        onClick={() => setSelectedElement("test-element")}
      >
        Select Element
      </button>
      <button
        data-testid="clear-selection-btn"
        onClick={() => setSelectedElement(null)}
      >
        Clear Selection
      </button>
    </div>
  );
}

describe("DesignModeContext", () => {
  test("should provide default values", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Initial state: design mode is off, no element selected
    expect(screen.getByTestId("design-mode-status").textContent).toBe("false");
    expect(screen.getByTestId("selected-element").textContent).toBe("none");
  });

  test("should toggle design mode", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Initial state: design mode is off
    expect(screen.getByTestId("design-mode-status").textContent).toBe("false");

    // Toggle design mode on
    fireEvent.click(screen.getByTestId("toggle-btn"));
    expect(screen.getByTestId("design-mode-status").textContent).toBe("true");

    // Toggle design mode off
    fireEvent.click(screen.getByTestId("toggle-btn"));
    expect(screen.getByTestId("design-mode-status").textContent).toBe("false");
  });

  test("should activate design mode", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Initial state: design mode is off
    expect(screen.getByTestId("design-mode-status").textContent).toBe("false");

    // Activate design mode
    fireEvent.click(screen.getByTestId("activate-btn"));
    expect(screen.getByTestId("design-mode-status").textContent).toBe("true");
  });

  test("should deactivate design mode and clear selection", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Activate design mode
    fireEvent.click(screen.getByTestId("activate-btn"));
    expect(screen.getByTestId("design-mode-status").textContent).toBe("true");

    // Select an element
    fireEvent.click(screen.getByTestId("select-element-btn"));
    expect(screen.getByTestId("selected-element").textContent).toBe(
      "test-element"
    );

    // Deactivate design mode should clear the selection
    fireEvent.click(screen.getByTestId("deactivate-btn"));
    expect(screen.getByTestId("design-mode-status").textContent).toBe("false");
    expect(screen.getByTestId("selected-element").textContent).toBe("none");
  });

  test("should select and clear element selection", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Initial state: no element selected
    expect(screen.getByTestId("selected-element").textContent).toBe("none");

    // Select an element
    fireEvent.click(screen.getByTestId("select-element-btn"));
    expect(screen.getByTestId("selected-element").textContent).toBe(
      "test-element"
    );

    // Clear selection
    fireEvent.click(screen.getByTestId("clear-selection-btn"));
    expect(screen.getByTestId("selected-element").textContent).toBe("none");
  });

  test("should throw error when used outside of provider", () => {
    // Spy on console.error to suppress the expected error in test output
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useDesignMode must be used within a DesignModeProvider");

    // Restore console.error
    console.error.mockRestore();
  });
});
