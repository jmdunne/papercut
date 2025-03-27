"use client";

import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useOnboarding } from "./onboarding-context";

export function CompletionCelebration() {
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const { completeTutorial } = useOnboarding();

  useEffect(() => {
    // Launch confetti when component mounts
    if (confettiCanvasRef.current) {
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true,
      });

      // Launch multiple bursts of confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        spread: 90,
        ticks: 50,
        gravity: 1.2,
        decay: 0.92,
        startVelocity: 30,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        myConfetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        origin: { x: 0.2, y: 0.9 },
      });

      fire(0.2, {
        spread: 60,
        origin: { x: 0.5, y: 0.9 },
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        origin: { x: 0.8, y: 0.9 },
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        origin: { x: 0.4, y: 0.9 },
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        origin: { x: 0.6, y: 0.9 },
      });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 design-mode-ui"
      data-testid="completion-celebration"
    >
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <div className="bg-card rounded-lg shadow-lg p-6 text-center max-w-md pointer-events-auto border">
          <div className="mx-auto h-16 w-16 bg-primary/20 flex items-center justify-center rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-xl font-bold mb-2">
            You've completed the tutorial!
          </h2>

          <p className="text-muted-foreground mb-6">
            You now know how to use Papercut to edit your website directly in
            the browser. Ready to start creating something amazing?
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Start Over
            </Button>
            <Button onClick={completeTutorial}>Start Editing</Button>
          </div>

          {/* Emoji feedback row */}
          <div className="mt-8 flex justify-center gap-4">
            <p className="text-sm text-muted-foreground mr-2">
              How was your experience?
            </p>
            {["😞", "😐", "🙂", "😃", "🤩"].map((emoji, index) => (
              <button
                key={index}
                className="text-2xl transition-transform hover:scale-125 focus:scale-125"
                onClick={() => {
                  // Log feedback
                  console.log(`User rated tutorial: ${emoji} (${index + 1}/5)`);
                  completeTutorial();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
