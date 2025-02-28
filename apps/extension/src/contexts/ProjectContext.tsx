/**
 * Project Context
 *
 * This context provides project state and methods to all components in the app.
 * It wraps the useProjects hook and makes it available through React Context.
 */

import React, { createContext, ReactNode, useContext } from "react"

import { Project, useProjects } from "../hooks/useProjects"
import { useAuthContext } from "./AuthContext"

// Define the shape of the context
interface ProjectContextType {
  projects: Project[]
  collaborations: Project[]
  currentProject: Project | null
  loading: boolean
  error: Error | null
  fetchProjects: () => Promise<void>
  fetchCollaborations: () => Promise<void>
  createProject: (
    name: string,
    description?: string
  ) => Promise<{ success: boolean; project?: Project; error?: string }>
  updateProject: (
    projectId: string,
    updates: Partial<Project>
  ) => Promise<{ success: boolean; error?: string }>
  deleteProject: (
    projectId: string
  ) => Promise<{ success: boolean; error?: string }>
  setCurrentProject: (project: Project | null) => void
  addCollaborator: (
    projectId: string,
    userId: string,
    role: string
  ) => Promise<{ success: boolean; error?: string }>
  removeCollaborator: (
    projectId: string,
    userId: string
  ) => Promise<{ success: boolean; error?: string }>
}

// Create the context with a default value
const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Props for the provider component
interface ProjectProviderProps {
  children: ReactNode
}

/**
 * Project Provider Component
 *
 * Wraps the application and provides project state and methods
 * to all child components through context.
 */
export function ProjectProvider({ children }: ProjectProviderProps) {
  const { user } = useAuthContext()
  const projectsState = useProjects(user?.id || null)

  return (
    <ProjectContext.Provider value={projectsState}>
      {children}
    </ProjectContext.Provider>
  )
}

/**
 * Custom hook to use the project context
 *
 * This hook provides a convenient way to access the project context
 * and ensures that it's being used within a ProjectProvider.
 */
export function useProjectContext() {
  const context = useContext(ProjectContext)

  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider")
  }

  return context
}

/**
 * Higher-order component to ensure a project is selected
 *
 * Wraps a component and only renders it if a project is selected.
 * Otherwise, it renders a fallback component (e.g., project selection screen).
 */
export function withProject<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<{}>
) {
  return function WithProjectComponent(props: P) {
    const { currentProject, loading } = useProjectContext()

    if (loading) {
      // You could return a loading spinner here
      return <div>Loading...</div>
    }

    if (!currentProject) {
      return <FallbackComponent />
    }

    return <Component {...props} />
  }
}
