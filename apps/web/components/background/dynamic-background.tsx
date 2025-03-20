"use client";

import { useEffect, useState } from "react";
import { AnimatedGradient } from "./animated-gradient";
import { useMediaQuery } from "@/hooks/use-media-query";

// Only import ThreeBackground on client, and only if needed
// We'll comment this out for now to avoid issues
// const ThreeBackground = dynamic(() => import("./three-background").then(mod => mod.ThreeBackground), {
//   ssr: false,
// })

export function DynamicBackground() {
  const [mounted, setMounted] = useState(false);
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isLowPower = useMediaQuery("(prefers-reduced-data: reduce)");

  // Only render on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Since ThreeBackground is causing issues, we'll just use the AnimatedGradient for now
  // const shouldRender3D = !isReducedMotion && !isLowPower

  return (
    <>
      <AnimatedGradient />
      {/* {shouldRender3D && <ThreeBackground />} */}
    </>
  );
}
