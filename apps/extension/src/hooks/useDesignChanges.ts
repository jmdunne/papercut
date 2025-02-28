/**
 * Design Changes Hook
 *
 * This hook provides functionality for managing design changes using Supabase.
 * It handles tracking, saving, and retrieving design modifications.
 */

import { useEffect, useState } from "react"

import type { Database } from "../types/supabase"
import { supabase } from "../utils/supabase"

// Type definitions for design changes and snapshots
export type DesignChange = Database["public"]["Tables"]["design_changes"]["Row"]
export type DesignSnapshot =
  Database["public"]["Tables"]["design_snapshots"]["Row"]

interface DesignChangesState {
  changes: DesignChange[]
  snapshots: DesignSnapshot[]
  loading: boolean
  error: Error | null
}

interface UseDesignChangesReturn extends DesignChangesState {
  fetchChanges: () => Promise<void>
  fetchSnapshots: () => Promise<void>
  saveChange: (
    elementSelector: string,
    cssProperty: string,
    previousValue: string | undefined,
    newValue: string
  ) => Promise<{ success: boolean; change?: DesignChange; error?: string }>
  createSnapshot: (
    name: string,
    description?: string,
    thumbnailUrl?: string
  ) => Promise<{ success: boolean; snapshot?: DesignSnapshot; error?: string }>
  deleteSnapshot: (
    snapshotId: string
  ) => Promise<{ success: boolean; error?: string }>
  getSnapshotChanges: (
    snapshotId: string
  ) => Promise<{ changes: DesignChange[]; error?: string }>
  applySnapshot: (
    snapshotId: string
  ) => Promise<{ success: boolean; error?: string }>
}

/**
 * Hook for managing design changes
 * @param projectId - The ID of the current project
 * @param userId - The ID of the current user
 * @returns Design changes state and methods
 */
