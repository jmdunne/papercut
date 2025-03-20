import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicBackground } from "@/components/background/dynamic-background";
import { DesignModeProvider } from "@/contexts/design-mode-context";
import { KeyboardShortcutListener } from "@/components/design-mode/keyboard-shortcut-listener";
import { WelcomeMessage } from "@/components/design-mode/welcome-message";
import { FloatingActionBar } from "@/components/design-mode/floating-action-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Papercut - Design directly on your live website",
  description:
    "Eliminate the small but persistent annoyances when making minor, iterative changes to your web pages.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DesignModeProvider>
            <DynamicBackground />
            <KeyboardShortcutListener />
            <WelcomeMessage />
            <FloatingActionBar />
            {children}
          </DesignModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
