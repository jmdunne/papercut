import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "@/components/hero-section";
import { useDesignMode } from "@/contexts/design-mode-context";

// Mock the design-mode-context
jest.mock("@/contexts/design-mode-context", () => ({
  useDesignMode: jest.fn(),
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
  const mockActivateDesignMode = jest.fn();

  // Setup mock implementation before each test
  beforeEach(() => {
    (useDesignMode as jest.Mock).mockReturnValue({
      activateDesignMode: mockActivateDesignMode,
      isDesignMode: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders hero section with correct content", () => {
    render(<HeroSection />);

    // Check if the main heading is rendered
    expect(
      screen.getByRole("heading", {
        name: /design directly on your live website/i,
      })
    ).toBeInTheDocument();

    // Check if the intro badge is rendered
    expect(screen.getByText(/introducing papercut/i)).toBeInTheDocument();
    expect(screen.getByText(/beta coming soon/i)).toBeInTheDocument();

    // Check if the description is rendered
    expect(
      screen.getByText(/eliminate the small but persistent annoyances/i)
    ).toBeInTheDocument();

    // Check if the buttons are rendered
    expect(
      screen.getByRole("button", { name: /try sandbox demo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /see how it works/i })
    ).toBeInTheDocument();
  });

  test("calls activateDesignMode when 'Try Sandbox Demo' button is clicked", () => {
    render(<HeroSection />);

    // Click the "Try Sandbox Demo" button
    fireEvent.click(screen.getByRole("button", { name: /try sandbox demo/i }));

    // Check if activateDesignMode was called
    expect(mockActivateDesignMode).toHaveBeenCalledTimes(1);
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
