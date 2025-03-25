"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useDesignMode } from "@/contexts/design-mode-context";
import { motion, type MotionProps } from "framer-motion";
import { useState } from "react";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { designModeTutorial } from "@/components/onboarding/guided-tour";

// Create properly typed motion component
type MotionDivProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;
const MotionDiv = motion.div as React.FC<MotionDivProps>;

export function HeroSection() {
  const { activateDesignMode } = useDesignMode();
  const { startTutorial } = useOnboarding();
  const [isHovering, setIsHovering] = useState(false);

  const handleTrySandboxClick = () => {
    // Activate design mode
    activateDesignMode();

    // Start the tutorial with a slight delay
    setTimeout(() => {
      startTutorial(designModeTutorial);
    }, 800);
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/0 backdrop-blur-sm pointer-events-none" />
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-white/10 backdrop-blur-sm">
            <span className="text-primary">Introducing Papercut</span>
            <span className="mx-1">•</span>
            <span className="text-muted-foreground">Beta Coming Soon</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Design directly on your{" "}
            <span className="text-primary">live website</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Eliminate the small but persistent annoyances when making minor,
            iterative changes to your web pages. No more switching between
            design tools and code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="gap-2 relative overflow-hidden group"
                onClick={handleTrySandboxClick}
              >
                {isHovering && (
                  <MotionDiv
                    className="absolute inset-0 bg-primary/20"
                    initial={{ scale: 0, borderRadius: "100%" }}
                    animate={{ scale: 1.5, borderRadius: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Try Sandbox Demo</span>
                <ArrowRight className="h-4 w-4 relative z-10" />
              </Button>
            </motion.div>

            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-white/10 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              See How It Works
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 relative mx-auto max-w-5xl px-6">
        <div className="aspect-video overflow-hidden rounded-xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-2xl">
          <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 right-0 h-10 bg-black/10 flex items-center px-4">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="mx-auto bg-white/20 rounded-md px-4 py-1 text-xs">
                https://example.com
              </div>
            </div>
            <div className="pt-10 h-full bg-gradient-to-b from-gray-50 to-gray-100">
              {/* Browser content mockup */}
              <div className="flex h-full">
                <div className="flex-1 p-4">
                  {/* Website content being edited */}
                  <div className="h-full rounded-md bg-white shadow-sm p-4">
                    <div className="h-8 w-32 bg-primary/20 rounded mb-4" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-4/6 bg-gray-200 rounded mb-6" />
                    <div className="h-32 w-full bg-gray-100 rounded mb-4" />
                  </div>
                </div>
                <div className="w-64 border-l bg-white/80 p-4 properties-panel">
                  {/* Papercut editor panel */}
                  <div className="space-y-4">
                    <div className="h-6 w-24 bg-primary/30 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-8 w-full bg-white border rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-8 w-full bg-white border rounded" />
                    </div>
                    <div className="h-24 w-full bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating action bar */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md text-white rounded-full px-4 py-2 flex items-center space-x-4">
          <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-primary rounded-sm" />
          </div>
          <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-white/80 rounded-sm" />
          </div>
          <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-white/80 rounded-sm" />
          </div>
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
