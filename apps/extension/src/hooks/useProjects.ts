/**
 * Projects Hook
 *
 * This hook provides functionality for managing projects using Supabase.
 * It handles creating, updating, deleting, and fetching projects.
 */

import { useEffect, useState } from "react"

import type { Database } from "../types/supabase"
import { supabase } from "../utils/supabase"

// Type definitions for projects and collaborators
export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectCollaborator =
  Database["public"]["Tables"]["project_collaborators"]["Row"]

interface ProjectsState {
  projects: Project[]
  collaborations: Project[]
  currentProject: Project | null
  loading: boolean
  error: Error | null
}

interface UseProjectsReturn extends ProjectsState {
  fetchProjects: () => Promise
  fetchCollaborations: () => Promise
  createProject: (name: string, description?: string) => Promise
  updateProject: (projectId: string, updates: Partial) => Promise
  deleteProject: (projectId: string) => Promise
  setCurrentProject: (project: Project | null) => void
  addCollaborator: (
    projectId: string,
    collaboratorId: string,
    role: string
  ) => Promise
  removeCollaborator: (projectId: string, collaboratorId: string) => Promise
}

/**
 * Hook for managing projects
 * @param userId - The ID of the current user
 * @returns Projects state and methods
 */
export function useProjects(userId: string | null): UseProjectsReturn {
  console.log(
    "[DEBUG] useProjects: Hook initialized with userId:",
    userId ? "exists" : "null"
  )
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    collaborations: [],
    currentProject: null,
    loading: false,
    error: null
  })

  // Load projects when userId changes
  useEffect(() => {
    console.log(
      "[DEBUG] useProjects: useEffect running, userId:",
      userId ? "exists" : "null"
    )
    if (userId) {
      console.log(
        "[DEBUG] useProjects: User exists, fetching projects and collaborations"
      )
      fetchProjects()
      fetchCollaborations()
    } else {
      console.log("[DEBUG] useProjects: No user, clearing projects state")
      setState((prev) => ({
        ...prev,
        projects: [],
        collaborations: [],
        currentProject: null
      }))
    }
  }, [userId])

  /**
   * Fetch projects owned by the current user
   */
  const fetchProjects = async (): Promise => {
    console.log("[DEBUG] useProjects: fetchProjects called")
    if (!userId) {
      console.log("[DEBUG] useProjects: No userId, clearing projects")
      setState((prev) => ({ ...prev, projects: [] }))
      return
    }

    try {
      console.log("[DEBUG] useProjects: Setting loading=true for fetchProjects")
      setState((prev) => ({ ...prev, loading: true, error: null }))

      console.log("[DEBUG] useProjects: Querying Supabase for projects")
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", userId)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("[DEBUG] useProjects: Error fetching projects:", error)
        console.error(
          "[DEBUG] useProjects: Error details:",
          JSON.stringify({
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
        )
        throw error
      }

      console.log(
        "[DEBUG] useProjects: Projects fetched successfully, count:",
        data?.length || 0
      )
      setState((prev) => ({
        ...prev,
        projects: data || [],
        loading: false
      }))
      console.log(
        "[DEBUG] useProjects: State updated after fetchProjects, loading=false"
      )
    } catch (error) {
      console.error("[DEBUG] useProjects: Exception in fetchProjects:", error)
      console.error(
        "[DEBUG] useProjects: Error details:",
        JSON.stringify(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            name: error instanceof Error ? error.name : "Unknown",
            stack: error instanceof Error ? error.stack : "No stack trace"
          },
          null,
          2
        )
      )
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to fetch projects")
      }))
      console.log(
        "[DEBUG] useProjects: State updated after fetchProjects error, loading=false"
      )
    }
  }

  /**
   * Fetch projects the user collaborates on
   */
  const fetchCollaborations = async (): Promise => {
    console.log("[DEBUG] useProjects: fetchCollaborations called")
    if (!userId) {
      console.log("[DEBUG] useProjects: No userId, clearing collaborations")
      setState((prev) => ({ ...prev, collaborations: [] }))
      return
    }

    try {
      console.log(
        "[DEBUG] useProjects: Setting loading=true for fetchCollaborations"
      )
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // First get the collaborations
      console.log("[DEBUG] useProjects: Querying Supabase for collaborations")
      const { data: collaboratorData, error: collaboratorError } =
        await supabase
          .from("project_collaborators")
          .select("project_id")
          .eq("user_id", userId)

      if (collaboratorError) {
        console.error(
          "[DEBUG] useProjects: Error fetching collaborations:",
          collaboratorError
        )
        console.error(
          "[DEBUG] useProjects: Error details:",
          JSON.stringify({
            message: collaboratorError.message,
            code: collaboratorError.code,
            details: collaboratorError.details,
            hint: collaboratorError.hint
          })
        )
        throw collaboratorError
      }

      if (!collaboratorData || collaboratorData.length === 0) {
        console.log("[DEBUG] useProjects: No collaborations found")
        setState((prev) => ({
          ...prev,
          collaborations: [],
          loading: false
        }))
        console.log(
          "[DEBUG] useProjects: State updated after empty collaborations, loading=false"
        )
        return
      }

      // Then get the actual projects
      console.log(
        "[DEBUG] useProjects: Fetching collaboration projects, count:",
        collaboratorData.length
      )
      const projectIds = collaboratorData.map((c) => c.project_id)
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("updated_at", { ascending: false })

      if (projectError) {
        console.error(
          "[DEBUG] useProjects: Error fetching collaboration projects:",
          projectError
        )
        console.error(
          "[DEBUG] useProjects: Error details:",
          JSON.stringify({
            message: projectError.message,
            code: projectError.code,
            details: projectError.details,
            hint: projectError.hint
          })
        )
        throw projectError
      }

      console.log(
        "[DEBUG] useProjects: Collaboration projects fetched, count:",
        projectData?.length || 0
      )
      setState((prev) => ({
        ...prev,
        collaborations: projectData || [],
        loading: false
      }))
      console.log(
        "[DEBUG] useProjects: State updated after fetchCollaborations, loading=false"
      )
    } catch (error) {
      console.error(
        "[DEBUG] useProjects: Exception in fetchCollaborations:",
        error
      )
      console.error(
        "[DEBUG] useProjects: Error details:",
        JSON.stringify(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            name: error instanceof Error ? error.name : "Unknown",
            stack: error instanceof Error ? error.stack : "No stack trace"
          },
          null,
          2
        )
      )
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch collaborations")
      }))
      console.log(
        "[DEBUG] useProjects: State updated after fetchCollaborations error, loading=false"
      )
    }
  }

  /**
   * Create a new project
   */
  const createProject = async (name: string, description?: string): Promise => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in to create a project")
      }))
      return {
        success: false,
        error: "Not authenticated"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const newProject = {
        name,
        description: description || null,
        owner_id: userId,
        is_public: false
      }

      const { data, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select()
        .single()

      if (error) throw error

      // Add the new project to the list
      setState((prev) => ({
        ...prev,
        projects: [data, ...prev.projects],
        currentProject: data,
        loading: false
      }))

      return { success: true, project: data }
    } catch (error) {
      console.error("Error creating project:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to create project")
      }))
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create project"
      }
    }
  }

  /**
   * Update an existing project
   */
  const updateProject = async (
    projectId: string,
    updates: Partial
  ): Promise => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in to update a project")
      }))
      return {
        success: false,
        error: "Not authenticated"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Ensure updated_at is set
      const updatedProject = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("projects")
        .update(updatedProject)
        .eq("id", projectId)
        .eq("owner_id", userId) // Ensure user owns the project

      if (error) throw error

      // Update local state
      setState((prev) => {
        const updatedProjects = prev.projects.map((p) =>
          p.id === projectId ? { ...p, ...updatedProject } : p
        )

        // Also update currentProject if it's the one being updated
        const updatedCurrentProject =
          prev.currentProject && prev.currentProject.id === projectId
            ? { ...prev.currentProject, ...updatedProject }
            : prev.currentProject

        return {
          ...prev,
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false
        }
      })

      return { success: true }
    } catch (error) {
      console.error("Error updating project:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to update project")
      }))
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update project"
      }
    }
  }

  /**
   * Delete a project
   */
  const deleteProject = async (projectId: string): Promise => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in to delete a project")
      }))
      return {
        success: false,
        error: "Not authenticated"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // First, check if user owns the project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", projectId)
        .single()

      if (projectError) throw projectError

      if (projectData.owner_id !== userId) {
        throw new Error("You do not have permission to delete this project")
      }

      // Delete the project (cascade will handle related records)
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

      if (error) throw error

      // Update local state
      setState((prev) => {
        const updatedProjects = prev.projects.filter((p) => p.id !== projectId)

        // Reset currentProject if it's the one being deleted
        const updatedCurrentProject =
          prev.currentProject && prev.currentProject.id === projectId
            ? null
            : prev.currentProject

        return {
          ...prev,
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          loading: false
        }
      })

      return { success: true }
    } catch (error) {
      console.error("Error deleting project:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to delete project")
      }))
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project"
      }
    }
  }

  /**
   * Set the current active project
   */
  const setCurrentProject = (project: Project | null) => {
    console.log(
      "[DEBUG] useProjects: setCurrentProject called",
      project ? "with project" : "null"
    )
    setState((prev) => ({
      ...prev,
      currentProject: project
    }))
    console.log("[DEBUG] useProjects: Current project updated")
  }

  /**
   * Add a collaborator to a project
   */
  const addCollaborator = async (
    projectId: string,
    collaboratorId: string,
    role: string
  ): Promise => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in to add collaborators")
      }))
      return {
        success: false,
        error: "Not authenticated"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // First, check if user owns the project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", projectId)
        .single()

      if (projectError) throw projectError

      if (projectData.owner_id !== userId) {
        throw new Error(
          "You do not have permission to add collaborators to this project"
        )
      }

      // Add the collaborator
      const newCollaborator = {
        project_id: projectId,
        user_id: collaboratorId,
        role
      }

      const { error } = await supabase
        .from("project_collaborators")
        .insert(newCollaborator)

      if (error) throw error

      setState((prev) => ({ ...prev, loading: false }))
      return { success: true }
    } catch (error) {
      console.error("Error adding collaborator:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to add collaborator")
      }))
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to add collaborator"
      }
    }
  }

  /**
   * Remove a collaborator from a project
   */
  const removeCollaborator = async (
    projectId: string,
    collaboratorId: string
  ): Promise => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in to remove collaborators")
      }))
      return {
        success: false,
        error: "Not authenticated"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // First, check if user owns the project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", projectId)
        .single()

      if (projectError) throw projectError

      if (projectData.owner_id !== userId) {
        throw new Error(
          "You do not have permission to remove collaborators from this project"
        )
      }

      // Remove the collaborator
      const { error } = await supabase
        .from("project_collaborators")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", collaboratorId)

      if (error) throw error

      setState((prev) => ({ ...prev, loading: false }))
      return { success: true }
    } catch (error) {
      console.error("Error removing collaborator:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to remove collaborator")
      }))
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove collaborator"
      }
    }
  }

  return {
    ...state,
    fetchProjects,
    fetchCollaborations,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    addCollaborator,
    removeCollaborator
  }
}
