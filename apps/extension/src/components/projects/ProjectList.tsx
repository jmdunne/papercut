/**
 * Project List Component
 *
 * This component displays a list of projects and allows the user to select one.
 */

import React, { useState } from "react"

import { useProjectContext } from "../../contexts/ProjectContext"
import type { Project } from "../../hooks/useProjects"

/**
 * Project List Component Props
 */
interface ProjectListProps {
  /**
   * Optional callback when a project is selected
   */
  onProjectSelect?: () => void
}

/**
 * Project List Component
 *
 * Displays a list of projects and allows the user to select one.
 */
export function ProjectList({ onProjectSelect }: ProjectListProps) {
  const {
    projects,
    collaborations,
    currentProject,
    setCurrentProject,
    loading,
    error,
    createProject,
    fetchProjects
  } = useProjectContext()

  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  /**
   * Handle project selection
   */
  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    // Call the onProjectSelect callback if provided
    if (onProjectSelect) {
      onProjectSelect()
    }
  }

  /**
   * Handle new project form submission
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!newProjectName.trim()) {
      setFormError("Project name is required")
      return
    }

    try {
      const { success, error, project } = await createProject(
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      )

      if (success && project) {
        // Reset form
        setNewProjectName("")
        setNewProjectDescription("")
        setShowNewProjectForm(false)

        // Select the newly created project and navigate to details
        setCurrentProject(project)
        if (onProjectSelect) {
          onProjectSelect()
        }
      } else if (error) {
        setFormError(error)
      }
    } catch (err) {
      setFormError("Failed to create project")
      console.error(err)
    }
  }

  /**
   * Render a project card
   */
  const renderProjectCard = (project: Project, isSelected: boolean) => (
    <div
      key={project.id}
      className={`p-4 mb-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
      }`}
      onClick={() => handleSelectProject(project)}>
      <h3 className="font-medium text-gray-900">{project.name}</h3>
      {project.description && (
        <p className="mt-1 text-sm text-gray-500">{project.description}</p>
      )}
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Updated: {new Date(project.updated_at).toLocaleDateString()}
        </span>
        {project.is_public && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Public
          </span>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error loading projects: {error.message}</p>
        <button
          className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          onClick={() => fetchProjects()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* New Project Button */}
      {!showNewProjectForm ? (
        <button
          className="w-full mb-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setShowNewProjectForm(true)}>
          + New Project
        </button>
      ) : (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-medium text-gray-900 mb-3">Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <div className="mb-3">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Awesome Project"
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
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A brief description of your project"
                rows={2}
              />
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
                onClick={() => setShowNewProjectForm(false)}>
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

      {/* My Projects Section */}
      <h2 className="text-lg font-medium text-gray-900 mb-3">My Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          You don't have any projects yet. Create one to get started!
        </p>
      ) : (
        <div className="mb-6">
          {projects.map((project) =>
            renderProjectCard(project, currentProject?.id === project.id)
          )}
        </div>
      )}

      {/* Collaborations Section */}
      {collaborations.length > 0 && (
        <>
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Shared With Me
          </h2>
          <div>
            {collaborations.map((project) =>
              renderProjectCard(project, currentProject?.id === project.id)
            )}
          </div>
        </>
      )}
    </div>
  )
}