export function useDesignChanges(
  projectId: string | null,
  userId: string | null
): UseDesignChangesReturn {
  const [state, setState] = useState<DesignChangesState>({
    changes: [],
    snapshots: [],
    loading: false,
    error: null
  })

  // Load initial data when projectId or userId changes
  useEffect(() => {
    if (projectId && userId) {
      fetchChanges()
      fetchSnapshots()
    } else {
      setState((prev) => ({
        ...prev,
        changes: [],
        snapshots: []
      }))
    }
  }, [projectId, userId])

  /**
   * Fetch design changes for the current project
   */
  const fetchChanges = async () => {
    if (!projectId || !userId) {
      setState((prev) => ({ ...prev, changes: [] }))
      return
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase
        .from("design_changes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setState((prev) => ({
        ...prev,
        changes: data || [],
        loading: false
      }))
    } catch (error) {
      console.error("Error fetching design changes:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch design changes")
      }))
    }
  }

  /**
   * Fetch snapshots for the current project
   */
  const fetchSnapshots = async () => {
    if (!projectId || !userId) {
      setState((prev) => ({ ...prev, snapshots: [] }))
      return
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase
        .from("design_snapshots")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setState((prev) => ({
        ...prev,
        snapshots: data || [],
        loading: false
      }))
    } catch (error) {
      console.error("Error fetching snapshots:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch snapshots")
      }))
    }
  }

  /**
   * Save a new design change
   */
  const saveChange = async (
    elementSelector: string,
    cssProperty: string,
    previousValue: string | undefined,
    newValue: string
  ) => {
    if (!projectId || !userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in and have a project selected")
      }))
      return {
        success: false,
        error: "Not authenticated or no project selected"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const newChange = {
        project_id: projectId,
        element_selector: elementSelector,
        css_property: cssProperty,
        previous_value: previousValue || null,
        new_value: newValue,
        created_by: userId
      }

      const { data, error } = await supabase
        .from("design_changes")
        .insert(newChange)
        .select()
        .single()

      if (error) throw error

      // Add the new change to the list
      setState((prev) => ({
        ...prev,
        changes: [data, ...prev.changes],
        loading: false
      }))

      // Update the project's updated_at timestamp
      await supabase
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", projectId)

      return { success: true, change: data }
    } catch (error) {
      console.error("Error saving design change:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to save design change")
      }))
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save design change"
      }
    }
  }

  /**
   * Create a new snapshot of the current design state
   */
  const createSnapshot = async (
    name: string,
    description?: string,
    thumbnailUrl?: string
  ) => {
    if (!projectId || !userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in and have a project selected")
      }))
      return {
        success: false,
        error: "Not authenticated or no project selected"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const newSnapshot = {
        project_id: projectId,
        name,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        created_by: userId
      }

      const { data, error } = await supabase
        .from("design_snapshots")
        .insert(newSnapshot)
        .select()
        .single()

      if (error) throw error

      // Add the new snapshot to the list
      setState((prev) => ({
        ...prev,
        snapshots: [data, ...prev.snapshots],
        loading: false
      }))

      // Update all recent changes to associate them with this snapshot
      const recentChanges = state.changes.slice(0, 100) // Limit to last 100 changes

      if (recentChanges.length > 0) {
        const changeIds = recentChanges.map((c) => c.id)

        await supabase
          .from("design_changes")
          .update({ snapshot_id: data.id })
          .in("id", changeIds)

        // Update local changes state
        setState((prev) => ({
          ...prev,
          changes: prev.changes.map((c) =>
            changeIds.includes(c.id) ? { ...c, snapshot_id: data.id } : c
          )
        }))
      }

      return { success: true, snapshot: data }
    } catch (error) {
      console.error("Error creating snapshot:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to create snapshot")
      }))
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create snapshot"
      }
    }
  }

  /**
   * Delete a snapshot
   */
  const deleteSnapshot = async (snapshotId: string) => {
    if (!projectId || !userId) {
      setState((prev) => ({
        ...prev,
        error: new Error("You must be logged in and have a project selected")
      }))
      return {
        success: false,
        error: "Not authenticated or no project selected"
      }
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // First, remove snapshot_id from associated changes
      await supabase
        .from("design_changes")
        .update({ snapshot_id: null })
        .eq("snapshot_id", snapshotId)

      // Then delete the snapshot
      const { error } = await supabase
        .from("design_snapshots")
        .delete()
        .eq("id", snapshotId)

      if (error) throw error

      // Update local state
      setState((prev) => ({
        ...prev,
        snapshots: prev.snapshots.filter((s) => s.id !== snapshotId),
        changes: prev.changes.map((c) =>
          c.snapshot_id === snapshotId ? { ...c, snapshot_id: null } : c
        ),
        loading: false
      }))

      return { success: true }
    } catch (error) {
      console.error("Error deleting snapshot:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to delete snapshot")
      }))
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete snapshot"
      }
    }
  }

  /**
   * Get all changes associated with a snapshot
   */
  const getSnapshotChanges = async (snapshotId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase
        .from("design_changes")
        .select("*")
        .eq("snapshot_id", snapshotId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setState((prev) => ({ ...prev, loading: false }))
      return { changes: data || [] }
    } catch (error) {
      console.error("Error fetching snapshot changes:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch snapshot changes")
      }))
      return {
        changes: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch snapshot changes"
      }
    }
  }

  /**
   * Apply a snapshot to the current design
   * This is a placeholder for the actual implementation
   */
  const applySnapshot = async (snapshotId: string) => {
    try {
      // Get all changes associated with the snapshot
      const { changes, error } = await getSnapshotChanges(snapshotId)

      if (error) throw new Error(error)

      // This would typically involve sending a message to the content script
      // to apply these changes to the DOM
      console.log(
        `Applying snapshot ${snapshotId} with ${changes.length} changes`
      )

      // Implementation will depend on how you're applying changes to the DOM

      return { success: true }
    } catch (error) {
      console.error("Error applying snapshot:", error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to apply snapshot"
      }
    }
  }

  return {
    ...state,
    fetchChanges,
    fetchSnapshots,
    saveChange,
    createSnapshot,
    deleteSnapshot,
    getSnapshotChanges,
    applySnapshot
  }
}
