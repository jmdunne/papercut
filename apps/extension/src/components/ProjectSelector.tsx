/**
 * Project Selector Component
 *
 * This component provides an interface for selecting and managing projects.
 * It allows users to create, select, and manage their design projects.
 */

import React, { useState } from "react"

import { useProjects } from "../hooks/useProjects"
import { Project } from "../lib/types"
import { formatDate } from "../lib/utils"

/**
 * Project selector props
 */
interface ProjectSelectorProps {
  userId: string
  onProjectSelected?: (project: Project) => void
}

/**
 * Project selector component
 */
export default function ProjectSelector({
  userId,
  onProjectSelected
}: ProjectSelectorProps) {
  // Projects hook
  const {
    projects,
    currentProject,
    setCurrentProject,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject
  } = useProjects(userId)

  // Form state
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  /**
   * Handle project selection
   */
  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    onProjectSelected?.(project)
  }

  /**
   * Handle project creation form submission
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!projectName) {
      setFormError("Project name is required")
      return
    }

    try {
      const result = await createProject(projectName, projectDescription)

      if (result.success) {
        setIsCreating(false)
        setProjectName("")
        setProjectDescription("")
        onProjectSelected?.(result.project)
      } else {
        setFormError(result.error || "Failed to create project")
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred")
    }
  }

  /**
   * Handle project update form submission
   */
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!currentProject) {
      setFormError("No project selected")
      return
    }

    if (!projectName) {
      setFormError("Project name is required")
      return
    }

    try {
      const result = await updateProject(currentProject.id, {
        name: projectName,
        description: projectDescription
      })

      if (result.success) {
        setIsEditing(false)
        setProjectName("")
        setProjectDescription("")
      } else {
        setFormError(result.error || "Failed to update project")
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred")
    }
  }

  /**
   * Handle project deletion
   */
  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      const result = await deleteProject(projectId)

      if (!result.success) {
        setFormError(result.error || "Failed to delete project")
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred")
    }
  }

  /**
   * Start editing a project
   */
  const startEditing = (project: Project) => {
    setProjectName(project.name)
    setProjectDescription(project.description || "")
    setIsEditing(true)
    setIsCreating(false)
  }

  /**
   * Start creating a new project
   */
  const startCreating = () => {
    setProjectName("")
    setProjectDescription("")
    setIsCreating(true)
    setIsEditing(false)
  }

  /**
   * Cancel form
   */
  const cancelForm = () => {
    setIsCreating(false)
    setIsEditing(false)
    setProjectName("")
    setProjectDescription("")
    setFormError(null)
  }

  return (
    <div className="project-selector">
      <h2>Your Projects</h2>

      {error && <div className="error-message">{error}</div>}

      {formError && <div className="error-message">{formError}</div>}

      {isLoading ? (
        <div className="loading">Loading projects...</div>
      ) : (
        <>
          {isCreating || isEditing ? (
            <form
              onSubmit={isEditing ? handleUpdateProject : handleCreateProject}>
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectDescription">
                  Description (Optional)
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {isEditing ? "Update Project" : "Create Project"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelForm}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="project-list">
                {projects.length === 0 ? (
                  <div className="no-projects">
                    <p>You don't have any projects yet.</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={`project-item ${
                        currentProject?.id === project.id ? "selected" : ""
                      }`}
                      onClick={() => handleSelectProject(project)}>
                      <div className="project-info">
                        <h3>{project.name}</h3>
                        {project.description && (
                          <p className="description">{project.description}</p>
                        )}
                        <p className="updated-at">
                          Updated {formatDate(project.updated_at)}
                        </p>
                      </div>

                      <div className="project-actions">
                        <button
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(project)
                          }}>
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button className="create-button" onClick={startCreating}>
                Create New Project
              </button>
            </>
          )}
        </>
      )}

      <style jsx>{`
        .project-selector {
          padding: 20px;
        }

        h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .error-message {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .project-list {
          margin-bottom: 20px;
          max-height: 400px;
          overflow-y: auto;
        }

        .no-projects {
          text-align: center;
          padding: 20px;
          color: #666;
          background-color: #f5f5f5;
          border-radius: 4px;
        }

        .project-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .project-item:hover {
          border-color: #00a8ff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .project-item.selected {
          border-color: #00a8ff;
          background-color: #f0f9ff;
        }

        .project-info {
          flex: 1;
        }

        .project-info h3 {
          margin: 0 0 5px;
          color: #333;
        }

        .project-info .description {
          margin: 0 0 5px;
          color: #666;
          font-size: 14px;
        }

        .project-info .updated-at {
          margin: 0;
          color: #999;
          font-size: 12px;
        }

        .project-actions {
          display: flex;
          gap: 5px;
        }

        .edit-button,
        .delete-button {
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .edit-button {
          background-color: #f0f0f0;
          color: #333;
        }

        .delete-button {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .create-button {
          width: 100%;
          padding: 12px;
          background-color: #00a8ff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .create-button:hover {
          background-color: #0096e0;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        input,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #00a8ff;
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .submit-button,
        .cancel-button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .submit-button {
          background-color: #00a8ff;
          color: white;
          flex: 1;
        }

        .cancel-button {
          background-color: #f0f0f0;
          color: #333;
        }
      `}</style>
    </div>
  )
}
