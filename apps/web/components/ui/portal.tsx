"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Portal component that renders its children into a DOM node that exists outside
 * the DOM hierarchy of the parent component, directly to the document body.
 * This helps with z-index stacking issues by avoiding nested stacking contexts.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}
