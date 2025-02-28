/**
 * TypeScript definitions for Supabase database schema
 *
 * This file defines the types for our Supabase database tables and relationships.
 * It helps provide type safety when interacting with the database.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          owner_id: string
          is_public: boolean
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id: string
          is_public?: boolean
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id?: string
          is_public?: boolean
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      design_changes: {
        Row: {
          id: string
          project_id: string
          element_selector: string
          css_property: string
          previous_value: string | null
          new_value: string
          created_at: string
          created_by: string
          snapshot_id: string | null
        }
        Insert: {
          id?: string
          project_id: string
          element_selector: string
          css_property: string
          previous_value?: string | null
          new_value: string
          created_at?: string
          created_by: string
          snapshot_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          element_selector?: string
          css_property?: string
          previous_value?: string | null
          new_value?: string
          created_at?: string
          created_by?: string
          snapshot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_changes_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_changes_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_changes_snapshot_id_fkey"
            columns: ["snapshot_id"]
            referencedRelation: "design_snapshots"
            referencedColumns: ["id"]
          }
        ]
      }
      design_snapshots: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          created_at: string
          created_by: string
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          created_at?: string
          created_by: string
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          created_at?: string
          created_by?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_snapshots_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_snapshots_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
