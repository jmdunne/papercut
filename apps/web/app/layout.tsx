import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicBackground } from "@/components/background/dynamic-background";
import { DesignModeProvider } from "@/components/design-mode/contexts/design-mode-context";
import { KeyboardShortcutListener } from "@/components/design-mode/components/keyboard-shortcut-listener";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";
import { DesignModeUILayer } from "@/components/design-mode/components/design-mode-ui-layer";

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

              {/* Page content rendered first in DOM order */}
              {children}

              {/* Consolidated UI layers that render through portals */}
              <DesignModeUILayer />
              <OnboardingOverlay />
            </OnboardingProvider>
          </DesignModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
