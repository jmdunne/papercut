import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicBackground } from "@/components/background/dynamic-background";
import { DesignModeProvider } from "@/components/design-mode/contexts/design-mode-context";
import { KeyboardShortcutListener } from "@/components/design-mode/components/keyboard-shortcut-listener";
import { FloatingActionBar } from "@/components/design-mode/components/floating-action-bar";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";
import { SelectionHighlighter } from "@/components/design-mode/components/selection-highlighter";
import { InspectorPanel } from "@/components/design-mode/components/inspector-panel";
import { ElementSelectionHandler } from "@/components/design-mode/components/element-selection-handler";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <DesignModeProvider>
            <OnboardingProvider>
              <DynamicBackground />
              <KeyboardShortcutListener />
              <FloatingActionBar />
              <SelectionHighlighter />
              <InspectorPanel />
              <ElementSelectionHandler />
              <OnboardingOverlay />
              {children}
            </OnboardingProvider>
          </DesignModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
