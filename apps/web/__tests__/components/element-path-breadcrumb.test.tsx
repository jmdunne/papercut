import React, { useEffect } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ElementPathBreadcrumb } from "@/components/design-mode/components/element-path-breadcrumb";
import {
  DesignModeProvider,
  useDesignMode,
} from "@/components/design-mode/contexts/design-mode-context";

// Mock context wrapper
function TestWrapper({
  elementPath = ["body", "main", "section", "div.test-class"],
  children,
}: {
  elementPath?: string[];
  children: React.ReactNode;
}) {
  const { toggleDesignMode, setSelectedElement, isDesignMode } =
    useDesignMode();

  // Initialize design mode and element selection
  useEffect(() => {
    if (!isDesignMode) {
      toggleDesignMode();
    }
    setSelectedElement("test-element");

    // This is a mock approach and will need to be adjusted
    // based on actual implementation
    const context = useDesignMode as any;
    if (context._currentValue) {
      context._currentValue.elementPath = elementPath;
    }
  }, [toggleDesignMode, setSelectedElement, isDesignMode]);

  return (
    <DesignModeProvider>
      <TestWrapper>{children}</TestWrapper>
    </DesignModeProvider>
  );
}

describe("ElementPathBreadcrumb", () => {
  test("should render the complete element path", () => {
    render(
      <TestWrapper>
        <ElementPathBreadcrumb />
      </TestWrapper>
    );

    // All elements in the path should be visible
    expect(screen.getByText("body")).toBeInTheDocument();
    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("section")).toBeInTheDocument();
    expect(screen.getByText("div.test-class")).toBeInTheDocument();

    // Should have separators between elements
    const separators = screen.getAllByTestId("breadcrumb-separator");
    expect(separators.length).toBe(3); // One less than the number of path items
  });

  test("should highlight the last element in the path", () => {
    render(
      <TestWrapper>
        <ElementPathBreadcrumb />
      </TestWrapper>
    );

    // The last element should have a different style to indicate it's the current element
    const lastElement = screen.getByText("div.test-class");
    expect(lastElement).toHaveClass("current-element"); // This class name may vary based on actual implementation
  });

  test("should allow selecting a parent element in the path", () => {
    // Mock the setSelectedElement function
    const setSelectedElementMock = jest.fn();

    // Set up the mock to capture the function call
    jest.spyOn(React, "useContext").mockImplementation(() => ({
      isDesignMode: true,
      selectedElement: "test-element",
      elementPath: ["body", "main", "section", "div.test-class"],
      setSelectedElement: setSelectedElementMock,
    }));

    render(
      <TestWrapper>
        <ElementPathBreadcrumb />
      </TestWrapper>
    );

    // Click on a parent element in the path
    fireEvent.click(screen.getByText("section"));

    // Should call setSelectedElement with the path to that element
    expect(setSelectedElementMock).toHaveBeenCalledWith("section");

    // Clean up the mock
    jest.restoreAllMocks();
  });

  test("should truncate very long paths", () => {
    // Create a very long path
    const longPath = [
      "html",
      "body",
      "div.container",
      "main",
      "section",
      "article",
      "div.card",
      "div.card-body",
      "div.content",
      "div.test-class",
    ];

    render(
      <TestWrapper elementPath={longPath}>
        <ElementPathBreadcrumb />
      </TestWrapper>
    );

    // Should show an indicator for truncation
    expect(screen.getByTestId("breadcrumb-truncation")).toBeInTheDocument();

    // Should still show the first and last few elements
    expect(screen.getByText("html")).toBeInTheDocument();
    expect(screen.getByText("div.test-class")).toBeInTheDocument();

    // Some middle elements should be hidden
    expect(screen.queryByText("article")).toBeNull();
  });

  test("should expand truncated path when ellipsis is clicked", () => {
    // Create a very long path
    const longPath = [
      "html",
      "body",
      "div.container",
      "main",
      "section",
      "article",
      "div.card",
      "div.card-body",
      "div.content",
      "div.test-class",
    ];

    render(
      <TestWrapper elementPath={longPath}>
        <ElementPathBreadcrumb />
      </TestWrapper>
    );

    // Initially, some elements should be hidden
    expect(screen.queryByText("article")).toBeNull();

    // Click the ellipsis/truncation indicator
    fireEvent.click(screen.getByTestId("breadcrumb-truncation"));

    // After clicking, all elements should be visible
    expect(screen.getByText("article")).toBeInTheDocument();
    expect(screen.getByText("div.card")).toBeInTheDocument();
    expect(screen.getByText("div.card-body")).toBeInTheDocument();
    expect(screen.getByText("div.content")).toBeInTheDocument();
  });

  test("should not render when element path is empty", () => {
    render(
      <TestWrapper elementPath={[]}>
        <ElementPathBreadcrumb />
      </TestWrapper>
    );

    // Should not render anything or should render a placeholder
    expect(screen.queryByTestId("element-path-breadcrumb")).toBeNull();
  });
});
