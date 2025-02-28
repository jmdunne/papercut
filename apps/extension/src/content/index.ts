/**
 * Content Script
 *
 * This script is injected into web pages and handles:
 * - Element selection and highlighting
 * - CSS manipulation
 * - Communication with the extension popup and background service
 */

// Store the current state
let state = {
  isSelecting: false,
  highlightedElement: null as HTMLElement | null,
  selectedElement: null as HTMLElement | null,
  projectId: null as string | null,
  highlightOverlay: null as HTMLElement | null,
  originalStyles: new Map<HTMLElement, string>(),
  modifiedElements: new Map<string, Record<string, string>>()
}

/**
 * Initialize the content script
 */
function initialize() {
  console.log("Papercut content script initialized")

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener(handleExtensionMessages)

  // Listen for messages from the page
  window.addEventListener("message", handleWindowMessages)
}

/**
 * Handle messages from the extension
 */
function handleExtensionMessages(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  console.log("Received message from extension:", message)

  switch (message.type) {
    case "START_SELECTION":
      startElementSelection(message.projectId)
      break

    case "CANCEL_SELECTION":
      cancelElementSelection()
      break

    case "PREVIEW_CHANGE":
      previewCSSChange(message.elementSelector, message.property, message.value)
      break

    case "APPLY_SNAPSHOT":
      applySnapshot(message.changes)
      break

    default:
      console.log("Unknown message type:", message.type)
  }

  // Return true to indicate that the response will be sent asynchronously
  return true
}

/**
 * Handle messages from the page
 */
function handleWindowMessages(event: MessageEvent) {
  // Only handle messages from our extension
  if (event.data.source !== "papercut-extension") return

  console.log("Received message from page:", event.data)

  switch (event.data.command) {
    case "startSelection":
      startElementSelection(event.data.projectId)
      break

    case "cancelSelection":
      cancelElementSelection()
      break

    case "previewChange":
      previewCSSChange(
        event.data.elementSelector,
        event.data.property,
        event.data.value
      )
      break

    case "applySnapshot":
      applySnapshot(event.data.changes)
      break

    default:
      console.log("Unknown command:", event.data.command)
  }
}

/**
 * Start element selection mode
 */
function startElementSelection(projectId: string | null) {
  if (state.isSelecting) return

  state.isSelecting = true
  state.projectId = projectId

  console.log("Starting element selection mode")

  // Create highlight overlay
  createHighlightOverlay()

  // Add event listeners
  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("click", handleElementClick, true)
  document.addEventListener("keydown", handleKeyDown)
}

/**
 * Cancel element selection mode
 */
function cancelElementSelection() {
  if (!state.isSelecting) return

  console.log("Cancelling element selection mode")

  // Remove highlight overlay
  removeHighlightOverlay()

  // Remove event listeners
  document.removeEventListener("mousemove", handleMouseMove)
  document.removeEventListener("click", handleElementClick, true)
  document.removeEventListener("keydown", handleKeyDown)

  // Reset state
  state.isSelecting = false
  state.highlightedElement = null
  state.selectedElement = null
}

/**
 * Create a highlight overlay for the selected element
 */
function createHighlightOverlay() {
  // Create overlay element if it doesn't exist
  if (!state.highlightOverlay) {
    const overlay = document.createElement("div")
    overlay.id = "papercut-highlight-overlay"
    overlay.style.position = "absolute"
    overlay.style.border = "2px solid #3b82f6"
    overlay.style.backgroundColor = "rgba(59, 130, 246, 0.1)"
    overlay.style.pointerEvents = "none"
    overlay.style.zIndex = "2147483647"
    overlay.style.transition = "all 0.1s ease-in-out"
    overlay.style.display = "none"

    document.body.appendChild(overlay)
    state.highlightOverlay = overlay
  }
}

/**
 * Remove the highlight overlay
 */
function removeHighlightOverlay() {
  if (state.highlightOverlay) {
    state.highlightOverlay.remove()
    state.highlightOverlay = null
  }
}

/**
 * Update the highlight overlay position and size
 */
function updateHighlightOverlay(element: HTMLElement | null) {
  if (!state.highlightOverlay || !element) {
    if (state.highlightOverlay) {
      state.highlightOverlay.style.display = "none"
    }
    return
  }

  const rect = element.getBoundingClientRect()

  state.highlightOverlay.style.display = "block"
  state.highlightOverlay.style.top = `${rect.top + window.scrollY}px`
  state.highlightOverlay.style.left = `${rect.left + window.scrollX}px`
  state.highlightOverlay.style.width = `${rect.width}px`
  state.highlightOverlay.style.height = `${rect.height}px`
}

/**
 * Handle mouse movement during element selection
 */
