/**
 * CSS Editor Component
 *
 * This component provides a UI for editing CSS properties of selected elements.
 * It allows users to modify properties like color, background, font, spacing, etc.
 */

import React, { useEffect, useState } from "react"

import { useDesignContext } from "../../contexts/DesignContext"

/**
 * CSS Property Interface
 */
interface CSSProperty {
  name: string
  value: string
  category: "color" | "typography" | "layout" | "spacing" | "effects" | "other"
  type: "color" | "text" | "select" | "number" | "range"
  options?: string[]
  unit?: string
  min?: number
  max?: number
  step?: number
}

/**
 * CSS Editor Props
 */
interface CSSEditorProps {
  elementSelector: string
  initialStyles: Record<string, string>
  onClose: () => void
}

/**
 * CSS Editor Component
 */
export function CSSEditor({
  elementSelector,
  initialStyles,
  onClose
}: CSSEditorProps) {
  const { createChange } = useDesignContext()
  const [styles, setStyles] = useState<Record<string, string>>(
    initialStyles || {}
  )
  const [activeCategory, setActiveCategory] = useState<string>("color")
  const [previewStyles, setPreviewStyles] = useState<Record<string, string>>(
    initialStyles || {}
  )
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Common CSS properties organized by category
  const cssProperties: CSSProperty[] = [
    // Color properties
    {
      name: "color",
      value: styles.color || "",
      category: "color",
      type: "color"
    },
    {
      name: "background-color",
      value: styles.backgroundColor || "",
      category: "color",
      type: "color"
    },
    {
      name: "border-color",
      value: styles.borderColor || "",
      category: "color",
      type: "color"
    },

    // Typography properties
    {
      name: "font-family",
      value: styles.fontFamily || "",
      category: "typography",
      type: "select",
      options: [
        "Arial",
        "Helvetica",
        "Times New Roman",
        "Georgia",
        "Courier New",
        "Verdana",
        "system-ui",
        "sans-serif",
        "serif",
        "monospace"
      ]
    },
    {
      name: "font-size",
      value: styles.fontSize || "",
      category: "typography",
      type: "number",
      unit: "px",
      min: 8,
      max: 72,
      step: 1
    },
    {
      name: "font-weight",
      value: styles.fontWeight || "",
      category: "typography",
      type: "select",
      options: [
        "normal",
        "bold",
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900"
      ]
    },
    {
      name: "text-align",
      value: styles.textAlign || "",
      category: "typography",
      type: "select",
      options: ["left", "center", "right", "justify"]
    },
    {
      name: "line-height",
      value: styles.lineHeight || "",
      category: "typography",
      type: "number",
      min: 0.5,
      max: 3,
      step: 0.1
    },

    // Layout properties
    {
      name: "display",
      value: styles.display || "",
      category: "layout",
      type: "select",
      options: ["block", "inline", "inline-block", "flex", "grid", "none"]
    },
    {
      name: "position",
      value: styles.position || "",
      category: "layout",
      type: "select",
      options: ["static", "relative", "absolute", "fixed", "sticky"]
    },
    {
      name: "width",
      value: styles.width || "",
      category: "layout",
      type: "text"
    },
    {
      name: "height",
      value: styles.height || "",
      category: "layout",
      type: "text"
    },

    // Spacing properties
    {
      name: "margin",
      value: styles.margin || "",
      category: "spacing",
      type: "text"
    },
    {
      name: "padding",
      value: styles.padding || "",
      category: "spacing",
      type: "text"
    },
    {
      name: "margin-top",
      value: styles.marginTop || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "margin-right",
      value: styles.marginRight || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "margin-bottom",
      value: styles.marginBottom || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "margin-left",
      value: styles.marginLeft || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "padding-top",
      value: styles.paddingTop || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "padding-right",
      value: styles.paddingRight || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "padding-bottom",
      value: styles.paddingBottom || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },
    {
      name: "padding-left",
      value: styles.paddingLeft || "",
      category: "spacing",
      type: "number",
      unit: "px",
      min: 0,
      max: 100,
      step: 1
    },

    // Effects properties
    {
      name: "border-width",
      value: styles.borderWidth || "",
      category: "effects",
      type: "number",
      unit: "px",
      min: 0,
      max: 20,
      step: 1
    },
    {
      name: "border-style",
      value: styles.borderStyle || "",
      category: "effects",
      type: "select",
      options: ["none", "solid", "dashed", "dotted", "double"]
    },
    {
      name: "border-radius",
      value: styles.borderRadius || "",
      category: "effects",
      type: "number",
      unit: "px",
      min: 0,
      max: 50,
      step: 1
    },
    {
      name: "box-shadow",
      value: styles.boxShadow || "",
      category: "effects",
      type: "text"
    },
    {
      name: "opacity",
      value: styles.opacity || "",
      category: "effects",
      type: "range",
      min: 0,
      max: 1,
      step: 0.01
    }
  ]

  // Filter properties by active category
  const filteredProperties = cssProperties.filter(
    (prop) => prop.category === activeCategory
  )

  /**
   * Handle property change
   */
  const handlePropertyChange = (name: string, value: string) => {
    // Update the styles state
    setStyles((prev) => ({
      ...prev,
      [name]: value
    }))

    // Update the preview styles
    setPreviewStyles((prev) => ({
      ...prev,
      [name]: value
    }))

    // Send message to content script to preview the change
    previewChange(name, value)
  }

  /**
   * Preview a CSS change in the content script
   */
  const previewChange = async (property: string, value: string) => {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id) {
        // Send message to content script to preview the change
        await chrome.tabs
          .sendMessage(tab.id, {
            type: "PREVIEW_CHANGE",
            elementSelector,
            property,
            value
          })
          .catch(async (err) => {
            console.log("Content script not loaded, injecting...", err)

            // If content script is not loaded, inject it
            await chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              func: (selector, prop, val) => {
                window.postMessage(
                  {
                    source: "papercut-extension",
                    command: "previewChange",
                    elementSelector: selector,
                    property: prop,
                    value: val
                  },
                  "*"
                )
              },
              args: [elementSelector, property, value]
            })
          })
      }
    } catch (error) {
      console.error("Error previewing change:", error)
    }
  }

  /**
   * Apply all changes
   */
  const applyChanges = async () => {
    setIsApplying(true)
    setError(null)

    try {
      // Compare initial styles with current styles to find changes
      const changedProperties = Object.keys(styles).filter(
        (prop) => styles[prop] !== initialStyles[prop]
      )

      if (changedProperties.length === 0) {
        setIsApplying(false)
        onClose()
        return
      }

      // Create a design change for each changed property
      for (const property of changedProperties) {
        const previousValue = initialStyles[property] || ""
        const newValue = styles[property]

        const { success, error } = await createChange(
          elementSelector,
          property,
          previousValue,
          newValue
        )

        if (!success) {
          throw new Error(error || "Failed to save changes")
        }
      }

      // Close the editor after successful changes
      onClose()
    } catch (err) {
      console.error("Error applying changes:", err)
      setError(err instanceof Error ? err.message : "Failed to apply changes")
    } finally {
      setIsApplying(false)
    }
  }

  /**
   * Reset changes to initial values
   */
  const resetChanges = () => {
    setStyles(initialStyles)
    setPreviewStyles(initialStyles)

    // Reset all properties in the content script
    Object.keys(initialStyles).forEach((property) => {
      previewChange(property, initialStyles[property])
    })
  }

  /**
   * Render an input field based on property type
   */
  const renderInput = (property: CSSProperty) => {
    switch (property.type) {
      case "color":
        return (
          <input
            type="color"
            value={property.value || "#000000"}
            onChange={(e) =>
              handlePropertyChange(property.name, e.target.value)
            }
            className="w-10 h-10 rounded border border-gray-300"
          />
        )

      case "select":
        return (
          <select
            value={property.value}
            onChange={(e) =>
              handlePropertyChange(property.name, e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select...</option>
            {property.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case "number":
        return (
          <div className="flex items-center">
            <input
              type="number"
              value={property.value}
              min={property.min}
              max={property.max}
              step={property.step}
              onChange={(e) =>
                handlePropertyChange(
                  property.name,
                  e.target.value + (property.unit || "")
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {property.unit && (
              <span className="ml-2 text-gray-500">{property.unit}</span>
            )}
          </div>
        )

      case "range":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              value={property.value || 0}
              min={property.min}
              max={property.max}
              step={property.step}
              onChange={(e) =>
                handlePropertyChange(property.name, e.target.value)
              }
              className="w-full"
            />
            <span className="text-gray-700 min-w-[40px] text-right">
              {property.value || 0}
            </span>
          </div>
        )

      case "text":
      default:
        return (
          <input
            type="text"
            value={property.value}
            onChange={(e) =>
              handlePropertyChange(property.name, e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${property.name}`}
          />
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Edit Element: <span className="text-blue-600">{elementSelector}</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {["color", "typography", "layout", "spacing", "effects"].map(
          (category) => (
            <button
              key={category}
              className={`px-4 py-2 font-medium text-sm ${
                activeCategory === category
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveCategory(category)}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Property Inputs */}
      <div className="max-h-80 overflow-y-auto">
        {filteredProperties.map((property) => (
          <div key={property.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {property.name}
            </label>
            {renderInput(property)}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          type="button"
          onClick={resetChanges}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Reset
        </button>
        <button
          type="button"
          onClick={applyChanges}
          disabled={isApplying}
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
          {isApplying ? "Applying..." : "Apply Changes"}
        </button>
      </div>
    </div>
  )
}
