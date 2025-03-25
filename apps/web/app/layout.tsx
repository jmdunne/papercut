import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicBackground } from "@/components/background/dynamic-background";
import { DesignModeProvider } from "@/contexts/design-mode-context";
import { KeyboardShortcutListener } from "@/components/design-mode/keyboard-shortcut-listener";
import { WelcomeMessage } from "@/components/design-mode/welcome-message";
import { FloatingActionBar } from "@/components/design-mode/floating-action-bar";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";

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
              <WelcomeMessage />
              <FloatingActionBar />
              <OnboardingOverlay />
              {children}
            </OnboardingProvider>
          </DesignModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
