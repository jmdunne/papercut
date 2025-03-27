import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// Mock element for testing
const MockElement = () => <div data-testid="mock-element">Mock Element</div>;

// Test component that uses the DesignModeContext
function TestComponent() {
  const {
    isDesignMode,
    toggleDesignMode,
    selectedElement,
    setSelectedElement,
    elementProperties,
    elementPath,
  } = useDesignMode();

  return (
    <div>
      <div data-testid="design-mode-status">
        {isDesignMode ? "active" : "inactive"}
      </div>
      <div data-testid="selected-element">
        {selectedElement ? selectedElement : "none"}
      </div>
      <div data-testid="element-properties">
        {elementProperties ? JSON.stringify(elementProperties) : "none"}
      </div>
      <div data-testid="element-path">
        {elementPath && elementPath.length > 0
          ? elementPath.map((path) => path.tagName).join(" > ")
          : "none"}
      </div>
      <button
        data-testid="activate-btn"
        onClick={() => {
          if (!isDesignMode) toggleDesignMode();
        }}
      >
        Activate
      </button>
      <button
        data-testid="select-element-btn"
        onClick={() => setSelectedElement("test-element")}
      >
        Select Element
      </button>
      <MockElement />
    </div>
  );
}

describe("Element Selection Feature", () => {
  // Setup document body for DOM testing
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("should select an element and capture its properties", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Activate design mode
    fireEvent.click(screen.getByTestId("activate-btn"));
    expect(screen.getByTestId("design-mode-status").textContent).toBe("active");

    // Select an element
    fireEvent.click(screen.getByTestId("select-element-btn"));
    expect(screen.getByTestId("selected-element").textContent).toBe(
      "test-element"
    );

    // After element selection, element properties and path should be populated
    // This will fail until implementation is complete, but serves as our requirement
    expect(screen.getByTestId("element-properties").textContent).not.toBe(
      "none"
    );
    expect(screen.getByTestId("element-path").textContent).not.toBe("none");
  });

  test("should update element properties when DOM element changes", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Activate design mode
    fireEvent.click(screen.getByTestId("activate-btn"));

    // Select an element
    fireEvent.click(screen.getByTestId("select-element-btn"));

    // Get initial properties
    const initialProps = screen.getByTestId("element-properties").textContent;

    // Simulate property change in the DOM
    // This will need to be implemented in the actual code
    act(() => {
      // Simulating a change to element styles or attributes
      const mockEvent = new CustomEvent("element:updated", {
        detail: { id: "test-element" },
      });
      document.dispatchEvent(mockEvent);
    });

    // Properties should be updated
    // This will fail until implementation is complete
    expect(screen.getByTestId("element-properties").textContent).not.toBe(
      initialProps
    );
  });

  test("should clear selection when design mode is deactivated", () => {
    render(
      <DesignModeProvider>
        <TestComponent />
      </DesignModeProvider>
    );

    // Activate design mode
    fireEvent.click(screen.getByTestId("activate-btn"));

    // Select an element
    fireEvent.click(screen.getByTestId("select-element-btn"));
    expect(screen.getByTestId("selected-element").textContent).toBe(
      "test-element"
    );

    // Deactivate design mode
    act(() => {
      // Using the existing deactivateDesignMode from the context
      const mockEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(mockEvent);
    });

    // Selection should be cleared
    // This will fail until implementation is complete
    expect(screen.getByTestId("selected-element").textContent).toBe("none");
  });
});
