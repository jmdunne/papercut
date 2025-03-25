"use client";

import { motion } from "framer-motion";

type ToolHighlighterProps = {
  rect: DOMRect;
  position: "top" | "right" | "bottom" | "left";
};

export function ToolHighlighter({ rect, position }: ToolHighlighterProps) {
  // Add a small padding to the highlight
  const padding = 8;

  // Calculate position and size with padding
  const highlightStyle = {
    position: "fixed" as const,
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
    zIndex: 45,
    pointerEvents: "none" as const,
  };

  // Calculate arrow position based on the specified position
  const getArrowPosition = () => {
    switch (position) {
      case "top":
        return {
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
        };
      case "right":
        return {
          left: -8,
          top: "50%",
          transform: "translateY(-50%) rotate(-45deg)",
        };
      case "bottom":
        return {
          top: -8,
          left: "50%",
          transform: "translateX(-50%) rotate(-135deg)",
        };
      case "left":
        return {
          right: -8,
          top: "50%",
          transform: "translateY(-50%) rotate(135deg)",
        };
    }
  };

  return (
    <>
      {/* Full screen overlay with a cutout */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <mask id="spotlight">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - padding}
                y={rect.top - padding}
                width={rect.width + padding * 2}
                height={rect.height + padding * 2}
                fill="black"
                rx="4"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#spotlight)"
          />
        </svg>
      </div>

      {/* Highlight border */}
      <motion.div
        style={highlightStyle}
        className="border-2 border-primary rounded-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            "0 0 0 rgba(59, 130, 246, 0)",
            "0 0 0 8px rgba(59, 130, 246, 0.2)",
            "0 0 0 4px rgba(59, 130, 246, 0.3)",
            "0 0 0 8px rgba(59, 130, 246, 0.2)",
            "0 0 0 rgba(59, 130, 246, 0)",
          ],
        }}
        transition={{
          duration: 0.3,
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          },
        }}
      >
        {/* Arrow pointing from the tutorial card to the element */}
        <div
          className="absolute w-4 h-4 bg-primary"
          style={getArrowPosition()}
        />
      </motion.div>
    </>
  );
}
