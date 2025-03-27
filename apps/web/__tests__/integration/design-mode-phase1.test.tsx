import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DesignModeProvider } from "@/components/design-mode/contexts/design-mode-context";
import { FloatingActionBar } from "@/components/design-mode/components/floating-action-bar";
import { SelectionHighlighter } from "@/components/design-mode/components/selection-highlighter";
import { InspectorPanel } from "@/components/design-mode/components/inspector-panel";
import { ElementPathBreadcrumb } from "@/components/design-mode/components/element-path-breadcrumb";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Sample content for testing element selection
function SampleContent() {
  return (
    <div className="sample-content" data-testid="sample-content">
      <header id="header" className="header" data-testid="header">
        <h1>Header</h1>
      </header>
      <main
        id="main-content"
        className="main-content"
        data-testid="main-content"
      >
        <section id="hero" className="hero-section" data-testid="hero-section">
          <h2>Hero Section</h2>
          <p id="hero-text" data-testid="hero-text">
            This is the hero text
          </p>
          <button
            id="cta-button"
            className="cta-button"
            data-testid="cta-button"
          >
            Call to Action
          </button>
        </section>
      </main>
    </div>
  );
}

// Complete test environment with all Phase 1 components
function TestEnvironment() {
  return (
    <DesignModeProvider>
      <SampleContent />
      <SelectionHighlighter />
      <InspectorPanel />
      <FloatingActionBar />
    </DesignModeProvider>
  );
}

