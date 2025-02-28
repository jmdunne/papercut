/**
 * Type definitions for the Papercut extension
 *
 * This file contains TypeScript interfaces and types used throughout the extension.
 */

/**
 * User profile information
 */
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

/**
 * Project information
 */
export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  owner_id: string
  is_public: boolean
  thumbnail_url?: string
}

/**
 * Design change record
 */
export interface DesignChange {
  id: string
  project_id: string
  element_selector: string
  css_property: string
  previous_value?: string
  new_value: string
  created_at: string
  created_by: string
  snapshot_id?: string
}

/**
 * Design snapshot
 */
export interface DesignSnapshot {
  id: string
  project_id: string
  name: string
  description?: string
  created_at: string
  created_by: string
  thumbnail_url?: string
}

/**
 * Collaboration member
 */
export interface CollaborationMember {
  id: string
  project_id: string
  user_id: string
  role: "viewer" | "editor" | "admin"
  joined_at: string
}

/**
 * Element selection information
 */
export interface SelectedElement {
  selector: string
  element: HTMLElement
  computedStyles: CSSStyleDeclaration
  boundingRect: DOMRect
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  error: string | null
}

/**
 * Message types for communication between content script and background service
 */
export enum MessageType {
  AUTH_STATE_CHANGED = "auth_state_changed",
  ELEMENT_SELECTED = "element_selected",
  APPLY_STYLE_CHANGE = "apply_style_change",
  SAVE_DESIGN_CHANGE = "save_design_change",
  CREATE_SNAPSHOT = "create_snapshot",
  ERROR = "error"
}

/**
 * Base message interface
 */
export interface Message {
  type: MessageType
  payload: any
}

/**
 * CSS property categories for the editor
 */
export enum CSSPropertyCategory {
  LAYOUT = "Layout",
  TYPOGRAPHY = "Typography",
  COLORS = "Colors",
  EFFECTS = "Effects",
  SPACING = "Spacing",
  BORDERS = "Borders",
  TRANSITIONS = "Transitions",
  TRANSFORMS = "Transforms"
}

/**
 * CSS property definition
 */
export interface CSSPropertyDefinition {
  name: string
  displayName: string
  category: CSSPropertyCategory
  type: "color" | "size" | "text" | "select" | "number"
  options?: string[]
  defaultValue?: string
  unit?: string
}
