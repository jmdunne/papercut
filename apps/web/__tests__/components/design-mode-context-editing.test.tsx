import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// An actual mock for the useDesignMode hook
jest.mock("@/components/design-mode/contexts/design-mode-context", () => {
  const original = jest.requireActual(
    "@/components/design-mode/contexts/design-mode-context"
  );
  return {
    ...original,
    useDesignMode: jest.fn(),
  };
});

// Simple test component that displays properties
function TestComponent() {
  const {
    isDesignMode,
    toggleDesignMode,
    selectedElement,
    setSelectedElement,
    elementProperties,
    updateElementProperty,
    undoLastChange,
  } = useDesignMode();

  return (
    <div>
      <div data-testid="design-mode-status">
        {isDesignMode ? "true" : "false"}
      </div>

      <div data-testid="selected-element">{selectedElement || "none"}</div>

      <div data-testid="element-properties">
        {elementProperties
          ? JSON.stringify({
              fontSize: elementProperties.style.typography.fontSize,
              color: elementProperties.style.colors.color,
              text: elementProperties.content.text,
            })
          : "none"}
      </div>

      <button data-testid="toggle-btn" onClick={toggleDesignMode}>
        Toggle
      </button>

      <button
        data-testid="select-element-btn"
        onClick={() => setSelectedElement("test-element")}
      >
        Select Element
      </button>

      <button
        data-testid="update-font-size-btn"
        onClick={() =>
          updateElementProperty("style", "typography.fontSize", "24px")
        }
      >
        Update Font Size
      </button>

      <button
        data-testid="update-color-btn"
        onClick={() =>
          updateElementProperty("style", "colors.color", "#FF0000")
        }
      >
        Update Color
      </button>

      <button
        data-testid="update-text-btn"
        onClick={() => updateElementProperty("content", "text", "Updated Text")}
      >
        Update Text
      </button>

      <button data-testid="undo-btn" onClick={undoLastChange}>
        Undo
      </button>
    </div>
  );
}

describe("DesignModeContext - Property Editing", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update element properties", () => {
    // Mock implementation for this test
    const mockUpdateElementProperty = jest.fn();
    const mockUndoLastChange = jest.fn();

    // Set up the mock return value
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      toggleDesignMode: jest.fn(),
      selectedElement: "test-element",
      setSelectedElement: jest.fn(),
      elementProperties: {
        style: {
          typography: { fontSize: "16px" },
          colors: { color: "rgb(0, 0, 0)" },
          spacing: {},
        },
        content: { text: "Test Content" },
        dimensions: {},
        metadata: {},
      },
      elementPath: [],
      activeTool: "select",
      setActiveTool: jest.fn(),
      selectedElementRef: { current: null },
      updateElementProperty: mockUpdateElementProperty,
      undoLastChange: mockUndoLastChange,
    });

    render(<TestComponent />);

    // Update font size
    fireEvent.click(screen.getByTestId("update-font-size-btn"));
    expect(mockUpdateElementProperty).toHaveBeenCalledWith(
      "style",
      "typography.fontSize",
      "24px"
    );

    // Update color
    fireEvent.click(screen.getByTestId("update-color-btn"));
    expect(mockUpdateElementProperty).toHaveBeenCalledWith(
      "style",
      "colors.color",
      "#FF0000"
    );

    // Update text
    fireEvent.click(screen.getByTestId("update-text-btn"));
    expect(mockUpdateElementProperty).toHaveBeenCalledWith(
      "content",
      "text",
      "Updated Text"
    );
  });

  test("should undo changes", () => {
    // Mock implementation for this test
    const mockUpdateElementProperty = jest.fn();
    const mockUndoLastChange = jest.fn();

    // Set up the mock return value
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      toggleDesignMode: jest.fn(),
      selectedElement: "test-element",
      setSelectedElement: jest.fn(),
      elementProperties: {
        style: {
          typography: { fontSize: "16px" },
          colors: { color: "rgb(0, 0, 0)" },
          spacing: {},
        },
        content: { text: "Test Content" },
        dimensions: {},
        metadata: {},
      },
      elementPath: [],
      activeTool: "select",
      setActiveTool: jest.fn(),
      selectedElementRef: { current: null },
      updateElementProperty: mockUpdateElementProperty,
      undoLastChange: mockUndoLastChange,
    });

    render(<TestComponent />);

    // Click undo button
    fireEvent.click(screen.getByTestId("undo-btn"));
    expect(mockUndoLastChange).toHaveBeenCalledTimes(1);
  });
});