describe("Design Mode - Phase 1 Integration", () => {
  beforeAll(() => {
    // Mock ResizeObserver
    window.ResizeObserver = ResizeObserverMock as any;

    // Mock element positioning for getBoundingClientRect
    const mockElementPositions: Record<string, DOMRect> = {
      header: {
        top: 0,
        left: 0,
        right: 800,
        bottom: 100,
        width: 800,
        height: 100,
        x: 0,
        y: 0,
      } as DOMRect,
      "main-content": {
        top: 100,
        left: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 500,
        x: 0,
        y: 100,
      } as DOMRect,
      "hero-section": {
        top: 120,
        left: 20,
        right: 780,
        bottom: 400,
        width: 760,
        height: 280,
        x: 20,
        y: 120,
      } as DOMRect,
      "hero-text": {
        top: 180,
        left: 40,
        right: 760,
        bottom: 220,
        width: 720,
        height: 40,
        x: 40,
        y: 180,
      } as DOMRect,
      "cta-button": {
        top: 240,
        left: 40,
        right: 200,
        bottom: 280,
        width: 160,
        height: 40,
        x: 40,
        y: 240,
      } as DOMRect,
    };

    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      const id = this.id;
      if (id && mockElementPositions[id]) {
        return mockElementPositions[id];
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

  test("should activate design mode and make selection tools available", () => {
    render(<TestEnvironment />);

    // Design mode should initially be inactive
    // Inspector and highlighter should not be visible
    expect(screen.queryByTestId("inspector-panel")).toBeNull();
    expect(screen.queryByTestId("selection-highlighter")).toBeNull();

    // The floating action bar should be visible (but minimized)
    expect(screen.getByTestId("motion-div")).toBeInTheDocument();

    // Activate design mode by clicking on the design mode button
    const designModeBtn = screen.getByText("Design Mode");
    fireEvent.click(designModeBtn);

    // Now the floating action bar should show the design tools
    expect(screen.getByLabelText("Select")).toBeInTheDocument();
    expect(screen.getByLabelText("Move/Resize")).toBeInTheDocument();
    expect(screen.getByLabelText("Style")).toBeInTheDocument();
  });

  test("should select an element, highlight it, and show properties in inspector", async () => {
    render(<TestEnvironment />);

    // Activate design mode
    const designModeBtn = screen.getByText("Design Mode");
    fireEvent.click(designModeBtn);

    // Make sure the select tool is active (it should be by default)
    const selectTool = screen.getByLabelText("Select");
    fireEvent.click(selectTool);

    // Initially no element is selected
    expect(screen.queryByTestId("selection-highlighter")).toBeNull();
    expect(screen.queryByTestId("inspector-panel")).toBeNull();

    // Click on an element to select it
    const heroText = screen.getByTestId("hero-text");
    fireEvent.click(heroText);

    // Now the element should be selected
    // Selection highlighter should appear around the element
    const highlighter = await screen.findByTestId("selection-highlighter");
    expect(highlighter).toBeInTheDocument();
    expect(highlighter).toHaveStyle({
      position: "absolute",
      top: "180px", // Based on the mock position
      left: "40px",
      width: "720px",
      height: "40px",
    });

    // Inspector panel should appear showing element properties
    const inspector = await screen.findByTestId("inspector-panel");
    expect(inspector).toBeInTheDocument();

    // Element path should be visible in the breadcrumb
    const breadcrumb = await screen.findByTestId("element-path-breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveTextContent("hero-text");
  });

  test("should update selection when clicking on a different element", async () => {
    render(<TestEnvironment />);

    // Activate design mode
    const designModeBtn = screen.getByText("Design Mode");
    fireEvent.click(designModeBtn);

    // Select the hero text
    const heroText = screen.getByTestId("hero-text");
    fireEvent.click(heroText);

    // Verify initial selection
    const highlighter = await screen.findByTestId("selection-highlighter");
    expect(highlighter).toHaveStyle({
      top: "180px", // Based on the mock position for hero-text
    });

    // Now click on the CTA button to select it instead
    const ctaButton = screen.getByTestId("cta-button");
    fireEvent.click(ctaButton);

    // Highlighter should move to the new element
    expect(highlighter).toHaveStyle({
      top: "240px", // Based on the mock position for cta-button
      left: "40px",
      width: "160px",
      height: "40px",
    });

    // Inspector should update with the new element's properties
    const inspector = await screen.findByTestId("inspector-panel");
    expect(inspector).toHaveTextContent("cta-button"); // The element ID should appear somewhere
  });

  test("should navigate element hierarchy using breadcrumb", async () => {
    render(<TestEnvironment />);

    // Activate design mode
    const designModeBtn = screen.getByText("Design Mode");
    fireEvent.click(designModeBtn);

    // Select a deeply nested element
    const ctaButton = screen.getByTestId("cta-button");
    fireEvent.click(ctaButton);

    // Breadcrumb should show the element path
    const breadcrumb = await screen.findByTestId("element-path-breadcrumb");
    expect(breadcrumb).toBeInTheDocument();

    // Path should include parent elements
    expect(breadcrumb).toHaveTextContent("hero-section");
    expect(breadcrumb).toHaveTextContent("cta-button");

    // Click on the parent element in the breadcrumb
    const heroSectionLink = screen.getByText("hero-section");
    fireEvent.click(heroSectionLink);

    // Selection should change to the hero section
    const highlighter = await screen.findByTestId("selection-highlighter");
    expect(highlighter).toHaveStyle({
      top: "120px", // Based on the mock position for hero-section
      left: "20px",
      width: "760px",
      height: "280px",
    });

    // Inspector should update with the hero section's properties
    const inspector = await screen.findByTestId("inspector-panel");
    expect(inspector).toHaveTextContent("hero-section");
  });

  test("should exit design mode and hide all UI elements", async () => {
    render(<TestEnvironment />);

    // Activate design mode
    const designModeBtn = screen.getByText("Design Mode");
    fireEvent.click(designModeBtn);

    // Select an element
    const heroText = screen.getByTestId("hero-text");
    fireEvent.click(heroText);

    // Verify UI elements are present
    expect(
      await screen.findByTestId("selection-highlighter")
    ).toBeInTheDocument();
    expect(await screen.findByTestId("inspector-panel")).toBeInTheDocument();

    // Exit design mode by pressing Escape
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    // All design mode UI should be hidden
    expect(screen.queryByTestId("selection-highlighter")).toBeNull();
    expect(screen.queryByTestId("inspector-panel")).toBeNull();

    // Floating action bar should be minimized
    expect(screen.getByText("Design Mode")).toBeInTheDocument(); // Back to minimized state
  });
});
