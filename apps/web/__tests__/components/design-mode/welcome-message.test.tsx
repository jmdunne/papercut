import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { WelcomeMessage } from "@/components/design-mode/welcome-message";
import { useDesignMode } from "@/contexts/design-mode-context";

// Mock the design-mode-context
jest.mock("@/contexts/design-mode-context", () => ({
  useDesignMode: jest.fn(),
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

describe("WelcomeMessage", () => {
  // Setup the mock implementation for useDesignMode
  const mockUseDesignMode = useDesignMode as jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("does not show welcome message when design mode is not active", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: false,
    });

    render(<WelcomeMessage />);

    // Welcome message should not be in the document
    expect(
      screen.queryByText(/welcome to design mode/i)
    ).not.toBeInTheDocument();
  });

  test("shows welcome message after a delay when design mode is activated", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    render(<WelcomeMessage />);

    // Initially, welcome message should not be visible
    expect(
      screen.queryByText(/welcome to design mode/i)
    ).not.toBeInTheDocument();

    // Advance timers by 1800ms (the delay before showing the message)
    act(() => {
      jest.advanceTimersByTime(1800);
    });

    // Now the welcome message should be visible
    expect(screen.getByText(/welcome to design mode/i)).toBeInTheDocument();
    expect(
      screen.getByText(/you can now edit any element on this page/i)
    ).toBeInTheDocument();
  });

  test("hides welcome message when X button is clicked", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    render(<WelcomeMessage />);

    // Show the welcome message
    act(() => {
      jest.advanceTimersByTime(1800);
    });

    // Welcome message should be visible
    expect(screen.getByText(/welcome to design mode/i)).toBeInTheDocument();

    // Click the X button to dismiss
    fireEvent.click(screen.getByRole("button", { name: "" })); // X button has no text

    // Welcome message should be hidden
    expect(
      screen.queryByText(/welcome to design mode/i)
    ).not.toBeInTheDocument();
  });

  test("hides welcome message when 'Got it' button is clicked", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    render(<WelcomeMessage />);

    // Show the welcome message
    act(() => {
      jest.advanceTimersByTime(1800);
    });

    // Welcome message should be visible
    expect(screen.getByText(/welcome to design mode/i)).toBeInTheDocument();

    // Click the "Got it" button to dismiss
    fireEvent.click(screen.getByRole("button", { name: /got it/i }));

    // Welcome message should be hidden
    expect(
      screen.queryByText(/welcome to design mode/i)
    ).not.toBeInTheDocument();
  });

  test("cleans up timer when unmounted", () => {
    mockUseDesignMode.mockReturnValue({
      isDesignMode: true,
    });

    const { unmount } = render(<WelcomeMessage />);

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
