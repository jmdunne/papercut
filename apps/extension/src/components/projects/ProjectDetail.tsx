/**
 * Project Detail Component
 *
 * This component displays the details of a selected project and provides
 * options for managing the project and its design changes.
 */

import React, { useState } from "react"

import { useDesignContext } from "../../contexts/DesignContext"
import { useProjectContext } from "../../contexts/ProjectContext"

/**
 * Project Detail Component
 *
 * Displays project details and provides options for managing the project.
 */
export function ProjectDetail() {
  const {
    currentProject,
    updateProject,
    loading: projectLoading
  } = useProjectContext()
  const {
    changes,
    snapshots,
    createSnapshot,
    loading: designLoading
  } = useDesignContext()

  const [isEditing, setIsEditing] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [showSnapshotForm, setShowSnapshotForm] = useState(false)
  const [snapshotName, setSnapshotName] = useState("")
  const [snapshotDescription, setSnapshotDescription] = useState("")
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  // If no project is selected, show a message
  if (!currentProject) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Select a project to view its details</p>
      </div>
    )
  }

  /**
   * Start editing the project
   */
  const handleStartEditing = () => {
    setProjectName(currentProject.name)
    setProjectDescription(currentProject.description || "")
    setIsPublic(currentProject.is_public)
    setIsEditing(true)
    setFormError(null)
  }

  /**
   * Cancel editing the project
   */
  const handleCancelEditing = () => {
    setIsEditing(false)
    setFormError(null)
  }

  /**
   * Save project changes
   */
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!projectName.trim()) {
      setFormError("Project name is required")
      return
    }

    try {
      const { success, error } = await updateProject(currentProject.id, {
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        is_public: isPublic
      })

      if (success) {
        setIsEditing(false)
      } else if (error) {
        setFormError(error)
      }
    } catch (err) {
      setFormError("Failed to update project")
      console.error(err)
    }
  }

  /**
   * Create a new snapshot
   */
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault()
    setSnapshotError(null)

    if (!snapshotName.trim()) {
      setSnapshotError("Snapshot name is required")
      return
    }

    try {
      const { success, error } = await createSnapshot(
        snapshotName.trim(),
        snapshotDescription.trim() || undefined
      )

      if (success) {
        setSnapshotName("")
        setSnapshotDescription("")
        setShowSnapshotForm(false)
      } else if (error) {
        setSnapshotError(error)
      }
    } catch (err) {
      setSnapshotError("Failed to create snapshot")
      console.error(err)
    }
  }

  /**
   * Start element inspection
   */
  const startInspection = async () => {
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
                    command: "startSelection",
                    projectId: currentProject.id
                  },
                  "*"
                )
              }
            })
          })

        // Close popup to allow selection
        window.close()
      }
    } catch (error) {
      console.error("Error starting inspection:", error)
    }
  }

  const loading = projectLoading || designLoading

  return (
    <div>
      {/* Project Header */}
      {!isEditing ? (
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                {currentProject.name}
              </h2>
              {currentProject.description && (
                <p className="mt-1 text-gray-500">
                  {currentProject.description}
                </p>
              )}
            </div>
            <button
              onClick={handleStartEditing}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Edit
            </button>
          </div>
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <span className="mr-4">
              Updated:{" "}
              {new Date(currentProject.updated_at).toLocaleDateString()}
            </span>
            {currentProject.is_public && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Public
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-medium text-gray-900 mb-3">Edit Project</h3>
          <form onSubmit={handleSaveProject}>
            <div className="mb-3">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="projectDescription"
                className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="mb-3 flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublic"
                className="ml-2 block text-sm text-gray-700">
                Make project public
              </label>
            </div>
            {formError && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                {formError}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleCancelEditing}>
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={startInspection}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}>
          Select Element
        </button>
        <button
          onClick={() => setShowSnapshotForm(true)}
          className="flex-1 py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading || changes.length === 0}>
          Create Snapshot
        </button>
      </div>

      {/* Snapshot Form */}
      {showSnapshotForm && (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-medium text-gray-900 mb-3">Create Snapshot</h3>
          <form onSubmit={handleCreateSnapshot}>
            <div className="mb-3">
              <label
                htmlFor="snapshotName"
                className="block text-sm font-medium text-gray-700 mb-1">
                Snapshot Name
              </label>
              <input
                id="snapshotName"
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Version 1.0"
                required
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="snapshotDescription"
                className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="snapshotDescription"
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Initial design"
                rows={2}
              />
            </div>
            {snapshotError && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                {snapshotError}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setShowSnapshotForm(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}>
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Changes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Recent Changes
        </h3>
        {changes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No changes yet. Select an element to start editing.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {changes.slice(0, 10).map((change) => (
              <div
                key={change.id}
                className="p-3 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    {change.element_selector}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(change.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-gray-700">{change.css_property}:</span>{" "}
                  <span className="text-red-500">{change.previous_value}</span>{" "}
                  <span className="text-gray-500">→</span>{" "}
                  <span className="text-green-500">{change.new_value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshots */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Snapshots</h3>
        {snapshots.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No snapshots yet. Create one to save your current design state.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="p-3 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    {snapshot.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(snapshot.created_at).toLocaleDateString()}
                  </span>
                </div>
                {snapshot.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {snapshot.description}
                  </p>
                )}
                <div className="mt-2 flex space-x-2">
                  <button
                    className="px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onClick={() => {
                      /* Apply snapshot */
                    }}>
                    Apply
                  </button>
                  <button
                    className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500"
                    onClick={() => {
                      /* Delete snapshot */
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
