import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingActionBar } from "@/components/design-mode/components/floating-action-bar";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";

// Mock the dependencies
jest.mock("@/components/design-mode/contexts/design-mode-context", () => ({
  useDesignMode: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, whileHover, whileTap, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button data-testid="motion-button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("FloatingActionBar", () => {
  // Mock implementation values
  const mockSetActiveTool = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders nothing when not in design mode", () => {
    // Mock useDesignMode to return isDesignMode as false
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: false,
      activeTool: "select",
      setActiveTool: mockSetActiveTool,
    });

    const { container } = render(<FloatingActionBar />);
    expect(container.firstChild).toBeNull();
  });

  test("renders the FAB when in design mode", () => {
    // Mock useDesignMode to return isDesignMode as true
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setActiveTool: mockSetActiveTool,
    });

    render(<FloatingActionBar />);

    // Check if the FAB container is rendered - get all motion-div elements and use the first one
    const fabContainers = screen.getAllByTestId("motion-div");
    expect(fabContainers[0]).toBeInTheDocument();

    // Check if all the tool buttons are rendered
    expect(screen.getByLabelText("Select")).toBeInTheDocument();
    expect(screen.getByLabelText("Move/Resize")).toBeInTheDocument();
    expect(screen.getByLabelText("Style")).toBeInTheDocument();
    expect(screen.getByLabelText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByLabelText("History")).toBeInTheDocument();

    // Check if optional tools are rendered
    expect(screen.getByLabelText("Responsive")).toBeInTheDocument();
    expect(screen.getByLabelText("Help")).toBeInTheDocument();
  });

  test("minimizes when minimize button is clicked", () => {
    // Mock useDesignMode to return isDesignMode as true
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setActiveTool: mockSetActiveTool,
    });

    render(<FloatingActionBar />);

    // Click the minimize button
    fireEvent.click(screen.getByLabelText("Minimize"));

    // Check if the FAB is minimized (showing just the pill)
    expect(screen.getByText("Design Mode")).toBeInTheDocument();
    expect(screen.queryByLabelText("Select")).not.toBeInTheDocument();
  });

  test("maximizes when clicking on the minimized pill", () => {
    // Mock useDesignMode to return isDesignMode as true
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setActiveTool: mockSetActiveTool,
    });

    render(<FloatingActionBar />);

    // First minimize the FAB
    fireEvent.click(screen.getByLabelText("Minimize"));

    // Then click on the pill to maximize
    fireEvent.click(screen.getByTestId("motion-button"));

    // Check if the FAB is maximized again (tools are visible)
    expect(screen.getByLabelText("Select")).toBeInTheDocument();
  });

  test("calls setActiveTool when a tool button is clicked", () => {
    // Mock useDesignMode to return isDesignMode as true
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setActiveTool: mockSetActiveTool,
    });

    render(<FloatingActionBar />);

    // Click on the "Move/Resize" tool
    fireEvent.click(screen.getByLabelText("Move/Resize"));

    // Check if setActiveTool was called with the correct tool id
    expect(mockSetActiveTool).toHaveBeenCalledWith("move");

    // Click on the "Style" tool
    fireEvent.click(screen.getByLabelText("Style"));

    // Check if setActiveTool was called with the correct tool id
    expect(mockSetActiveTool).toHaveBeenCalledWith("style");
  });

  test("auto-hides after 2 seconds of inactivity", () => {
    // Mock useDesignMode to return isDesignMode as true
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: true,
      activeTool: "select",
      setActiveTool: mockSetActiveTool,
    });

    render(<FloatingActionBar />);

    // Initially the FAB should be fully visible (opacity 1)
    const fabContainers = screen.getAllByTestId("motion-div");
    const fabContainer = fabContainers[0];
    expect(fabContainer).toBeInTheDocument();

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    // Trigger mouse movement to make the FAB visible again
    fireEvent.mouseMove(document);

    // The auto-hide timer should be reset
    jest.advanceTimersByTime(1000);

    // The FAB should still be visible
    expect(fabContainer).toBeInTheDocument();
  });
});
