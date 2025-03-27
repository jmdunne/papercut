import React, { useEffect } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InspectorPanel } from "@/components/design-mode/components/inspector-panel";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// Mock the design mode context values for testing
const mockElementProperties = {
  style: {
    typography: { fontSize: "16px", fontWeight: "400" },
    colors: { color: "#000000", backgroundColor: "transparent" },
    spacing: { margin: "0px", padding: "0px" },
  },
  dimensions: { width: 200, height: 50, x: 100, y: 200 },
  content: { text: "Test content" },
  metadata: { tagName: "div", className: "test-class", id: "test-id" },
};

const mockElementPath = ["body", "main", "section", "div.test-class"];

// Test wrapper component to set up design mode and element selection
function TestWrapper({ children }: { children: React.ReactNode }) {
  const { toggleDesignMode, setSelectedElement, isDesignMode } =
    useDesignMode();

  // Initialize design mode and selection
  useEffect(() => {
    if (!isDesignMode) {
      toggleDesignMode();
    }
    setSelectedElement("test-element");
  }, [toggleDesignMode, setSelectedElement, isDesignMode]);

  return <>{children}</>;
}

describe("InspectorPanel", () => {
  test("should render when design mode is active and element is selected", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Panel should be visible
    expect(screen.getByTestId("inspector-panel")).toBeInTheDocument();
  });

  test("should display element path breadcrumb", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Breadcrumb should be visible with the last element in the path
    const breadcrumb = screen.getByTestId("element-path-breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveTextContent("div.test-class");
  });

  test("should display element's style properties", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Style properties section should be visible
    expect(screen.getByTestId("style-properties")).toBeInTheDocument();

    // Typography properties
    expect(screen.getByLabelText("Font Size")).toHaveValue("16px");
    expect(screen.getByLabelText("Font Weight")).toHaveValue("400");

    // Color properties
    expect(screen.getByLabelText("Text Color")).toHaveValue("#000000");
  });

  test("should display element's dimension properties", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Dimension properties section should be visible
    expect(screen.getByTestId("dimension-properties")).toBeInTheDocument();

    // Width and height
    expect(screen.getByLabelText("Width")).toHaveValue("200");
    expect(screen.getByLabelText("Height")).toHaveValue("50");

    // Position
    expect(screen.getByLabelText("X Position")).toHaveValue("100");
    expect(screen.getByLabelText("Y Position")).toHaveValue("200");
  });

  test("should display element's content properties", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Content properties section should be visible
    expect(screen.getByTestId("content-properties")).toBeInTheDocument();

    // Text content
    expect(screen.getByLabelText("Text Content")).toHaveValue("Test content");
  });

  test("should display element's metadata properties", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Metadata properties section should be visible
    expect(screen.getByTestId("metadata-properties")).toBeInTheDocument();

    // Tag, class, and ID
    expect(screen.getByLabelText("Tag")).toHaveTextContent("div");
    expect(screen.getByLabelText("Class")).toHaveValue("test-class");
    expect(screen.getByLabelText("ID")).toHaveValue("test-id");
  });

  test("should hide when no element is selected", () => {
    render(
      <DesignModeProvider>
        <InspectorPanel />
      </DesignModeProvider>
    );

    // Panel should not be visible
    expect(screen.queryByTestId("inspector-panel")).toBeNull();
  });

  test("should update properties when a different element is selected", () => {
    render(
      <TestWrapper>
        <InspectorPanel />
      </TestWrapper>
    );

    // Initial property values
    expect(screen.getByLabelText("Width")).toHaveValue("200");

    // Simulate selecting a different element with different properties
    // This approach needs to be adjusted based on actual implementation
    act(() => {
      const newProperties = { ...mockElementProperties };
      newProperties.dimensions.width = 300;

      const context = useDesignMode as any;
      if (context._currentValue) {
        context._currentValue.elementProperties = newProperties;
      }

      // Trigger a re-render
      fireEvent(window, new Event("element-selected"));
    });

    // Properties should be updated
    expect(screen.getByLabelText("Width")).toHaveValue("300");
  });
});
