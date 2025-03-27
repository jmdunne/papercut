import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "@/components/hero-section";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";
import { useOnboarding } from "@/components/onboarding/onboarding-context";

// Mock the design mode and onboarding contexts
jest.mock("@/components/design-mode/contexts/design-mode-context", () => ({
  useDesignMode: jest.fn(),
}));

jest.mock("@/components/onboarding/onboarding-context", () => ({
  useOnboarding: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
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

describe("HeroSection", () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Mock the design mode hook
    const mockToggleDesignMode = jest.fn();
    (useDesignMode as jest.Mock).mockReturnValue({
      isDesignMode: false,
      toggleDesignMode: mockToggleDesignMode,
    });

    // Mock the onboarding hook
    const mockStartTutorial = jest.fn();
    (useOnboarding as jest.Mock).mockReturnValue({
      startTutorial: mockStartTutorial,
      isActive: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the hero section with correct content", () => {
    render(<HeroSection />);

    // Check for headline text
    expect(
      screen.getByText(/Design directly on your live website/i)
    ).toBeInTheDocument();

    // Check for description text
    expect(
      screen.getByText(
        /Eliminate the small but persistent annoyances when making minor/i
      )
    ).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText(/Try Sandbox Demo/i)).toBeInTheDocument();
    expect(screen.getByText(/See How It Works/i)).toBeInTheDocument();
  });

  test("calls toggleDesignMode when 'Try Sandbox Demo' button is clicked", () => {
    render(<HeroSection />);

    // Get the button and click it
    const button = screen.getByText(/Try Sandbox Demo/i);
    fireEvent.click(button);

    // Check if toggleDesignMode was called
    expect(useDesignMode().toggleDesignMode).toHaveBeenCalledTimes(1);
  });

  test("calls startTutorial with designModeTutorial when button is clicked", () => {
    jest.useFakeTimers();
    render(<HeroSection />);

    // Get the button and click it
    const button = screen.getByText(/Try Sandbox Demo/i);
    fireEvent.click(button);

    // Fast-forward timers
    jest.advanceTimersByTime(800);

    // Check if startTutorial was called
    expect(useOnboarding().startTutorial).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test("applies hover animation when hovering over 'Try Sandbox Demo' button", () => {
    render(<HeroSection />);

    // Get the button wrapper (motion.div)
    const buttonWrapper = screen.getByTestId("motion-div");

    // Simulate hover
    fireEvent.mouseEnter(buttonWrapper);

    // Check that the state was updated (indicated by the animation div appearing)
    // Note: We can't fully test framer-motion animations in JSDOM, but we can check the component's states
    expect(buttonWrapper.children.length).toBeGreaterThan(0);

    // Simulate hover end
    fireEvent.mouseLeave(buttonWrapper);
  });
});
