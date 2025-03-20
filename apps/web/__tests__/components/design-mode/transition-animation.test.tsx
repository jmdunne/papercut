import React from "react";
import { render, screen, act } from "@testing-library/react";
import { TransitionAnimation } from "@/components/design-mode/transition-animation";
import { useDesignMode } from "@/contexts/design-mode-context";

// Mock the design-mode-context
jest.mock("@/contexts/design-mode-context", () => ({
  useDesignMode: jest.fn(),
}));

// Mock the GlitterEffect component
jest.mock("@/components/design-mode/glitter-effect", () => ({
  GlitterEffect: () => <div data-testid="glitter-effect" />,
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock canvas-confetti
jest.mock("canvas-confetti", () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockReturnValue(jest.fn()),
  },
}));

describe("TransitionAnimation", () => {
  // Setup the mock implementation for useDesignMode
  const mockUseDesignMode = useDesignMode as jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("does not show overlay when design mode is not active", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: false,
    });

    render(
      <TransitionAnimation>
        <div data-testid="child-content">Test Content</div>
      </TransitionAnimation>
    );

    // Child content should be rendered
    expect(screen.getByTestId("child-content")).toBeInTheDocument();

    // Overlay and glitter effect should NOT be in the document
    expect(screen.queryByText(/entering design mode/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("glitter-effect")).not.toBeInTheDocument();
  });

  test("shows overlay and glitter effect when entering design mode", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    render(
      <TransitionAnimation>
        <div data-testid="child-content">Test Content</div>
      </TransitionAnimation>
    );

    // Child content should still be rendered
    expect(screen.getByTestId("child-content")).toBeInTheDocument();

    // Overlay and glitter effect should now be rendered
    expect(screen.getByText(/entering design mode/i)).toBeInTheDocument();
    expect(
      screen.getByText(/get ready to create something amazing/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("glitter-effect")).toBeInTheDocument();
  });

  test("hides overlay and glitter effect after animation completes", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    render(
      <TransitionAnimation>
        <div data-testid="child-content">Test Content</div>
      </TransitionAnimation>
    );

    // Overlay and glitter effect should be visible initially
    expect(screen.getByText(/entering design mode/i)).toBeInTheDocument();
    expect(screen.getByTestId("glitter-effect")).toBeInTheDocument();

    // Advance timers by 1500ms (the duration of the animation)
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Overlay and glitter effect should no longer be in the document
    expect(screen.queryByText(/entering design mode/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("glitter-effect")).not.toBeInTheDocument();
  });

  test("renders canvas for confetti", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    render(
      <TransitionAnimation>
        <div>Test Content</div>
      </TransitionAnimation>
    );

    // Canvas should be in the document for confetti
    const canvas = screen.getByTestId("motion-div").querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  test("cleans up timer when unmounted", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    const { unmount } = render(
      <TransitionAnimation>
        <div>Test Content</div>
      </TransitionAnimation>
    );

    // Mock the clearTimeout function
    const originalClearTimeout = window.clearTimeout;
    window.clearTimeout = jest.fn();

    // Unmount the component
    unmount();

    // Check that clearTimeout was called
    expect(window.clearTimeout).toHaveBeenCalled();

    // Restore the original clearTimeout
    window.clearTimeout = originalClearTimeout;
  });
});
