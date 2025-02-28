/**
 * Utility functions for the Papercut extension
 *
 * This file contains helper functions used throughout the extension.
 */

import { SelectedElement } from "./types"

/**
 * Generate a unique CSS selector for an element
 * This helps identify elements uniquely on a page
 *
 * @param element - The DOM element to generate a selector for
 * @returns A unique CSS selector string
 */
export function generateUniqueSelector(element: HTMLElement): string {
  // Start with the tag name
  let selector = element.tagName.toLowerCase()

  // Add ID if it exists
  if (element.id) {
    return `${selector}#${element.id}`
  }

  // Add classes if they exist
  if (element.className && typeof element.className === "string") {
    const classes = element.className.trim().split(/\s+/)
    if (classes.length > 0 && classes[0] !== "") {
      selector += "." + classes.join(".")
    }
  }

  // Add position among siblings if needed
  const siblings = element.parentNode
    ? Array.from(element.parentNode.children)
    : []
  if (siblings.length > 1) {
    const index = siblings.indexOf(element) + 1
    selector += `:nth-child(${index})`
  }

  // Add parent context if needed for uniqueness
  if (element.parentElement && element.parentElement.tagName !== "BODY") {
    const parentSelector = generateUniqueSelector(element.parentElement)
    selector = `${parentSelector} > ${selector}`
  }

  return selector
}

/**
 * Get computed styles for an element
 *
 * @param element - The DOM element to get styles for
 * @returns The computed style declaration
 */
export function getComputedStyles(element: HTMLElement): CSSStyleDeclaration {
  return window.getComputedStyle(element)
}

/**
 * Create a selected element object from a DOM element
 *
 * @param element - The DOM element that was selected
 * @returns A SelectedElement object with all necessary information
 */
export function createSelectedElement(element: HTMLElement): SelectedElement {
  return {
    selector: generateUniqueSelector(element),
    element: element,
    computedStyles: getComputedStyles(element),
    boundingRect: element.getBoundingClientRect()
  }
}

/**
 * Apply a CSS style change to an element
 *
 * @param selector - The CSS selector for the element
 * @param property - The CSS property to change
 * @param value - The new value for the property
 * @returns Whether the change was successfully applied
 */
export function applyStyleChange(
  selector: string,
  property: string,
  value: string
): boolean {
  try {
    const elements = document.querySelectorAll(selector)
    if (elements.length === 0) {
      return false
    }

    elements.forEach((el) => {
      ;(el as HTMLElement).style[property as any] = value
    })

    return true
  } catch (error) {
    console.error("Error applying style change:", error)
    return false
  }
}

/**
 * Format a date for display
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

/**
 * Create a debounced function
 * Useful for handling rapid events like resize or input changes
 *
 * @param func - The function to debounce
 * @param wait - The debounce delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = undefined
      func(...args)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}
