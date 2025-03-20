"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesignMode } from "@/contexts/design-mode-context";
import confetti from "canvas-confetti";
import { GlitterEffect } from "./glitter-effect";

export function TransitionAnimation({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDesignMode } = useDesignMode();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showGlitter, setShowGlitter] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isDesignMode) {
      // Show overlay during transition
      setShowOverlay(true);

      // Show glitter effect
      setShowGlitter(true);

      // Trigger confetti immediately
      if (confettiCanvasRef.current) {
        const myConfetti = confetti.create(confettiCanvasRef.current, {
          resize: true,
          useWorker: true,
        });

        // Launch confetti from multiple positions
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          spread: 90,
          ticks: 50, // Reduced for quicker animation
          gravity: 1.2,
          decay: 0.92, // Faster decay
          startVelocity: 30,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
          myConfetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        // Launch multiple bursts of confetti
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

      // Hide overlay after animation completes - exactly 1.5 seconds
      const hideTimer = setTimeout(() => {
        setShowOverlay(false);
        setShowGlitter(false);
      }, 1500); // Exactly 1.5 seconds

      return () => {
        clearTimeout(hideTimer);
      };
    } else {
      setShowGlitter(false);
    }
  }, [isDesignMode]);

  return (
    <>
      {children}

      <AnimatePresence>
        {showGlitter && <GlitterEffect duration={1500} />}
      </AnimatePresence>

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <canvas
              ref={confettiCanvasRef}
              className="fixed inset-0 pointer-events-none z-10"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -20 }}
              transition={{
                duration: 0.8,
                ease: [0.19, 1, 0.22, 1], // Cubic bezier for smooth animation
              }}
              className="relative z-20 flex flex-col items-center"
            >
              <motion.div
                className="text-5xl font-bold text-primary mb-4 text-center"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                Entering Design Mode
              </motion.div>

              <motion.div
                className="text-xl text-primary/80 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Get ready to create something amazing
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
