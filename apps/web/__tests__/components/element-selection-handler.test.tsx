import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ElementSelectionHandler } from "@/components/design-mode/components/element-selection-handler";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// Mock the useDesignMode hook
jest.mock("@/components/design-mode/contexts/design-mode-context", () => {
  const originalModule = jest.requireActual(
    "@/components/design-mode/contexts/design-mode-context"
  );

  return {
    ...originalModule,
    useDesignMode: jest.fn(),
  };
});

// Test wrapper component to set up design mode
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <div data-testid="test-wrapper">{children}</div>;
}

describe("ElementSelectionHandler", () => {
  // Mock element for testing
  const createTestElement = () => {
    const element = document.createElement("div");
    element.id = "test-element";
    element.setAttribute("data-testid", "test-element");
    document.body.appendChild(element);
    return element;
  };

  // Clean up after each test
  afterEach(() => {
    const testElement = document.getElementById("test-element");
    if (testElement) {
      document.body.removeChild(testElement);
    }
    jest.clearAllMocks();
  });

  test("should not attach event listeners when design mode is off", () => {
    // Mock the hook to return design mode off
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: false,
      activeTool: "select",
      setSelectedElement: jest.fn(),
    });

    // Create a spy on addEventListener
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    render(
      <TestWrapper>
        <ElementSelectionHandler />
      </TestWrapper>
    );

    // Should not attach event listeners
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      expect.any(Object)
    );

    // Clean up
    addEventListenerSpy.mockRestore();
  });

  test("should not attach event listeners when select tool is not active", () => {
    // Mock the hook to return design mode on but different tool active
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "move", // Not "select"
      setSelectedElement: jest.fn(),
    });

    // Create a spy on addEventListener
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    render(
      <TestWrapper>
        <ElementSelectionHandler />
      </TestWrapper>
    );

    // Should not attach event listeners for click
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      expect.any(Object)
    );

    // Clean up
    addEventListenerSpy.mockRestore();
  });

  test("should attach event listeners when design mode is on and select tool is active", () => {
    // Mock the hook to return design mode on and select tool active
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setSelectedElement: jest.fn(),
    });

    // Create a spy on addEventListener
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    render(
      <TestWrapper>
        <ElementSelectionHandler />
      </TestWrapper>
    );

    // Should attach event listeners
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      { capture: true }
    );

    // Clean up
    addEventListenerSpy.mockRestore();
  });

  test("should select element when clicked", () => {
    // Create test element
    const testElement = createTestElement();

    // Mock setSelectedElement function
    const mockSetSelectedElement = jest.fn();

    // Mock the hook
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setSelectedElement: mockSetSelectedElement,
    });

    render(
      <TestWrapper>
        <ElementSelectionHandler />
      </TestWrapper>
    );

    // Simulate click on the test element
    fireEvent.click(testElement);

    // setSelectedElement should be called with the element's ID
    expect(mockSetSelectedElement).toHaveBeenCalledWith("test-element");
  });

  test("should not select UI elements", () => {
    // Create test UI elements that should be ignored
    const uiElements = [
      { testId: "selection-highlighter", id: "ui-1" },
      { testId: "inspector-panel", id: "ui-2" },
      { testId: "motion-div", id: "ui-3" },
      { testId: "breadcrumb-separator", id: "ui-4" },
    ];

    const createdElements = uiElements.map(({ testId, id }) => {
      const element = document.createElement("div");
      element.id = id;
      element.setAttribute("data-testid", testId);
      document.body.appendChild(element);
      return element;
    });

    // Mock setSelectedElement function
    const mockSetSelectedElement = jest.fn();

    // Mock the hook
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setSelectedElement: mockSetSelectedElement,
    });

    render(
      <TestWrapper>
        <ElementSelectionHandler />
      </TestWrapper>
    );

    // Simulate clicks on UI elements
    createdElements.forEach((element) => {
      fireEvent.click(element);
    });

    // setSelectedElement should not be called for UI elements
    expect(mockSetSelectedElement).not.toHaveBeenCalled();

    // Clean up UI elements
    createdElements.forEach((element) => {
      document.body.removeChild(element);
    });
  });

  test("should detach event listeners when unmounted", () => {
    // Mock the hook
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setSelectedElement: jest.fn(),
    });

    // Create spies on addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    // Render and unmount
    const { unmount } = render(
      <TestWrapper>
        <ElementSelectionHandler />
      </TestWrapper>
    );

    unmount();

    // Should remove the event listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      { capture: true }
    );

    // Clean up
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
