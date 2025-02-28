/**
 * Element Selector Component
 *
 * This component provides functionality for selecting elements on the page.
 * It injects a script into the active tab to enable element selection and highlighting.
 */

import React, { useEffect, useState } from "react"

import { useProjectContext } from "../../contexts/ProjectContext"
import { CSSEditor } from "./CSSEditor"

/**
 * Element Selector Props
 */
interface ElementSelectorProps {
  onClose: () => void
}

/**
 * Selected Element Interface
 */
interface SelectedElement {
  selector: string
  styles: Record<string, string>
}

/**
 * Element Selector Component
 */
export function ElementSelector({ onClose }: ElementSelectorProps) {
  const { currentProject } = useProjectContext()
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Start element selection mode
   */
  const startSelection = async () => {
    if (!currentProject) {
      setError("No project selected")
      return
    }

    setIsSelecting(true)
    setError(null)

    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id) {
        // Send message to content script to start selection mode
        await chrome.tabs
          .sendMessage(tab.id, {
            type: "START_SELECTION",
            projectId: currentProject.id
          })
          .catch(async (err) => {
            console.log("Content script not loaded, injecting...", err)

            // If content script is not loaded, inject it
            await chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              func: () => {
                window.postMessage(
                  {
                    source: "papercut-extension",
                    command: "startSelection"
                  },
                  "*"
                )
              }
            })
          })

        // Listen for element selection message from content script
        const handleMessage = (message: any) => {
          if (message.type === "ELEMENT_SELECTED") {
            setSelectedElement({
              selector: message.selector,
              styles: message.styles
            })
            setIsSelecting(false)
            window.removeEventListener("message", handleMessage)
          }
        }

        // Add message listener
        chrome.runtime.onMessage.addListener(handleMessage)

        // Set timeout to cancel selection after 30 seconds
        setTimeout(() => {
          if (isSelecting) {
            setIsSelecting(false)
            setError("Selection timed out. Please try again.")
            chrome.runtime.onMessage.removeListener(handleMessage)
          }
        }, 30000)
      }
    } catch (error) {
      console.error("Error starting selection:", error)
      setIsSelecting(false)
      setError("Failed to start element selection")
    }
  }

  /**
   * Cancel element selection
   */
  const cancelSelection = async () => {
    setIsSelecting(false)

    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id) {
        // Send message to content script to cancel selection
        await chrome.tabs
          .sendMessage(tab.id, {
            type: "CANCEL_SELECTION"
          })
          .catch((err) => {
            console.log("Content script not loaded or already cancelled", err)
          })
      }
    } catch (error) {
      console.error("Error cancelling selection:", error)
    }
  }

  /**
   * Handle closing the element selector
   */
  const handleClose = () => {
    if (isSelecting) {
      cancelSelection()
    }
    onClose()
  }

  // Start selection when component mounts
  useEffect(() => {
    startSelection()

    // Cleanup on unmount
    return () => {
      if (isSelecting) {
        cancelSelection()
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {!selectedElement ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Select an Element
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500">
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

          {isSelecting ? (
            <div className="text-center py-8">
              <div className="animate-pulse mb-4">
                <svg
                  className="h-12 w-12 mx-auto text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <p className="text-gray-700 mb-2">
                Click on any element on the page to select it
              </p>
              <p className="text-sm text-gray-500">
                Move your cursor over the page to highlight elements
              </p>
              <button
                onClick={cancelSelection}
                className="mt-4 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Cancel Selection
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              {error ? (
                <div>
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={startSelection}
                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Try Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={startSelection}
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Start Selection
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <CSSEditor
          elementSelector={selectedElement.selector}
          initialStyles={selectedElement.styles}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
