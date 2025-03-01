/**
 * Design Context
 *
 * This context provides access to design changes and snapshots for the current project.
 * It manages the state of design changes and provides methods for creating and applying snapshots.
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProjectContext } from './ProjectContext'
import { supabase } from '../utils/supabase'

/**
 * Design Change Interface
 */
export interface DesignChange {
  id: string
  project_id: string
  element_selector: string
  css_property: string
  previous_value: string
  new_value: string
  created_at: string
  created_by: string
}

/**
 * Snapshot Interface
 */
export interface Snapshot {
  id: string
  project_id: string
  name: string
  description?: string
  created_at: string
  created_by: string
}

/**
 * Design Context Interface
 */
interface DesignContextType {
  changes: DesignChange[]
  snapshots: Snapshot[]
  loading: boolean
  error: Error | null
  fetchChanges: () => Promise<void>
  fetchSnapshots: () => Promise<void>
  createChange: (
    elementSelector: string,
    cssProperty: string,
    previousValue: string,
    newValue: string
  ) => Promise<{ success: boolean; error?: string; change?: DesignChange }>
  createSnapshot: (
    name: string,
    description?: string
  ) => Promise<{ success: boolean; error?: string; snapshot?: Snapshot }>
  applySnapshot: (
    snapshotId: string
  ) => Promise<{ success: boolean; error?: string }>
  deleteSnapshot: (
    snapshotId: string
  ) => Promise<{ success: boolean; error?: string }>
}

/**
 * Design Context
 */
const DesignContext = createContext<DesignContextType | undefined>(undefined)

/**
 * Design Provider Props
 */
interface DesignProviderProps {
  children: React.ReactNode
}

/**
 * Design Provider Component
 * 
 * Provides design context to child components.
 */
export function DesignProvider({ children }: DesignProviderProps) {
  const { currentProject } = useProjectContext()
  
  const [changes, setChanges] = useState<DesignChange[]>([])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Fetch design changes for the current project
   */
  const fetchChanges = async () => {
    if (!currentProject) {
      setChanges([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('design_changes')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      setChanges(data || [])
    } catch (err) {
      console.error('Error fetching design changes:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch design changes'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch snapshots for the current project
   */
  const fetchSnapshots = async () => {
    if (!currentProject) {
      setSnapshots([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('snapshots')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      setSnapshots(data || [])
    } catch (err) {
      console.error('Error fetching snapshots:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch snapshots'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new design change
   */
  const createChange = async (
    elementSelector: string,
    cssProperty: string,
    previousValue: string,
    newValue: string
  ) => {
    if (!currentProject) {
      return { success: false, error: 'No project selected' }
    }

    try {
      const { data, error } = await supabase
        .from('design_changes')
        .insert([
          {
            project_id: currentProject.id,
            element_selector: elementSelector,
            css_property: cssProperty,
            previous_value: previousValue,
            new_value: newValue
          }
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setChanges(prevChanges => [data, ...prevChanges])

      return { success: true, change: data }
    } catch (err) {
      console.error('Error creating design change:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create design change' 
      }
    }
  }

  /**
   * Create a new snapshot
   */
  const createSnapshot = async (name: string, description?: string) => {
    if (!currentProject) {
      return { success: false, error: 'No project selected' }
    }

    try {
      // First, create the snapshot record
      const { data: snapshot, error: snapshotError } = await supabase
        .from('snapshots')
        .insert([
          {
            project_id: currentProject.id,
            name,
            description
          }
        ])
        .select()
        .single()

      if (snapshotError) {
        throw new Error(snapshotError.message)
      }

      // Then, create snapshot_changes records for all current changes
      if (changes.length > 0) {
        const snapshotChanges = changes.map(change => ({
          snapshot_id: snapshot.id,
          design_change_id: change.id
        }))

        const { error: relationsError } = await supabase
          .from('snapshot_changes')
          .insert(snapshotChanges)

        if (relationsError) {
          throw new Error(relationsError.message)
        }
      }

      // Update local state
      setSnapshots(prevSnapshots => [snapshot, ...prevSnapshots])

      return { success: true, snapshot }
    } catch (err) {
      console.error('Error creating snapshot:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create snapshot' 
      }
    }
  }

  /**
   * Apply a snapshot to the current project
   */
  const applySnapshot = async (snapshotId: string) => {
    if (!currentProject) {
      return { success: false, error: 'No project selected' }
    }

    try {
      // Get all changes associated with this snapshot
      const { data: snapshotChanges, error: relationsError } = await supabase
        .from('snapshot_changes')
        .select('design_change_id')
        .eq('snapshot_id', snapshotId)

      if (relationsError) {
        throw new Error(relationsError.message)
      }

      if (!snapshotChanges || snapshotChanges.length === 0) {
        return { success: true } // Empty snapshot, nothing to apply
      }

      // Get the actual change records
      const changeIds = snapshotChanges.map(sc => sc.design_change_id)
      const { data: changes, error: changesError } = await supabase
        .from('design_changes')
        .select('*')
        .in('id', changeIds)

      if (changesError) {
        throw new Error(changesError.message)
      }

      // TODO: Apply these changes to the DOM
      // This would typically be done by sending a message to the content script
      // For now, we'll just log them
      console.log('Changes to apply:', changes)

      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (tab.id) {
        // Send message to content script to apply changes
        await chrome.tabs.sendMessage(tab.id, {
          type: 'APPLY_SNAPSHOT',
          changes
        }).catch(async (err) => {
          console.log('Content script not loaded, injecting...', err)
          
          // If content script is not loaded, inject it
          await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: (changesData) => {
              window.postMessage(
                { 
                  source: 'papercut-extension', 
                  command: 'applySnapshot',
                  changes: changesData
                },
                '*'
              )
            },
            args: [changes]
          })
        })
      }

      return { success: true }
    } catch (err) {
      console.error('Error applying snapshot:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to apply snapshot' 
      }
    }
  }

  /**
   * Delete a snapshot
   */
  const deleteSnapshot = async (snapshotId: string) => {
    try {
      // First delete the snapshot_changes relations
      const { error: relationsError } = await supabase
        .from('snapshot_changes')
        .delete()
        .eq('snapshot_id', snapshotId)

      if (relationsError) {
        throw new Error(relationsError.message)
      }

      // Then delete the snapshot itself
      const { error: snapshotError } = await supabase
        .from('snapshots')
        .delete()
        .eq('id', snapshotId)

      if (snapshotError) {
        throw new Error(snapshotError.message)
      }

      // Update local state
      setSnapshots(prevSnapshots => 
        prevSnapshots.filter(snapshot => snapshot.id !== snapshotId)
      )

      return { success: true }
    } catch (err) {
      console.error('Error deleting snapshot:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete snapshot' 
      }
    }
  }

  // Fetch changes and snapshots when the current project changes
  useEffect(() => {
    if (currentProject) {
      fetchChanges()
      fetchSnapshots()
    } else {
      setChanges([])
      setSnapshots([])
    }
  }, [currentProject?.id])

  const value = {
    changes,
    snapshots,
    loading,
    error,
    fetchChanges,
    fetchSnapshots,
    createChange,
    createSnapshot,
    applySnapshot,
    deleteSnapshot
  }

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  )
}

/**
 * Hook to use the design context
 */
export function useDesignContext() {
  const context = useContext(DesignContext)
  if (context === undefined) {
    throw new Error('useDesignContext must be used within a DesignProvider')
  }
  return context
}
