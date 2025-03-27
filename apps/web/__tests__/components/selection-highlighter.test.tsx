import React, { useEffect } from "react";
import { render, screen, act } from "@testing-library/react";
import { SelectionHighlighter } from "@/components/design-mode/components/selection-highlighter";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Wrapper component to provide context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DesignModeProvider>
      <TestContent />
      {children}
    </DesignModeProvider>
  );
}

// Test content with elements that can be selected
function TestContent() {
  const { toggleDesignMode, setSelectedElement, isDesignMode } =
    useDesignMode();

  // Initialize design mode and selection on mount
  useEffect(() => {
    if (!isDesignMode) {
      toggleDesignMode();
    }
    setSelectedElement("test-element");
  }, [toggleDesignMode, setSelectedElement, isDesignMode]);

  return (
    <div>
      <button
        data-testid="select-button"
        onClick={() => setSelectedElement("test-element")}
      >
        Select Element
      </button>
      <div
        id="test-element"
        data-testid="test-element"
        style={{
          width: 200,
          height: 100,
          position: "absolute",
          top: 50,
          left: 50,
        }}
      >
        Test Element
      </div>
    </div>
  );
}

// Component to initialize test state
const Initializer = ({ selector }: { selector: string }) => {
  const { toggleDesignMode, setSelectedElement, isDesignMode } =
    useDesignMode();

  // Initialize design mode and selection on mount
  useEffect(() => {
    if (!isDesignMode) {
      toggleDesignMode();
    }
    setSelectedElement(selector);
  }, [toggleDesignMode, setSelectedElement, selector, isDesignMode]);

  return null;
};

// Component to deactivate design mode for cleanup
const Cleanup = () => {
  const { toggleDesignMode, isDesignMode } = useDesignMode();

  // Deactivate design mode on unmount
  useEffect(() => {
    return () => {
      if (isDesignMode) {
        toggleDesignMode();
      }
    };
  }, [toggleDesignMode, isDesignMode]);

  return null;
};

describe("SelectionHighlighter", () => {
  beforeAll(() => {
    // Mock ResizeObserver
    window.ResizeObserver = ResizeObserverMock as any;

    // Mock getBoundingClientRect for test-element
    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if (this.id === "test-element") {
        return {
          top: 50,
          left: 50,
          right: 250,
          bottom: 150,
          width: 200,
          height: 100,
          x: 50,
          y: 50,
        } as DOMRect;
      }
      return originalGetBoundingClientRect.call(this);
    };
  });

  afterAll(() => {
    // Restore original methods
    delete window.ResizeObserver;
    Element.prototype.getBoundingClientRect = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "getBoundingClientRect"
    )?.value;
  });

  test("should not render when no element is selected", () => {
    render(
      <TestWrapper>
        <SelectionHighlighter />
      </TestWrapper>
    );

    // Highlighter should not be visible
    expect(screen.queryByTestId("selection-highlighter")).toBeNull();
  });

  test("should render around the selected element", () => {
    render(
      <TestWrapper>
        <SelectionHighlighter />
      </TestWrapper>
    );

    // Select an element
    act(() => {
      screen.getByTestId("select-button").click();
    });

    // Highlighter should now be visible
    const highlighter = screen.getByTestId("selection-highlighter");
    expect(highlighter).toBeInTheDocument();

    // Highlighter should position itself correctly around the selected element
    expect(highlighter).toHaveStyle({
      position: "absolute",
      top: "50px",
      left: "50px",
      width: "200px",
      height: "100px",
    });
  });

  test("should update position when element moves", () => {
    render(
      <TestWrapper>
        <SelectionHighlighter />
      </TestWrapper>
    );

    // Select an element
    act(() => {
      screen.getByTestId("select-button").click();
    });

    // Initially positioned correctly
    const highlighter = screen.getByTestId("selection-highlighter");
    expect(highlighter).toHaveStyle({
      top: "50px",
      left: "50px",
    });

    // Simulate element moving
    act(() => {
      const element = screen.getByTestId("test-element");
      Object.defineProperty(element, "getBoundingClientRect", {
        value: () => ({
          top: 100,
          left: 100,
          right: 300,
          bottom: 200,
          width: 200,
          height: 100,
          x: 100,
          y: 100,
        }),
        configurable: true,
      });

      // Trigger a resize event to update highlighter
      window.dispatchEvent(new Event("resize"));
    });

    // Highlighter should update its position
    // Note: This expectation might need adjustment based on actual implementation
    expect(highlighter).toHaveStyle({
      top: "100px",
      left: "100px",
    });
  });

  test("should render selection handles on the corners", () => {
    render(
      <TestWrapper>
        <SelectionHighlighter />
      </TestWrapper>
    );

    // Select an element
    act(() => {
      screen.getByTestId("select-button").click();
    });

    // Selection handles should be rendered
    // Typically there are 8 handles (4 corners, 4 sides)
    const handles = screen.getAllByTestId(/selection-handle/);
    expect(handles.length).toBeGreaterThanOrEqual(4); // At minimum, the 4 corners

    // The handles should be positioned correctly relative to the highlighter
    const cornerHandles = handles.filter((handle) =>
      handle.getAttribute("data-handle-position")?.includes("corner")
    );

    // Check that corner handles exist
    expect(cornerHandles.length).toBe(4);
  });

  test("should hide when design mode is deactivated", () => {
    render(
      <TestWrapper>
        <SelectionHighlighter />
      </TestWrapper>
    );

    // Select an element
    act(() => {
      screen.getByTestId("select-button").click();
    });

    // Highlighter should be visible
    expect(screen.getByTestId("selection-highlighter")).toBeInTheDocument();

    // Deactivate design mode
    act(() => {
      const { toggleDesignMode } = useDesignMode();
      toggleDesignMode();
    });

    // Highlighter should no longer be visible
    expect(screen.queryByTestId("selection-highlighter")).toBeNull();
  });
});