function handleMouseMove(event: MouseEvent) {
  if (!state.isSelecting) return

  // Get element under cursor
  const element = document.elementFromPoint(
    event.clientX,
    event.clientY
  ) as HTMLElement

  // Skip if it's our overlay or the same element
  if (
    !element ||
    element === state.highlightOverlay ||
    element === state.highlightedElement
  ) {
    return
  }

  // Update highlighted element
  state.highlightedElement = element
  updateHighlightOverlay(element)
}

/**
 * Handle element click during selection
 */
function handleElementClick(event: MouseEvent) {
  if (!state.isSelecting) return

  // Prevent default click behavior
  event.preventDefault()
  event.stopPropagation()

  // Get element under cursor
  const element = document.elementFromPoint(
    event.clientX,
    event.clientY
  ) as HTMLElement

  // Skip if it's our overlay
  if (!element || element === state.highlightOverlay) {
    return
  }

  // Select the element
  selectElement(element)
}

/**
 * Handle key press during selection
 */
function handleKeyDown(event: KeyboardEvent) {
  if (!state.isSelecting) return

  // Cancel selection on Escape
  if (event.key === "Escape") {
    cancelElementSelection()
  }
}

/**
 * Select an element and send its details to the extension
 */
function selectElement(element: HTMLElement) {
  console.log("Element selected:", element)

  // Store the selected element
  state.selectedElement = element

  // Generate a CSS selector for the element
  const selector = generateSelector(element)

  // Get computed styles
  const computedStyles = window.getComputedStyle(element)
  const styles: Record<string, string> = {}

  // Extract relevant CSS properties
  const relevantProperties = [
    "color",
    "background-color",
    "font-family",
    "font-size",
    "font-weight",
    "text-align",
    "line-height",
    "margin",
    "padding",
    "border",
    "border-radius",
    "display",
    "position",
    "width",
    "height",
    "opacity",
    "box-shadow"
  ]

  relevantProperties.forEach((prop) => {
    styles[prop] = computedStyles.getPropertyValue(prop)
  })

  // Send message to extension
  chrome.runtime.sendMessage({
    type: "ELEMENT_SELECTED",
    selector,
    styles
  })

  // End selection mode
  cancelElementSelection()
}

/**
 * Generate a CSS selector for an element
 */
function generateSelector(element: HTMLElement): string {
  // Start with the element's tag name
  let selector = element.tagName.toLowerCase()

  // Add ID if it exists
  if (element.id) {
    selector = `#${element.id}`
  }
  // Otherwise, add classes if they exist
  else if (element.className && typeof element.className === "string") {
    const classes = element.className.trim().split(/\s+/)
    if (classes.length > 0 && classes[0] !== "") {
      selector = `${selector}.${classes.join(".")}`
    }
  }

  // If the selector is still just the tag name, add some context
  if (selector === element.tagName.toLowerCase()) {
    // Add parent context if needed
    let parent = element.parentElement
    let index = 0
    let siblings = parent ? Array.from(parent.children) : []

    siblings.forEach((sibling, i) => {
      if (sibling === element) {
        index = i
      }
    })

    if (parent && siblings.length > 1) {
      const parentSelector = parent.tagName.toLowerCase()
      selector = `${parentSelector} > ${selector}:nth-child(${index + 1})`
    }
  }

  return selector
}

/**
 * Preview a CSS change on an element
 */
function previewCSSChange(selector: string, property: string, value: string) {
  try {
    // Find the element
    const elements = document.querySelectorAll(selector)
    if (elements.length === 0) {
      console.error("Element not found:", selector)
      return
    }

    // Apply the change to all matching elements
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement

      // Store original style if not already stored
      if (!state.originalStyles.has(htmlElement)) {
        state.originalStyles.set(htmlElement, htmlElement.style.cssText)
      }

      // Apply the new style
      htmlElement.style.setProperty(property, value)

      // Store the modified property
      const selectorKey = selector
      if (!state.modifiedElements.has(selectorKey)) {
        state.modifiedElements.set(selectorKey, {})
      }

      const styles = state.modifiedElements.get(selectorKey)!
      styles[property] = value
    })
  } catch (error) {
    console.error("Error previewing CSS change:", error)
  }
}

/**
 * Apply a snapshot of CSS changes
 */
function applySnapshot(changes: any[]) {
  try {
    // Reset any current modifications
    resetAllModifications()

    // Apply each change
    changes.forEach((change) => {
      previewCSSChange(
        change.element_selector,
        change.css_property,
        change.new_value
      )
    })
  } catch (error) {
    console.error("Error applying snapshot:", error)
  }
}

/**
 * Reset all CSS modifications
 */
function resetAllModifications() {
  // Restore original styles
  state.originalStyles.forEach((originalStyle, element) => {
    element.style.cssText = originalStyle
  })

  // Clear stored modifications
  state.originalStyles.clear()
  state.modifiedElements.clear()
}

// Initialize the content script
initialize()
