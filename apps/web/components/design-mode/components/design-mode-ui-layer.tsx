"use client";

import { FloatingActionBar } from "./floating-action-bar";
import { SelectionHighlighter } from "./selection-highlighter";
import { InspectorPanel } from "./inspector-panel";
import { ElementSelectionHandler } from "./element-selection-handler";
import { useDesignMode } from "../contexts/design-mode-context";
import { Portal } from "@/components/ui/portal";
import { Z_INDEX } from "@/lib/constants";

/**
 * DesignModeUILayer is a dedicated layer for design mode UI components.
 * It uses Portal to render components at the document body level to avoid
 * stacking context issues with page content.
 */
export function DesignModeUILayer() {
  const { isDesignMode } = useDesignMode();

  if (!isDesignMode) return null;

  return (
    <>
      {/* ElementSelectionHandler has no visual elements, so no need for Portal */}
      <ElementSelectionHandler />

      {/* Visual UI components rendered through Portal to ensure proper stacking */}
      <Portal>
        <div
          className="design-mode-layers"
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
        >
          <div
            style={{
              position: "relative",
              zIndex: Z_INDEX.FLOATING_TOOLS,
              pointerEvents: "auto",
            }}
          >
            <FloatingActionBar />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: Z_INDEX.SELECTION_OVERLAY,
              pointerEvents: "none",
            }}
          >
            <SelectionHighlighter />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: Z_INDEX.INSPECTOR_PANEL,
              pointerEvents: "auto",
            }}
          >
            <InspectorPanel />
          </div>
        </div>
      </Portal>
    </>
  );
}
