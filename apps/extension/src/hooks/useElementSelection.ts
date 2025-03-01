/**
 * Element Selection Hook
 *
 * This hook provides functionality for selecting and manipulating DOM elements.
 * It handles element selection, highlighting, and style manipulation.
 */

import { useCallback, useEffect, useState } from "react"

import type { SelectedElement } from "../lib/types"
import { createSelectedElement } from "../lib/utils"

/**
 * Hook for managing element selection
 * @returns Element selection state and methods
 */
export function useElementSelection() {
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null)
  const [isSelecting, setIsSelecting] = useState<boolean>(false)
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Start the element selection mode
   */
  const startSelectionMode = useCallback(() => {
    setIsSelecting(true)
    setError(null)
  }, [])

  /**
   * Stop the element selection mode
   */
  const stopSelectionMode = useCallback(() => {
    setIsSelecting(false)

    // Remove highlight if any
    if (highlightedElement) {
      setHighlightedElement(null)
    }
  }, [highlightedElement])

  /**
   * Handle element selection
   */
  const selectElement = useCallback((element: HTMLElement) => {
    try {
      const selected = createSelectedElement(element)
      setSelectedElement(selected)
      setIsSelecting(false)
      return selected
    } catch (error: any) {
      console.error("Error selecting element:", error)
      setError(error.message || "Failed to select element")
      return null
    }
  }, [])

  /**
   * Clear the current selection
   */
  const clearSelection = useCallback(() => {
    setSelectedElement(null)
  }, [])

  /**
   * Update the selected element's style
   */
  const updateElementStyle = useCallback(
    (property: string, value: string) => {
      if (!selectedElement) {
        setError("No element selected")
        return false
      }

      try {
        selectedElement.element.style[property as any] = value

        // Update the selected element with new computed styles
        setSelectedElement({
          ...selectedElement,
          computedStyles: window.getComputedStyle(selectedElement.element)
        })

        return true
      } catch (error: any) {
        console.error("Error updating element style:", error)
        setError(error.message || "Failed to update element style")
        return false
      }
    },
    [selectedElement]
  )

  /**
   * Get the current value of a CSS property for the selected element
   */
  const getElementStyleValue = useCallback(
    (property: string): string => {
      if (!selectedElement) {
        return ""
      }

      return selectedElement.computedStyles.getPropertyValue(property)
    },
    [selectedElement]
  )

  /**
   * Handle mouseover during selection mode
   */
  const handleMouseOver = useCallback(
    (event: MouseEvent) => {
      if (!isSelecting) return

      event.stopPropagation()

      const target = event.target as HTMLElement

      // Skip body and html elements
      if (target.tagName === "BODY" || target.tagName === "HTML") {
        return
      }

      // Remove previous highlight
      if (highlightedElement && highlightedElement !== target) {
        highlightedElement.style.outline = ""
      }

      // Add highlight to current element
      target.style.outline = "2px solid #00a8ff"
      setHighlightedElement(target)
    },
    [isSelecting, highlightedElement]
  )

  /**
   * Handle click during selection mode
   */
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!isSelecting) return

      event.preventDefault()
      event.stopPropagation()

      const target = event.target as HTMLElement

      // Skip body and html elements
      if (target.tagName === "BODY" || target.tagName === "HTML") {
        return
      }

      // Remove highlight
      if (highlightedElement) {
        highlightedElement.style.outline = ""
      }

      // Select the element
      selectElement(target)
    },
    [isSelecting, highlightedElement, selectElement]
  )

  // Set up event listeners for element selection
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener("mouseover", handleMouseOver)
      document.addEventListener("click", handleClick)

      // Change cursor to indicate selection mode
      document.body.style.cursor = "crosshair"
    } else {
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("click", handleClick)

      // Reset cursor
      document.body.style.cursor = ""

      // Remove highlight if any
      if (highlightedElement) {
        highlightedElement.style.outline = ""
        setHighlightedElement(null)
      }
    }

    return () => {
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("click", handleClick)
      document.body.style.cursor = ""

      // Remove highlight if any
      if (highlightedElement) {
        highlightedElement.style.outline = ""
      }
    }
  }, [isSelecting, handleMouseOver, handleClick, highlightedElement])

  return {
    selectedElement,
    isSelecting,
    error,
    startSelectionMode,
    stopSelectionMode,
    selectElement,
    clearSelection,
    updateElementStyle,
    getElementStyleValue
  }
}
