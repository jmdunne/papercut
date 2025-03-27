/**
 * Z-index constants for UI layers
 * Using a consistent scale to ensure proper stacking order
 */
export const Z_INDEX = {
  BASE_CONTENT: 1,
  SELECTION_OVERLAY: 100,
  FLOATING_TOOLS: 200,
  INSPECTOR_PANEL: 300,
  DIALOGS_AND_MODALS: 400,
  ONBOARDING_OVERLAY: 500,
} as const;
